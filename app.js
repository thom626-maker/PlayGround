(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const player = $("#player");
  const audio = $("#audio");
  const playBtn = $("#play");
  const seek = $("#seek");
  const cur = $("#cur");
  const dur = $("#dur");
  const toastEl = $("#toast");

  const SHARE_TEXT = "Mirage City — Fã de músicas, rock e gamer!";
  const DISCORD_USER = "@thomclassic";
  const AUDIO_TITLE = "Khalifa";
  const AUDIO_ARTIST = "Mirage City";

  let toastTimer = 0;

  function toast(message, ms = 2600) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), ms);
  }

  function bridge() {
    try {
      return window.Mirage && typeof window.Mirage === "object" ? window.Mirage : null;
    } catch (_) {
      return null;
    }
  }

  function fallbackCopy(text, done) {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      area.style.pointerEvents = "none";
      document.body.appendChild(area);
      area.select();
      area.setSelectionRange(0, area.value.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      if (ok && done) done();
      else toast("Não consegui copiar. Selecione e copie manualmente.");
    } catch (_) {
      toast("Não consegui copiar. Selecione e copie manualmente.");
    }
  }

  function copyText(text, message) {
    const done = () => toast(message || "Copiado!");
    const b = bridge();
    if (b && typeof b.copy === "function") {
      try {
        b.copy(text);
        done();
        return;
      } catch (_) {}
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
      return;
    }
    fallbackCopy(text, done);
  }

  function openExternal(url) {
    const b = bridge();
    if (b && typeof b.open === "function") {
      try {
        b.open(url);
        return;
      } catch (_) {}
    }
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (_) {
      location.href = url;
    }
  }

  function shareApp() {
    const shareUrl = /^https?:$/.test(location.protocol) ? location.href : "";
    const text = SHARE_TEXT;
    const b = bridge();
    if (b && typeof b.share === "function") {
      try {
        b.share(shareUrl ? text + "\n" + shareUrl : text);
        return;
      } catch (_) {}
    }
    if (navigator.share) {
      const data = { title: "Mirage City", text };
      if (shareUrl) data.url = shareUrl;
      navigator.share(data).catch(() => {});
      return;
    }
    copyText(shareUrl || text, shareUrl ? "Link copiado!" : "Texto copiado!");
  }

  function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) return "--:--";
    const total = Math.floor(value);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function setProgress(pct) {
    seek.style.setProperty("--progress", pct + "%");
  }

  function syncSeek() {
    const d = audio.duration;
    if (!Number.isFinite(d) || d <= 0) return;
    const pct = Math.min(100, Math.max(0, (audio.currentTime / d) * 100));
    seek.value = String(Math.round(pct * 10));
    setProgress(pct);
    cur.textContent = formatTime(audio.currentTime);
  }

  function resetPlayer() {
    player.classList.remove("playing", "loading");
    playBtn.setAttribute("aria-pressed", "false");
    playBtn.setAttribute("aria-label", "Tocar música");
    seek.disabled = true;
    seek.value = "0";
    setProgress(0);
    cur.textContent = "0:00";
    dur.textContent = "--:--";
  }

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      player.classList.add("loading");
      const promise = audio.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch((err) => {
          player.classList.remove("loading");
          if (err && err.name === "NotAllowedError") {
            toast("Toque novamente para tocar.");
          } else {
            toast("Não foi possível carregar a música. Verifique sua conexão.");
          }
          resetPlayer();
        });
      }
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    seek.disabled = false;
    dur.textContent = formatTime(audio.duration);
    syncSeek();
  });
  audio.addEventListener("timeupdate", syncSeek);
  audio.addEventListener("playing", () => {
    player.classList.remove("loading");
    player.classList.add("playing");
    playBtn.setAttribute("aria-pressed", "true");
    playBtn.setAttribute("aria-label", "Pausar música");
  });
  audio.addEventListener("play", () => {
    player.classList.add("playing");
  });
  audio.addEventListener("pause", () => {
    player.classList.remove("playing", "loading");
    playBtn.setAttribute("aria-pressed", "false");
    playBtn.setAttribute("aria-label", "Tocar música");
  });
  audio.addEventListener("waiting", () => {
    if (!audio.paused) player.classList.add("loading");
  });
  audio.addEventListener("canplay", () => player.classList.remove("loading"));
  audio.addEventListener("ended", () => {
    try { audio.currentTime = 0; } catch (_) {}
    resetPlayer();
  });
  audio.addEventListener("error", () => {
    player.classList.remove("loading");
    toast("Não foi possível carregar a música. Verifique sua conexão.");
    resetPlayer();
  });

  seek.addEventListener("input", () => {
    const d = audio.duration;
    if (!Number.isFinite(d) || d <= 0) return;
    const time = (Number(seek.value) / 1000) * d;
    audio.currentTime = time;
    const pct = Number(seek.value) / 10;
    setProgress(pct);
    cur.textContent = formatTime(time);
  });

  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: AUDIO_TITLE,
        artist: AUDIO_ARTIST,
        album: "Mirage City",
        artwork: [
          { src: "assets/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "assets/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      });
      navigator.mediaSession.setActionHandler("play", () => audio.play().catch(() => {}));
      navigator.mediaSession.setActionHandler("pause", () => audio.pause());
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (Number.isFinite(details.seekTime)) audio.currentTime = details.seekTime;
      });
    } catch (_) {}
  }

  $("#discord").addEventListener("click", () => {
    copyText(DISCORD_USER, "Discord copiado: " + DISCORD_USER);
  });

  $("#share").addEventListener("click", shareApp);
  $("#shareTop").addEventListener("click", shareApp);

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented) return;
    const anchor = event.target instanceof Element
      ? event.target.closest("a[target='_blank']")
      : null;
    if (!anchor) return;
    const href = anchor.getAttribute("href") || "";
    if (/^https?:/i.test(href)) {
      event.preventDefault();
      openExternal(href);
    }
  });

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

  function initParallax() {
    if (motionQuery.matches || !hoverQuery.matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    const apply = () => {
      raf = 0;
      document.documentElement.style.setProperty("--px", tx.toFixed(2) + "px");
      document.documentElement.style.setProperty("--py", ty.toFixed(2) + "px");
    };
    window.addEventListener("pointermove", (event) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      tx = ((event.clientX / w) - 0.5) * -10;
      ty = ((event.clientY / h) - 0.5) * -8;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
  }

  function initNight() {
    const canvas = $("#night");
    if (!canvas || motionQuery.matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let particles = [];
    let raf = 0;
    let running = true;

    function makeParticle(randomY) {
      const violet = Math.random() > 0.45;
      return {
        x: Math.random(),
        y: randomY ? Math.random() : 1.05,
        r: Math.random() * 1.6 + 0.35,
        speed: Math.random() * 0.00022 + 0.00006,
        drift: (Math.random() - 0.5) * 0.00008,
        alpha: Math.random() * 0.5 + 0.18,
        twinkle: Math.random() * Math.PI * 2,
        color: violet ? "168,85,247" : "34,211,238"
      };
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = W < 520 ? 34 : 58;
      particles = Array.from({ length: count }, () => makeParticle(true));
    }

    function frame() {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        p.twinkle += 0.018;
        if (p.y < -0.05) {
          p.y = 1.05;
          p.x = Math.random();
        }
        if (p.x < -0.05) p.x = 1.05;
        if (p.x > 1.05) p.x = -0.05;
        const a = p.alpha * (0.65 + 0.35 * Math.sin(p.twinkle));
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + p.color + "," + a.toFixed(3) + ")";
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function start() {
      if (running) return;
      running = true;
      frame();
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    frame();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });
    motionQuery.addEventListener("change", () => {
      if (motionQuery.matches) {
        stop();
        ctx.clearRect(0, 0, W, H);
      } else {
        resize();
        start();
      }
    });
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (!/^https?:$/.test(location.protocol)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  document.documentElement.classList.add("js");
  initParallax();
  initNight();
  registerServiceWorker();

  window.addEventListener("beforeunload", () => {
    try { audio.pause(); } catch (_) {}
  });
})();
