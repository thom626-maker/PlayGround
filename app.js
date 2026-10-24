(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const STORAGE_KEY = "mirage.profile.v1";
  const ADMIN_KEY = "mirage.admin.v1";
  const SESSION_KEY = "mirage.admin.session";
  const DEFAULT_PIN = "1234";

  const DEFAULTS = {
    version: 1,
    profile: {
      name: "Mirage City",
      handle: "@thomkhali",
      bio: "Fã de músicas, rock e gamer!",
      status: "Jogando!",
      online: true,
      avatar: "assets/avatar.png",
      background: "assets/bg.webp",
      bgX: 62,
      bgY: 42
    },
    brand: {
      name: "Mirage City",
      mark: "assets/icon-192.png",
      footer: "Mirage City",
      badge: "100% MEU"
    },
    audio: {
      visible: true,
      autoplay: true,
      eyebrow: "TOCANDO AGORA",
      title: "Khalifa",
      artist: "Mirage City",
      album: "Mirage City",
      url: "https://r2.guns.lol/0d1faa7f-3bdf-45c6-b509-517c0020add9.mp3",
      cover: "assets/icon-192.png"
    },
    links: [
      {
        id: "instagram",
        kind: "instagram",
        label: "Instagram",
        subtitle: "@ueltonthom",
        action: "open",
        value: "https://instagram.com/ueltonthom",
        visible: true
      },
      {
        id: "discord",
        kind: "discord",
        label: "Discord",
        subtitle: "@thomclassic",
        action: "copy",
        value: "@thomclassic",
        visible: true
      },
      {
        id: "share",
        kind: "share",
        label: "Compartilhar",
        subtitle: "Meu app, do meu jeito",
        action: "share",
        value: "",
        visible: true
      }
    ],
    about: {
      text: "Música, rock e games. Um cantinho feito por mim, para mim — sem marca de terceiros, sem navegador no meio.",
      chips: ["🎧 Rock", "🎮 Gamer", "🌙 Night"]
    },
    share: {
      text: "Mirage City — Fã de músicas, rock e gamer!"
    },
    theme: {
      accent: "#a855f7",
      accent2: "#22d3ee"
    }
  };

  const KIND_LABELS = {
    instagram: "Instagram",
    discord: "Discord",
    link: "Link",
    share: "Compartilhar",
    copy: "Copiar"
  };

  const ACTION_LABELS = {
    open: "Abrir link",
    copy: "Copiar texto",
    share: "Compartilhar app"
  };

  const KIND_CLASS = {
    instagram: "ig",
    discord: "dc",
    link: "generic",
    share: "share-ico",
    copy: "copy-ico"
  };

  const ICONS = {
    instagram: '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23a3.7 3.7 0 0 1-.9 1.38 3.7 3.7 0 0 1-1.38.9c-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.2 15.58 2.2 15.2 2.2 12s0-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.15 0-3.52 0-4.76.07-1.15.05-1.77.24-2.18.4-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.41-.35 1.03-.4 2.18C2.36 10.12 2.35 10.49 2.35 12s0 1.88.08 3.12c.05 1.15.24 1.77.4 2.18.21.55.47.94.88 1.35.41.41.8.67 1.35.88.41.16 1.03.35 2.18.4 1.24.07 1.61.07 4.76.07s3.52 0 4.76-.07c1.15-.05 1.77-.24 2.18-.4.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.41.35-1.03.4-2.18.07-1.24.08-1.61.08-3.12s0-1.88-.08-3.12c-.05-1.15-.24-1.77-.4-2.18a3.6 3.6 0 0 0-.88-1.35 3.6 3.6 0 0 0-1.35-.88c-.41-.16-1.03-.35-2.18-.4C15.52 4 15.15 4 12 4Z" fill="currentColor"/><path d="M12 6.87A5.13 5.13 0 1 0 12 17.13 5.13 5.13 0 0 0 12 6.87Zm0 8.46a3.33 3.33 0 1 1 0-6.66 3.33 3.33 0 0 1 0 6.66Z" fill="currentColor"/><circle cx="17.33" cy="6.67" r="1.2" fill="currentColor"/></svg>',
    discord: '<svg viewBox="0 0 24 24"><path d="M19.5 5.34a16.2 16.2 0 0 0-4.05-1.26l-.2.4a13.6 13.6 0 0 1 3.6 1.18 15.9 15.9 0 0 0-13.7 0 13.6 13.6 0 0 1 3.6-1.18l-.2-.4A16.2 16.2 0 0 0 4.5 5.34C1.8 9.36 1.07 13.28 1.44 17.14a16.6 16.6 0 0 0 4.96 2.5l1.06-1.44a10.7 10.7 0 0 1-1.66-.8l.4-.31a11.9 11.9 0 0 0 11.6 0l.4.31c-.53.32-1.09.58-1.67.8l1.07 1.44a16.6 16.6 0 0 0 4.96-2.5c.44-4.48-.75-8.36-3.1-11.8ZM8.6 14.7c-.97 0-1.77-.9-1.77-2s.78-2 1.77-2c1 0 1.8.9 1.78 2 0 1.1-.79 2-1.78 2Zm6.8 0c-.97 0-1.77-.9-1.77-2s.78-2 1.77-2c1 0 1.8.9 1.78 2 0 1.1-.79 2-1.78 2Z" fill="currentColor"/></svg>',
    share: '<svg viewBox="0 0 24 24"><path d="M18 8a3 3 0 1 0-2.83-4H15a3 3 0 0 0 .17 1L8.9 8.3a3 3 0 1 0 0 3.4l6.27 3.3a3 3 0 1 0 .9-1.8l-6.27-3.3a3 3 0 0 0 0-.8l6.27-3.3A3 3 0 0 0 18 8Z" fill="currentColor"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10.6 13.4a4 4 0 0 0 5.66 0l2.83-2.83a4 4 0 0 0-5.66-5.66l-1.6 1.6"/><path d="M13.4 10.6a4 4 0 0 0-5.66 0l-2.83 2.83a4 4 0 0 0 5.66 5.66l1.6-1.6"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>'
  };

  const player = $("#player");
  const audio = $("#audio");
  const playBtn = $("#play");
  const seek = $("#seek");
  const cur = $("#cur");
  const dur = $("#dur");
  const toastEl = $("#toast");
  const adminEl = $("#admin");
  const adminGate = $("#adminGate");
  const adminEditor = $("#adminEditor");
  const adminBody = $("#adminBody");
  const linksEditor = $("#linksEditor");
  const gatePin = $("#gatePin");
  const gateConfirm = $("#gateConfirm");
  const gateForm = $("#gateForm");
  const gateSubmit = $("#gateSubmit");
  const gateConfirmWrap = $("#gateConfirmWrap");
  const gateReset = $("#gateReset");
  const gateTitle = $("#gateTitle");
  const gateHint = $("#gateHint");
  const newPin = $("#newPin");
  const newPinConfirm = $("#newPinConfirm");
  const backupData = $("#backupData");

  let config = normalizeConfig(null);
  let draft = null;
  let dirty = false;
  let openLinkOnRender = null;
  let sessionUnlocked = false;
  let toastTimer = 0;
  let deferredReload = false;
  let autoplayCleanup = null;

  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeDefaults(base, saved) {
    if (Array.isArray(base)) return Array.isArray(saved) ? clone(saved) : clone(base);
    if (!isObject(base)) return saved === undefined ? base : saved;
    const out = clone(base);
    if (isObject(saved)) {
      for (const key of Object.keys(saved)) {
        if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
        out[key] = key in base ? mergeDefaults(base[key], saved[key]) : clone(saved[key]);
      }
    }
    return out;
  }

  function clean(value, fallback = "") {
    if (typeof value === "string") return value.trim();
    if (value === null || value === undefined) return fallback;
    return String(value).trim();
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function validColor(value, fallback) {
    const text = clean(value);
    return /^#[0-9a-f]{6}$/i.test(text) ? text : fallback;
  }

  function normalizeLink(link, index) {
    const item = isObject(link) ? link : {};
    const kind = KIND_LABELS[item.kind] ? item.kind : "link";
    let action = ACTION_LABELS[item.action] ? item.action : "open";
    if (kind === "share") action = "share";
    if (kind === "copy" && !ACTION_LABELS[item.action]) action = "copy";
    return {
      id: clean(item.id) || "link-" + index,
      kind,
      label: clean(item.label) || "Link",
      subtitle: clean(item.subtitle),
      action,
      value: clean(item.value),
      visible: item.visible !== false
    };
  }

  function normalizeConfig(input) {
    const saved = isObject(input) ? input : {};
    const next = mergeDefaults(clone(DEFAULTS), saved);

    next.profile.name = clean(next.profile.name) || DEFAULTS.profile.name;
    next.profile.handle = clean(next.profile.handle);
    next.profile.bio = clean(next.profile.bio);
    next.profile.status = clean(next.profile.status);
    next.profile.online = next.profile.online !== false;
    next.profile.avatar = clean(next.profile.avatar) || DEFAULTS.profile.avatar;
    next.profile.background = clean(next.profile.background) || DEFAULTS.profile.background;
    next.profile.bgX = clampNumber(next.profile.bgX, 0, 100, DEFAULTS.profile.bgX);
    next.profile.bgY = clampNumber(next.profile.bgY, 0, 100, DEFAULTS.profile.bgY);

    next.brand.name = clean(next.brand.name) || next.profile.name;
    next.brand.mark = clean(next.brand.mark) || DEFAULTS.brand.mark;
    next.brand.footer = clean(next.brand.footer) || next.profile.name;
    next.brand.badge = clean(next.brand.badge);

    next.audio.visible = next.audio.visible !== false;
    next.audio.autoplay = next.audio.autoplay !== false;
    next.audio.eyebrow = clean(next.audio.eyebrow);
    next.audio.title = clean(next.audio.title);
    next.audio.artist = clean(next.audio.artist);
    next.audio.album = clean(next.audio.album);
    next.audio.url = clean(next.audio.url);
    next.audio.cover = clean(next.audio.cover) || DEFAULTS.audio.cover;

    next.links = Array.isArray(next.links)
      ? next.links.map((link, index) => normalizeLink(link, index))
      : clone(DEFAULTS.links);

    next.about.text = clean(next.about.text);
    next.about.chips = Array.isArray(next.about.chips)
      ? next.about.chips.map((chip) => clean(chip)).filter(Boolean)
      : [];

    next.share.text = clean(next.share.text);
    next.theme.accent = validColor(next.theme.accent, DEFAULTS.theme.accent);
    next.theme.accent2 = validColor(next.theme.accent2, DEFAULTS.theme.accent2);
    next.version = 1;
    return next;
  }

  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return normalizeConfig(raw ? JSON.parse(raw) : null);
    } catch (_) {
      return normalizeConfig(null);
    }
  }

  function persistConfig(next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return true;
    } catch (err) {
      const quota = err && (err.name === "QuotaExceededError" || err.code === 22);
      toast(quota
        ? "Espaço cheio. Use imagens menores ou remova o fundo."
        : "Não foi possível salvar as alterações.");
      return false;
    }
  }

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

  function getShareText() {
    return config.share.text || (config.profile.name + (config.profile.bio ? " — " + config.profile.bio : ""));
  }

  function shareApp() {
    const shareUrl = /^https?:$/.test(location.protocol) ? location.href : "";
    const text = getShareText();
    const title = config.profile.name;
    const b = bridge();
    if (b && typeof b.share === "function") {
      try {
        b.share(shareUrl ? text + "\n" + shareUrl : text);
        return;
      } catch (_) {}
    }
    if (navigator.share) {
      const data = { title, text };
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

  function updateMediaSession() {
    if (!("mediaSession" in navigator)) return;
    const a = config.audio;
    try {
      if (typeof MediaMetadata === "function") {
        const artwork = [];
        if (a.cover) artwork.push({ src: a.cover, sizes: "512x512" });
        if (a.cover !== "assets/icon-512.png") {
          artwork.push({ src: "assets/icon-512.png", sizes: "512x512" });
        }
        navigator.mediaSession.metadata = new MediaMetadata({
          title: a.title || config.profile.name,
          artist: a.artist || config.profile.name,
          album: a.album || config.brand.name,
          artwork
        });
      }
      navigator.mediaSession.setActionHandler("play", () => audio.play().catch(() => {}));
      navigator.mediaSession.setActionHandler("pause", () => audio.pause());
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (Number.isFinite(details.seekTime)) audio.currentTime = details.seekTime;
      });
    } catch (_) {}
  }

  function disarmAutoplay() {
    if (!autoplayCleanup) return;
    const cleanup = autoplayCleanup;
    autoplayCleanup = null;
    cleanup();
  }

  function armAutoplay() {
    if (autoplayCleanup) return;
    const resume = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (
        document.body.classList.contains("admin-open") ||
        (target && target.closest("a, #player, #adminOpen"))
      ) {
        disarmAutoplay();
        return;
      }
      disarmAutoplay();
      if (!audio.paused) return;
      const promise = audio.play();
      if (promise && typeof promise.catch === "function") promise.catch(() => {});
    };
    autoplayCleanup = () => {
      window.removeEventListener("pointerdown", resume, true);
      window.removeEventListener("touchstart", resume, true);
      window.removeEventListener("keydown", resume, true);
    };
    window.addEventListener("pointerdown", resume, true);
    window.addEventListener("touchstart", resume, { capture: true, passive: true });
    window.addEventListener("keydown", resume, true);
  }

  function startAutoplay() {
    const a = config.audio;
    if (!a.autoplay || !a.visible || !a.url || !audio.paused || !navigator.onLine) return;
    const promise = audio.play();
    if (!promise || typeof promise.catch !== "function") return;
    promise.catch((err) => {
      if (err && err.name === "NotAllowedError") {
        armAutoplay();
        toast("Toque na página para ativar o som.");
      }
    });
  }

  function applyAudio() {
    const a = config.audio;
    const src = a.url;
    const visible = a.visible && !!src;
    player.hidden = !visible;
    if (!visible) {
      try { audio.pause(); } catch (_) {}
      return;
    }

    $("#coverImg").src = a.cover;
    $("#trackEyebrow").textContent = a.eyebrow;
    $("#trackTitle").textContent = a.title || config.profile.name;
    $("#trackArtist").textContent = a.artist || config.profile.name;

    if (audio.getAttribute("src") !== src) {
      try { audio.pause(); } catch (_) {}
      audio.setAttribute("src", src);
      audio.load();
      resetPlayer();
    }
    updateMediaSession();
  }

  function renderLinks() {
    const nav = $("#links");
    nav.innerHTML = "";
    const visible = config.links.filter((link) => link.visible !== false && link.label);
    nav.hidden = visible.length === 0;

    for (const link of visible) {
      const action = link.action;
      const href = action === "open" && /^(https?:|mailto:|tel:)/i.test(link.value) ? link.value : "";
      const hasValue = !!href;
      const element = document.createElement(href ? "a" : "button");
      element.className = "link card";
      element.dataset.linkId = link.id;
      if (element.tagName === "A") {
        element.href = href;
        element.target = "_blank";
        element.rel = "noopener noreferrer";
      } else {
        element.type = "button";
      }
      element.setAttribute("aria-label", link.label + (link.subtitle ? ": " + link.subtitle : ""));

      const icon = document.createElement("span");
      icon.className = "link-ico " + (KIND_CLASS[link.kind] || KIND_CLASS.link);
      icon.setAttribute("aria-hidden", "true");
      icon.innerHTML = ICONS[link.kind] || ICONS.link;

      const text = document.createElement("span");
      text.className = "link-text";
      const strong = document.createElement("strong");
      strong.textContent = link.label;
      text.append(strong);
      if (link.subtitle) {
        const small = document.createElement("small");
        small.textContent = link.subtitle;
        text.append(small);
      }

      const chev = document.createElement("span");
      chev.className = "chev" + (action === "copy" ? " copy" : "");
      chev.setAttribute("aria-hidden", "true");
      chev.textContent = action === "copy" ? "⧉" : action === "share" ? "↗" : "↗";

      element.append(icon, text, chev);

      element.addEventListener("click", (event) => {
        if (action === "copy") {
          event.preventDefault();
          const value = link.value || link.subtitle || link.label;
          copyText(value, link.label + " copiado: " + value);
          return;
        }
        if (action === "share") {
          event.preventDefault();
          shareApp();
          return;
        }
        if (!hasValue) {
          event.preventDefault();
          toast("Este link ainda não foi configurado.");
        }
      });

      nav.append(element);
    }
  }

  function applyConfig() {
    const p = config.profile;
    const root = document.documentElement;

    document.title = p.name;
    document.querySelectorAll('meta[name="description"]').forEach((el) => {
      el.setAttribute("content", p.bio || DEFAULTS.profile.bio);
    });
    document.querySelectorAll('meta[name="application-name"]').forEach((el) => {
      el.setAttribute("content", p.name);
    });
    document.querySelectorAll('meta[name="apple-mobile-web-app-title"]').forEach((el) => {
      el.setAttribute("content", p.name);
    });
    document.querySelectorAll('meta[property="og:title"]').forEach((el) => {
      el.setAttribute("content", p.name);
    });
    document.querySelectorAll('meta[property="og:description"]').forEach((el) => {
      el.setAttribute("content", p.bio || DEFAULTS.profile.bio);
    });
    $("#brandName").textContent = config.brand.name;
    $("#brandMark").src = config.brand.mark;
    $("#footerMark").src = config.brand.mark;
    $("#footerName").textContent = config.brand.footer;
    $("#footerBadge").textContent = config.brand.badge;
    $("#footerBadge").hidden = !config.brand.badge;

    const statusPill = $("#statusPill");
    statusPill.hidden = !p.status;
    $("#statusText").textContent = p.status;

    $("#onlineDot").hidden = !p.online;
    $("#avatar").src = p.avatar;
    $("#avatar").alt = "Foto de perfil de " + p.name;

    $("#title").textContent = p.name;
    $("#title").dataset.text = p.name;
    const handle = $("#handle");
    handle.textContent = p.handle;
    handle.hidden = !p.handle;
    const bio = $("#bio");
    bio.textContent = p.bio;
    bio.hidden = !p.bio;

    const bg = $("#bg");
    bg.style.backgroundImage = 'url("' + p.background.replace(/"/g, "%22") + '")';
    bg.style.backgroundPosition = p.bgX + "% " + p.bgY + "%";

    root.style.setProperty("--violet", config.theme.accent);
    root.style.setProperty("--cyan", config.theme.accent2);
    root.style.setProperty("--violet-deep", config.theme.accent);

    applyAudio();
    renderLinks();

    const about = $("#about");
    const chips = config.about.chips;
    $("#aboutText").textContent = config.about.text;
    $("#aboutText").hidden = !config.about.text;
    $("#aboutChips").innerHTML = "";
    for (const chip of chips) {
      const span = document.createElement("span");
      span.textContent = chip;
      $("#aboutChips").append(span);
    }
    $("#aboutChips").hidden = chips.length === 0;
    about.hidden = !config.about.text && chips.length === 0;
  }

  function getPath(object, path) {
    return path.split(".").reduce((current, key) => (current == null ? undefined : current[key]), object);
  }

  function setPath(object, path, value) {
    const keys = path.split(".");
    const last = keys.pop();
    let current = object;
    for (const key of keys) {
      if (!isObject(current[key])) current[key] = {};
      current = current[key];
    }
    current[last] = value;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function setPreview(path, src) {
    const image = adminEditor.querySelector('[data-preview="' + path + '"]');
    if (image) image.src = src;
  }

  function fillEditor() {
    adminEditor.querySelectorAll("[data-path]").forEach((input) => {
      const path = input.dataset.path;
      let value = getPath(draft, path);
      if (path === "about.chips") value = Array.isArray(value) ? value.join(", ") : "";
      if (input.type === "checkbox") input.checked = !!value;
      else if (input.type === "color") input.value = validColor(value, "#000000");
      else input.value = value == null ? "" : value;
    });
    $("#bgXOut").textContent = String(draft.profile.bgX);
    $("#bgYOut").textContent = String(draft.profile.bgY);
    ["profile.avatar", "profile.background", "brand.mark", "audio.cover"].forEach((path) => {
      setPreview(path, getPath(draft, path));
    });
    renderLinkEditor();
  }

  function populateEditor() {
    draft = normalizeConfig(clone(config));
    fillEditor();
    backupData.value = "";
    newPin.value = "";
    newPinConfirm.value = "";
    dirty = false;
  }

  function collectForm() {
    adminEditor.querySelectorAll("[data-path]").forEach((input) => {
      const path = input.dataset.path;
      let value = input.type === "checkbox" ? input.checked : input.value;
      if (input.type === "range" || input.type === "number") value = Number(value);
      if (path === "about.chips") {
        value = String(value).split(/[,;\n]/).map((chip) => chip.trim()).filter(Boolean);
      }
      setPath(draft, path, value);
    });
  }

  function createLink() {
    return {
      id: "link-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
      kind: "link",
      label: "Novo link",
      subtitle: "",
      action: "open",
      value: "",
      visible: true
    };
  }

  function kindOptions(selected) {
    return Object.keys(KIND_LABELS).map((key) =>
      '<option value="' + key + '"' + (selected === key ? " selected" : "") + ">" + KIND_LABELS[key] + "</option>"
    ).join("");
  }

  function actionOptions(selected) {
    return Object.keys(ACTION_LABELS).map((key) =>
      '<option value="' + key + '"' + (selected === key ? " selected" : "") + ">" + ACTION_LABELS[key] + "</option>"
    ).join("");
  }

  function updateLinkSummary(box) {
    const index = Number(box.dataset.index);
    const link = draft.links[index];
    if (!link) return;
    const strong = box.querySelector("summary strong");
    const small = box.querySelector("summary small");
    const kind = box.querySelector("summary .admin-link-kind");
    if (strong) strong.textContent = link.label || "Link";
    if (small) small.textContent = link.subtitle || link.value || (link.visible ? "" : "Oculto");
    if (kind) kind.textContent = KIND_LABELS[link.kind] || "Link";
  }

  function renderLinkEditor() {
    linksEditor.innerHTML = "";
    if (!draft.links.length) {
      const empty = document.createElement("p");
      empty.className = "admin-hint";
      empty.textContent = "Nenhum link configurado. Toque em “Adicionar link”.";
      linksEditor.append(empty);
      return;
    }

    draft.links.forEach((link, index) => {
      const box = document.createElement("details");
      box.className = "admin-link";
      box.dataset.index = String(index);
      box.innerHTML =
        '<summary><span class="admin-link-dot"></span><strong></strong><small></small><span class="admin-link-kind"></span></summary>' +
        '<div class="admin-link-body">' +
          '<div class="admin-grid">' +
            '<label class="field"><span>Nome</span><input data-k="label" value="' + escapeHtml(link.label) + '" maxlength="32"></label>' +
            '<label class="field"><span>Subtítulo</span><input data-k="subtitle" value="' + escapeHtml(link.subtitle) + '" maxlength="48"></label>' +
            '<label class="field"><span>Ícone</span><select data-k="kind">' + kindOptions(link.kind) + '</select></label>' +
            '<label class="field"><span>Ação</span><select data-k="action">' + actionOptions(link.action) + '</select></label>' +
            '<label class="field field-wide"><span>URL ou texto copiado</span><input data-k="value" value="' + escapeHtml(link.value) + '" placeholder="https://... ou texto"></label>' +
            '<label class="field check field-wide"><input type="checkbox" data-k="visible"' + (link.visible ? " checked" : "") + '><span>Mostrar este link</span></label>' +
          '</div>' +
          '<div class="admin-link-actions">' +
            '<button class="mini-btn" type="button" data-move="up"' + (index === 0 ? " disabled" : "") + '>↑ Subir</button>' +
            '<button class="mini-btn" type="button" data-move="down"' + (index === draft.links.length - 1 ? " disabled" : "") + '>↓ Descer</button>' +
            '<button class="mini-btn danger" type="button" data-remove>Remover</button>' +
          '</div>' +
        '</div>';
      if (openLinkOnRender === index) box.open = true;
      linksEditor.append(box);
      updateLinkSummary(box);
    });
    openLinkOnRender = null;
  }

  function resizeImage(file, max, square) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        try {
          let sx = 0;
          let sy = 0;
          let sw = image.naturalWidth;
          let sh = image.naturalHeight;
          if (square) {
            const side = Math.min(sw, sh);
            sx = (sw - side) / 2;
            sy = (sh - side) / 2;
            sw = side;
            sh = side;
          }
          const scale = Math.min(1, max / Math.max(sw, sh));
          const width = Math.max(1, Math.round(sw * scale));
          const height = Math.max(1, Math.round(sh * scale));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
          const data = canvas.toDataURL("image/webp", 0.84);
          URL.revokeObjectURL(url);
          resolve(data);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("image"));
      };
      image.src = url;
    });
  }

  function setUnlocked(value) {
    sessionUnlocked = value;
    try {
      if (value) sessionStorage.setItem(SESSION_KEY, "1");
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {}
  }

  function isUnlocked() {
    if (sessionUnlocked) return true;
    try {
      return sessionStorage.getItem(SESSION_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function readAdminStore() {
    try {
      const raw = localStorage.getItem(ADMIN_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data && data.salt && data.hash ? data : null;
    } catch (_) {
      return null;
    }
  }

  function writeAdminStore(data) {
    try {
      localStorage.setItem(ADMIN_KEY, JSON.stringify(data));
      return true;
    } catch (_) {
      toast("Não foi possível salvar o PIN.");
      return false;
    }
  }

  function randomSalt() {
    try {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    } catch (_) {
      let salt = "";
      for (let i = 0; i < 32; i += 1) salt += Math.floor(Math.random() * 16).toString(16);
      return salt;
    }
  }

  async function hashPin(pin, salt) {
    const text = salt + ":" + pin;
    if (window.crypto && crypto.subtle && typeof TextEncoder === "function") {
      try {
        const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
        return "sha256:" + Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
      } catch (_) {}
    }
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return "fallback:" + (hash >>> 0).toString(16);
  }

  function showGate() {
    adminGate.hidden = false;
    adminEditor.hidden = true;
    gateForm.reset();
    const store = readAdminStore();
    gateTitle.textContent = "Acesso restrito";
    gateHint.textContent = store
      ? "Digite o PIN para editar o perfil."
      : "Digite o PIN para editar o perfil. PIN padrão: " + DEFAULT_PIN + ".";
    gateSubmit.textContent = "Entrar";
    gateConfirmWrap.hidden = true;
    gateReset.hidden = !store;
    gatePin.setAttribute("autocomplete", "current-password");
    setTimeout(() => gatePin.focus(), 60);
  }

  function showEditor() {
    adminGate.hidden = true;
    adminEditor.hidden = false;
    populateEditor();
    setTab("profile");
    setTimeout(() => {
      const first = adminEditor.querySelector("[data-path]");
      if (first) first.focus();
    }, 60);
  }

  function openAdmin() {
    adminEl.classList.add("open");
    adminEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("admin-open");
    if (isUnlocked()) showEditor();
    else showGate();
  }

  function closeAdmin(force = false) {
    if (!force && dirty && !confirm("Descartar as alterações não salvas?")) return;
    dirty = false;
    draft = null;
    adminEl.classList.remove("open");
    adminEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("admin-open");
    if (deferredReload) {
      deferredReload = false;
      location.reload();
      return;
    }
    const trigger = $("#adminOpen");
    if (trigger) trigger.focus();
  }

  function setTab(name) {
    adminEditor.querySelectorAll(".admin-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === name);
    });
    adminEditor.querySelectorAll(".admin-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === name);
    });
    adminBody.scrollTop = 0;
  }

  function handleImage(input) {
    const path = input.dataset.image;
    const file = input.files && input.files[0];
    input.value = "";
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      toast("Selecione um arquivo de imagem.");
      return;
    }
    const isBackground = path === "profile.background";
    const max = isBackground ? 1600 : path === "brand.mark" ? 256 : 512;
    input.disabled = true;
    resizeImage(file, max, !isBackground).then((data) => {
      setPath(draft, path, data);
      setPreview(path, data);
      dirty = true;
      toast("Imagem pronta. Clique em Salvar alterações.");
    }).catch(() => {
      toast("Não foi possível processar essa imagem.");
    }).finally(() => {
      input.disabled = false;
    });
  }

  function bindLinksEditor() {
    const update = (event) => {
      const field = event.target.closest("[data-k]");
      if (!field) return;
      const box = field.closest("[data-index]");
      if (!box) return;
      const index = Number(box.dataset.index);
      const link = draft.links[index];
      if (!link) return;
      link[field.dataset.k] = field.type === "checkbox" ? field.checked : field.value;
      dirty = true;
      updateLinkSummary(box);
    };
    linksEditor.addEventListener("input", update);
    linksEditor.addEventListener("change", update);
    linksEditor.addEventListener("click", (event) => {
      const box = event.target.closest("[data-index]");
      if (!box) return;
      const index = Number(box.dataset.index);
      if (event.target.closest("[data-remove]")) {
        draft.links.splice(index, 1);
        dirty = true;
        renderLinkEditor();
        return;
      }
      const move = event.target.closest("[data-move]");
      if (!move) return;
      const direction = move.dataset.move === "up" ? -1 : 1;
      const target = index + direction;
      if (target < 0 || target >= draft.links.length) return;
      const item = draft.links.splice(index, 1)[0];
      draft.links.splice(target, 0, item);
      openLinkOnRender = target;
      dirty = true;
      renderLinkEditor();
    });
  }

  function bindEditor() {
    adminEditor.addEventListener("input", (event) => {
      const input = event.target;
      if (input.dataset.path === "profile.bgX") $("#bgXOut").textContent = input.value;
      if (input.dataset.path === "profile.bgY") $("#bgYOut").textContent = input.value;
      dirty = true;
    });
    adminEditor.addEventListener("change", (event) => {
      const input = event.target;
      if (input.matches("[data-image]")) {
        handleImage(input);
        return;
      }
      dirty = true;
    });
    adminEditor.addEventListener("click", (event) => {
      const reset = event.target.closest("[data-reset-image]");
      if (!reset) return;
      const path = reset.dataset.resetImage;
      const value = clone(getPath(DEFAULTS, path));
      setPath(draft, path, value);
      setPreview(path, value);
      dirty = true;
      toast("Imagem padrão restaurada. Clique em Salvar.");
    });
  }

  function handleSave() {
    collectForm();
    const next = normalizeConfig(draft);
    if (!next.profile.name) {
      toast("O nome de exibição não pode ficar vazio.");
      setTab("profile");
      return;
    }
    if (!persistConfig(next)) return;
    config = next;
    applyConfig();
    dirty = false;
    closeAdmin(true);
    toast("Perfil atualizado!");
  }

  function resetProfile() {
    if (!confirm("Restaurar o perfil padrão? Suas edições serão apagadas.")) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    config = normalizeConfig(null);
    applyConfig();
    draft = normalizeConfig(clone(config));
    fillEditor();
    dirty = false;
    toast("Perfil restaurado.");
  }

  async function savePin() {
    const pin = newPin.value;
    const confirmPin = newPinConfirm.value;
    if (!/^\d{4,12}$/.test(pin)) {
      toast("O PIN deve ter de 4 a 12 dígitos.");
      newPin.focus();
      return;
    }
    if (pin !== confirmPin) {
      toast("Os PINs não conferem.");
      newPinConfirm.focus();
      return;
    }
    const salt = randomSalt();
    const hash = await hashPin(pin, salt);
    if (!writeAdminStore({ salt, hash, version: 1 })) return;
    newPin.value = "";
    newPinConfirm.value = "";
    toast("PIN atualizado.");
  }

  function bindAdmin() {
    $("#adminOpen").addEventListener("click", openAdmin);
    $("#adminClose").addEventListener("click", () => closeAdmin());
    $("#adminCancel").addEventListener("click", () => closeAdmin());
    $("#adminSave").addEventListener("click", handleSave);
    $("#adminLogout").addEventListener("click", () => {
      setUnlocked(false);
      closeAdmin(true);
      toast("Sessão encerrada.");
    });
    $("#adminTabs").addEventListener("click", (event) => {
      const tab = event.target.closest("[data-tab]");
      if (tab) setTab(tab.dataset.tab);
    });
    gateForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const pin = gatePin.value;
      const store = readAdminStore();
      if (!/^\d{4,12}$/.test(pin)) {
        toast("Use de 4 a 12 dígitos.");
        gatePin.focus();
        return;
      }
      gateSubmit.disabled = true;
      try {
        if (!store) {
          if (pin !== DEFAULT_PIN) {
            toast("PIN incorreto.");
            gatePin.value = "";
            gatePin.focus();
            return;
          }
          const salt = randomSalt();
          const hash = await hashPin(DEFAULT_PIN, salt);
          if (!writeAdminStore({ salt, hash, version: 1 })) return;
          setUnlocked(true);
          showEditor();
          toast("PIN padrão aceito. Altere o PIN em Sistema.");
        } else {
          const hash = await hashPin(pin, store.salt);
          if (hash !== store.hash) {
            toast("PIN incorreto.");
            gatePin.value = "";
            gatePin.focus();
            return;
          }
          setUnlocked(true);
          showEditor();
        }
      } finally {
        gateSubmit.disabled = false;
      }
    });
    gateReset.addEventListener("click", () => {
      if (!confirm("Isso apaga o perfil salvo e o PIN. Continuar?")) return;
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ADMIN_KEY);
      } catch (_) {}
      setUnlocked(false);
      config = normalizeConfig(null);
      applyConfig();
      closeAdmin(true);
      toast("Perfil e PIN apagados.");
    });
    [gatePin, gateConfirm, newPin, newPinConfirm].forEach((input) => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "");
      });
    });
    $("#addLink").addEventListener("click", () => {
      draft.links.push(createLink());
      openLinkOnRender = draft.links.length - 1;
      dirty = true;
      renderLinkEditor();
    });
    $("#savePin").addEventListener("click", savePin);
    $("#resetProfile").addEventListener("click", resetProfile);
    $("#exportData").addEventListener("click", () => {
      backupData.value = JSON.stringify(config, null, 2);
      backupData.focus();
      backupData.select();
      toast("Backup gerado. Copie o JSON.");
    });
    $("#importData").addEventListener("click", () => {
      try {
        const parsed = JSON.parse(backupData.value);
        if (!isObject(parsed)) throw new Error("invalid");
        draft = normalizeConfig(parsed);
        fillEditor();
        dirty = true;
        toast("Backup carregado. Clique em Salvar alterações.");
      } catch (_) {
        toast("JSON inválido. Cole um backup completo.");
      }
    });
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
    disarmAutoplay();
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
    disarmAutoplay();
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

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && adminEl.classList.contains("open")) closeAdmin();
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

    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;

    function requestReload() {
      if (reloading) return;
      if (document.body.classList.contains("admin-open")) {
        deferredReload = true;
        if (!document.hidden) toast("Atualização pronta. Feche o painel para aplicar.");
        return;
      }
      reloading = true;
      location.reload();
    }

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hadController) requestReload();
    });

    async function checkForUpdate() {
      if (!navigator.onLine) return;
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return;
        await registration.update();
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      } catch (_) {}
    }

    window.addEventListener("load", async () => {
      try {
        await navigator.serviceWorker.register("sw.js", { updateViaCache: "none" });
        checkForUpdate();
        setInterval(checkForUpdate, 60000);
        window.addEventListener("online", checkForUpdate);
        document.addEventListener("visibilitychange", () => {
          if (document.hidden) return;
          checkForUpdate();
          if (deferredReload && !document.body.classList.contains("admin-open")) requestReload();
        });
      } catch (_) {}
    });
  }

  config = loadConfig();
  applyConfig();
  bindAdmin();
  bindEditor();
  bindLinksEditor();
  document.documentElement.classList.add("js");
  initParallax();
  initNight();
  registerServiceWorker();
  startAutoplay();

  window.addEventListener("beforeunload", () => {
    try { audio.pause(); } catch (_) {}
  });
})();
