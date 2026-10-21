/* flames.js — twin edge particle-flames (left + right), vanilla JS, no dependencies.
 *
 * Port of a single centered 400x400 circular flame to TWO side strips:
 *   <canvas id="flameLeft" class="flame"> and <canvas id="flameRight" class="flame">
 * fixed to the left/right viewport edges, behind all content.
 *
 * Adaptations vs the original:
 *  - CSS typo `@explore keyframes fade-in2` corrected to `@keyframes`.
 *  - The `.static` snow-GIF layer was dropped entirely (no external hotlink;
 *    everything stays self-contained). No synthesized static — particles glow.
 *  - No `body{overflow:hidden}`, no full-page absolute positioning: page scrolls.
 *  - One engine drives BOTH canvases via a Flame class (per-instance W/H/ctx/
 *    emitters/tick state — no shared mutable tick state). One shared rAF loop.
 *  - Narrow-strip coordinate mapping: the original Neg emitters sat at x=W-100
 *    and x=100 (for W=400, i.e. W*0.75 and W*0.25). Those fractions are used so
 *    the carve shape survives on a ~200px-wide strip. Horizontal radii/spreads
 *    scale by W/400 so proportions match the original at any strip width.
 *  - Paint order is back-to-front (Red->Orange->Yellow->White) so the bright
 *    core stays visible through 'source-over' on a narrow strip.
 */
