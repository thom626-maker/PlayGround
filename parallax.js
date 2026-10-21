/* parallax.js — layered night-forest parallax + scroll-reveal transitions.
 * Vanilla JS, no dependencies, fully self-contained (no external assets).
 *
 * Layers (deepest first): generated stars -> moon -> clouds -> far mountains
 * -> near mountains -> back pines -> front pines -> hill + spirits -> grass.
 * Storm canvases and flames paint ABOVE this (later in DOM, same z-index),
 * so rain falls over the mountains and fire burns in front — real depth.
 * The app shell paints above everything; text is never covered.
 */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* ---------- generated starfield ---------- */
  function buildStars() {
    var g = document.getElementById('pxStars');
    if (!g) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 70; i++) {
      var c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', (Math.random() * 1600).toFixed(0));
      c.setAttribute('cy', (Math.random() * 560).toFixed(0));
      c.setAttribute('r', (0.6 + Math.random() * 1.2).toFixed(2));
      c.setAttribute('fill', '#cfd9ef');
      c.setAttribute('class', 'star');
      c.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
      c.style.animationDuration = (2.2 + Math.random() * 3).toFixed(2) + 's';
      frag.appendChild(c);
    }
    g.appendChild(frag);
  }

  /* ---------- parallax engine (scroll + mouse, lerped) ---------- */
  var layers = [];
  var mx = 0, my = 0, cx = 0, cy = 0, sy = 0, csy = 0;
  var rafId = null;
  var reducedMotion = false;

  function collect() {
    layers = [];
    var nodes = document.querySelectorAll('#parallax [data-depth]');
    for (var i = 0; i < nodes.length; i++) {
      layers.push({ el: nodes[i], d: parseFloat(nodes[i].getAttribute('data-depth')) || 0 });
    }
  }

  function onMouse(e) {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    if (document.body.classList.contains("fx-off")) return;
    try {
      cx += (mx - cx) * 0.06;
      cy += (my - cy) * 0.06;
      var target = Math.min(window.scrollY || 0, 1400);
      csy += (target - csy) * 0.08;
      for (var i = 0; i < layers.length; i++) {
        var L = layers[i];
        var x = cx * L.d * 36;
        var y = cy * L.d * 22 + csy * L.d * 0.12;
        L.el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';
      }
    } catch (err) {
      if (window.console && window.console.warn) window.console.warn('[parallax] frame skipped', err);
    }
  }

  function start() {
    if (rafId !== null || reducedMotion) return;
    loop();
  }
  function stop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  /* ---------- scroll-reveal transitions ---------- */
  var revealObserver = null;
  function revealEl(el) {
    if (el.classList.contains('in')) return;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add('in');
            revealObserver.unobserve(entries[i].target);
          }
        }
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    }
    revealObserver.observe(el);
  }
  function sweepReveals(root) {
    var nodes = (root || document).querySelectorAll('.reveal:not(.in)');
    for (var i = 0; i < nodes.length; i++) revealEl(nodes[i]);
  }

  function init() {
    buildStars();
    collect();
    reducedMotion = !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (!reducedMotion) {
      window.addEventListener('mousemove', onMouse, { passive: true });
      start();
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { stop(); } else { start(); }
      });
    }
    // Reveal on scroll; MutationObserver picks up dynamically rendered blocks.
    sweepReveals(document);
    if (window.MutationObserver) {
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType !== 1) continue;
            if (n.classList && n.classList.contains('reveal')) revealEl(n);
            if (n.querySelectorAll) sweepReveals(n);
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.__parallax = {
    running: function () { return rafId !== null; },
    layers: function () { return layers.length; }
  };
})();
