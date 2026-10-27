/* =========================================================
   Hero cinematográfico — motion (JS puro, sem libs): entrada da logo, parallax, slideshow, contadores
   Tudo em transform/opacity; IntersectionObserver pausa fora da tela;
   prefers-reduced-motion = conteúdo final, sem animação.
   ========================================================= */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const root = document.documentElement;
  root.classList.add(reduce ? "rm" : "mo");
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const S = window.SOPHIA || {};
  const ROOT = (window.SophiaBrand && window.SophiaBrand.root) || "../";
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const small = () => innerWidth < 700;
  const WAIT = 1900; // fim da animação de entrada da logo (ms)

  /* ---------- dados do config (fonte única) ---------- */
  const CFG = {
    BASE_PRICE: () => S.BASE_PRICE,
    CASHBACK: () => Math.round((S.CASHBACK_PCT || 0) * 100),
    HOURS: () => S.HOURS_INCLUDED,
    INCLUDED: () => (S.INCLUDED || []).length,
  };
  $$("[data-cfg]").forEach((el) => { const v = CFG[el.dataset.cfg] && CFG[el.dataset.cfg](); if (v != null) el.dataset.to = v; if (v != null) el.textContent = fmtNum(v); });
  function fmtNum(v) { return Math.round(v).toLocaleString("pt-BR"); }
  $$("[data-wa]").forEach((a) => {
    a.href = "https://wa.me/" + S.WHATSAPP + "?text=" + encodeURIComponent(a.dataset.wa);
    a.target = "_blank"; a.rel = "noopener";
  });

  /* ---------- visibilidade por seção (pausa fora da tela / aba oculta) ---------- */
  const hosts = new Set();
  const hostIO = new IntersectionObserver((es) => es.forEach((e) => {
    e.target.classList.toggle("hx-off", !e.isIntersecting);
    e.target._vis = e.isIntersecting;
    (e.target._onvis || []).forEach((fn) => fn(e.isIntersecting));
  }), { rootMargin: "80px" });
  $$("[data-host]").forEach((h) => { h._vis = true; hosts.add(h); hostIO.observe(h); });
  document.addEventListener("visibilitychange", () => root.classList.toggle("hx-hidden", document.hidden));
  const onVis = (host, fn) => { (host._onvis = host._onvis || []).push(fn); };

  /* ---------- navegação: translúcida, esconde ao descer, progresso e seção ativa ---------- */
  const nav = $(".nav");
  if (nav) {
    const bar = document.createElement("span"); bar.className = "nav-progress"; nav.appendChild(bar);
    let last = scrollY, tick = false;
    const upd = () => {
      tick = false;
      const y = scrollY, d = y - last, menu = $(".nav-links.open", nav);
      if (!menu && !reduce) nav.classList.toggle("nav-hide", d > 4 && y > 260 ? true : d < -4 ? false : nav.classList.contains("nav-hide"));
      last = y;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? clamp(y / max, 0, 1) : 0).toFixed(4) + ")";
    };
    addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
    const links = $$('.nav-links a[href^="#"]', nav), map = new Map();
    links.forEach((a) => { const t = $(a.getAttribute("href")); if (t) map.set(t, a); });
    const secIO = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { links.forEach((l) => l.classList.remove("is-active")); map.get(e.target).classList.add("is-active"); }
    }), { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, t) => secIO.observe(t));
  }

  /* ---------- texto: split por palavra (reveal por máscara) ---------- */
  $$("[data-split]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map((w, i) => '<span class="w" aria-hidden="true"><span class="wi" style="--k:' + i + '">' + w + "</span></span>").join(" ");
  });

  /* ---------- contadores ---------- */
  const counters = $$("[data-count]");
  function runCount(el) {
    const to = Number(el.dataset.to) || 0, dur = 1700, t0 = performance.now() + (Number(el.dataset.delay) || 0);
    const step = (t) => {
      const p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmtNum(to * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if (!reduce) {
    counters.forEach((el) => { el.dataset.final = el.textContent; el.textContent = "0"; });
    const cIO = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { cIO.unobserve(e.target); setTimeout(() => runCount(e.target), root.classList.contains("go") ? 0 : WAIT - 300); }
    }), { threshold: 0.4 });
    counters.forEach((el) => cIO.observe(el));
  }

  /* ---------- botões magnéticos ---------- */
  if (!reduce && fine) {
    $$("[data-magnetic]").forEach((b) => {
      let raf = 0, tx = 0, ty = 0;
      const set = () => { raf = 0; b.style.setProperty("--mx", tx.toFixed(1) + "px"); b.style.setProperty("--my", ty.toFixed(1) + "px"); };
      addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const dx = e.clientX - cx, dy = e.clientY - cy, dist = Math.hypot(dx, dy), reach = Math.max(r.width, r.height) * 0.9;
        if (dist < reach) { tx = dx * 0.28; ty = dy * 0.38; } else if (!tx && !ty) return; else { tx = ty = 0; }
        if (!raf) raf = requestAnimationFrame(set);
      }, { passive: true });
    });
  }

  /* ---------- rastro de estrelas no cursor ---------- */
  if (!reduce && fine) {
    const POOL = 18, pool = [];
    for (let i = 0; i < POOL; i++) { const s = document.createElement("span"); s.className = "trail"; s.textContent = "✦"; document.body.appendChild(s); pool.push(s); }
    let n = 0, last = 0, lx = 0, ly = 0;
    addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - last < 48 || Math.hypot(e.clientX - lx, e.clientY - ly) < 14) return;
      last = now; lx = e.clientX; ly = e.clientY;
      const s = pool[n++ % POOL];
      s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px";
      s.style.setProperty("--dx", ((Math.random() - 0.5) * 36).toFixed(0) + "px");
      s.style.setProperty("--dy", (14 + Math.random() * 26).toFixed(0) + "px");
      s.style.setProperty("--r", ((Math.random() - 0.5) * 140).toFixed(0) + "deg");
      s.style.fontSize = (7 + Math.random() * 9).toFixed(0) + "px";
      s.classList.remove("on"); void s.offsetWidth; s.classList.add("on");
    }, { passive: true });
  }

  /* ---------- parallax por scroll + mouse (um único laço, só itens visíveis) ---------- */
  const items = [];
  let mx = 0, my = 0, tmx = 0, tmy = 0, raf = 0;
  function reg(el, par, mouse, scale) {
    const host = el.closest("[data-host]");
    items.push({ el, par: par || 0, mouse: mouse || 0, scale: scale || 1, host });
    el.style.willChange = "transform";
  }
  $$("[data-par],[data-mouse]").forEach((el) => reg(el, parseFloat(el.dataset.par), parseFloat(el.dataset.mouse), parseFloat(el.dataset.scale)));
  function frame() {
    raf = 0;
    mx += (tmx - mx) * 0.07; my += (tmy - my) * 0.07;
    const y = scrollY;
    for (const it of items) {
      if (it.host && !it.host._vis) continue;
      const ty = y * it.par + my * it.mouse, tx = mx * it.mouse;
      it.el.style.transform = "translate3d(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px,0)" + (it.scale !== 1 ? " scale(" + it.scale + ")" : "");
    }
    if (Math.abs(tmx - mx) > 0.002 || Math.abs(tmy - my) > 0.002) kick();
  }
  function kick() { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); }
  if (!reduce) {
    addEventListener("scroll", kick, { passive: true });
    if (fine) addEventListener("pointermove", (e) => { tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; kick(); }, { passive: true });
    else { // celular: flutuação lenta no lugar do mouse
      const lazy = (t) => { tmx = Math.sin(t / 4200) * 0.35; tmy = Math.cos(t / 5300) * 0.3; kick(); if (!document.hidden) setTimeout(() => requestAnimationFrame(lazy), 90); };
      requestAnimationFrame(lazy);
    }
    kick();
  }

  /* ---------- profundidade: estrelas e borboletas (uma só imagem reaproveitada) ---------- */
  function depth(host, cfg) {
    const src = ROOT + "img/borboleta.webp";
    const wrap = document.createElement("div");
    wrap.className = "depth-host"; wrap.setAttribute("aria-hidden", "true");
    const total = small() ? cfg.fliesMobile : cfg.flies;
    const L = [
      { c: "d1", mouse: 7, par: 0.03, size: [15, 22], blur: 1.6, op: 0.42, share: 0.4, stars: cfg.stars[0] },
      { c: "d2", mouse: 18, par: 0.08, size: [26, 38], blur: 0.7, op: 0.72, share: 0.35, stars: cfg.stars[1] },
      { c: "d3", mouse: 38, par: 0.18, size: [46, 70], blur: 1.4, op: 0.9, share: 0.25, stars: cfg.stars[2] },
    ];
    let left = total;
    L.forEach((l, i) => {
      const layer = document.createElement("div"); layer.className = "depth " + l.c; wrap.appendChild(layer);
      const nStars = small() ? Math.ceil(l.stars * 0.6) : l.stars;
      for (let k = 0; k < nStars; k++) {
        const s = document.createElement("span"); s.className = "ds"; s.textContent = Math.random() < 0.3 ? "✦" : "•";
        s.style.cssText = "left:" + (Math.random() * 100).toFixed(1) + "%;top:" + (Math.random() * 100).toFixed(1) + "%;--s:" + (6 + i * 4 + Math.random() * 6).toFixed(0) + "px;--t:" + (2.6 + Math.random() * 4).toFixed(1) + "s;--dl:-" + (Math.random() * 6).toFixed(1) + "s;--o:" + (0.4 + i * 0.2).toFixed(2);
        layer.appendChild(s);
      }
      const n = i === 2 ? left : Math.round(total * l.share); left -= n;
      for (let k = 0; k < n; k++) {
        const f = document.createElement("div");
        const size = l.size[0] + Math.random() * (l.size[1] - l.size[0]);
        const T = 16 + Math.random() * 14 + (2 - i) * 4;
        f.className = "df p" + (1 + ((k + i) % 3));
        f.style.cssText = "left:" + (4 + Math.random() * 88).toFixed(1) + "%;top:" + (10 + Math.random() * 80).toFixed(1) + "%;--s:" + size.toFixed(0) + "px;--o:" + l.op + ";--T:" + T.toFixed(1) + "s;--dl:-" + (Math.random() * T).toFixed(1) + "s;--fl:" + (0.55 + Math.random() * 0.5).toFixed(2) + "s" + (l.blur ? ";filter:blur(" + l.blur + "px)" : "");
        const im = document.createElement("img"); im.src = src; im.alt = ""; im.width = 480; im.height = 604; im.decoding = "async";
        f.appendChild(im); layer.appendChild(f);
      }
      if (!reduce) reg(layer, l.par, l.mouse);
    });
    host.appendChild(wrap);
    return wrap;
  }
  $$("[data-depth]").forEach((h) => {
    const P = { stars: [14, 10, 5], flies: 9, fliesMobile: 4 };
    depth(h, P);
  });

  /* ---------- slideshow do fundo: crossfade + Ken Burns; só a 1ª foto carrega de início, a próxima é hidratada antes da troca ---------- */
  $$("[data-slides]").forEach((box) => {
    const slides = $$(".slide", box); if (slides.length < 2) return;
    const iv = Number(box.dataset.interval) || 6000, host = box.closest("[data-host]") || box;
    const ticks = $$("[data-tick]", box.parentElement);
    let i = 0, timer = 0;
    const hydrate = (s) => {
      const pic = $("picture[data-pending]", s); if (!pic) return;
      const src = $("source", pic), im = $("img", pic);
      src.srcset = src.dataset.srcset; im.src = im.dataset.src; pic.removeAttribute("data-pending");
    };
    slides.forEach((s, k) => { s.style.setProperty("--ox", (20 + ((k * 37) % 60)) + "%"); s.style.setProperty("--oy", (25 + ((k * 53) % 50)) + "%"); });
    slides[0].classList.add("on");
    const mark = () => ticks.forEach((t, k) => t.classList.toggle("on", k === i));
    mark();
    if (reduce) return; // foto fixa
    const go = () => {
      const prev = slides[i]; prev.classList.remove("on"); prev.classList.add("leave");
      setTimeout(() => prev.classList.remove("leave"), 2200);
      i = (i + 1) % slides.length; slides[i].classList.remove("leave"); slides[i].classList.add("on"); mark();
      hydrate(slides[(i + 1) % slides.length]);          // já deixa a seguinte pronta
    };
    const start = () => { if (!timer) timer = setInterval(go, iv); };
    const stop = () => { clearInterval(timer); timer = 0; };
    const arm = () => { hydrate(slides[1]); start(); };
    if (document.readyState === "complete") setTimeout(arm, 1200); else addEventListener("load", () => setTimeout(arm, 1200), { once: true });
    onVis(host, (v) => (v ? (timer || document.readyState !== "complete" ? 0 : start()) : stop()));
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : host._vis && document.readyState === "complete" && start()));
  });

  /* ---------- animação de entrada da logo (Web Animations API) ---------- */
  const EASE = "cubic-bezier(.16,.84,.24,1)";
  function introLogo(svg) {
    const NS = "http://www.w3.org/2000/svg", anims = [];
    const word = $(".sf-word", svg), sub = $(".sf-sub", svg), star = $(".sf-star", svg), bf = $(".logo-butterfly", svg);
    const A = (el, kf, o) => { if (!el) return; const a = el.animate(kf, Object.assign({ fill: "both", easing: EASE }, o)); anims.push(a); return a; };

    // wordmark: revelação por máscara (clip-path) da esquerda para a direita
    if (word) {
      const defs = $("defs", svg), id = "pv-wipe" + Math.random().toString(36).slice(2, 6);
      const cp = document.createElementNS(NS, "clipPath"); cp.id = id;
      const r = document.createElementNS(NS, "rect");
      r.setAttribute("x", "-30"); r.setAttribute("y", "-220"); r.setAttribute("width", "640"); r.setAttribute("height", "320");
      r.style.transformBox = "fill-box"; r.style.transformOrigin = "0 50%";
      cp.appendChild(r); defs.appendChild(cp); word.setAttribute("clip-path", "url(#" + id + ")");
      const a = r.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 1500, delay: 250, easing: "cubic-bezier(.65,0,.25,1)", fill: "both" });
      a.onfinish = () => word.removeAttribute("clip-path");
      A(word, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 200, easing: "linear" });
    }
    // FESTAS: sobe com fade, depois da palavra
    if (sub) { sub.style.transformBox = "fill-box"; A(sub, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 900, delay: 1250 }); }

    // borboleta: voa e pousa no S (batidas de asa só durante o voo)
    if (bf) {
      bf.style.transformBox = "fill-box"; bf.style.transformOrigin = "70% 90%";
      const f = (x, y, r, sx, o) => ({ opacity: o, transform: "translate(" + x + "px," + y + "px) rotate(" + r + "deg) scale(" + sx + ",1)" });
      A(bf, [
        Object.assign(f(-150, -70, -24, 0.7, 0), { offset: 0 }),
        Object.assign(f(-96, -96, 14, 1, 1), { offset: 0.14 }),
        Object.assign(f(-60, -50, -10, 0.72, 1), { offset: 0.26 }),
        Object.assign(f(-36, -78, 12, 1, 1), { offset: 0.38 }),
        Object.assign(f(-12, -34, -8, 0.74, 1), { offset: 0.52 }),
        Object.assign(f(10, -46, 8, 1, 1), { offset: 0.64 }),
        Object.assign(f(4, -8, -4, 0.8, 1), { offset: 0.78 }),
        Object.assign(f(-2, 3, 3, 1, 1), { offset: 0.9 }),
        Object.assign(f(0, 0, 0, 1, 1), { offset: 1 }),
      ], { duration: 2100, delay: 450, easing: "cubic-bezier(.45,.05,.3,1)" });
    }
    // estrela: surge girando, brilha e fica pulsando; estrelinhas piscam
    if (star) {
      star.style.transformBox = "fill-box"; star.style.transformOrigin = "50% 50%";
      A(star, [{ opacity: 0, transform: "scale(.1) rotate(-120deg)" }, { opacity: 1, transform: "scale(1.18) rotate(8deg)", offset: 0.7 }, { opacity: 1, transform: "none" }], { duration: 1200, delay: 1000 });
      const pulse = A(star, [{ transform: "scale(1)" }, { transform: "scale(1.06)" }], { duration: 3200, delay: 2300, iterations: Infinity, direction: "alternate", easing: "ease-in-out", fill: "none", composite: "add" });
      const polys = $$("polygon", star), small4 = polys.slice(-4);
      small4.forEach((p, k) => { p.style.transformBox = "fill-box"; p.style.transformOrigin = "50% 50%"; A(p, [{ opacity: 1, transform: "scale(1)" }, { opacity: 0.25, transform: "scale(.6)" }, { opacity: 1, transform: "scale(1.12)" }], { duration: 2400 + k * 330, delay: 2300 + k * 420, iterations: Infinity, easing: "ease-in-out", fill: "none" }); });
    }
    return anims;
  }

  /* ---------- balão de WhatsApp: escondido no topo; aparece quando o hero sai da tela (~80px antes do fim) ---------- */
  (function () {
    const wa = $("#wa-float"), hero = $(".hero[data-host]");
    if (!wa || !hero) return;
    const setWa = (top) => { root.classList.toggle("hero-top", top); wa.setAttribute("aria-hidden", String(top)); wa.tabIndex = top ? -1 : 0; };
    setWa(true);
    new IntersectionObserver((es) => setWa(es[0].isIntersecting), { rootMargin: "-80px 0px 0px 0px" }).observe(hero);
  })();

  function start() {
    const heroLogo = $('.hero [data-logo="big"] svg');
    if (reduce) { root.classList.add("go"); return; }
    let anims = [];
    if (heroLogo) anims = introLogo(heroLogo);
    setTimeout(() => root.classList.add("go"), 700);
    // pausa as animações infinitas da logo quando o hero sai da tela
    const host = $(".hero[data-host]");
    if (host) onVis(host, (v) => root.classList.toggle("hero-vis", v));
    if (host) root.classList.toggle("hero-vis", host._vis);
    if (host) onVis(host, (v) => anims.forEach((a) => { if (a.effect && a.effect.getComputedTiming().iterations === Infinity) v ? a.play() : a.pause(); }));
  }
  const boot = () => { (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve()).then(start); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
