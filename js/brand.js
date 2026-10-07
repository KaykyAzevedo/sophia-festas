/* =========================================================
   Marca Sophia Festa — logo oficial redesenhada em SVG
   (referência: logo original do cliente, fora do repositório)
   Uso: <div data-logo="big|mark"></div>  /  <div data-butterfly></div>
   API: window.SophiaBrand = { butterflySVG, logoSVG, name }
   Fontes: Great Vibes (Sophia) e Cinzel (FESTA), já carregadas nas páginas.
   Classes úteis p/ tema claro/impressão: .sf-word, .sf-sub, .sf-star.
   Animação: o grupo .wing-l (asas) bate via CSS (soft-flap / flap).
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
      <radialGradient id="${p}-wing" gradientUnits="userSpaceOnUse" cx="78" cy="92" r="78">
        <stop offset="0" stop-color="#8af2ff"/>
        <stop offset=".28" stop-color="#26bcff"/>
        <stop offset=".62" stop-color="#1068ee"/>
        <stop offset="1" stop-color="#0a3ab0"/>
      </radialGradient>`;
  }

  function butterflyShapes(p) {
    const veins = (x, y, pts) => pts.map(([a, b]) => `<path d="M${x},${y} L${a},${b}"/>`).join("");
    const dots = (d, s, w) => `<path d="${d}" ${shrink(s[0], s[1], s[2])} fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="0.01 5"/>`;
    return `
      <g class="wing-l">
        <path d="${HIND}" fill="#05070f" stroke="#2a5fd0" stroke-width=".8"/>
        <path d="${HIND}" ${shrink(54, 120, 0.7)} fill="url(#${p}-wing)"/>
        <g stroke="#031238" stroke-width="1.7" opacity=".9" fill="none" stroke-linecap="round">${veins(100, 112, [[24, 102], [14, 116], [20, 134], [36, 146], [56, 148], [76, 138], [60, 112]])}</g>
        ${dots(HIND, [54, 120, 0.93], 2.6)}${dots(HIND, [54, 120, 0.855], 1.9)}
        <path d="${FORE}" fill="#05070f" stroke="#2a5fd0" stroke-width=".8"/>
        <path d="${FORE}" ${shrink(72, 56, 0.7)} fill="url(#${p}-wing)"/>
        <g stroke="#031238" stroke-width="1.7" opacity=".9" fill="none" stroke-linecap="round">${veins(98, 100, [[54, 16], [44, 30], [44, 52], [58, 72], [84, 40], [70, 28]])}</g>
        ${dots(FORE, [72, 56, 0.93], 2.6)}${dots(FORE, [72, 56, 0.855], 1.9)}
      </g>
      <path d="M114,104 C116,82 123,64 120,50 M116,105 C124,92 134,78 140,64" stroke="#05070f" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <path d="M72,154 L112,108" stroke="#8fb6ff" stroke-width="7" stroke-linecap="round"/>
      <path d="M72,154 L112,108" stroke="#05070f" stroke-width="5" stroke-linecap="round"/>
      <path d="M74,152 L110,110" stroke="#3b4a78" stroke-width="3.6" stroke-dasharray="1.1 3.4"/>
      <circle cx="115" cy="105" r="4.8" fill="#8fb6ff"/><circle cx="115" cy="105" r="3.6" fill="#05070f"/>`;
  }

  function butterflySVG() {
    const p = "bf" + ++uid;
    return `<svg viewBox="-2 0 144 164" aria-hidden="true" class="butterfly-svg">
      <defs>${butterflyDefs(p)}</defs>
      <g class="logo-butterfly">${butterflyShapes(p)}</g>
    </svg>`;
  }

  const pt = (cx, cy, r, a) => (cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1);

  // estrela facetada de 8 pontas: cada ponta tem metade clara e metade azul
  function star8Facets(cx, cy, L, S, I, light, dark) {
    let out = "";
    for (let k = 0; k < 8; k++) {
      const a = (Math.PI / 4) * k - Math.PI / 2, r = k % 2 ? S : L, d = Math.PI / 8;
      out += `<polygon points="${cx},${cy} ${pt(cx, cy, I, a - d)} ${pt(cx, cy, r, a)}" fill="${light}"/>` +
             `<polygon points="${cx},${cy} ${pt(cx, cy, r, a)} ${pt(cx, cy, I, a + d)}" fill="${dark}"/>`;
    }
    return out;
  }
  function star4(cx, cy, r) {
    const k = r * 0.26;
    return `${cx},${cy - r} ${cx + k},${cy - k} ${cx + r},${cy} ${cx + k},${cy + k} ${cx},${cy + r} ${cx - k},${cy + k} ${cx - r},${cy} ${cx - k},${cy - k}`;
  }

  // Logo: "Sophia" cursiva branca, borboleta azul no S, estrela à direita e FESTA embaixo
  function logoSVG(variant) {
    const p = "lg" + ++uid;
    const big = variant === "big";
    const h = big ? 318 : 268;
    return `<svg viewBox="0 0 592 ${h}" class="${big ? "logo-big" : "logo-mark"}" role="img" aria-label="${BRAND_NAME}">
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
      <g transform="translate(16 12)">
        <text class="sf-word" transform="translate(26 236) scale(1 1.18)" font-family="'Great Vibes', cursive" font-size="172" fill="#fff"
              stroke="#b9d6ff" stroke-width=".8" paint-order="stroke" filter="url(#${p}-relief)">Sophia</text>
        <g class="logo-butterfly" transform="translate(-4 -2)">${butterflyShapes(p)}</g>
        <g class="sf-star" filter="url(#${p}-glow)">
          ${star8Facets(478, 136, 74, 44, 15, "#f2f8ff", "#4f95ff")}
          ${big ? [[438, 78, 12], [520, 82, 11], [528, 188, 11], [500, 216, 9]].map(([x, y, r]) =>
            `<polygon points="${star4(x, y, r)}" fill="url(#${p}-star)" stroke="#7fb2ff" stroke-width=".7"/>`).join("") : ""}
        </g>
        ${big ? `<text class="sf-sub" x="240" y="288" font-family="Cinzel, serif" font-weight="700" font-size="54" textLength="264" lengthAdjust="spacing" fill="#fff"
              stroke="#fff" stroke-width=".9" paint-order="stroke">FESTA</text>` : ""}
      </g>
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
