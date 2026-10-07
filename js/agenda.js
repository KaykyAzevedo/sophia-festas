/* =========================================================
   Agenda da equipe — protótipo sem back end.
   Casa única, locada por diária (só o espaço): conflito por DATA.
   Preços e regras vêm de window.SOPHIA (js/config.js).
   Os dados ficam só no navegador (localStorage).
   ========================================================= */
(function () {
  const KEY = "sophia.bookings.v2";
  const OLD_KEY = "sophia.bookings.v1";
  const SESSION = "sophia.session";
  const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const DOW = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  const TIER_LABEL = { weekday: "Seg–qui", friday: "Sexta / véspera", weekend: "Fim de semana / feriado" };

  const S = window.SOPHIA;
  if (!S) console.error("js/config.js não carregou: window.SOPHIA indefinido.");
  const CASHBACK_PCT = (S && S.CASHBACK_PCT) || 0.1;
  const OPTIONALS = (S && S.OPTIONALS) || [];
  const EVENT_TYPES = ((S && S.EVENT_TYPES) || ["Outro"]).map((t) => (typeof t === "string" ? t : t.label || t.id));

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const brl = (v) => {
    const n = Number(v || 0), frac = Math.abs(n * 100 % 100) > 0.001 && Math.abs(n * 100 % 100) < 99.999;
    return "R$ " + n.toLocaleString("pt-BR", frac ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : { maximumFractionDigits: 0 });
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const statusClass = (s) => (s === "Confirmada" ? "ok" : s === "Cancelada" ? "cancel" : "pre");
  const payClass = (s) => (s === "Pago" ? "ok" : s === "Sinal pago" ? "pre" : "cancel");
  const clientKey = (b) => String(b.client || "").trim().toLowerCase();

  /* ---------- preço (SOPHIA.quote) ---------- */
  function dayInfo(date) {
    try { if (S && date) { const r = S.dayRate(date); if (!r) throw 0; return { rate: r.rate, tier: r.tier, holiday: !!S.isHoliday(date) }; } } catch (e) {}
    return { rate: 0, tier: "weekday", holiday: false };
  }
  // detalhamento automático de uma reserva (sem desconto de cashback)
  function breakdown(date, extraHours, optIds, optManual) {
    let q = { rate: 0, extra: 0, cleaning: 0 };
    try { if (S && date) q = S.quote({ date, extraHours: extraHours || 0, optionals: [] }) || q; } catch (e) {}
    const opts = OPTIONALS.filter((o) => optIds.includes(o.id)).map((o) => ({
      id: o.id, label: o.label, tbd: o.price == null,
      price: o.price == null ? Number((optManual || {})[o.id]) || 0 : o.price,
    }));
    const optTotal = opts.reduce((s, o) => s + o.price, 0);
    return { rate: q.rate || 0, extra: q.extra || 0, cleaning: q.cleaning || 0, opts, optTotal, subtotal: (q.rate || 0) + (q.extra || 0) + (q.cleaning || 0) + optTotal };
  }
  const bookingBreakdown = (b) => breakdown(b.date, b.extraHours, b.opts || [], b.optManual);

  /* ---------- cashback ---------- */
  // base do cashback: diária + horas adicionais (sem limpeza e sem opcionais)
  function baseAuto(date, extraHours) {
    try {
      if (S && S.cashbackBase) { const r = S.cashbackBase({ date, extraHours: extraHours || 0 }); if (r != null) return Number(r.base != null ? r.base : r) || 0; }
    } catch (e) {}
    const bd = breakdown(date, extraHours, [], {});
    return bd.rate + bd.extra;
  }
  // total manual ou migrado sem detalhamento: valor − limpeza − opcionais (mínimo 0)
  function baseManual(value, date, optIds, optManual) {
    const bd = breakdown(date, 0, optIds, optManual);
    return Math.max(0, Number(value || 0) - bd.cleaning - bd.optTotal);
  }
  const baseOf = (b) => (b.manual ? baseManual(b.value, b.date, b.opts || [], b.optManual) : baseAuto(b.date, b.extraHours));
  const earnedBy = (b) => (b.status === "Confirmada" ? Math.round(baseOf(b) * CASHBACK_PCT) : 0);
  // crédito do cliente vindo de eventos confirmados anteriores a `date`, menos o já usado em outras reservas
  function cashbackAvailable(client, date, selfId) {
    const k = String(client || "").trim().toLowerCase();
    if (!k || !date) return 0;
    const mine = bookings.filter((b) => b.id !== selfId && clientKey(b) === k);
    const earned = mine.filter((b) => b.date < date).reduce((s, b) => s + earnedBy(b), 0);
    const used = mine.filter((b) => b.status !== "Cancelada").reduce((s, b) => s + Number(b.cashbackUsed || 0), 0);
    return Math.max(0, earned - used);
  }

  /* ---------- armazenamento ---------- */
  function migrate(b) {
    const value = Number(b.value) || 0, deposit = Number(b.deposit) || 0;
    return {
      id: b.id, client: b.client || "", phone: b.phone || "", type: b.type || "Outro", date: b.date,
      start: b.start || "10:00", end: b.end || "18:00", guests: Number(b.guests) || 0,
      extraHours: Number(b.extraHours) || 0, opts: Array.isArray(b.opts) ? b.opts : [], optManual: b.optManual || {},
      term: b.term || "Não assinado", termCode: b.termCode || "", manual: b.manual !== undefined ? !!b.manual : true, cashbackUsed: Number(b.cashbackUsed) || 0,
      value, deposit, status: b.status || "Pré-reserva", notes: b.notes || "",
      pay: b.pay || (value > 0 && deposit >= value ? "Pago" : deposit > 0 ? "Sinal pago" : "Pendente"),
    };
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const a = JSON.parse(raw); if (Array.isArray(a)) return a.filter((b) => b && b.date).map(migrate); }
      const old = localStorage.getItem(OLD_KEY); // dados da versão com 4 espaços: descarta espaço/pacote, mantém valor
      if (old) { const a = JSON.parse(old); if (Array.isArray(a)) { const m = a.filter((b) => b && b.date).map(migrate); try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} return m; } }
    } catch (e) {}
    return seed();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(bookings)); } catch (e) {}
  }
  function seed() {
    const t = new Date();
    const at = (offset) => iso(new Date(t.getFullYear(), t.getMonth(), t.getDate() + offset));
    // [cliente, evento, dia(offset), início, fim, convidados, horas extras, opcionais(índices), regras, sinal, status, pagamento, obs]
    const list = [
      ["Mariana Alves", "Aniversário", 2, "10:00", "18:00", 60, 2, [], true, 500, "Confirmada", "Sinal pago", "Decoração própria."],
      ["Lucas e Beatriz", "Confraternização", 5, "11:00", "19:00", 80, 0, [0], true, 800, "Confirmada", "Sinal pago", ""],
      ["Helena Costa", "Aniversário", 6, "14:00", "22:00", 45, 0, [], false, 0, "Pré-reserva", "Pendente", "Aguardando sinal."],
      ["Grupo Aurora", "Confraternização", 9, "12:00", "20:00", 70, 1, [], true, 400, "Confirmada", "Sinal pago", "Fim de ano."],
      ["Rafaela Lima", "Outro", 12, "10:00", "18:00", 50, 0, [], false, 0, "Pré-reserva", "Pendente", ""],
      ["Pedro Santos", "Aniversário", 13, "16:00", "00:00", 100, 0, [], true, 600, "Confirmada", "Sinal pago", "40 anos."],
      ["Camila Rocha", "Aniversário", -3, "12:00", "20:00", 40, 0, [], true, 0, "Confirmada", "Pago", ""],
      ["Família Moreira", "Aniversário", 16, "10:00", "18:00", 70, 0, [], false, 0, "Cancelada", "Pendente", "Cancelado pelo cliente."],
      ["Camila Rocha", "Aniversário", 20, "12:00", "20:00", 60, 0, [], true, 0, "Pré-reserva", "Pendente", "Cliente recorrente — cashback."],
    ];
    return list.map((r, i) => {
      const date = at(r[2]);
      const optIds = r[7].map((x) => (OPTIONALS[x] || {}).id).filter(Boolean);
      const bd = breakdown(date, r[6], optIds, {});
      return {
        id: "seed" + i, client: r[0], phone: "(00) 9" + (8000 + i * 137) + "-" + (1000 + i * 71), type: EVENT_TYPES.includes(r[1]) ? r[1] : EVENT_TYPES[0],
        date, start: r[3], end: r[4], guests: r[5], extraHours: r[6], opts: optIds, optManual: {}, term: r[8] ? "Assinado" : "Não assinado", termCode: r[8] ? "SEED-" + (1000 + i) : "", manual: false,
        cashbackUsed: 0, value: bd.subtotal, deposit: r[9], status: r[10], pay: r[11], notes: r[12],
      };
    });
  }

  let bookings = load();
  let view = new Date(); view.setDate(1);
  let selectedDay = null;

  /* ---------- login ---------- */
  function enter() {
    $("#login").style.display = "none";
    $("#dash").classList.add("on");
    render();
  }
  $("#login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    try { sessionStorage.setItem(SESSION, "1"); } catch (err) {}
    enter();
    showToast("Que bom te ver de novo na agenda ✦");
  });
  function logout() {
    try { sessionStorage.removeItem(SESSION); } catch (err) {}
    location.reload();
  }
  $("#logout").addEventListener("click", logout);
  $("#m-logout").addEventListener("click", logout);
  try { if (sessionStorage.getItem(SESSION)) enter(); } catch (err) {}

  /* ---------- navegação entre visões ---------- */
  $$("[data-view]").forEach((b) =>
    b.addEventListener("click", () => {
      const v = b.dataset.view;
      $$("[data-view]").forEach((x) => x.classList.toggle("active", x.dataset.view === v));
      $$(".view").forEach((x) => x.classList.toggle("on", x.id === "view-" + v));
    })
  );

  /* ---------- render ---------- */
  function render() {
    const now = new Date();
    $("#today-label").textContent = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    renderStats();
    renderCalendar();
    renderList();
    renderTable();
  }

  function inMonth(b) {
    const d = parse(b.date);
    return d.getFullYear() === view.getFullYear() && d.getMonth() === view.getMonth();
  }

  function renderStats() {
    const month = bookings.filter(inMonth);
    const active = month.filter((b) => b.status !== "Cancelada");
    $("#s-month").textContent = active.length;
    $("#s-month-sub").textContent = MONTHS[view.getMonth()] + " " + view.getFullYear();
    $("#s-ok").textContent = active.filter((b) => b.status === "Confirmada").length;
    $("#s-pre").textContent = active.filter((b) => b.status === "Pré-reserva").length;
    $("#s-rev").textContent = brl(active.reduce((s, b) => s + Number(b.value || 0), 0));
  }

  function renderCalendar() {
    $("#month-label").textContent = MONTHS[view.getMonth()] + " " + view.getFullYear();
    const cal = $("#cal");
    cal.innerHTML = DOW.map((d) => `<div class="dow">${d}</div>`).join("");
    const start = new Date(view.getFullYear(), view.getMonth(), 1 - view.getDay());
    const todayIso = iso(new Date());
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      const key = iso(d);
      const evs = bookings.filter((b) => b.date === key).sort((a, b) => a.start.localeCompare(b.start));
      const info = dayInfo(key);
      const active = evs.filter((b) => b.status !== "Cancelada").length;
      const busy = active > 0, dup = active > 1;
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "day t-" + info.tier +
        (info.holiday ? " holiday" : "") +
        (busy ? " busy" : "") + (dup ? " dup" : "") +
        (d.getMonth() !== view.getMonth() ? " other" : "") +
        (key === todayIso ? " today" : "") +
        (key === selectedDay ? " selected" : "");
      cell.title = `${dup ? "⚠ Conflito: mais de uma reserva neste dia · " : ""}${TIER_LABEL[info.tier] || ""}${info.holiday ? " · feriado" : ""} · ${brl(info.rate)}`;
      cell.innerHTML = `<span class="top"><span class="num">${d.getDate()}</span>` +
        `<span class="rate">${info.holiday ? "★ " : ""}${info.rate ? Number(info.rate).toLocaleString("pt-BR") : ""}</span></span>` +
        evs.slice(0, 2).map((b) => `<span class="chip ${statusClass(b.status)}" title="${esc(b.client)}">${esc(b.client.split(" ")[0])}</span>`).join("") +
        (evs.length > 2 ? `<span class="more">+${evs.length - 2} mais</span>` : "");
      // o clique simples re-renderiza o calendário e descartaria o dblclick: usa a contagem de cliques
      cell.addEventListener("click", (e) => {
        selectedDay = key;
        if (e.detail >= 2) { renderCalendar(); renderList(); openModal(null, key); return; }
        renderCalendar(); renderList();
      });
      cal.appendChild(cell);
    }
  }

  function evCard(b) {
    const d = parse(b.date);
    return `<div class="ev" data-id="${b.id}">
      <div class="ev-date"><b>${pad(d.getDate())}</b><small>${MONTHS[d.getMonth()].slice(0, 3)}</small></div>
      <div><h4>${esc(b.client)}</h4><p>${esc(b.type)} · ${esc(b.start)}–${esc(b.end)} · ${brl(b.value)}</p></div>
      <span class="badge ${statusClass(b.status)}">${esc(b.status)}</span>
    </div>`;
  }

  function emptyState(msg, withButton) {
    return `<div class="empty">${SophiaBrand.butterflySVG()}${msg}${withButton ? `<br><br><button class="btn btn-ghost" data-new-day>+ Reservar este dia</button>` : ""}</div>`;
  }

  function renderList() {
    const list = $("#ev-list");
    let items;
    if (selectedDay) {
      const d = parse(selectedDay);
      const info = dayInfo(selectedDay);
      $("#side-title").textContent = d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" }).toUpperCase();
      $("#clear-day").style.display = "";
      items = bookings.filter((b) => b.date === selectedDay).sort((a, b) => a.start.localeCompare(b.start));
      const nAct = items.filter((b) => b.status !== "Cancelada").length;
      const taken = nAct > 0;
      list.innerHTML = `<div class="day-info t-${info.tier}"><span class="dot ${info.holiday ? "holiday" : info.tier}"></span>${TIER_LABEL[info.tier] || ""}${info.holiday ? " · feriado" : ""} — diária ${brl(info.rate)}</div>` +
        (nAct > 1 ? `<div class="warn on">⚠ Conflito de data: ${nAct} reservas ativas neste dia. Cancele ou mude a data de uma delas.</div>` : "") +
        (items.length
          ? items.map(evCard).join("") + (taken ? "" : `<button class="btn btn-ghost" data-new-day style="justify-self:center;margin-top:.4rem">+ Reservar este dia</button>`)
          : emptyState("Data livre.", true));
    } else {
      $("#side-title").textContent = "PRÓXIMOS EVENTOS";
      $("#clear-day").style.display = "none";
      const today = iso(new Date());
      items = bookings.filter((b) => b.date >= today && b.status !== "Cancelada")
        .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start)).slice(0, 8);
      list.innerHTML = items.length ? items.map(evCard).join("") : emptyState("Nenhum evento agendado ainda.");
    }
    list.querySelectorAll(".ev").forEach((el) => el.addEventListener("click", () => openModal(el.dataset.id)));
    list.querySelectorAll("[data-new-day]").forEach((el) => el.addEventListener("click", () => openModal(null, selectedDay)));
  }
  $("#clear-day").addEventListener("click", () => { selectedDay = null; renderCalendar(); renderList(); });

  function breakdownText(b) {
    if (b.manual) return "valor ajustado manualmente";
    const bd = bookingBreakdown(b);
    const parts = [`diária ${brl(bd.rate)}`];
    if (bd.extra) parts.push(`+${b.extraHours}h extra ${brl(bd.extra)}`);
    if (bd.cleaning) parts.push(`limpeza ${brl(bd.cleaning)}`);
    if (bd.optTotal) parts.push(`opcionais ${brl(bd.optTotal)}`);
    if (b.cashbackUsed) parts.push(`cashback −${brl(b.cashbackUsed)}`);
    return parts.join(" · ");
  }

  const dupDates = () => { const c = {}; bookings.forEach((b) => { if (b.status !== "Cancelada") c[b.date] = (c[b.date] || 0) + 1; }); return c; };

  function renderTable() {
    const dups = dupDates();
    const q = $("#f-search").value.trim().toLowerCase();
    const st = $("#f-status").value;
    const py = $("#f-pay").value;
    const rows = bookings
      .filter((b) => (!q || b.client.toLowerCase().includes(q)) && (!st || b.status === st) && (!py || b.pay === py))
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    $("#tbody").innerHTML = rows.length
      ? rows.map((b) => `<tr class="row" data-id="${b.id}">
          <td>${parse(b.date).toLocaleDateString("pt-BR")}${b.status !== "Cancelada" && dups[b.date] > 1 ? ' <span class="badge cancel" title="Mais de uma reserva neste dia">⚠ conflito</span>' : ""}<br><small style="color:var(--muted)">${esc(b.start)}–${esc(b.end)}</small></td>
          <td>${esc(b.client)}<br><small style="color:var(--muted)">${esc(b.phone || "")}</small></td>
          <td>${esc(b.type)}<br><small style="color:var(--muted)">${b.term === "Assinado" ? "termo assinado" + (b.termCode ? " · " + esc(b.termCode) : "") : "termo não assinado"}</small></td>
          <td>${esc(b.guests)}</td>
          <td>${brl(b.value)}<br><small style="color:var(--muted)">${esc(breakdownText(b))}</small></td>
          <td><span class="badge ${payClass(b.pay)}">${esc(b.pay)}</span><br><small style="color:var(--muted)">sinal ${brl(b.deposit)}</small></td>
          <td><span class="badge ${statusClass(b.status)}">${esc(b.status)}</span></td>
        </tr>`).join("")
      : `<tr><td colspan="7">${emptyState("Nenhuma reserva encontrada.")}</td></tr>`;
    $$("#tbody tr.row").forEach((tr) => tr.addEventListener("click", () => openModal(tr.dataset.id)));
  }
  ["#f-search", "#f-status", "#f-pay"].forEach((s) => $(s).addEventListener("input", renderTable));

  /* ---------- navegação do mês ---------- */
  $("#prev").addEventListener("click", () => { view.setMonth(view.getMonth() - 1); selectedDay = null; render(); });
  $("#next").addEventListener("click", () => { view.setMonth(view.getMonth() + 1); selectedDay = null; render(); });

  /* ---------- modal de reserva ---------- */
  const f = {
    id: $("#b-id"), client: $("#b-client"), phone: $("#b-phone"), type: $("#b-type"),
    date: $("#b-date"), start: $("#b-start"), end: $("#b-end"), guests: $("#b-guests"), extra: $("#b-extra"),
    term: $("#b-term"), termCode: $("#b-termcode"), value: $("#b-value"), deposit: $("#b-deposit"), pay: $("#b-pay"), status: $("#b-status"),
    notes: $("#b-notes"), cbUse: $("#b-cb-use"),
  };
  f.type.innerHTML = EVENT_TYPES.map((t) => `<option>${esc(t)}</option>`).join("");
  $("#b-opts").innerHTML = OPTIONALS.map((o) => `<div class="opt" data-opt="${esc(o.id)}">
      <label class="check"><input type="checkbox" value="${esc(o.id)}"> ${esc(o.label)} <em>${o.price == null ? "a combinar" : brl(o.price)}</em></label>
      ${o.price == null ? `<input type="number" class="opt-val" min="0" step="any" placeholder="R$" aria-label="Valor de ${esc(o.label)}" disabled>` : ""}
    </div>`).join("") || `<small style="color:var(--muted)">Nenhum opcional cadastrado.</small>`;

  let manual = false; // total ajustado à mão pela equipe

  const selectedOpts = () => [...$$("#b-opts input[type=checkbox]:checked")].map((c) => c.value);
  const manualOpts = () => {
    const o = {};
    $$("#b-opts .opt").forEach((el) => { const v = el.querySelector(".opt-val"); if (v && v.value !== "") o[el.dataset.opt] = Number(v.value) || 0; });
    return o;
  };

  // recalcula detalhamento, cashback e (se não estiver manual) o total
  function recalc() {
    $$("#b-opts .opt").forEach((el) => {
      const v = el.querySelector(".opt-val");
      if (v) v.disabled = !el.querySelector("input[type=checkbox]").checked;
    });
    const date = f.date.value;
    const extraH = Math.max(0, Number(f.extra.value) || 0);
    const bd = breakdown(date, extraH, selectedOpts(), manualOpts());
    const info = dayInfo(date);
    const avail = cashbackAvailable(f.client.value, date, f.id.value);
    const disc = f.cbUse.checked ? Math.min(avail, bd.subtotal) : 0;
    const auto = Math.max(0, bd.subtotal - disc);
    if (!manual) f.value.value = auto;
    f.cbUse.disabled = avail <= 0 && !f.cbUse.checked;
    $("#b-cb-info").textContent = avail > 0
      ? `Crédito disponível: ${brl(avail)}${disc ? ` (aplicando ${brl(disc)})` : ""}`
      : "Sem crédito disponível para este cliente.";
    $("#b-recalc").style.display = manual ? "" : "none";

    const row = (l, v, cls) => `<div class="q-row ${cls || ""}"><span>${l}</span><b>${v}</b></div>`;
    let h = "";
    if (!date) h = `<div class="q-row"><span>Escolha a data para calcular a diária.</span></div>`;
    else {
      h += row(`Diária · ${TIER_LABEL[info.tier] || ""}${info.holiday ? " (feriado)" : ""}`, brl(bd.rate));
      h += row(`Horas adicionais${extraH ? ` (${extraH}h)` : ""}`, brl(bd.extra));
      h += row("Taxa de limpeza", brl(bd.cleaning));
      bd.opts.forEach((o) => { h += row(esc(o.label) + (o.tbd ? " (a combinar)" : ""), brl(o.price)); });
      if (disc) h += row("Cashback aplicado", "− " + brl(disc), "neg");
      h += row("Total automático", brl(auto), "tot");
      if (manual) h += row("Total ajustado manualmente", brl(f.value.value), "manual");
      const base = manual ? baseManual(f.value.value, date, selectedOpts(), manualOpts()) : baseAuto(date, extraH);
      const gen = Math.round(base * CASHBACK_PCT);
      h += row(`Base do cashback (${manual ? "total − limpeza − opcionais" : "diária + horas adicionais"})`, brl(base), "base");
      h += `<div class="q-note">Esta reserva gera ${brl(gen)} (${Math.round(CASHBACK_PCT * 100)}% da base) de cashback para o próximo evento${f.status.value === "Confirmada" ? "." : " depois de confirmada."}</div>`;
    }
    $("#b-quote").innerHTML = h;
  }

  function fill(b, date) {
    f.id.value = b ? b.id : "";
    f.client.value = b ? b.client : "";
    f.phone.value = b ? b.phone || "" : "";
    const type = b ? b.type : EVENT_TYPES[0];
    [...f.type.options].forEach((o) => { if (o.dataset.legacy) o.remove(); });
    if (![...f.type.options].some((o) => o.value === type)) { const o = new Option(type, type); o.dataset.legacy = "1"; f.type.add(o); }
    f.type.value = type;
    f.date.value = b ? b.date : date || iso(new Date());
    f.start.value = b ? b.start : "10:00";
    f.end.value = b ? b.end : "18:00";
    f.guests.value = b ? b.guests : 50;
    f.extra.value = b ? b.extraHours || 0 : 0;
    f.term.value = b ? b.term : "Não assinado";
    f.termCode.value = b ? b.termCode || "" : "";
    f.deposit.value = b ? b.deposit : 0;
    f.pay.value = b ? b.pay : "Pendente";
    f.status.value = b ? b.status : "Pré-reserva";
    f.notes.value = b ? b.notes || "" : "";
    f.cbUse.checked = !!(b && b.cashbackUsed > 0);
    $$("#b-opts .opt").forEach((el) => {
      const id = el.dataset.opt, on = !!(b && (b.opts || []).includes(id));
      el.querySelector("input[type=checkbox]").checked = on;
      const v = el.querySelector(".opt-val");
      if (v) v.value = on && b.optManual && b.optManual[id] != null ? b.optManual[id] : "";
    });
    manual = !!(b && b.manual);
    recalc();
    if (b) f.value.value = b.value; // mantém o total gravado (recalc só sobrescreve em modo automático)
  }

  function openModal(id, date) {
    const b = id ? bookings.find((x) => x.id === id) : null;
    $("#m-title").textContent = b ? "Editar reserva" : "Nova reserva";
    $("#m-sub").textContent = b ? `${b.type} de ${b.client}` : "Preencha os dados para bloquear a data (casa única, uma reserva por dia).";
    $("#b-delete").style.display = b ? "" : "none";
    if (!modalOpen()) opener = document.activeElement;
    fill(b, date);
    checkConflict();
    $("#b-err").classList.remove("on");
    $("#modal").classList.add("on");
    setTimeout(() => f.client.focus(), 50);
  }
  let opener = null;
  function closeModal() {
    $("#modal").classList.remove("on");
    $("#b-err").classList.remove("on");
    const back = opener && document.contains(opener) && opener.offsetParent !== null ? opener : document.querySelector(".topbar [data-new]");
    if (back) back.focus();
    opener = null;
  }
  const modalOpen = () => $("#modal").classList.contains("on");
  const focusables = () => [...$$("#modal button, #modal input, #modal select, #modal textarea")].filter((el) => !el.disabled && el.type !== "hidden" && el.offsetParent !== null);

  $$("[data-new]").forEach((b) => b.addEventListener("click", () => openModal(null, selectedDay)));
  $("#b-cancel").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
  addEventListener("keydown", (e) => {
    if (!modalOpen()) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key !== "Tab") return;
    const els = focusables();
    if (!els.length) return;
    const first = els[0], last = els[els.length - 1];
    if (!$("#modal").contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // casa única: outra reserva ativa no mesmo dia é conflito
  function conflicts() {
    if (!f.date.value || f.status.value === "Cancelada") return [];
    return bookings.filter((b) => b.id !== f.id.value && b.date === f.date.value && b.status !== "Cancelada");
  }
  function checkDuration() {
    const w = $("#b-dur");
    let msg = "";
    if (f.start.value && f.end.value) {
      const m = (t) => { const [h, mi] = t.split(":").map(Number); return h * 60 + mi; };
      let d = m(f.end.value) - m(f.start.value);
      if (d <= 0) d += 24 * 60; // fim menor/igual ao início: vira o dia
      const inc = (S && S.HOURS_INCLUDED) || 8;
      const hrs = d / 60;
      const need = Math.ceil(hrs - inc);
      if (need > 0 && (Number(f.extra.value) || 0) < need)
        msg = `⏱ Duração de ${Number.isInteger(hrs) ? hrs : hrs.toFixed(1)}h (a diária inclui ${inc}h). Sugestão: ${need} hora${need > 1 ? "s" : ""} ${need > 1 ? "adicionais" : "adicional"}.`;
    }
    w.textContent = msg;
    w.classList.toggle("on", !!msg);
  }
  function checkConflict() {
    checkDuration();
    const c = conflicts();
    const w = $("#b-warn");
    w.classList.toggle("on", c.length > 0);
    w.innerHTML = c.length
      ? "⚠ Conflito de data: a casa já está reservada neste dia por " + c.map((b) => `<b>${esc(b.client)}</b> (${esc(b.status)}, ${esc(b.start)}–${esc(b.end)})`).join(", ") + "."
      : "";
  }

  ["start", "end"].forEach((k) => f[k].addEventListener("input", checkDuration));
  ["date", "extra", "status", "client"].forEach((k) => f[k].addEventListener("input", () => { recalc(); checkConflict(); }));
  f.cbUse.addEventListener("change", recalc);
  $("#b-opts").addEventListener("input", recalc);
  f.value.addEventListener("input", () => { manual = true; recalc(); });
  $("#b-recalc").addEventListener("click", () => { manual = false; recalc(); });
  f.deposit.addEventListener("input", () => {
    const d = Number(f.deposit.value) || 0, v = Number(f.value.value) || 0;
    f.pay.value = d <= 0 ? "Pendente" : v > 0 && d >= v ? "Pago" : "Sinal pago";
  });

  // erros de validação nativos ficam visíveis dentro do modal
  $("#booking-form").addEventListener("invalid", (e) => {
    const el = e.target, lab = document.querySelector(`label[for="${el.id}"]`);
    const w = $("#b-err");
    w.textContent = `⚠ Verifique "${lab ? lab.textContent.replace(/\s*\(R\$\)/, "") : el.id}": ${el.validationMessage}`;
    w.classList.add("on");
  }, true);

  $("#booking-form").addEventListener("submit", (e) => {
    $("#b-err").classList.remove("on");
    e.preventDefault();
    if (conflicts().length && !confirm("A casa já tem reserva nesta data. Salvar mesmo assim?")) return;
    const date = f.date.value;
    const bd = breakdown(date, Number(f.extra.value) || 0, selectedOpts(), manualOpts());
    const avail = cashbackAvailable(f.client.value, date, f.id.value);
    const data = {
      id: f.id.value, client: f.client.value.trim(), phone: f.phone.value.trim(), type: f.type.value, date,
      start: f.start.value, end: f.end.value, guests: Number(f.guests.value) || 0,
      extraHours: Math.max(0, Number(f.extra.value) || 0), opts: selectedOpts(), optManual: manualOpts(),
      term: f.term.value, termCode: f.termCode.value.trim(), manual, cashbackUsed: f.cbUse.checked ? Math.min(avail, bd.subtotal) : 0,
      value: Number(f.value.value) || 0, deposit: Number(f.deposit.value) || 0, pay: f.pay.value,
      status: f.status.value, notes: f.notes.value.trim(),
    };
    const isNew = !data.id;
    if (isNew) {
      data.id = "b" + Date.now();
      bookings.push(data);
    } else {
      bookings = bookings.map((b) => (b.id === data.id ? data : b));
    }
    save();
    // leva o calendário até o mês da reserva
    const d = parse(data.date);
    view = new Date(d.getFullYear(), d.getMonth(), 1);
    selectedDay = data.date;
    render();
    closeModal();
    showToast(isNew ? `Reserva de ${esc(data.client)} criada ✦` : "Reserva atualizada ✦");
  });

  $("#b-delete").addEventListener("click", () => {
    const id = f.id.value;
    const b = bookings.find((x) => x.id === id);
    if (!b || !confirm(`Excluir a reserva de ${b.client}?`)) return;
    bookings = bookings.filter((x) => x.id !== id);
    save();
    render();
    closeModal();
    showToast("Reserva excluída.");
  });
})();
