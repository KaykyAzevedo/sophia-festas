/* =========================================================
   Seções do index: incluso, opcionais, regras, contato (mapa/total animado), rodapé.
   Tudo vem do config (SOPHIA): itens inclusos, opcionais, regras, endereço e WhatsApp.
   JS puro; animações só em transform/opacity; prefers-reduced-motion = sem animação.
   ========================================================= */
(function () {
  const S = window.SOPHIA || {};
  const $ = (id) => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const waLink = (text) => "https://wa.me/" + S.WHATSAPP + "?text=" + encodeURIComponent(text);
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const I = (d) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>";

  /* ---------- #incluso: 14 itens em cards por categoria ---------- */
  const CAT = {
    estrutura: ["Estrutura", I('<path d="M3 21V9l9-6 9 6v12zM9 21v-6h6v6"/>')],
    lazer: ["Lazer", I('<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 4.5h-5L8 10z"/>')],
    cozinha: ["Cozinha", I('<path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>')],
    conforto: ["Conforto", I('<path d="M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0M12 19h.01"/>')],
    seguranca: ["Segurança", I('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>')],
  };
  const ITEM_CAT = {
    "Área para decoração de festa": "estrutura", "2 banheiros (feminino e masculino)": "estrutura", "10 jogos de mesa com 4 cadeiras cada": "estrutura",
    "Piscina grande": "lazer", "Totó (pebolim)": "lazer", "Sinuca": "lazer", "Sistema de som JBL": "lazer",
    "Churrasqueira": "cozinha", "Fogão industrial de 6 bocas": "cozinha", "Frigobar": "cozinha", "Geladeira": "cozinha",
    "Wi-Fi": "conforto", "Televisão": "conforto", "Monitoramento por câmeras": "seguranca",
  };
  const incl = $("included-list");
  if (incl && S.INCLUDED) {
    const order = ["estrutura", "lazer", "cozinha", "conforto", "seguranca"];
    const items = S.INCLUDED.map((t) => ({ t, c: ITEM_CAT[t] || "estrutura" })).sort((a, b) => order.indexOf(a.c) - order.indexOf(b.c));
    incl.innerHTML = items.map((it, i) =>
      '<li class="inc-card st" style="--i:' + i + '"><span class="inc-ic">' + CAT[it.c][1] + "</span>" +
      '<span class="inc-tx"><small>' + CAT[it.c][0] + "</small><b>" + esc(it.t) + "</b></span></li>").join("");
  }

  /* ---------- #opcionais: cards premium com consulta no WhatsApp ---------- */
  const OPT = {
    "telao": { icon: I('<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>'), photo: "piscina-telao", big: true, note: "Junto à piscina, para noites de cinema e jogos." },
    "rede-futevolei": { icon: I('<path d="M3 4v16M21 4v16M3 8h18M3 12h18M3 16h18M7 8v8M11 8v8M15 8v8M19 8v8"/>'), photo: null, note: "Para animar a área externa." },
    "piscina-aquecida": { icon: I('<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 9v6"/>'), photo: null, note: "Consulte a disponibilidade para o seu dia." },
  };
  const opts = $("optionals-list");
  if (opts && S.OPTIONALS) {
    opts.innerHTML = S.OPTIONALS.map((o, i) => {
      const d = OPT[o.id] || { icon: CAT.estrutura[1], photo: null, note: "" };
      const photo = d.photo ? '<picture class="opt-bg"><source type="image/webp" srcset="img/' + d.photo + '-800.webp"><img src="img/' + d.photo + '.jpg" alt="" width="1448" height="1086" loading="lazy" decoding="async"></picture>' : "";
      const href = waLink("Olá! Vim pelo site da Sophia Festas e gostaria de consultar o valor do opcional: " + o.label + ".");
      return '<article class="opt-card2 st' + (d.big ? " big" : "") + (d.photo ? " has-photo" : "") + '" style="--i:' + i + '">' + photo +
        '<span class="opt-badge">Sob consulta</span><span class="opt-ic">' + d.icon + "</span>" +
        '<div class="opt-body"><h3>' + esc(o.label) + "</h3><p>" + esc(d.note) + '</p>' +
        '<a class="btn btn-ghost opt-btn" href="' + href + '" target="_blank" rel="noopener">Consultar no WhatsApp</a></div></article>';
    }).join("");
  }

  /* ---------- #regras: cards numerados com ícone ---------- */
  const RULE_ICON = [
    I('<path d="M3 11l9-7 9 7M5 10v10h14V10"/><path d="M4 4l16 16"/>'),
    I('<path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3z"/><path d="M4 4l16 16"/>'),
    I('<path d="M6 21V4h12v17M3 21h18M14 12.500h.01"/>'),
    I('<path d="M5 16v-5l2-5h10l2 5v5M3 16h18M7 19v-3M17 19v-3M7 11h10"/><path d="M4 4l16 16"/>'),
  ];
  const rl = $("rules-list");
  if (rl && S.RULES) {
    rl.innerHTML = S.RULES.map((t, i) => {
      const no = /^(Não|Proibid)/i.test(t);
      return '<li class="rule-card st" style="--i:' + i + '"><span class="rule-n">' + String(i + 1).padStart(2, "0") + '</span>' +
        '<span class="rule-ic">' + (RULE_ICON[i] || RULE_ICON[0]) + "</span>" +
        '<div class="rule-tx">' + (no ? '<em class="rule-tag">Não pode</em>' : "") + "<p>" + esc(t) + "</p></div></li>";
    }).join("");
  }

  /* ---------- #contato: mapa + total animado ---------- */
  const maps = $("info-map");
  if (maps && S.ADDRESS) maps.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(S.ADDRESS);
  const addr2 = $("foot-addr"); if (addr2 && S.ADDRESS) addr2.textContent = S.ADDRESS;
  const footWa = $("foot-wa");
  if (footWa && S.WHATSAPP) {
    const d = S.WHATSAPP.replace(/^55/, "");
    footWa.textContent = "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
    footWa.href = waLink("Olá! Gostaria de informações sobre o aluguel da casa.");
  }
  const cta = $("final-wa"); if (cta) cta.href = waLink("Olá! Vim pelo site da Sophia Festas e gostaria de reservar a casa.");

  // chamado pelo renderEstimate do index: anima o valor total quando ele muda
  let lastTotal = null, rafT = 0;
  window.animateEstimate = function (box) {
    const dd = box && box.querySelector("dd.total[data-total]"); if (!dd) { lastTotal = null; return; }
    const to = Number(dd.dataset.total);
    const from = lastTotal == null ? to : lastTotal;
    lastTotal = to;
    if (reduce || from === to) { dd.textContent = brl(to); return; }
    cancelAnimationFrame(rafT);
    const t0 = performance.now(), dur = 600;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      dd.textContent = brl(from + (to - from) * e);
      if (p < 1) rafT = requestAnimationFrame(step);
    };
    rafT = requestAnimationFrame(step);
  };
})();
