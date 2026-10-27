/* =========================================================
   Seção #eventos — bento de cards por tipo de evento, filtro por categoria
   e pré-seleção do tipo no formulário de orçamento. JS puro, só transform/opacity.
   Os tipos vêm de SOPHIA.EVENT_TYPES (fonte única); aqui só ícone, categoria e frase.
   ========================================================= */
(function () {
  const S = window.SOPHIA || {};
  const grid = document.getElementById("ev-grid");
  if (!grid) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const I = (d) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>";
  const ICON = {
    futebol: I('<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 4.5h-5L8 10z"/><path d="M12 7V3M16 10l4-1M14.5 14.5l2.5 3.5M9.5 14.5L7 18M8 10L4 9"/>'),
    cinema: I('<rect x="3" y="10" width="18" height="11" rx="1.5"/><path d="M3 10l3-5 4 5M10 10l3-5 4 5M17 10l3-5"/>'),
    noivado: I('<circle cx="12" cy="15.5" r="5"/><path d="M9 7.5L12 3.5l3 4-3 3z"/>'),
    festa: I('<path d="M4 20l5-12 7 7z"/><path d="M14 4v2M19 9h2M17 6l1.5-1.5M10 4l.5 1.5"/>'),
    empresa: I('<rect x="5" y="3" width="10" height="18"/><path d="M15 9h4v12M8 7h4M8 11h4M8 15h4M3 21h18"/>'),
    halloween: I('<path d="M12 7c-5 0-8 3-8 7s3 7 8 7 8-3 8-7-3-7-8-7z"/><path d="M12 7c0-2 1-3 3-3M9 13l1 1M15 13l-1 1M9.5 17c1.5 1 3.5 1 5 0"/>'),
    natal: I('<path d="M12 3l4.5 5.5H14l3.5 4.5H14l3 4.5H7l3-4.5H6.500L10 8.500H7.500z"/><path d="M12 17.500V21"/>'),
    junina: I('<path d="M3 6c6 5 12 5 18 0M6 8.500l1 5 2-4.200M11 10.200l1 5 2-4.200M16 9l1 5 2-4.200"/>'),
    familia: I('<path d="M3 11l9-7 9 7M5 10v10h14V10"/><circle cx="12" cy="14" r="2"/><path d="M9 20c0-2 1.500-3 3-3s3 1 3 3"/>'),
    escola: I('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>'),
    igreja: I('<path d="M12 2v5M10 4.500h4M6 21V12l6-5 6 5v9zM10 21v-5h4v5"/>'),
    brinde: I('<path d="M5 4h5l-.5 6a2.500 2.500 0 0 1-4 0zM14 4h5l-.5 6a2.500 2.500 0 0 1-4 0zM7.500 12.500V20M4.500 20h6M16.500 12.500V20M13.500 20h6"/>'),
  };

  // [tipo (igual ao config), categoria, ícone, frase, foto (opcional: nome do arquivo em img/), destaque grande]
  const EV = [
    ["Evento familiar", "familia", "familia", "Piscina, churrasqueira e mesas para reunir a família.", "area-externa-piscina", true],
    ["Dia de futebol com os amigos", "amigos", "futebol", "Televisão, som JBL e frigobar para acompanhar o jogo com a turma.", "area-jogos", true],
    ["Confraternização", "amigos", "brinde", "Piscina, churrasqueira e jogos de mesa para a turma toda.", "churrasqueira-cozinha", true],
    ["Festa comemorativa", "datas", "festa", "Área para decoração, som JBL e churrasqueira à disposição.", "salao-decoracao", true],
    ["Noite de cinema", "amigos", "cinema", "Telão opcional junto à piscina e som JBL para uma sessão ao ar livre.", null, false],
    ["Noivado", "familia", "noivado", "Área para decoração e mesas para receber os convidados do seu jeito.", null, false],
    ["Festa de empresa", "empresa", "empresa", "Churrasqueira, mesas e piscina para um dia diferente com a equipe.", null, false],
    ["Evento escolar", "empresa", "escola", "Área externa, mesas e som para o seu evento.", null, false],
    ["Evento de igreja", "empresa", "igreja", "Espaço reservado para o seu grupo, com mesas e cozinha.", null, false],
    ["Halloween", "datas", "halloween", "Decore a área do seu jeito e use o som JBL na sua noite temática.", null, false],
    ["Natal", "datas", "natal", "Mesas, cozinha com fogão industrial e área para decoração.", null, false],
    ["Festa junina", "datas", "junina", "Churrasqueira, cozinha e área para decoração com a sua temática.", null, false],
  ].filter((e) => !S.EVENT_TYPES || S.EVENT_TYPES.indexOf(e[0]) !== -1);

  const CATS = [["todos", "Todos"], ["familia", "Família"], ["amigos", "Amigos"], ["empresa", "Empresa, escola e igreja"], ["datas", "Datas especiais"]];

  const tabs = document.getElementById("ev-tabs");
  tabs.innerHTML = CATS.map((c, i) => '<button type="button" role="tab" class="ev-tab' + (i ? "" : " on") + '" data-cat="' + c[0] + '" aria-selected="' + (i ? "false" : "true") + '">' + esc(c[1]) + "</button>").join("");

  grid.innerHTML = EV.map((e, i) => {
    const photo = e[4]
      ? '<picture class="ev-bg"><source type="image/webp" srcset="img/' + e[4] + '-800.webp"><img src="img/' + e[4] + '.jpg" alt="" width="1448" height="1086" loading="lazy" decoding="async"></picture>'
      : "";
    return '<button type="button" class="ev-card' + (e[5] ? " big" : "") + (e[4] ? " has-photo" : "") + '" data-cat="' + e[1] + '" data-type="' + esc(e[0]) + '" style="--i:' + i + '" aria-pressed="false">' +
      photo + '<span class="ev-ic">' + ICON[e[2]] + "</span>" +
      '<span class="ev-txt"><b>' + esc(e[0]) + '</b><span class="ev-desc">' + esc(e[3]) + '</span></span></button>';
  }).join("");

  const cards = [...grid.querySelectorAll(".ev-card")];

  // entrada escalonada (IntersectionObserver); sem animação em reduced-motion
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) { grid.classList.add("in"); io.disconnect(); setTimeout(() => grid.classList.add("done"), 1600); }
  }), { threshold: 0.12 });
  io.observe(grid);

  // filtro por categoria: sai (fade) -> esconde -> entra
  let busy = 0;
  tabs.addEventListener("click", (e) => {
    const t = e.target.closest(".ev-tab"); if (!t || t.classList.contains("on")) return;
    tabs.querySelectorAll(".ev-tab").forEach((b) => { const on = b === t; b.classList.toggle("on", on); b.setAttribute("aria-selected", String(on)); });
    const cat = t.dataset.cat, token = ++busy;
    grid.classList.toggle("filtered", cat !== "todos");
    const show = cards.filter((c) => cat === "todos" || c.dataset.cat === cat);
    const apply = () => {
      if (token !== busy) return;
      cards.forEach((c) => { const keep = show.indexOf(c) !== -1; c.hidden = !keep; if (!keep) c.classList.add("out"); });
      requestAnimationFrame(() => requestAnimationFrame(() => show.forEach((c, i) => { c.style.setProperty("--d", i * 50 + "ms"); c.classList.remove("out"); })));
    };
    cards.forEach((c) => c.classList.add("out"));
    if (reduce) apply(); else setTimeout(apply, 260);
  });

  // aviso temporário (toast): um só elemento, reaproveitado; some sozinho em ~2,5 s
  let toast = null, toastT = 0;
  const say = (msg) => {
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "ev-toast"; toast.setAttribute("role", "status"); toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    clearTimeout(toastT);
    void toast.offsetWidth;                     // garante a transição mesmo no 1º aviso
    toast.classList.add("show");
    toastT = setTimeout(() => toast.classList.remove("show"), 2500);
  };

  // clique/toque: escolhe o tipo no formulário de orçamento (estado "selecionado" sutil no card);
  // em telas sem hover (toque) o toque também mostra a frase do card
  const touch = matchMedia("(hover: none)").matches;
  grid.addEventListener("click", (e) => {
    const c = e.target.closest(".ev-card"); if (!c) return;
    const wasSel = c.classList.contains("sel");
    cards.forEach((x) => { x.classList.remove("open", "sel"); x.setAttribute("aria-pressed", "false"); });
    if (wasSel) return;                         // segundo clique desmarca
    c.classList.add("sel"); c.setAttribute("aria-pressed", "true");
    if (touch) c.classList.add("open");
    const sel = document.getElementById("q-type");
    if (sel) {
      sel.value = c.dataset.type;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      say("Tipo de evento escolhido: " + c.dataset.type);
    }
  });
  if (touch) document.addEventListener("click", (e) => { if (!e.target.closest(".ev-card")) cards.forEach((x) => x.classList.remove("open")); });
})();
