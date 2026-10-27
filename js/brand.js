/* =========================================================
   Marca Sophia Festas — logo oficial redesenhada em SVG
   (referência: logo original do cliente, fora do repositório)
   Uso: <div data-logo="big|mark"></div>  /  <div data-butterfly></div>
   API: window.SophiaBrand = { butterflySVG, logoSVG, name }
   Fontes: Great Vibes (Sophia) e Cinzel (FESTAS), já carregadas nas páginas.
   Classes úteis p/ tema claro/impressão: .sf-word, .sf-sub, .sf-star.
   Camadas .sf-layer[data-layer] (word, sub, star, bfly): parallax 3D do hero (magic.js).
   Borboleta: PNG/WebP recortado da logo oficial (img/borboleta.webp); animação (flutuar) em css/style.css.
   ========================================================= */
(function () {
  const BRAND_NAME = "Sophia Festas";
  const NS = "http://www.w3.org/2000/svg";
  let uid = 0;

  /* ================= borboleta: recorte da própria imagem da logo (img/borboleta.webp, fundo transparente) ================= */
  // raiz do site a partir do próprio script (funciona também em subpastas, ex.: preview/)
  const ROOT = document.currentScript && document.currentScript.src ? new URL("../", document.currentScript.src).href : "";
  const BFLY_SRC = ROOT + "img/borboleta.webp", BFLY_FALLBACK = ROOT + "img/borboleta.png", BFLY_W = 480, BFLY_H = 604;

  // borboleta solta (nas seções, no brilho flutuante e no toast)
  function butterflySVG() {
    return `<img class="butterfly-svg" src="${BFLY_SRC}" alt="" width="${BFLY_W}" height="${BFLY_H}" decoding="async" onerror="this.onerror=null;this.src='${BFLY_FALLBACK}'">`;
  }

  /* ================= estrelas ================= */
  const pt = (cx, cy, r, a) => (cx + r * Math.cos(a)).toFixed(1) + "," + (cy + r * Math.sin(a)).toFixed(1);

  // estrela facetada de 8 pontas (prata): comprimentos por ponta, a partir do norte, no sentido horário
  function star8Facets(cx, cy, lens, I, light, dark) {
    let out = "";
    for (let k = 0; k < 8; k++) {
      const a = (Math.PI / 4) * k - Math.PI / 2, r = lens[k], d = Math.PI / 8;
      out += `<polygon points="${cx},${cy} ${pt(cx, cy, I, a - d)} ${pt(cx, cy, r, a)}" fill="${light}"/>` +
             `<polygon points="${cx},${cy} ${pt(cx, cy, r, a)} ${pt(cx, cy, I, a + d)}" fill="${dark}"/>`;
    }
    return out;
  }
  function star4(cx, cy, r) {
    const k = r * 0.26;
    return `${cx},${cy - r} ${cx + k},${cy - k} ${cx + r},${cy} ${cx + k},${cy + k} ${cx},${cy + r} ${cx - k},${cy + k} ${cx - r},${cy} ${cx - k},${cy - k}`;
  }

  // Logo: "Sophia" cursiva branca, borboleta monarca azul no S, estrela prata à direita e FESTAS embaixo
  function logoSVG(variant) {
    const p = "lg" + ++uid;
    const big = variant === "big";
    const h = big ? 318 : 268;
    return `<svg viewBox="0 20 592 ${h - 20}" class="${big ? "logo-big" : "logo-mark"}" role="img" aria-label="${BRAND_NAME}">
      <defs>
        <radialGradient id="${p}-star" cx=".5" cy=".5" r=".55">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset=".4" stop-color="#eef2f8"/>
          <stop offset="1" stop-color="#b4bfcf"/>
        </radialGradient>
        <filter id="${p}-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="${p}-relief" x="-5%" y="-5%" width="110%" height="120%">
          <feDropShadow dx="1.2" dy="1.8" stdDeviation="1.2" flood-color="#8aa0c8" flood-opacity=".5"/>
        </filter>
      </defs>
      <g transform="translate(16 12)">
        <g class="sf-layer" data-layer="word"><text class="sf-word" transform="translate(26 236) scale(1 1.18)" font-family="'Great Vibes', cursive" font-size="172" fill="#fff"
              stroke="#e4e9f1" stroke-width="1.6" paint-order="stroke" filter="url(#${p}-relief)">Sophia</text></g>
        <g class="sf-layer" data-layer="bfly"><g class="logo-butterfly"><image href="${BFLY_SRC}" x="3.4" y="17.6" width="115" height="${(115 * BFLY_H / BFLY_W).toFixed(1)}" preserveAspectRatio="xMidYMid meet"/></g></g>
        <g class="sf-layer" data-layer="star"><g class="sf-star" filter="url(#${p}-glow)">
          ${star8Facets(478, 140, [84, 40, 76, 40, 100, 40, 76, 40], 13, "#ffffff", "#aeb8c8")}
          ${big ? [[438, 78, 12], [520, 82, 11], [528, 188, 11], [500, 216, 9]].map(([x, y, r]) =>
            `<polygon points="${star4(x, y, r)}" fill="url(#${p}-star)" stroke="#dfe6f0" stroke-width=".7"/>`).join("") : ""}
        </g></g>
        ${big ? `<g class="sf-layer" data-layer="sub"><text class="sf-sub" x="272" y="298" font-family="Cinzel, serif" font-weight="700" font-size="50" textLength="262" lengthAdjust="spacing" fill="#f3f6fa"
              stroke="#f3f6fa" stroke-width=".9" paint-order="stroke">FESTAS</text></g>` : ""}
      </g>
    </svg>`;
  }

  function mount() {
    document.querySelectorAll("[data-logo]").forEach((el) => {
      el.innerHTML = logoSVG(el.dataset.logo || "mark");
      // sem WebP (ou arquivo ausente): cai para o PNG
      el.querySelectorAll("image").forEach((im) => im.addEventListener("error", () => { im.setAttribute("href", BFLY_FALLBACK); }, { once: true }));
    });
    document.querySelectorAll("[data-butterfly]").forEach((el) => {
      el.innerHTML = butterflySVG();
    });
  }

  window.SophiaBrand = { butterflySVG, logoSVG, name: BRAND_NAME, root: ROOT };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
