/* =========================================================
   Atmosfera mágica: estrelas, poeira de brilho e borboletinhas
   Tudo discreto — pouca quantidade, baixa opacidade.
   ========================================================= */
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- céu estrelado + poeira azul (canvas) ---------- */
  const canvas = document.getElementById("stars");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, stars = [], dust = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = innerWidth * dpr;
      h = canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
      const count = Math.round((innerWidth * innerHeight) / 9000);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: (Math.random() * 1.1 + 0.2) * dpr,
        p: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 1.2,
        blue: Math.random() < 0.35,
      }));
      dust = Array.from({ length: 26 }, newDust);
    }
    function newDust() {
      return {
        x: Math.random() * w, y: h + Math.random() * h * 0.5,
        r: (Math.random() * 1.6 + 0.6) * dpr,
        vy: (0.15 + Math.random() * 0.35) * dpr,
        sway: Math.random() * Math.PI * 2,
        a: 0.25 + Math.random() * 0.4,
      };
    }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.001 * s.s + s.p));
        ctx.beginPath();
        ctx.fillStyle = s.blue ? `rgba(150,195,255,${a})` : `rgba(235,240,250,${a})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const d of dust) {
        d.y -= d.vy; d.sway += 0.01;
        const x = d.x + Math.sin(d.sway) * 12 * dpr;
        const g = ctx.createRadialGradient(x, d.y, 0, x, d.y, d.r * 4);
        g.addColorStop(0, `rgba(160,200,255,${d.a})`);
        g.addColorStop(1, "rgba(47,123,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, d.y, d.r * 4, 0, Math.PI * 2); ctx.fill();
        if (d.y < -20) Object.assign(d, newDust(), { y: h + 10 });
      }
      if (!reduce) requestAnimationFrame(draw);
    }
    resize();
    addEventListener("resize", resize);
    requestAnimationFrame(draw);
  }

  /* ---------- borboletinhas azuis voando ---------- */
  const layer = document.getElementById("flutter");
  if (layer && !reduce) {
    const MINI = `<svg viewBox="-70 -60 140 120"><g class="flap">
      <path d="M-2,-2 C-14,-34 -52,-56 -60,-34 C-66,-16 -44,2 -4,4 Z M-2,6 C-32,8 -46,28 -36,42 C-26,54 -8,34 -1,12 Z" fill="#2f7bff"/>
      <path d="M2,-2 C14,-34 52,-56 60,-34 C66,-16 44,2 4,4 Z M2,6 C32,8 46,28 36,42 C26,54 8,34 1,12 Z" fill="#2f7bff"/>
      <path d="M-6,-4 C-18,-26 -42,-40 -48,-28 C-52,-18 -36,-6 -8,0 Z M6,-4 C18,-26 42,-40 48,-28 C52,-18 36,-6 8,0 Z" fill="#b9d6ff" opacity=".7"/>
      <ellipse cx="0" cy="4" rx="3" ry="18" fill="#0b1226"/></g></svg>`;

    const count = innerWidth < 700 ? 4 : 7;
    const flies = [];
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "mini-fly";
      el.innerHTML = MINI;
      const size = 10 + Math.random() * 12;
      el.style.width = el.style.height = size + "px";
      const flap = el.querySelector(".flap");
      flap.style.transformOrigin = "0 0";
      flap.style.animation = `flap ${0.18 + Math.random() * 0.16}s ease-in-out infinite alternate`;
      layer.appendChild(el);
      flies.push(spawn({ el, size }, true));
    }

    function spawn(f, initial) {
      f.x = Math.random() * innerWidth;
      f.y = initial ? Math.random() * innerHeight : innerHeight + 30;
      f.angle = -Math.PI / 2 + (Math.random() - 0.5);
      f.speed = 0.35 + Math.random() * 0.45;
      f.life = 0;
      f.maxLife = 900 + Math.random() * 900;
      f.wobble = Math.random() * 100;
      return f;
    }

    function tick() {
      for (const f of flies) {
        f.life++;
        f.wobble += 0.02;
        f.angle += Math.sin(f.wobble) * 0.02 + (Math.random() - 0.5) * 0.04;
        f.x += Math.cos(f.angle) * f.speed;
        f.y += Math.sin(f.angle) * f.speed + Math.sin(f.wobble * 3) * 0.3;
        // fade-in / fade-out suave
        const fade = Math.min(1, f.life / 120, (f.maxLife - f.life) / 120);
        f.el.style.opacity = (Math.max(0, fade) * 0.75).toFixed(3);
        const tilt = (f.angle + Math.PI / 2) * 57.3 * 0.5;
        f.el.style.transform = `translate(${f.x}px, ${f.y}px) rotate(${tilt}deg)`;
        if (f.life > f.maxLife || f.x < -60 || f.x > innerWidth + 60 || f.y < -60) spawn(f, false);
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- brilhinhos discretos seguindo o cursor ---------- */
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    let last = 0;
    addEventListener("pointermove", (e) => {
      const now = performance.now();
      if (now - last < 70) return;
      last = now;
      const s = document.createElement("span");
      s.className = "spark";
      s.style.left = e.clientX + "px";
      s.style.top = e.clientY + "px";
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 900);
    });
  }

  /* ---------- navegação e revelação ao rolar ---------- */
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", scrollY > 30);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    const toggle = nav.querySelector(".nav-toggle");
    const links = nav.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", () => links.classList.toggle("open"));
      links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => links.classList.remove("open")));
    }
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- toast reutilizável ---------- */
  window.showToast = function (msg) {
    let t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast metal-frame";
      document.body.appendChild(t);
    }
    t.innerHTML = (window.SophiaBrand ? window.SophiaBrand.butterflySVG() : "") + `<span>${msg}</span>`;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 3600);
  };
})();
