/* =========================================================
   Agenda da equipe — protótipo sem back end.
   Os dados ficam só no navegador (localStorage).
   ========================================================= */
(function () {
  const KEY = "sophia.bookings.v1";
  const SESSION = "sophia.session";
  const SPACES = ["Salão Azul Noturno", "Jardim das Borboletas", "Lounge Prata", "Casa inteira"];
  const PRICES = { "Casulo": 4900, "Asas": 8700, "Voo Mágico": 14500 };
  const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const DOW = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const brl = (v) => "R$ " + Number(v || 0).toLocaleString("pt-BR");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const statusClass = (s) => (s === "Confirmada" ? "ok" : s === "Cancelada" ? "cancel" : "pre");

  /* ---------- armazenamento ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return seed();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(bookings)); } catch (e) {}
  }
  function seed() {
    const t = new Date();
    const at = (offset) => { const d = new Date(t.getFullYear(), t.getMonth(), t.getDate() + offset); return iso(d); };
    const list = [
      ["Mariana Alves", "15 anos", "Salão Azul Noturno", 2, "20:00", "02:00", 150, "Voo Mágico", 14500, 7000, "Confirmada", "Tema: noite estrelada. Valsa às 23h."],
      ["Lucas e Beatriz", "Casamento", "Jardim das Borboletas", 5, "17:00", "23:00", 110, "Personalizado", 18900, 9000, "Confirmada", "Cerimônia no jardim, recepção no salão."],
      ["Helena Costa", "Infantil", "Lounge Prata", 6, "15:00", "19:00", 45, "Casulo", 4900, 0, "Pré-reserva", "Tema borboletas azuis. Aguardando sinal."],
      ["Grupo Aurora", "Corporativo", "Salão Azul Noturno", 9, "19:00", "23:00", 90, "Asas", 8700, 4350, "Confirmada", "Confraternização de fim de ano."],
      ["Rafaela Lima", "Chá revelação", "Lounge Prata", 12, "16:00", "20:00", 50, "Casulo", 4900, 0, "Pré-reserva", ""],
      ["Pedro Santos", "Aniversário", "Salão Azul Noturno", 13, "20:00", "00:00", 100, "Asas", 8700, 4350, "Confirmada", "40 anos — open bar."],
      ["Camila Rocha", "Aniversário", "Lounge Prata", -3, "19:00", "23:00", 40, "Casulo", 4900, 4900, "Confirmada", ""],
      ["Família Moreira", "Infantil", "Jardim das Borboletas", 16, "14:00", "18:00", 70, "Asas", 8700, 0, "Cancelada", "Cancelado pelo cliente."],
      ["Isabela Freitas", "15 anos", "Casa inteira", 20, "21:00", "03:00", 180, "Voo Mágico", 14500, 7250, "Confirmada", "Entrada com borboletas de LED."],
    ];
    return list.map((b, i) => ({
      id: "seed" + i, client: b[0], type: b[1], space: b[2], date: at(b[3]), start: b[4], end: b[5],
      guests: b[6], pkg: b[7], value: b[8], deposit: b[9], status: b[10], notes: b[11], phone: "(00) 9" + (8000 + i * 137) + "-" + (1000 + i * 71),
    }));
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
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "day" +
        (d.getMonth() !== view.getMonth() ? " other" : "") +
        (key === todayIso ? " today" : "") +
        (key === selectedDay ? " selected" : "");
      cell.innerHTML = `<span class="num">${d.getDate()}</span>` +
        evs.slice(0, 2).map((b) => `<span class="chip ${statusClass(b.status)}" title="${esc(b.start)} · ${esc(b.client)}">${esc(b.client.split(" ")[0])}</span>`).join("") +
        (evs.length > 2 ? `<span class="more">+${evs.length - 2} mais</span>` : "");
      cell.addEventListener("click", () => { selectedDay = key; renderCalendar(); renderList(); });
      cell.addEventListener("dblclick", () => openModal(null, key));
      cal.appendChild(cell);
    }
  }

  function evCard(b) {
    const d = parse(b.date);
    return `<div class="ev" data-id="${b.id}">
      <div class="ev-date"><b>${pad(d.getDate())}</b><small>${MONTHS[d.getMonth()].slice(0, 3)}</small></div>
      <div><h4>${esc(b.client)}</h4><p>${esc(b.type)} · ${esc(b.start)}–${esc(b.end)} · ${esc(b.space)}</p></div>
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
      $("#side-title").textContent = d.toLocaleDateString("pt-BR", { day: "numeric", month: "long" }).toUpperCase();
      $("#clear-day").style.display = "";
      items = bookings.filter((b) => b.date === selectedDay).sort((a, b) => a.start.localeCompare(b.start));
      list.innerHTML = items.length
        ? items.map(evCard).join("") + `<button class="btn btn-ghost" data-new-day style="justify-self:center;margin-top:.4rem">+ Outra reserva neste dia</button>`
        : emptyState("Nenhum evento neste dia.", true);
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

  function renderTable() {
    const q = $("#f-search").value.trim().toLowerCase();
    const st = $("#f-status").value;
    const sp = $("#f-space").value;
    const rows = bookings
      .filter((b) => (!q || b.client.toLowerCase().includes(q)) && (!st || b.status === st) && (!sp || b.space === sp))
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    $("#tbody").innerHTML = rows.length
      ? rows.map((b) => `<tr class="row" data-id="${b.id}">
          <td>${parse(b.date).toLocaleDateString("pt-BR")}<br><small style="color:var(--muted)">${esc(b.start)}–${esc(b.end)}</small></td>
          <td>${esc(b.client)}<br><small style="color:var(--muted)">${esc(b.phone || "")}</small></td>
          <td>${esc(b.type)}<br><small style="color:var(--muted)">${esc(b.pkg)}</small></td>
          <td>${esc(b.space)}</td>
          <td>${esc(b.guests)}</td>
          <td>${brl(b.value)}<br><small style="color:var(--muted)">sinal ${brl(b.deposit)}</small></td>
          <td><span class="badge ${statusClass(b.status)}">${esc(b.status)}</span></td>
        </tr>`).join("")
      : `<tr><td colspan="7">${emptyState("Nenhuma reserva encontrada.")}</td></tr>`;
    $$("#tbody tr.row").forEach((tr) => tr.addEventListener("click", () => openModal(tr.dataset.id)));
  }
  ["#f-search", "#f-status", "#f-space"].forEach((s) => $(s).addEventListener("input", renderTable));

  /* ---------- navegação do mês ---------- */
  $("#prev").addEventListener("click", () => { view.setMonth(view.getMonth() - 1); selectedDay = null; render(); });
  $("#next").addEventListener("click", () => { view.setMonth(view.getMonth() + 1); selectedDay = null; render(); });

  /* ---------- modal de reserva ---------- */
  const spaceOpts = SPACES.map((s) => `<option>${s}</option>`).join("");
  $("#b-space").innerHTML = spaceOpts;
  $("#f-space").innerHTML += spaceOpts;

  const f = {
    id: $("#b-id"), client: $("#b-client"), phone: $("#b-phone"), type: $("#b-type"), space: $("#b-space"),
    date: $("#b-date"), start: $("#b-start"), end: $("#b-end"), guests: $("#b-guests"), pkg: $("#b-pkg"),
    value: $("#b-value"), deposit: $("#b-deposit"), status: $("#b-status"), notes: $("#b-notes"),
  };

  function openModal(id, date) {
    const b = id ? bookings.find((x) => x.id === id) : null;
    $("#booking-form").reset();
    $("#m-title").textContent = b ? "Editar reserva" : "Nova reserva";
    $("#m-sub").textContent = b ? `${b.type} de ${b.client}` : "Preencha os dados do evento para bloquear a data.";
    $("#b-delete").style.display = b ? "" : "none";
    f.id.value = b ? b.id : "";
    if (b) {
      Object.keys(f).forEach((k) => { if (k !== "id" && b[k] !== undefined) f[k].value = b[k]; });
    } else {
      f.date.value = date || iso(new Date());
      f.value.value = PRICES[f.pkg.value] || 0;
    }
    checkConflict();
    $("#modal").classList.add("on");
    setTimeout(() => f.client.focus(), 50);
  }
  function closeModal() { $("#modal").classList.remove("on"); }

  $$("[data-new]").forEach((b) => b.addEventListener("click", () => openModal(null, selectedDay)));
  $("#b-cancel").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeModal(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  f.pkg.addEventListener("change", () => { if (PRICES[f.pkg.value]) f.value.value = PRICES[f.pkg.value]; });

  // minutos a partir do início do dia; término após meia-noite conta como dia seguinte
  function range(start, end) {
    const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const s = toMin(start); let e = toMin(end);
    if (e <= s) e += 24 * 60;
    return [s, e];
  }
  function conflicts() {
    if (!f.date.value || !f.start.value || !f.end.value || f.status.value === "Cancelada") return [];
    const [s, e] = range(f.start.value, f.end.value);
    return bookings.filter((b) => {
      if (b.id === f.id.value || b.date !== f.date.value || b.status === "Cancelada") return false;
      const sameSpace = b.space === f.space.value || b.space === "Casa inteira" || f.space.value === "Casa inteira";
      if (!sameSpace) return false;
      const [bs, be] = range(b.start, b.end);
      return s < be && bs < e;
    });
  }
  function checkConflict() {
    const c = conflicts();
    const w = $("#b-warn");
    w.classList.toggle("on", c.length > 0);
    w.innerHTML = c.length
      ? "⚠ Atenção: este horário já está ocupado por " + c.map((b) => `<b>${esc(b.client)}</b> (${esc(b.start)}–${esc(b.end)}, ${esc(b.space)})`).join(", ") + "."
      : "";
  }
  ["date", "start", "end", "space", "status"].forEach((k) => f[k].addEventListener("input", checkConflict));

  $("#booking-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (conflicts().length && !confirm("Existe conflito de horário neste espaço. Salvar mesmo assim?")) return;
    const data = {};
    Object.keys(f).forEach((k) => (data[k] = f[k].value.trim()));
    data.guests = Number(data.guests) || 0;
    data.value = Number(data.value) || 0;
    data.deposit = Number(data.deposit) || 0;
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
    closeModal();
    render();
    showToast(isNew ? `Reserva de ${esc(data.client)} criada ✦` : "Reserva atualizada ✦");
  });

  $("#b-delete").addEventListener("click", () => {
    const id = f.id.value;
    const b = bookings.find((x) => x.id === id);
    if (!b || !confirm(`Excluir a reserva de ${b.client}?`)) return;
    bookings = bookings.filter((x) => x.id !== id);
    save();
    closeModal();
    render();
    showToast("Reserva excluída.");
  });
})();
