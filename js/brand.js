/* =========================================================
   Marca Sophia Festas — logo e borboleta em SVG
   Uso: <div data-logo="big|mark"></div>  /  <div data-butterfly></div>
   ========================================================= */
(function () {
  const BRAND_NAME = "Sophia";
  let uid = 0;

  // Borboleta centrada em (0,0), ~110 x 90 unidades
  function butterflyShapes(p, opts = {}) {
    const stroke = opts.stroke || `url(#${p}-edge)`;
    const wingL = `
      <g class="wing-l">
        <path d="M-2,-2 C-14,-34 -52,-56 -60,-34 C-66,-16 -44,2 -4,4 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M-6,-4 C-18,-26 -42,-40 -48,-28 C-52,-18 -36,-6 -8,0 Z" fill="url(#${p}-inner)" opacity=".85"/>
        <path d="M-2,6 C-32,8 -46,28 -36,42 C-26,54 -8,34 -1,12 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M-6,10 C-26,14 -34,28 -28,36 C-22,42 -10,28 -5,14 Z" fill="url(#${p}-inner)" opacity=".7"/>
        <circle cx="-50" cy="-32" r="2.6" fill="#e8f1ff"/>
        <circle cx="-42" cy="-40" r="1.6" fill="#b9d6ff"/>
        <circle cx="-31" cy="38" r="1.8" fill="#e8f1ff"/>
      </g>`;
    const wingR = `
      <g class="wing-r">
        <path d="M2,-2 C14,-34 52,-56 60,-34 C66,-16 44,2 4,4 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M6,-4 C18,-26 42,-40 48,-28 C52,-18 36,-6 8,0 Z" fill="url(#${p}-inner)" opacity=".85"/>
        <path d="M2,6 C32,8 46,28 36,42 C26,54 8,34 1,12 Z" fill="url(#${p}-wing)" stroke="${stroke}" stroke-width="1.6"/>
        <path d="M6,10 C26,14 34,28 28,36 C22,42 10,28 5,14 Z" fill="url(#${p}-inner)" opacity=".7"/>
        <circle cx="50" cy="-32" r="2.6" fill="#e8f1ff"/>
        <circle cx="42" cy="-40" r="1.6" fill="#b9d6ff"/>
        <circle cx="31" cy="38" r="1.8" fill="#e8f1ff"/>
      </g>`;
    const body = `
      <path d="M-1,-16 C-4,-28 -10,-36 -16,-40 M1,-16 C4,-28 10,-36 16,-40" stroke="url(#${p}-edge)" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <circle cx="-16" cy="-40" r="2" fill="#dfe5ee"/><circle cx="16" cy="-40" r="2" fill="#dfe5ee"/>
      <ellipse cx="0" cy="4" rx="3" ry="20" fill="url(#${p}-body)"/>`;
    return wingL + wingR + body;
  }

  function butterflyDefs(p) {
    return `
      <linearGradient id="${p}-wing" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0a1230"/>
        <stop offset=".45" stop-color="#1a4fc0"/>
        <stop offset=".75" stop-color="#2f7bff"/>
        <stop offset="1" stop-color="#05070f"/>
      </linearGradient>
      <radialGradient id="${p}-inner" cx=".5" cy=".5" r=".6">
        <stop offset="0" stop-color="#9cc4ff"/>
        <stop offset=".6" stop-color="#2f7bff" stop-opacity=".6"/>
        <stop offset="1" stop-color="#030409" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${p}-edge" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f4f7fb"/>
        <stop offset=".3" stop-color="#8a94a6"/>
        <stop offset=".55" stop-color="#eef2f7"/>
        <stop offset=".8" stop-color="#6f7a8c"/>
        <stop offset="1" stop-color="#dfe5ee"/>
      </linearGradient>
      <linearGradient id="${p}-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#dfe5ee"/>
        <stop offset=".5" stop-color="#3a4256"/>
        <stop offset="1" stop-color="#0b1226"/>
      </linearGradient>`;
  }

  function butterflySVG() {
    const p = "bf" + ++uid;
    return `<svg viewBox="-70 -60 140 120" aria-hidden="true" class="butterfly-svg">
      <defs>${butterflyDefs(p)}</defs>
      <g class="logo-butterfly">${butterflyShapes(p)}</g>
    </svg>`;
  }

  // Logo: "Sophia" em caligrafia metálica com a borboleta pousada no S
  function logoSVG(variant) {
    const p = "lg" + ++uid;
    const showSub = variant === "big";
    const h = showSub ? 250 : 190;
    return `<svg viewBox="0 0 560 ${h}" class="${variant === "big" ? "logo-big" : "logo-mark"}" role="img" aria-label="${BRAND_NAME} Festas">
      <defs>
        ${butterflyDefs(p)}
        <linearGradient id="${p}-metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f4f7fb"/>
          <stop offset=".22" stop-color="#9aa4b3"/>
          <stop offset=".42" stop-color="#ffffff"/>
          <stop offset=".62" stop-color="#7d889a"/>
          <stop offset=".8" stop-color="#e6ebf2"/>
          <stop offset="1" stop-color="#a7b1bf"/>
        </linearGradient>
        <linearGradient id="${p}-sblue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e8f1ff"/>
          <stop offset=".35" stop-color="#6aa8ff"/>
          <stop offset=".7" stop-color="#1a4fc0"/>
          <stop offset="1" stop-color="#b9d6ff"/>
        </linearGradient>
        <filter id="${p}-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <text x="280" y="150" text-anchor="middle" font-family="Great Vibes, cursive" font-size="150"
            fill="url(#${p}-metal)" stroke="rgba(255,255,255,.25)" stroke-width=".6">
        <tspan fill="url(#${p}-sblue)" filter="url(#${p}-glow)">S</tspan>ophia
      </text>
      <g class="logo-butterfly" data-perch transform="translate(150 52) rotate(-16) scale(.58)">
        ${butterflyShapes(p)}
      </g>
      ${showSub ? `
      <g font-family="Cinzel, serif" font-size="20" letter-spacing="14" fill="url(#${p}-metal)" text-anchor="middle">
        <text x="287" y="212">FESTAS</text>
      </g>
      <path d="M150 205 H220 M354 205 H424" stroke="url(#${p}-metal)" stroke-width="1" opacity=".6"/>
      <circle cx="146" cy="205" r="2" fill="#6aa8ff"/><circle cx="428" cy="205" r="2" fill="#6aa8ff"/>` : ""}
    </svg>`;
  }

  // Pousa a borboleta exatamente sobre o topo do "S" (após a fonte carregar)
  function perch(svg) {
    const s = svg.querySelector("tspan");
    const bf = svg.querySelector("[data-perch]");
    if (!s || !bf || !s.getBBox) return;
    try {
      const n = s.getNumberOfChars ? s.getNumberOfChars() : 0;
      if (!n) return;
      const ext = s.getExtentOfChar(0);
      const x = ext.x + ext.width * 0.66;
      const y = ext.y + ext.height * 0.22;
      bf.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(-16) scale(.58)`);
    } catch (e) { /* mantém posição padrão */ }
  }

  function mount() {
    document.querySelectorAll("[data-logo]").forEach((el) => {
      el.innerHTML = logoSVG(el.dataset.logo || "mark");
    });
    document.querySelectorAll("[data-butterfly]").forEach((el) => {
      el.innerHTML = butterflySVG();
    });
    const place = () => document.querySelectorAll("[data-logo] svg").forEach(perch);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    else place();
  }

  window.SophiaBrand = { butterflySVG, logoSVG, name: BRAND_NAME };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
