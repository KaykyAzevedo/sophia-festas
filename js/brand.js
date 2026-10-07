/* =========================================================
   Marca Sophia Festa — logo oficial redesenhada em SVG
   (referência: logo original do cliente, fora do repositório)
   Uso: <div data-logo="big|mark"></div>  /  <div data-butterfly></div>
   API: window.SophiaBrand = { butterflySVG, logoSVG, name }
   Fontes: Great Vibes (Sophia) e Cinzel (FESTA), já carregadas nas páginas.
   Classes úteis p/ tema claro/impressão: .sf-word, .sf-sub, .sf-star.
   ========================================================= */
(function () {
  const BRAND_NAME = "Sophia Festa";
  let uid = 0;

  // Borboleta monarca azul, de perfil, asas para a esquerda. Caixa ~ 0..142 x 0..164
  const FORE = "M104,110 C112,90 112,60 100,40 C92,22 70,6 52,3 C40,10 30,32 32,56 C33,70 38,78 50,81 C60,84 66,88 74,88 Z";
  const HIND = "M106,114 C96,100 80,88 60,86 C40,84 22,86 10,94 C2,100 -2,114 2,128 C6,142 16,152 32,156 C48,160 64,152 76,142 C90,132 100,122 106,114 Z";
  const shrink = (cx, cy, s) => `transform="translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})"`;

  function butterflyDefs(p) {
    return `
      <radialGradient id="${p}-wing" gradientUnits="userSpaceOnUse" cx="100" cy="104" r="112">
        <stop offset="0" stop-color="#52dcff"/>
        <stop offset=".35" stop-color="#12a0ff"/>
        <stop offset=".72" stop-color="#1362e8"/>
        <stop offset="1" stop-color="#0a2f9a"/>
      </radialGradient>`;
  }

  function butterflyShapes(p) {
    const veins = (x, y, pts) => pts.map(([a, b]) => `<path d="M${x},${y} L${a},${b}"/>`).join("");
    return `
      <g class="wing-l">
        <path d="${HIND}" fill="#05070f" stroke="#2a5fd0" stroke-width="1"/>
        <path d="${HIND}" ${shrink(54, 120, 0.8)} fill="url(#${p}-wing)"/>
        <g stroke="#06236e" stroke-width="1.1" opacity=".75" fill="none">${veins(100, 112, [[26, 100], [14, 118], [24, 142], [48, 150], [74, 140]])}</g>
        <path d="${HIND}" ${shrink(54, 120, 0.92)} fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0.01 5.6"/>
        <path d="${FORE}" fill="#05070f" stroke="#2a5fd0" stroke-width="1"/>
        <path d="${FORE}" ${shrink(72, 56, 0.8)} fill="url(#${p}-wing)"/>
        <g stroke="#06236e" stroke-width="1.1" opacity=".75" fill="none">${veins(98, 100, [[54, 14], [44, 30], [42, 52], [58, 74], [82, 40]])}</g>
        <path d="${FORE}" ${shrink(72, 56, 0.92)} fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="0.01 5.6"/>
      </g>
      <path d="M114,104 C116,82 123,64 120,50 M116,105 C124,92 134,78 140,64" stroke="#05070f" stroke-width="1.3" fill="none" stroke-linecap="round"/>
      <path d="M72,154 L112,108" stroke="#8fb6ff" stroke-width="6.6" stroke-linecap="round"/>
      <path d="M72,154 L112,108" stroke="#05070f" stroke-width="4.6" stroke-linecap="round"/>
      <circle cx="115" cy="105" r="4.6" fill="#8fb6ff"/><circle cx="115" cy="105" r="3.4" fill="#05070f"/>`;
  }

  function butterflySVG() {
    const p = "bf" + ++uid;
    return `<svg viewBox="-2 0 144 164" aria-hidden="true" class="butterfly-svg">
      <defs>${butterflyDefs(p)}</defs>
      <g class="logo-butterfly">${butterflyShapes(p)}</g>
    </svg>`;
  }

  // estrela de n pontas: raios alternados (cardeais longos, diagonais curtos, vales)
  function star8(cx, cy, L, S, I) {
    const pts = [];
    for (let i = 0; i < 16; i++) {
      const a = (Math.PI / 8) * i - Math.PI / 2;
      const r = i % 2 ? I : (i % 4 === 0 ? L : S);
      pts.push((cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1));
    }
    return pts.join(" ");
  }
  function star4(cx, cy, r) {
    const k = r * 0.26;
    return `${cx},${cy - r} ${cx + k},${cy - k} ${cx + r},${cy} ${cx + k},${cy + k} ${cx},${cy + r} ${cx - k},${cy + k} ${cx - r},${cy} ${cx - k},${cy - k}`;
  }

  // Logo: "Sophia" cursiva branca, borboleta azul no S, estrela à direita e FESTA embaixo
  function logoSVG(variant) {
    const p = "lg" + ++uid;
    const big = variant === "big";
    const h = big ? 312 : 262;
    return `<svg viewBox="0 0 560 ${h}" class="${big ? "logo-big" : "logo-mark"}" role="img" aria-label="${BRAND_NAME}">
      <defs>
        ${butterflyDefs(p)}
        <radialGradient id="${p}-star" cx=".5" cy=".5" r=".55">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset=".3" stop-color="#d8e9ff"/>
          <stop offset="1" stop-color="#5a9dff"/>
        </radialGradient>
        <filter id="${p}-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="${p}-relief" x="-5%" y="-5%" width="110%" height="120%">
          <feDropShadow dx="1.2" dy="1.8" stdDeviation="1.2" flood-color="#2f7bff" flood-opacity=".55"/>
        </filter>
      </defs>
      <text class="sf-word" transform="translate(26 236) scale(1 1.18)" font-family="'Great Vibes', cursive" font-size="172" fill="#fff"
            stroke="#b9d6ff" stroke-width=".8" paint-order="stroke" filter="url(#${p}-relief)">Sophia</text>
      <g class="logo-butterfly" transform="translate(6 8) scale(.9)">${butterflyShapes(p)}</g>
      <g class="sf-star" filter="url(#${p}-glow)">
        <polygon points="${star8(478, 136, 72, 40, 13)}" fill="url(#${p}-star)" stroke="#9cc4ff" stroke-width=".8" stroke-linejoin="round"/>
        ${big ? [[438, 78, 12], [520, 82, 11], [528, 188, 11], [500, 216, 9]].map(([x, y, r]) =>
          `<polygon points="${star4(x, y, r)}" fill="url(#${p}-star)" stroke="#7fb2ff" stroke-width=".7"/>`).join("") : ""}
      </g>
      ${big ? `<text class="sf-sub" x="246" y="298" font-family="Cinzel, serif" font-weight="600" font-size="40" textLength="258" lengthAdjust="spacing" fill="#fff"
            stroke="#b9d6ff" stroke-width=".5" paint-order="stroke">FESTA</text>` : ""}
    </svg>`;
  }

  function mount() {
    document.querySelectorAll("[data-logo]").forEach((el) => {
      el.innerHTML = logoSVG(el.dataset.logo || "mark");
    });
    document.querySelectorAll("[data-butterfly]").forEach((el) => {
      el.innerHTML = butterflySVG();
    });
  }

  window.SophiaBrand = { butterflySVG, logoSVG, name: BRAND_NAME };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
