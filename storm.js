/* storm.js — background lightning storm + rain (vanilla JS, no dependencies).
 *
 * Port of a 3-canvas storm effect (rain troughs, rain streaks, lightning bolts
 * + thunder flash) adapted for this page:
 *  - The source SCSS (@mixin/$vars/@at-root) is flattened to plain CSS.
 *  - The Google Drive background image is NOT used (no external hotlink;
 *    the page already has its own background).
 *  - The thunder flash is a fixed full-viewport layer at z-index 0, i.e.
 *    UNDER the app shell — text and controls always paint above it.
 *  - All 3 canvases are fixed, full-viewport, pointer-events:none, z-index 0.
 *  - Same robustness as flames.js: rAF queued first + try/catch per frame,
 *    pause when tab hidden, slower (not frozen) under prefers-reduced-motion.
 */
(function () {
  'use strict';

  var c1 = document.getElementById('storm1');
  var c2 = document.getElementById('storm2');
  var c3 = document.getElementById('storm3');
  if (!c1 || !c2 || !c3) return;
  var ctx1 = c1.getContext('2d');
  var ctx2 = c2.getContext('2d');
  var ctx3 = c3.getContext('2d');

  var rainthroughnum = 500;
  var speedRainTrough = 25;
  var RainTrough = [];

  var rainnum = 500;
  var rain = [];

  var lightning = [];
  var lightTimeCurrent = 0;
  var lightTimeTotal = 0;

  var W = 0, H = 0;

  function fit() {
    W = c1.width = c2.width = c3.width = window.innerWidth;
    H = c1.height = c2.height = c3.height = window.innerHeight;
  }

  function random(min, max) {
    return Math.random() * (max - min + 1) + min;
  }

  function clearcanvas1() {
    ctx1.clearRect(0, 0, W, H);
  }

  function clearcanvas2() {
    ctx2.clearRect(0, 0, c2.width, c2.height);
  }

  function clearCanvas3() {
    ctx3.globalCompositeOperation = 'destination-out';
    ctx3.fillStyle = 'rgba(0,0,0,' + random(1, 30) / 100 + ')';
    ctx3.fillRect(0, 0, W, H);
    ctx3.globalCompositeOperation = 'source-over';
  }

  function createRainTrough() {
    RainTrough = [];
    for (var i = 0; i < rainthroughnum; i++) {
      RainTrough[i] = {
        x: random(0, W),
        y: random(0, H),
        length: Math.floor(random(1, 830)),
        opacity: Math.random() * 0.2,
        xs: random(-2, 2),
        ys: random(10, 20)
      };
    }
  }

  function createRain() {
    rain = [];
    for (var i = 0; i < rainnum; i++) {
      rain[i] = {
        x: Math.random() * W,
        y: Math.random() * H,
        l: Math.random() * 1,
        xs: -4 + Math.random() * 4 + 2,
        ys: Math.random() * 10 + 10
      };
    }
  }

  function createLightning() {
    var x = random(100, W - 100);
    var y = random(0, H / 4);

    var createCount = random(1, 3);
    for (var i = 0; i < createCount; i++) {
      lightning.push({
        x: x,
        y: y,
        xRange: random(5, 30),
        yRange: random(10, 25),
        path: [{
          x: x,
          y: y
        }],
        pathLimit: random(40, 55)
      });
    }
  }

  function drawRainTrough(i) {
    ctx1.beginPath();
    var grd = ctx1.createLinearGradient(0, RainTrough[i].y, 0, RainTrough[i].y + RainTrough[i].length);
    grd.addColorStop(0, 'rgba(255,255,255,0)');
    grd.addColorStop(1, 'rgba(255,255,255,' + RainTrough[i].opacity + ')');

    ctx1.fillStyle = grd;
    ctx1.fillRect(RainTrough[i].x, RainTrough[i].y, 1, RainTrough[i].length);
    ctx1.fill();
  }

  function drawRain(i) {
    ctx2.beginPath();
    ctx2.moveTo(rain[i].x, rain[i].y);
    ctx2.lineTo(rain[i].x + rain[i].l * rain[i].xs, rain[i].y + rain[i].l * rain[i].ys);
    ctx2.strokeStyle = 'rgba(174,194,224,0.5)';
    ctx2.lineWidth = 1;
    ctx2.lineCap = 'round';
    ctx2.stroke();
  }

  function drawLightning() {
    for (var i = 0; i < lightning.length; i++) {
      var light = lightning[i];

      light.path.push({
        x: light.path[light.path.length - 1].x + (random(0, light.xRange) - (light.xRange / 2)),
        y: light.path[light.path.length - 1].y + (random(0, light.yRange))
      });

      if (light.path.length > light.pathLimit) {
        lightning.splice(i, 1);
      }

      ctx3.strokeStyle = 'rgba(255, 255, 255, .1)';
      ctx3.lineWidth = 3;
      if (random(0, 15) === 0) {
        ctx3.lineWidth = 6;
      }
      if (random(0, 30) === 0) {
        ctx3.lineWidth = 8;
      }

      ctx3.beginPath();
      ctx3.moveTo(light.x, light.y);
      for (var pc = 0; pc < light.path.length; pc++) {
        ctx3.lineTo(light.path[pc].x, light.path[pc].y);
      }
      if (Math.floor(random(0, 30)) === 1) {
        ctx3.fillStyle = 'rgba(255, 255, 255, ' + random(1, 3) / 100 + ')';
        ctx3.fillRect(0, 0, W, H);
      }
      ctx3.lineJoin = 'miter';
      ctx3.stroke();
    }
  }

  function animateRainTrough() {
    clearcanvas1();
    for (var i = 0; i < rainthroughnum; i++) {
      if (RainTrough[i].y >= H) {
        RainTrough[i].y = H - RainTrough[i].y - RainTrough[i].length * 5;
      } else {
        RainTrough[i].y += speedRainTrough;
      }
      drawRainTrough(i);
    }
  }

  function animateRain() {
    clearcanvas2();
    for (var i = 0; i < rainnum; i++) {
      rain[i].x += rain[i].xs;
      rain[i].y += rain[i].ys;
      if (rain[i].x > W || rain[i].y > H) {
        rain[i].x = Math.random() * W;
        rain[i].y = -20;
      }
      drawRain(i);
    }
  }

  function animateLightning() {
    clearCanvas3();
    lightTimeCurrent++;
    if (lightTimeCurrent >= lightTimeTotal) {
      createLightning();
      lightTimeCurrent = 0;
      lightTimeTotal = 200;
    }
    drawLightning();
  }

  /* ---------- shared loop: rAF first, guarded, pausable ---------- */
  var rafId = null;
  var reducedMotion = false;
  var frame = 0;
  var totalSteps = 0;

  function animloop() {
    // Queue the next frame FIRST so a single bad frame can never kill the storm.
    rafId = requestAnimationFrame(animloop);
    if (document.body.classList.contains("fx-off")) return;
    frame++;
    try {
      // With reduced-motion on, still animate (slower) instead of freezing.
      if (!reducedMotion || (frame % 4 === 0)) {
        animateRainTrough();
        animateRain();
        animateLightning();
        totalSteps++;
      }
    } catch (err) {
      if (window.console && window.console.warn) window.console.warn('[storm] frame skipped', err);
    }
  }
  function start() {
    if (rafId !== null) return;
    animloop();
  }
  function stop() {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function init() {
    fit();
    createRainTrough();
    createRain();
    reducedMotion = !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    start();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); } else { start(); }
    });
    window.addEventListener('resize', function () {
      fit();
      createRainTrough();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Debug/verification handle.
  window.__storm = {
    steps: function () { return totalSteps; },
    running: function () { return rafId !== null; },
    bolts: function () { return lightning.length; }
  };
})();