(function () {
  'use strict';

  /* ---------- $ helpers ---------- */
  var $ = {
    PI: Math.PI,
    TAU: Math.PI * 2,
    rand: function (min, max) { return min + Math.random() * (max - min); },
    hsla: function (h, s, l, a) { return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')'; },
    baseRange: function (base, range) { return base + (Math.random() * 2 - 1) * range; }
  };

  /* ---------- Pool (recycles dead Particle objects) ---------- */
  $.Pool = function () { this.items = []; };
  $.Pool.prototype.get = function () { return this.items.pop(); };
  $.Pool.prototype.put = function (item) { this.items.push(item); };
  var particlePool = new $.Pool();

  /* ---------- Particle ---------- */
  $.Particle = function (opts) { this.reset(opts); };
  $.Particle.prototype.reset = function (o) {
    this.x = o.x; this.y = o.y; this.r = o.r;
    this.angle = o.angle; this.vel = o.vel; this.acc = o.acc;
    this.decay = o.decay;
    this.h = o.h; this.s = o.s; this.l = o.l;
    this.wander = o.wander; this.fade = o.fade;
    this.life = 1;
  };
  $.Particle.prototype.step = function () {
    this.angle += (Math.random() - 0.5) * this.wander;
    this.vel += this.acc;
    this.x += Math.cos(this.angle) * this.vel;
    this.y += Math.sin(this.angle) * this.vel;
    this.life -= this.decay;
  };
  $.Particle.prototype.draw = function (ctx) {
    if (this.life <= 0) return;
    var alpha = this.fade ? Math.max(this.life, 0) : 1;
    var radius = Math.max(this.r * this.life, 0.1);
    var h = Math.round(this.h);
    var s = Math.max(0, Math.min(100, Math.round(this.s)));
    var l = Math.max(0, Math.min(100, Math.round(this.l)));
    ctx.fillStyle = $.hsla(h, s, l, alpha);
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, $.TAU);
    ctx.fill();
  };

  /* ---------- ParticleEmitter ---------- */
  $.ParticleEmitter = function (flame, cfg) {
    this.flame = flame;
    this.cfg = cfg;
    this.particles = [];
    this.tick = (Math.random() * cfg.interval) | 0;
  };
  $.ParticleEmitter.prototype.spawn = function () {
    var W = this.flame.W, H = this.flame.H, c = this.cfg;
    // S keeps horizontal proportions identical to the 400px-wide original:
    // absolute radii/spreads would otherwise overwhelm a ~200px strip.
    var S = W / 400;
    var opts = {
      x: c.x(W, H) + (Math.random() * 2 - 1) * c.xr * S,
      y: $.baseRange(c.y(W, H), c.yr),
      r: Math.max($.baseRange(c.r, c.rr) * S, 0.1),
      angle: $.baseRange(c.angle, c.angleR),
      vel: $.baseRange(c.vel, c.velR),
      acc: $.baseRange(c.acc, c.accR),
      decay: Math.max($.baseRange(c.decay, c.decayR), 0.0005),
      h: $.baseRange(c.hue, c.hueR),
      s: $.baseRange(c.sat, c.satR),
      l: $.baseRange(c.light, c.lightR),
      wander: c.wander,
      fade: c.fade
    };
    var p = particlePool.get();
    if (p) { p.reset(opts); } else { p = new $.Particle(opts); }
    this.particles.push(p);
  };
  $.ParticleEmitter.prototype.step = function () {
    this.tick++;
    if (this.tick % this.cfg.interval === 0) this.spawn();
    var ps = this.particles;
    for (var i = ps.length - 1; i >= 0; i--) {
      var p = ps[i];
      p.step();
      if (p.life <= 0) { ps.splice(i, 1); particlePool.put(p); }
    }
  };
  $.ParticleEmitter.prototype.draw = function (ctx) {
    ctx.globalCompositeOperation = this.cfg.blend;
    for (var i = 0; i < this.particles.length; i++) this.particles[i].draw(ctx);
    ctx.globalCompositeOperation = 'source-over';
  };

  /* ---------- The 7 flame emitters (spec params, canvas-relative x/y) ----------
   * Paint order is back-to-front (Red -> Orange -> Yellow -> White) so the
   * bright core stays visible: with 'source-over', the widest emitter painted
   * last would otherwise bury the core on a narrow strip. All per-emitter
   * parameters (ranges, angles, velocities, decays, hues, blends, intervals)
   * are unchanged from the spec; only paint order adapts to the strip. */
  var PI = $.PI;
  var EMITTER_CONFIGS = [
    { // orange Sparks, additive
      x: function (W) { return W * 0.5; }, xr: 20,
      y: function (W, H) { return H; }, yr: 20,
      r: 0.75, rr: 0.4, angle: -PI / 2, angleR: PI * 0.01,
      vel: 0.5, velR: 0.5, acc: 0.01, accR: 0.01,
      decay: 0.005, decayR: 0.001, hue: 30, hueR: 30, sat: 80, satR: 20, light: 80, lightR: 20,
      wander: 0.06, blend: 'lighter', fade: true, interval: 5
    },
    { // Negative carve, right side (orig x = W-100 @W400 -> W*0.75)
      x: function (W) { return W * 0.75; }, xr: 25,
      y: function (W, H) { return H; }, yr: 5,
      r: 20, rr: 10, angle: -PI * 0.55, angleR: PI * 0.05,
      vel: 2, velR: 0, acc: 0.02, accR: 0.01,
      decay: 0.001, decayR: 0, hue: 0, hueR: 0, sat: 0, satR: 0, light: 0, lightR: 0,
      wander: 0.05, blend: 'destination-out', fade: false, interval: 1
    },
    { // Negative carve, left side (orig x = 100 @W400 -> W*0.25)
      x: function (W) { return W * 0.25; }, xr: 25,
      y: function (W, H) { return H; }, yr: 5,
      r: 20, rr: 10, angle: -PI * 0.45, angleR: PI * 0.05,
      vel: 2, velR: 0, acc: 0.02, accR: 0.01,
      decay: 0.001, decayR: 0, hue: 0, hueR: 0, sat: 0, satR: 0, light: 0, lightR: 0,
      wander: 0.05, blend: 'destination-out', fade: false, interval: 1
    },
    { // Red outer body (painted first: backdrop for the core)
      x: function (W) { return W * 0.5; }, xr: 30,
      y: function (W, H) { return H - 20; }, yr: 15,
      r: 35, rr: 10, angle: -PI / 2, angleR: PI * 0.025,
      vel: 2, velR: 0.25, acc: 0.01, accR: 0.01,
      decay: 0.0075, decayR: 0, hue: 0, hueR: 0, sat: 90, satR: 0, light: 50, lightR: 0,
      wander: 0.01, blend: 'source-over', fade: false, interval: 2
    },
    { // Orange body (interval 2->1 to match the denser core)
      x: function (W) { return W * 0.5; }, xr: 20,
      y: function (W, H) { return H - 20; }, yr: 15,
      r: 25, rr: 5, angle: -PI / 2, angleR: PI * 0.025,
      vel: 2, velR: 0.25, acc: 0.01, accR: 0.01,
      decay: 0.0075, decayR: 0, hue: 30, hueR: 0, sat: 90, satR: 0, light: 50, lightR: 0,
      wander: 0.01, blend: 'source-over', fade: false, interval: 1
    },
    { // Yellow body (denser core: interval 2->1 for reliable show-through)
      x: function (W) { return W * 0.5; }, xr: 20,
      y: function (W, H) { return H; }, yr: 20,
      r: 15, rr: 5, angle: -PI / 2, angleR: PI * 0.05,
      vel: 1.5, velR: 0, acc: 0.02, accR: 0.01,
      decay: 0.0075, decayR: 0, hue: 60, hueR: 0, sat: 100, satR: 0, light: 70, lightR: 0,
      wander: 0.01, blend: 'source-over', fade: false, interval: 1
    },
    { // White core (painted last: stays visible as the hot heart;
      // r 2->3 and interval 3->2 so the heart reads through the rails)
      x: function (W) { return W * 0.5; }, xr: 20,
      y: function (W, H) { return H - 20; }, yr: 20,
      r: 3, rr: 1, angle: -PI / 2, angleR: PI * 0.001,
      vel: 0.5, velR: 0, acc: 0.02, accR: 0.02,
      decay: 0.0075, decayR: 0, hue: 60, hueR: 0, sat: 90, satR: 0, light: 100, lightR: 0,
      wander: 0.025, blend: 'source-over', fade: false, interval: 2
    }
  ];

  /* ---------- Flame: owns one canvas + its emitters (per-instance state) ---------- */
  function Flame(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = 0; this.H = 0;
    this.grad = null;
    var self = this;
    this.emitters = EMITTER_CONFIGS.map(function (cfg) {
      return new $.ParticleEmitter(self, cfg);
    });
  }
  Flame.prototype.fit = function () {
    var cssW = window.innerWidth < 900 ? 120 : 200;
    var cssH = window.innerHeight || 800;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var pxW = Math.round(cssW * dpr), pxH = Math.round(cssH * dpr);
    if (this.canvas.width !== pxW || this.canvas.height !== pxH) {
      this.canvas.width = pxW;
      this.canvas.height = pxH;
    }
    // Simulate in CSS pixels so particle sizes match the design on any dpr.
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.W = cssW; this.H = cssH;
    this.grad = null;
  };
  Flame.prototype.step = function () {
    for (var i = 0; i < this.emitters.length; i++) this.emitters[i].step();
  };
  Flame.prototype.draw = function () {
    var ctx = this.ctx, W = this.W, H = this.H;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    var i;
    for (i = 0; i < this.emitters.length; i++) this.emitters[i].draw(ctx);
    // vertical gradient cutout: fade the flame out toward the top
    if (!this.grad) {
      var g = ctx.createLinearGradient(0, 0, 0, H * 0.75);
      g.addColorStop(0, 'rgba(0,0,0,1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      this.grad = g;
    }
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = this.grad;
    ctx.fillRect(0, 0, W, H * 0.75);
    // red/black base circle at the bottom (radii scaled like all radii)
    var bs = W / 400;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'red';
    ctx.beginPath(); ctx.arc(W * 0.5, H + 40, 63 * bs, 0, $.TAU); ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath(); ctx.arc(W * 0.5, H + 40, 60 * bs, 0, $.TAU); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  };

  /* ---------- init: one shared rAF loop drives both flames ---------- */
  var flames = [];
  var rafId = null;
  var reducedMotion = false;
  var totalSteps = 0;
  var frame = 0;

  function stepAll() {
    for (var i = 0; i < flames.length; i++) flames[i].step();
    totalSteps++;
  }
  function drawAll() {
    for (var i = 0; i < flames.length; i++) flames[i].draw();
  }
  function loop() {
    // Queue the next frame FIRST so a single bad frame can never kill the loop.
    rafId = requestAnimationFrame(loop);
    if (document.body.classList.contains("fx-off")) return;
    frame++;
    try {
      // With reduced-motion on, still animate (slower) instead of freezing.
      if (!reducedMotion || (frame % 4 === 0)) stepAll();
      drawAll();
    } catch (err) {
      if (window.console && window.console.warn) window.console.warn('[flames] frame skipped', err);
    }
  }
  function start() {
    if (rafId !== null) return;
    loop();
  }
  function stop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function init() {
    var left = document.getElementById('flameLeft');
    var right = document.getElementById('flameRight');
    if (!left || !right) return;
    flames = [new Flame(left), new Flame(right)];
    for (var i = 0; i < flames.length; i++) flames[i].fit();
    // pre-roll so the first paint already shows developed flames
    for (var s = 0; s < 300; s++) stepAll();

    reducedMotion = !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    drawAll(); // one static frame in all cases
    // Always animate (slower under reduced-motion) — never leave static flames.

    start();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { start(); }
    });
    // Resizing a canvas resets its bitmap, so re-fit AND repaint immediately
    // (never leave a cleared canvas waiting for the next rAF tick).
    function refitAndPaint() {
      for (var k = 0; k < flames.length; k++) flames[k].fit();
      drawAll();
    }
    window.addEventListener('resize', refitAndPaint);
    window.addEventListener('load', refitAndPaint);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Debug/verification handle: lets tests confirm the loop is alive + advancing.
  window.__flames = {
    steps: function () { return totalSteps; },
    running: function () { return rafId !== null; },
    reduced: function () { return reducedMotion; }
  };
})();
