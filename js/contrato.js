/* Termo de locação + aceite eletrônico simples (sem back end). Valores vindos de window.SOPHIA. */
(function () {
  const S = window.SOPHIA;
  const $ = (id) => document.getElementById(id);
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const plain = (t) => t.split(String.fromCharCode(160)).join(" "); // texto do WhatsApp sem espaço não separável
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const TBD = (what) => '<span class="tbc">A DEFINIR' + (what ? " (" + esc(what) + ")" : "") + "</span>";
  const pct = (v) => Math.round(v * 100) + "%";
  const li = (arr) => "<ul>" + arr.map((t) => "<li>" + esc(t) + "</li>").join("") + "</ul>";

  /* ---------- termo ---------- */
  const R = S.RATES;
  $("term").innerHTML =
    "<h3>1. Partes</h3>" +
    "<p><strong>Locadora:</strong> Sophia Festa — razão social, CNPJ/CPF e endereço: " + TBD("dados da locadora") + ".<br>" +
    "<strong>Locatário(a):</strong> a pessoa que assina este termo na seção abaixo, identificada por nome completo, CPF e telefone.</p>" +
    "<h3>2. Objeto</h3>" +
    "<p>Locação, por diária, de uma casa de lazer localizada em " + TBD("endereço do imóvel") + ", exclusivamente como espaço. " +
    "A locação é somente do espaço e dos itens inclusos listados abaixo.</p>" +
    "<h3>3. Itens inclusos</h3><p>Fazem parte da diária:</p>" + li(S.INCLUDED) +
    "<h3>4. Valores</h3>" + li([
      "Segunda a quinta: " + brl(R.weekday) + ".",
      "Sexta-feira e véspera de feriado: " + brl(R.friday) + ".",
      "Sábados, domingos, feriados e datas comemorativas (como Dia dos Namorados, São João e Halloween): " + brl(R.weekend) + ".",
      "Cada diária inclui " + S.HOURS_INCLUDED + " horas de festa.",
      "Hora adicional: " + pct(S.EXTRA_HOUR_PCT) + " do valor da diária, mediante disponibilidade.",
      "Taxa de limpeza: " + brl(S.CLEANING_FEE) + ", cobrada à parte.",
      "Opcionais (" + S.OPTIONALS.map((o) => o.label.toLowerCase()).join(", ") + "): valor sob consulta.",
    ]) +
    "<h3>5. Cashback</h3><p>O locatário recebe " + pct(S.CASHBACK_PCT) + " do valor da diária (diária e horas adicionais, <strong>sem a taxa de limpeza</strong>) como desconto no próximo evento. " +
    "Condições (validade, cumulatividade, etc.): " + TBD("regras do cashback") + ".</p>" +
    "<h3>6. Regras de uso</h3>" + li(S.RULES) +
    "<h3>7. Responsabilidade por danos</h3>" +
    "<p>" + TBD("regras de responsabilidade por danos, a informar pela locadora") + ".</p>" +
    "<h3>8. Assinatura, pagamento e confirmação</h3>" +
    "<p>Este termo deve ser assinado antes do pagamento. A disponibilidade da data é confirmada pelo WhatsApp. " +
    "Forma de pagamento: " + TBD("forma de pagamento") + ". Sinal: " + TBD("sinal") + ". Condições de confirmação da reserva: " + TBD("condições de confirmação") + ".</p>" +
    "<h3>9. Cancelamento e remarcação</h3><p>Política de cancelamento, remarcação e devolução de valores: " + TBD("política de cancelamento") + ".</p>" +
    "<h3>10. Aceite eletrônico</h3><p>O locatário declara ter lido e concordado com este termo ao marcar o aceite e digitar o próprio nome completo como assinatura. " +
    "Trata-se de aceite eletrônico simples. Foro: " + TBD("foro") + ".</p>";

  /* ---------- formulário ---------- */
  $("s-type").innerHTML = S.EVENT_TYPES.map((t) => "<option>" + esc(t) + "</option>").join("");
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  $("s-date").min = today;
  $("s-date").max = S.HOLIDAYS_MAX;
  const qs = new URLSearchParams(location.search);
  const qd = qs.get("date"), qt = qs.get("type");
  if (qd && /^\d{4}-\d{2}-\d{2}$/.test(qd)) $("s-date").value = qd;
  if (qt && S.EVENT_TYPES.indexOf(qt) !== -1) $("s-type").value = qt;

  $("s-cpf").addEventListener("input", (e) => {
    const d = e.target.value.replace(/\D/g, "").slice(0, 11);
    e.target.value = d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  });

  function validCPF(v) {
    const d = v.replace(/\D/g, "");
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    const dv = (len) => {
      let sum = 0;
      for (let i = 0; i < len; i++) sum += +d[i] * (len + 1 - i);
      const r = (sum * 10) % 11;
      return r === 10 ? 0 : r;
    };
    return dv(9) === +d[9] && dv(10) === +d[10];
  }
  const norm = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const fmtDate = (s) => s.split("-").reverse().join("/");

  // Código de referência (não verificável): dois hashes FNV-1a de 32 bits -> SF-XXXX-XXXX, alfabeto sem I, O, 0 e 1
  const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  function code(parts) {
    const str = parts.join("|");
    const h = (seed) => { let x = seed; for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x; };
    const hs = [h(2166136261), h(2166136261 ^ 0x9e3779b9)];
    let s = "";
    for (let i = 0; i < 8; i++) s += ALPHABET[(hs[i >> 2] >>> ((i & 3) * 5)) & 31];
    return "SF-" + s.slice(0, 4) + "-" + s.slice(4);
  }

  function setErr(id, msg) {
    const el = document.querySelector('[data-for="' + id + '"]');
    if (el) el.textContent = msg || "";
    const inp = $(id), f = inp && inp.closest(".field");
    if (f) f.classList.toggle("bad", !!msg);
  }

  $("sign-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("s-name").value.trim().replace(/\s+/g, " ");
    const cpf = $("s-cpf").value, phone = $("s-phone").value.trim(), date = $("s-date").value;
    const errs = {};
    if (name.split(" ").length < 2) errs["s-name"] = "Informe o nome completo.";
    if (!validCPF(cpf)) errs["s-cpf"] = "CPF inválido.";
    if (phone.replace(/\D/g, "").length < 10) errs["s-phone"] = "Informe o telefone com DDD.";
    if (!date) errs["s-date"] = "Escolha a data do evento.";
    else if (date < today) errs["s-date"] = "A data não pode ser anterior a hoje.";
    else if (date > S.HOLIDAYS_MAX) errs["s-date"] = "Para datas após " + fmtDate(S.HOLIDAYS_MAX) + ", fale com a locadora.";
    if (!$("s-accept").checked) errs["s-accept"] = "É preciso aceitar o termo.";
    if (!$("s-sign").value.trim()) errs["s-sign"] = "Digite seu nome completo como assinatura.";
    else if (norm($("s-sign").value) !== norm(name)) errs["s-sign"] = "A assinatura deve ser igual ao nome completo.";
    ["s-name", "s-cpf", "s-phone", "s-date", "s-accept", "s-sign"].forEach((id) => setErr(id, errs[id]));
    if (Object.keys(errs).length) {
      const f = document.querySelector(".bad input, .bad select");
      if (f) f.focus();
      return;
    }

    const now = new Date();
    const stamp = now.toLocaleDateString("pt-BR") + " às " + now.toLocaleTimeString("pt-BR");
    const type = $("s-type").value;
    const cod = code([name, cpf.replace(/\D/g, ""), phone.replace(/\D/g, ""), date, type, now.toISOString()]);
    const rate = S.dayRate(date).rate;

    $("receipt-data").innerHTML = [
      ["Locatário(a)", name], ["CPF", cpf], ["Telefone", phone],
      ["Data do evento", fmtDate(date)], ["Tipo de evento", type],
      ["Diária (" + S.HOURS_INCLUDED + "h)", brl(rate)], ["Assinado em", stamp],
    ].map((r) => "<dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd>").join("");
    $("receipt-code").textContent = "Código de referência: " + cod;
    const msg = [
      "*Aceite do termo de locação — Sophia Festa*",
      "Nome: " + name, "CPF: " + cpf, "Telefone: " + phone,
      "Data do evento: " + fmtDate(date), "Tipo de evento: " + type,
      "Diária: " + plain(brl(rate)), "Assinado em: " + stamp,
      "*Código de referência: " + cod + "*",
    ].join("\n");
    $("btn-wa").href = "https://wa.me/" + S.WHATSAPP + "?text=" + encodeURIComponent(msg);
    $("receipt").hidden = false;
    $("receipt").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });

  $("btn-print").addEventListener("click", () => window.print());
})();
