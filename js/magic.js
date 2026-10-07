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
  if (layer && !reduce && window.SophiaBrand) {
    const MINI = () => window.SophiaBrand.butterflySVG();
    const count = innerWidth < 700 ? 4 : 7;
    const flies = [];
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "mini-fly";
      el.innerHTML = MINI();
      const size = 10 + Math.random() * 12;
      el.style.width = el.style.height = size + "px";
      const flap = el.querySelector(".wing-l");
      flap.style.transformBox = "fill-box";
      flap.style.transformOrigin = "100% 70%";
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
      const setMenu = (open) => {
        links.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      };
      toggle.addEventListener("click", () => setMenu(!links.classList.contains("open")));
      links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
      addEventListener("keydown", (e) => {
        if (e.key === "Escape" && links.classList.contains("open")) { setMenu(false); toggle.focus(); }
      });
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

  /* ---------- lightbox da galeria ---------- */
  const thumbs = [...document.querySelectorAll("[data-lightbox]")];
  if (thumbs.length) {
    let lb, imgEl, capEl, idx = 0, opener = null;
    const build = () => {
      lb = document.createElement("div");
      lb.className = "lb";
      lb.setAttribute("role", "dialog");
      lb.setAttribute("aria-modal", "true");
      lb.setAttribute("aria-label", "Foto ampliada");
      lb.hidden = true;
      lb.innerHTML = '<button type="button" class="lb-close" aria-label="Fechar">&times;</button>' +
        '<button type="button" class="lb-prev" aria-label="Foto anterior">&#8249;</button>' +
        '<figure><img alt=""><figcaption></figcaption></figure>' +
        '<button type="button" class="lb-next" aria-label="Próxima foto">&#8250;</button>';
      document.body.appendChild(lb);
      imgEl = lb.querySelector("img");
      capEl = lb.querySelector("figcaption");
      lb.addEventListener("click", (e) => { if (e.target === lb) close(); }); // clique fora da foto
      lb.querySelector(".lb-close").addEventListener("click", close);
      lb.querySelector(".lb-prev").addEventListener("click", () => show(idx - 1));
      lb.querySelector(".lb-next").addEventListener("click", () => show(idx + 1));
    };
    const show = (i) => {
      idx = (i + thumbs.length) % thumbs.length;
      const t = thumbs[idx], im = t.querySelector("img"), cap = t.querySelector(".g-cap");
      imgEl.src = im.currentSrc || im.src;
      imgEl.alt = im.alt;
      capEl.textContent = cap ? cap.textContent : "";
    };
    const open = (i, from) => {
      if (!lb) build();
      opener = from;
      show(i);
      lb.hidden = false;
      document.body.classList.add("lb-lock");
      requestAnimationFrame(() => lb.classList.add("open"));
      lb.querySelector(".lb-close").focus();
    };
    function close() {
      if (!lb || lb.hidden) return;
      lb.classList.remove("open");
      lb.hidden = true;
      document.body.classList.remove("lb-lock");
      if (opener) opener.focus();
    }
    thumbs.forEach((t, i) => t.addEventListener("click", () => open(i, t)));
    addEventListener("keydown", (e) => {
      if (!lb || lb.hidden) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(idx - 1);
      else if (e.key === "ArrowRight") show(idx + 1);
      else if (e.key === "Tab") { // mantém o foco dentro do diálogo
        const f = [...lb.querySelectorAll("button")];
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
})();
