/* =========================================================
   Marca Sophia Festa — logo oficial redesenhada em SVG
   (referência: logo original do cliente, fora do repositório)
   Uso: <div data-logo="big|mark"></div>  /  <div data-butterfly></div>
   API: window.SophiaBrand = { butterflySVG, logoSVG, name }
   Fontes: Great Vibes (Sophia) e Cinzel (FESTA), já carregadas nas páginas.
   Classes úteis p/ tema claro/impressão: .sf-word, .sf-sub, .sf-star.
   Camadas .sf-layer[data-layer] (word, sub, star, bfly): parallax 3D do hero (magic.js).
   Borboleta solta (de frente): asas .bf-fore/.bf-hind (.l/.r) articuladas junto ao corpo.
   Borboleta da logo (de perfil): asas .pw-fore/.pw-hind. Animações em css/style.css.
   ========================================================= */
(function () {
  const BRAND_NAME = "Sophia Festa";
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;

  const shrink = (cx, cy, s) => `transform="translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})"`;

  /* ---------- pontinhos de borda: amostrados ao longo do contorno, tamanhos irregulares ---------- */
  const dotCache = {};
  function dots(key, d, hx, hy, sc, seed, from, to, step) {
    if (dotCache[key]) return dotCache[key];
    let out = "";
    try {
      const path = document.createElementNS(NS, "path");
      path.setAttribute("d", d);
      const len = path.getTotalLength();
      let s = seed, pos = len * from;
      const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
      while (pos < len * to) {
        const q = path.getPointAtLength(pos);
        const x = hx + (q.x - hx) * sc, y = hy + (q.y - hy) * sc;
        const r = 0.5 + rnd() * 0.65;
        out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}"/>`;
        pos += step * (0.8 + rnd() * 0.5);
      }
    } catch (e) { /* sem pontinhos */ }
    return (dotCache[key] = `<g fill="#fff" opacity=".92">${out}</g>`);
  }

  /* ================= borboleta solta: vista de frente, simétrica ================= */
  const FORE = "M-2,-2 C-14,-34 -52,-58 -62,-38 C-68,-20 -44,2 -4,4 Z";
  const HIND = "M-2,6 C-32,8 -48,28 -38,44 C-28,56 -8,36 -1,12 Z";

  function frontDefs(p) {
    return `
      <radialGradient id="${p}-gf" gradientUnits="userSpaceOnUse" cx="-32" cy="-14" r="46">
        <stop offset="0" stop-color="#9af6ff"/>
        <stop offset=".3" stop-color="#2cc4ff"/>
        <stop offset=".66" stop-color="#1470f0"/>
        <stop offset="1" stop-color="#0a2fa0"/>
      </radialGradient>
      <radialGradient id="${p}-gh" gradientUnits="userSpaceOnUse" cx="-22" cy="26" r="36">
        <stop offset="0" stop-color="#8cf0ff"/>
        <stop offset=".3" stop-color="#26b8ff"/>
        <stop offset=".66" stop-color="#1262ea"/>
        <stop offset="1" stop-color="#0a2c98"/>
      </radialGradient>
      <linearGradient id="${p}-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1b2a55"/>
        <stop offset=".5" stop-color="#070d22"/>
        <stop offset="1" stop-color="#02040c"/>
      </linearGradient>`;
  }

  // conteúdo de uma asa no lado esquerdo (a direita é espelhada por scale(-1 1))
  function foreWing(p) {
    return `
      <path d="${FORE}" fill="#040920" stroke="#2a62e0" stroke-width=".7"/>
      <path d="${FORE}" ${shrink(-3, 2, 0.85)} fill="url(#${p}-gf)"/>
      <g stroke="#0a2a78" stroke-width=".55" fill="none" opacity=".75" stroke-linecap="round">
        <path d="M-6,0 Q-26,-4 -50,-24"/><path d="M-6,-1 Q-22,-14 -42,-36"/><path d="M-6,-2 Q-16,-18 -30,-38"/>
        <path d="M-6,0 Q-30,2 -53,-12"/><path d="M-6,-2 Q-12,-16 -18,-31"/>
      </g>
      <path d="M-8,-4 C-18,-22 -34,-36 -48,-38 C-38,-26 -22,-12 -8,-2 Z" fill="#fff" opacity=".16"/>
      ${dots("front-fore", FORE, -3, 2, 0.93, 7, 0.06, 0.88, 5.2)}`;
  }
  function hindWing(p) {
    return `
      <path d="${HIND}" fill="#040920" stroke="#2a62e0" stroke-width=".7"/>
      <path d="${HIND}" ${shrink(-2, 8, 0.84)} fill="url(#${p}-gh)"/>
      <g stroke="#0a2a78" stroke-width=".55" fill="none" opacity=".75" stroke-linecap="round">
        <path d="M-5,9 Q-24,10 -38,22"/><path d="M-5,10 Q-20,22 -32,40"/><path d="M-4,11 Q-10,26 -16,41"/>
      </g>
      <path d="M-7,10 C-20,12 -32,22 -34,34 C-24,28 -14,22 -7,14 Z" fill="#fff" opacity=".15"/>
      ${dots("front-hind", HIND, -2, 8, 0.92, 19, 0.06, 0.88, 5)}`;
  }

  function butterflySVG() {
    const p = "bf" + ++uid;
    const mirror = (inner) => `<g transform="scale(-1 1)">${inner}</g>`;
    const hind = hindWing(p), fore = foreWing(p);
    return `<svg viewBox="-72 -60 144 120" aria-hidden="true" class="butterfly-svg">
      <defs>${frontDefs(p)}</defs>
      <g class="bf-hind l"><g>${hind}</g></g><g class="bf-hind r">${mirror(hind)}</g>
      <g class="bf-fore l"><g>${fore}</g></g><g class="bf-fore r">${mirror(fore)}</g>
      <g class="bf-body">
        <path d="M-1,-17 C-3,-28 -9,-37 -17,-41 M1,-17 C3,-28 9,-37 17,-41" stroke="#b9d6ff" stroke-width=".9" fill="none" stroke-linecap="round"/>
        <circle cx="-17" cy="-41" r="1.7" fill="#dbeaff"/><circle cx="17" cy="-41" r="1.7" fill="#dbeaff"/>
        <ellipse cx="0" cy="-13" rx="3.4" ry="4" fill="url(#${p}-body)" stroke="#3a6fe0" stroke-width=".35"/>
        <ellipse cx="0" cy="-3" rx="3.2" ry="8" fill="url(#${p}-body)" stroke="#3a6fe0" stroke-width=".35"/>
        <path d="M0,5 C3.2,5 3.6,22 0,32 C-3.6,22 -3.2,5 0,5 Z" fill="url(#${p}-body)" stroke="#3a6fe0" stroke-width=".35"/>
        <path d="M-2.4,12 H2.4 M-2.1,18 H2.1 M-1.6,24 H1.6" stroke="#3a6fe0" stroke-width=".35" opacity=".7"/>
      </g>
    </svg>`;
  }

  /* ================= borboleta da logo: de perfil, pousada no S ================= */
  const PFORE = "M104,110 C112,90 112,60 100,40 C92,22 70,6 52,3 C40,10 30,32 32,56 C33,70 38,78 50,81 C60,84 66,88 74,88 Z";
  const PHIND = "M106,114 C96,100 80,88 60,86 C40,84 22,86 10,94 C2,100 -2,114 2,128 C6,142 16,152 32,156 C48,160 64,152 76,142 C90,132 100,122 106,114 Z";

  function profileDefs(p) {
    return `
      <radialGradient id="${p}-wing" gradientUnits="userSpaceOnUse" cx="78" cy="92" r="78">
        <stop offset="0" stop-color="#8af2ff"/>
        <stop offset=".28" stop-color="#26bcff"/>
        <stop offset=".62" stop-color="#1068ee"/>
        <stop offset="1" stop-color="#0a3ab0"/>
      </radialGradient>
      <linearGradient id="${p}-pbody" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1b2a55"/><stop offset="1" stop-color="#02040c"/>
      </linearGradient>`;
  }

  function profileShapes(p) {
    return `
      <g class="pw-hind">
        <path d="${PHIND}" fill="#05070f" stroke="#2a5fd0" stroke-width=".7"/>
        <path d="${PHIND}" ${shrink(54, 120, 0.8)} fill="url(#${p}-wing)"/>
        <g stroke="#031238" stroke-width="1" fill="none" opacity=".8" stroke-linecap="round">
          <path d="M100,112 Q60,100 26,104"/><path d="M100,113 Q52,114 16,120"/><path d="M100,114 Q60,128 24,140"/>
          <path d="M100,115 Q76,136 50,150"/><path d="M100,113 Q78,114 62,108"/>
        </g>
        ${dots("p-hind", PHIND, 54, 120, 0.92, 31, 0.07, 0.9, 6)}
      </g>
      <g class="pw-fore">
        <path d="${PFORE}" fill="#05070f" stroke="#2a5fd0" stroke-width=".7"/>
        <path d="${PFORE}" ${shrink(72, 56, 0.8)} fill="url(#${p}-wing)"/>
        <g stroke="#031238" stroke-width="1" fill="none" opacity=".8" stroke-linecap="round">
          <path d="M98,100 Q70,70 56,16"/><path d="M98,100 Q56,70 44,32"/><path d="M98,101 Q50,80 44,52"/>
          <path d="M98,102 Q70,86 58,74"/><path d="M98,99 Q92,60 80,32"/>
        </g>
        ${dots("p-fore", PFORE, 72, 56, 0.92, 43, 0.06, 0.9, 6)}
      </g>
      <path d="M114,104 C116,82 123,64 120,50 M116,105 C124,92 134,78 140,64" stroke="#05070f" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <circle cx="120" cy="50" r="1.5" fill="#05070f"/><circle cx="140" cy="64" r="1.5" fill="#05070f"/>
      <path d="M72,155 C84,142 100,122 108,111" stroke="#8fb6ff" stroke-width="4.6" stroke-linecap="round" fill="none"/>
      <path d="M72,155 C84,142 100,122 108,111" stroke="url(#${p}-pbody)" stroke-width="3.2" stroke-linecap="round" fill="none"/>
      <path d="M78,149 L106,115" stroke="#3b4a78" stroke-width="2.6" stroke-dasharray=".5 3.2" fill="none"/>
      <ellipse cx="109" cy="109" rx="4.4" ry="5.6" transform="rotate(40 109 109)" fill="#8fb6ff"/>
      <ellipse cx="109" cy="109" rx="3.4" ry="4.6" transform="rotate(40 109 109)" fill="#05070f"/>
      <circle cx="115" cy="104" r="3.4" fill="#8fb6ff"/><circle cx="115" cy="104" r="2.6" fill="#05070f"/>`;
  }

  /* ================= estrelas ================= */
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
        ${profileDefs(p)}
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
        <g class="sf-layer" data-layer="word"><text class="sf-word" transform="translate(26 236) scale(1 1.18)" font-family="'Great Vibes', cursive" font-size="172" fill="#fff"
              stroke="#b9d6ff" stroke-width=".8" paint-order="stroke" filter="url(#${p}-relief)">Sophia</text></g>
        <g class="sf-layer" data-layer="bfly"><g class="logo-butterfly" transform="translate(-4 -2)">${profileShapes(p)}</g></g>
        <g class="sf-layer" data-layer="star"><g class="sf-star" filter="url(#${p}-glow)">
          ${star8Facets(478, 136, 74, 44, 15, "#f2f8ff", "#4f95ff")}
          ${big ? [[438, 78, 12], [520, 82, 11], [528, 188, 11], [500, 216, 9]].map(([x, y, r]) =>
            `<polygon points="${star4(x, y, r)}" fill="url(#${p}-star)" stroke="#7fb2ff" stroke-width=".7"/>`).join("") : ""}
        </g></g>
        ${big ? `<g class="sf-layer" data-layer="sub"><text class="sf-sub" x="266" y="294" font-family="Cinzel, serif" font-weight="700" font-size="52" textLength="246" lengthAdjust="spacing" fill="#fff"
              stroke="#fff" stroke-width=".9" paint-order="stroke">FESTA</text></g>` : ""}
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
