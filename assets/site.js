/* Site interactions and research demos for jabermahmud24.github.io
   Plain JavaScript, no dependencies. Each demo only animates while it is on screen. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var C = {
    ink: '#16202E', slate: '#5A6676', rule: '#DDE2E5', faint: '#EEF1F3',
    teal: '#0D6B6F', tealSoft: 'rgba(13,107,111,.14)', amber: '#F2B632', amberDeep: '#C98F0A',
    red: '#D64545', green: '#2E9E6A', white: '#FFFFFF'
  };
  // Canvas text is drawn in logical units; FS enlarges it when a demo is shown small (phones).
  var FS = 1;
  function font(px, weight) { return (weight || 600) + ' ' + Math.round(px * FS) + 'px "Schibsted Grotesk", system-ui, sans-serif'; }

  /* ------------------------------------------------------------------ */
  /* Small helpers                                                      */
  /* ------------------------------------------------------------------ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function len(x, y) { return Math.sqrt(x * x + y * y); }
  function angDiff(a, b) { var d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function arrow(ctx, x1, y1, x2, y2, color, w) {
    var a = Math.atan2(y2 - y1, x2 - x1), hl = 9 + w;
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * hl * 0.6, y2 - Math.sin(a) * hl * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hl * Math.cos(a - 0.45), y2 - hl * Math.sin(a - 0.45));
    ctx.lineTo(x2 - hl * Math.cos(a + 0.45), y2 - hl * Math.sin(a + 0.45));
    ctx.closePath(); ctx.fill();
  }
  function chip(ctx, x, y, text, bg, fg) {
    ctx.font = font(13); var h = 24 * FS, w = ctx.measureText(text).width + 18 * FS;
    ctx.fillStyle = bg; roundRect(ctx, x, y, w, h, 6); ctx.fill();
    ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 9 * FS, y + h / 2 + 0.5);
    return w;
  }
  // HUD meter under the status chip: label, track, fill and an optional threshold mark.
  function meter(ctx, label, frac, color, mark) {
    var top = 14 + 24 * FS, ly = top + 16 * FS, by = ly + 6 * FS, bw = 180, bh = 10 * FS;
    ctx.fillStyle = C.slate; ctx.font = font(12, 500); ctx.textBaseline = 'alphabetic';
    ctx.fillText(label, 14, ly);
    ctx.fillStyle = C.faint; roundRect(ctx, 14, by, bw, bh, bh / 2); ctx.fill();
    ctx.fillStyle = color; roundRect(ctx, 14, by, Math.max(bh, bw * frac), bh, bh / 2); ctx.fill();
    if (mark != null) { var tx = 14 + bw * mark; ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(tx, by - 4); ctx.lineTo(tx, by + bh + 4); ctx.stroke(); }
  }

  /* A canvas that keeps a fixed logical size (W x H) and scales to its box. */
  function makeStage(canvas, W, H, draw) {
    var ctx = canvas.getContext('2d');
    var running = false, visible = false, last = 0, raf = 0;
    function resize() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      var w = canvas.clientWidth || W;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(w * H / W * dpr);
      paint(0);
    }
    function paint(dt) {
      var s = canvas.width / W;
      FS = clamp(W / (canvas.clientWidth || W) * 0.85, 1, 2);
      ctx.setTransform(s, 0, 0, s, 0, 0);
      ctx.clearRect(0, 0, W, H);
      draw(ctx, dt);
    }
    function frame(t) {
      if (!running) return;
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
      paint(dt);
      raf = requestAnimationFrame(frame);
    }
    var stage = {
      ctx: ctx,
      start: function () { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); },
      stop: function () { running = false; cancelAnimationFrame(raf); },
      repaint: function () { paint(0); },
      isVisible: function () { return visible; },
      toLogical: function (ev) {
        var r = canvas.getBoundingClientRect();
        return { x: (ev.clientX - r.left) / r.width * W, y: (ev.clientY - r.top) / r.height * H };
      }
    };
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize);
    resize();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          visible = e.isIntersecting;
          if (visible) { stage.start(); if (stage.onShow) stage.onShow(); } else stage.stop();
        });
      }, { threshold: 0.15 }).observe(canvas);
    } else { visible = true; stage.start(); }
    return stage;
  }

  /* ------------------------------------------------------------------ */
  /* Demo 1: mutual adaptation in co-transportation (top-down)          */
  /* ------------------------------------------------------------------ */
  function demoMutual(root) {
    var canvas = $('canvas', root), W = 640, H = 400;
    var status = $('[data-status]', root), restartBtn = $('[data-restart]', root);
    var thrInput = $('[data-threshold]', root), thrOut = $('[data-threshold-out]', root);
    var OB = { x: 262, y: 148, w: 116, h: 104 };            // obstacle (a table)
    var S = { x: 78, y: 200 }, G = { x: 566, y: 200 };
    var ROUTES = {
      upper: [S, { x: 205, y: 92 }, { x: 435, y: 92 }, G],
      lower: [S, { x: 205, y: 308 }, { x: 435, y: 308 }, G]
    };
    var SPEED = 78, L = 64, MARGIN = 26;
    var st;

    function reset() {
      st = {
        c: { x: S.x, y: S.y }, th: 0, robotRoute: 'upper', humanRoute: 'lower',
        mode: 'lead', s: 0, alpha: 0.15, trail: [], manual: false, dragging: false, p: null,
        done: 0, toast: '', toastT: 0, t: 0, idle: 0
      };
      setStatus('The robot plans to go around the top. In this run, the person wants the bottom.');
    }
    function setStatus(t) { if (status) status.textContent = t; }
    function nextWp(route, c) {
      var pts = ROUTES[route];
      for (var i = 1; i < pts.length; i++) if (pts[i].x > c.x + 10) return pts[i];
      return G;
    }
    function dirTo(a, b, sp) { var dx = b.x - a.x, dy = b.y - a.y, d = len(dx, dy) || 1; return { x: dx / d * sp, y: dy / d * sp }; }
    function threshold() { return thrInput ? parseFloat(thrInput.value) : 0.6; }

    function step(dt) {
      if (!dt) return;
      st.t += dt;
      if (st.done) { st.done += dt; if (st.done > 2.2) reset(); return; }
      var c = st.c;
      var vr = dirTo(c, nextWp(st.robotRoute, c), SPEED);
      var vh;
      if (st.dragging && st.p) {
        var dx = st.p.x - c.x, dy = st.p.y - c.y, d = len(dx, dy);
        vh = d < 8 ? { x: 0, y: 0 } : { x: dx / d * Math.min(SPEED * 1.15, d * 3), y: dy / d * Math.min(SPEED * 1.15, d * 3) };
      } else if (st.manual) {
        vh = { x: vr.x, y: vr.y };                         // released: the person goes along
      } else {
        vh = dirTo(c, nextWp(st.humanRoute, c), SPEED);
      }
      // stubbornness grows while the person pushes against the robot's plan
      var nh = len(vh.x, vh.y), nr = len(vr.x, vr.y);
      var conflict = (nh > 4 && nr > 4) ? Math.max(0, 1 - (vh.x * vr.x + vh.y * vr.y) / (nh * nr)) : 0;
      st.s = clamp(st.s + dt * (conflict * 0.34 - 0.06), 0, 1);

      if (st.mode === 'lead' && st.s > threshold()) {
        st.mode = 'follow';
        st.toast = 'Robot yields and replans'; st.toastT = 2.2;
        setStatus('The person was persistent, so the robot switched from leading to following.');
      }
      if (st.mode === 'follow') {
        // follow: adopt the route that best matches the person's direction
        var best = st.robotRoute, bestDot = -Infinity;
        ['upper', 'lower'].forEach(function (k) {
          var v = dirTo(c, nextWp(k, c), 1), dd = v.x * vh.x + v.y * vh.y;
          if (dd > bestDot) { bestDot = dd; best = k; }
        });
        if (nh > 4) st.robotRoute = best;
        vr = dirTo(c, nextWp(st.robotRoute, c), SPEED);
      }
      st.alpha = lerp(st.alpha, st.mode === 'lead' ? 0.15 : 0.85, Math.min(1, dt * 3));
      var vx = (1 - st.alpha) * vr.x + st.alpha * vh.x, vy = (1 - st.alpha) * vr.y + st.alpha * vh.y;
      var sp = len(vx, vy);
      // two partners pulling apart slow the shared load down
      var agree = 1 - 0.55 * conflict * (st.mode === 'lead' ? 1 : 0.2);
      var cap = SPEED * clamp(agree, 0.25, 1);
      if (sp > cap) { vx = vx / sp * cap; vy = vy / sp * cap; }
      c.x += vx * dt; c.y += vy * dt;
      // keep the team out of the table
      var x0 = OB.x - MARGIN, x1 = OB.x + OB.w + MARGIN, y0 = OB.y - MARGIN, y1 = OB.y + OB.h + MARGIN;
      if (c.x > x0 && c.x < x1 && c.y > y0 && c.y < y1) {
        var dl = c.x - x0, dr = x1 - c.x, dtp = c.y - y0, db = y1 - c.y, m = Math.min(dl, dr, dtp, db);
        if (m === dl) c.x = x0; else if (m === dr) c.x = x1; else if (m === dtp) c.y = y0; else c.y = y1;
      }
      c.x = clamp(c.x, 30, W - 30); c.y = clamp(c.y, 30, H - 30);
      if (len(vx, vy) > 6) st.th += angDiff(st.th, Math.atan2(vy, vx)) * Math.min(1, dt * 5);
      if (!st.trail.length || len(c.x - st.trail[st.trail.length - 1].x, c.y - st.trail[st.trail.length - 1].y) > 6) st.trail.push({ x: c.x, y: c.y });
      if (st.toastT > 0) st.toastT -= dt;
      if (len(c.x - G.x, c.y - G.y) < 16) { st.done = 0.001; setStatus('Delivered. Restarting…'); }
    }

    function poly(ctx, pts, color, dash, w) {
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = w || 2; ctx.setLineDash(dash || []); ctx.lineJoin = 'round';
      ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.stroke(); ctx.restore();
    }
    function remaining(route, c) {
      var pts = [c], seen = false;
      ROUTES[route].forEach(function (p) { if (p.x > c.x + 10) seen = true; if (seen) pts.push(p); });
      if (pts.length === 1) pts.push(G);
      return pts;
    }

    function draw(ctx, dt) {
      step(dt);
      var c = st.c;
      // floor grid
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1;
      for (var gx = 0; gx <= W; gx += 32) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (var gy = 0; gy <= H; gy += 32) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      // table
      ctx.fillStyle = '#E4E9ED'; roundRect(ctx, OB.x, OB.y, OB.w, OB.h, 8); ctx.fill();
      ctx.strokeStyle = '#C5CDD4'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = C.slate; ctx.font = font(12, 500); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('obstacle', OB.x + OB.w / 2, OB.y + OB.h / 2); ctx.textAlign = 'left';
      // goal
      ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(G.x, G.y, 20, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink; ctx.font = font(13); ctx.textAlign = 'center'; ctx.fillText('Goal', G.x, G.y - 32); ctx.textAlign = 'left';
      // trail
      if (st.trail.length > 1) poly(ctx, st.trail.concat([c]), 'rgba(90,102,118,.35)', [], 3);
      // plans
      poly(ctx, remaining(st.robotRoute, c), C.teal, [7, 6], 2.2);
      if (st.dragging && st.p) poly(ctx, [c, st.p], C.amberDeep, [3, 5], 2);
      else if (!st.manual && st.humanRoute !== st.robotRoute) poly(ctx, remaining(st.humanRoute, c), C.amberDeep, [3, 5], 2);
      // team: board, human, robot
      var hx = c.x - Math.cos(st.th) * L / 2, hy = c.y - Math.sin(st.th) * L / 2;
      var rx = c.x + Math.cos(st.th) * L / 2, ry = c.y + Math.sin(st.th) * L / 2;
      ctx.strokeStyle = C.amber; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(rx, ry); ctx.stroke();
      ctx.save(); ctx.translate(rx, ry); ctx.rotate(st.th);
      ctx.fillStyle = C.teal; roundRect(ctx, -13, -13, 26, 26, 6); ctx.fill();
      ctx.fillStyle = C.white; ctx.font = font(12, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.rotate(-st.th); ctx.fillText('R', 0, 1); ctx.restore();
      ctx.fillStyle = C.amber; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(hx, hy, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = font(12, 700); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('H', hx, hy + 1); ctx.textAlign = 'left';
      if (st.dragging && st.p) { ctx.strokeStyle = C.amberDeep; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(st.p.x, st.p.y, 7, 0, Math.PI * 2); ctx.stroke(); }
      // HUD
      var lead = st.mode === 'lead';
      chip(ctx, 14, 14, lead ? 'Robot leading' : 'Robot following', lead ? C.teal : C.amber, lead ? C.white : C.ink);
      meter(ctx, 'Human stubbornness (robot’s estimate)', st.s, st.s > threshold() ? C.amberDeep : C.amber, threshold());
      // legend
      ctx.font = font(12, 500); ctx.textBaseline = 'middle';
      var lx = W - 14 - ctx.measureText("Person's intent").width - 40, l1 = H - 18 - 20 * FS, l2 = H - 18;
      ctx.strokeStyle = C.teal; ctx.lineWidth = 2.2; ctx.setLineDash([7, 6]); ctx.beginPath(); ctx.moveTo(lx, l1); ctx.lineTo(lx + 30, l1); ctx.stroke();
      ctx.strokeStyle = C.amberDeep; ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(lx, l2); ctx.lineTo(lx + 30, l2); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = C.ink; ctx.fillText("Robot's plan", lx + 38, l1); ctx.fillText("Person's intent", lx + 38, l2);
      if (st.toastT > 0) {
        ctx.globalAlpha = Math.min(1, st.toastT * 2);
        ctx.font = font(13); var w = ctx.measureText(st.toast).width + 24 * FS, th2 = 30 * FS, ty = 14, tx0 = W - 14 - w;
        ctx.fillStyle = C.ink; roundRect(ctx, tx0, ty, w, th2, 8); ctx.fill();
        ctx.fillStyle = C.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(st.toast, tx0 + w / 2, ty + th2 / 2); ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
      }
      if (st.done) {
        ctx.fillStyle = 'rgba(46,158,106,.12)'; ctx.beginPath(); ctx.arc(G.x, G.y, 20 + st.done * 30, 0, Math.PI * 2); ctx.fill();
      }
    }

    reset();
    var stage = makeStage(canvas, W, H, draw);
    if (reduceMotion) { stage.stop(); stage.onShow = function () { stage.stop(); stage.repaint(); }; }

    canvas.addEventListener('pointerdown', function (e) {
      if (st.done) reset();
      st.manual = true; st.dragging = true; st.p = stage.toLogical(e);
      canvas.setPointerCapture(e.pointerId);
      setStatus('You are steering the person. Push against the robot’s plan and hold it.');
      stage.start();
    });
    canvas.addEventListener('pointermove', function (e) { if (st.dragging) st.p = stage.toLogical(e); });
    function up() { st.dragging = false; }
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    if (restartBtn) restartBtn.addEventListener('click', function () { reset(); stage.start(); });
    if (thrInput) {
      var upd = function () { thrOut.textContent = Math.round(parseFloat(thrInput.value) * 100) + '%'; };
      thrInput.addEventListener('input', upd); upd();
    }
  }

  /* ------------------------------------------------------------------ */
  /* Demo 2: support contact vs rollover (side view, toy model)         */
  /* ------------------------------------------------------------------ */
  function demoContact(root) {
    var canvas = $('canvas', root), W = 640, H = 360;
    var force = $('[data-force]', root), forceOut = $('[data-force-out]', root);
    var braceBtns = $all('[data-brace]', root), status = $('[data-status]', root);
    var GROUND = 318, PIVOT = { x: 236, y: GROUND };
    var LIMIT = { off: 20, on: 52 };     // illustrative force limits in N
    var st = { F: 0, brace: false, th: 0, w: 0, auto: !reduceMotion, autoT: 0, fallen: false };

    function limit() { return st.brace ? LIMIT.on : LIMIT.off; }
    function setBrace(on) {
      st.brace = on;
      braceBtns.forEach(function (b) { b.setAttribute('aria-pressed', String((b.getAttribute('data-brace') === 'on') === on)); });
    }
    function setForce(v) { st.F = v; force.value = String(Math.round(v)); forceOut.textContent = Math.round(v) + ' N'; }
    function userTook() { st.auto = false; }

    force.addEventListener('input', function () { userTook(); setForce(parseFloat(force.value)); stage.start(); });
    braceBtns.forEach(function (b) {
      b.addEventListener('click', function () { userTook(); setBrace(b.getAttribute('data-brace') === 'on'); stage.start(); });
    });

    function autoStep(dt) {
      // ground-only push that tips over, then the same push with a brace
      st.autoT += dt; var t = st.autoT;
      if (t < 0.8) { setBrace(false); setForce(0); }
      else if (t < 3.6) setForce(clamp((t - 0.8) / 2.8 * 34, 0, 34));
      else if (t < 5.2) { /* hold */ }
      else if (t < 5.9) setForce(lerp(34, 0, (t - 5.2) / 0.7));
      else if (t < 6.6) { setBrace(true); setForce(0); }
      else if (t < 9.4) setForce(clamp((t - 6.6) / 2.8 * 40, 0, 40));
      else if (t < 11.4) { /* hold */ }
      else if (t < 12.1) setForce(lerp(40, 0, (t - 11.4) / 0.7));
      else st.autoT = 0;
    }

    function physics(dt) {
      if (!dt) return;
      if (st.auto && stage.isVisible()) autoStep(dt);
      var over = st.F > limit();
      if (over) {
        st.w += dt * (2.2 + (st.F - limit()) * 0.12);    // tipping accelerates
        st.th += st.w * dt;
        if (st.th > 0.62) { st.th = 0.62; st.w = 0; st.fallen = true; }
      } else {
        st.w = 0; st.fallen = false;
        st.th = lerp(st.th, 0, Math.min(1, dt * 4));
      }
      var margin = Math.round(clamp((limit() - st.F) / limit(), 0, 1) * 100);
      if (status) {
        status.textContent = over
          ? (st.brace ? 'Even braced, this force is too much.' : 'Ground contact alone can’t resist this force. The robot rolls over.')
          : (st.brace ? 'Braced on the cabinet, the robot holds the pull (margin ' + margin + '%).' : 'Standing on the ground only (margin ' + margin + '%).');
      }
    }

    function rot(p, th) {
      var dx = p.x - PIVOT.x, dy = p.y - PIVOT.y, c = Math.cos(th), s = Math.sin(th);
      return { x: PIVOT.x + dx * c - dy * s, y: PIVOT.y + dx * s + dy * c };
    }

    function draw(ctx, dt) {
      physics(dt);
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
      // floor
      ctx.fillStyle = '#F1F3F4'; ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.strokeStyle = '#C5CDD4'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
      // cabinet with drawer
      ctx.fillStyle = '#E4E9ED'; ctx.fillRect(388, 150, 150, GROUND - 150);
      ctx.strokeStyle = '#C5CDD4'; ctx.lineWidth = 1.5; ctx.strokeRect(388, 150, 150, GROUND - 150);
      ctx.strokeRect(396, 176, 134, 52);
      ctx.fillStyle = C.slate; ctx.fillRect(382, 194, 8, 16);           // handle
      ctx.font = font(12, 500); ctx.fillStyle = C.slate; ctx.fillText('stuck drawer', 420, 252);

      var th = st.th;
      var T = function (x, y) { return rot({ x: x, y: y }, th); };    // tips forward: rear lifts, front drops
      function line(pts, color, w) {
        ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); pts.forEach(function (p, i) { var q = T(p[0], p[1]); if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); }); ctx.stroke();
      }
      // far legs, body, near legs
      line([[150, 268], [138, 292], [150, GROUND - 2]], '#9AA5B1', 6);
      line([[236 - 14, 268], [222 - 14, 292], [236 - 14, GROUND - 2]], '#9AA5B1', 6);
      ctx.save();
      var b = T(108, 236); ctx.translate(b.x, b.y); ctx.rotate(th);
      ctx.fillStyle = '#B9C2CB'; roundRect(ctx, 0, 0, 142, 36, 9); ctx.fill();
      ctx.fillStyle = '#8D99A6'; roundRect(ctx, 136, 6, 22, 24, 6); ctx.fill();
      ctx.fillStyle = C.ink; ctx.font = font(12, 500); ctx.fillText('Go2', 12, 22);
      ctx.restore();
      line([[136, 268], [124, 292], [136, GROUND - 2]], C.ink, 6);
      line([[236, 268], [222, 292], [236, GROUND - 2]], C.ink, 6);
      // arm: base -> shoulder -> elbow -> wrist -> gripper at the handle
      // the arm lets go and folds in as the robot tips
      var k = clamp(th / 0.62, 0, 1);
      var el = [lerp(268, 236, k), lerp(150, 160, k)], wr = [lerp(338, 280, k), lerp(172, 145, k)], gp = [lerp(378, 300, k), lerp(202, 160, k)];
      var gripX = gp[0];
      line([[196, 236], [196, 222], el, wr, gp], C.ink, 9);
      line([[196, 236], [196, 222], el, wr, gp], '#2B3A4C', 5);
      var jt = [[196, 222], el, wr];
      jt.forEach(function (j) { var q = T(j[0], j[1]); ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(q.x, q.y, 5, 0, Math.PI * 2); ctx.fill(); });
      // brace frame from the forearm to the cabinet face
      if (st.brace) {
        line([[330, 184], [384, 270]], C.teal, 7);
        var cp = T(384, 270);
        ctx.fillStyle = C.amber; ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cp.x, cp.y, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = C.teal; ctx.font = font(13); ctx.textAlign = 'right'; ctx.fillText('support contact', cp.x - 12, cp.y + 24 * FS); ctx.textAlign = 'left';
      }
      // pull force at the handle (on the drawer, pointing toward the robot)
      if (st.F > 0.5 && !st.fallen) {
        var g = T(gp[0], gp[1]), Lf = 12 + st.F * 2.1;
        arrow(ctx, g.x + 20 + Lf, 186, g.x + 20, 186, C.red, 4);   // force on the drawer, toward the robot
        ctx.fillStyle = C.red; ctx.font = font(13); ctx.fillText('pull ' + Math.round(st.F) + ' N', g.x + 22, 168);
      }
      // HUD: margin bar
      var lim = limit(), m = clamp((lim - st.F) / lim, 0, 1), over = st.F > lim;
      chip(ctx, 14, 14, over ? 'Rolling over' : 'Stable', over ? C.red : C.green, C.white);
      meter(ctx, 'Remaining force margin', m, over ? C.red : C.green, null);
      // pivot marker while tipping
      if (th > 0.02) { ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(PIVOT.x, PIVOT.y, 9, Math.PI, 2 * Math.PI); ctx.stroke(); }
    }

    setBrace(false); setForce(0);
    var stage = makeStage(canvas, W, H, draw);
    stage.onShow = function () { if (reduceMotion && st.auto) { st.auto = false; } };
  }

  /* ------------------------------------------------------------------ */
  /* Demo 3: sequential narrow openings (top-down)                      */
  /* ------------------------------------------------------------------ */
  var NARROW = (function () {
    var W = 640, H = 400, T = 14, BAR = 110, BW = 10;
    var walls = [], X = [200, 340, 480], GAPS = [[230, 290], [90, 150], [210, 270]];
    X.forEach(function (x, i) {
      walls.push({ x: x - T / 2, y: 0, w: T, h: GAPS[i][0] });
      walls.push({ x: x - T / 2, y: GAPS[i][1], w: T, h: H - GAPS[i][1] });
    });
    var D = Math.PI / 2;
    var PLANS = {
      collide: [[80, 260, 0], [270, 260, 0], [270, 170, 0.5], [410, 120, 0.5], [560, 240, 0]],
      outside: [[80, 260, 0], [270, 260, 0], [270, 260, D], [270, 40, D], [270, 120, 0], [410, 120, 0]],
      tuned: [[80, 260, 0], [270, 260, 0], [270, 260, D], [270, 120, D], [270, 120, 0], [410, 120, 0], [410, 120, D], [410, 240, D], [410, 240, 0], [565, 240, 0]]
    };
    function barPoints(x, y, th) {
      var pts = [], c = Math.cos(th), s = Math.sin(th);
      for (var i = 0; i <= 24; i++) {
        var u = -BAR / 2 + BAR * i / 24;
        pts.push({ x: x + c * u, y: y + s * u });
      }
      return pts;
    }
    function check(x, y, th) {
      var pts = barPoints(x, y, th), r = BW / 2;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) return 'outside';
        for (var k = 0; k < walls.length; k++) {
          var w = walls[k];
          if (p.x > w.x - r && p.x < w.x + w.w + r && p.y > w.y - r && p.y < w.y + w.h + r) return 'collision';
        }
      }
      return null;
    }
    // Sample a plan: move first, then rotate, at fixed speeds; returns list of poses.
    function sample(plan) {
      var out = [];
      for (var i = 0; i < plan.length - 1; i++) {
        var a = plan[i], b = plan[i + 1];
        var dist = len(b[0] - a[0], b[1] - a[1]), rot = Math.abs(b[2] - a[2]);
        var n = Math.max(2, Math.ceil(dist / 2.5 + rot / 0.03));
        for (var j = 0; j < n; j++) {
          var t = j / n;
          out.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]);
        }
      }
      var e = plan[plan.length - 1]; out.push([e[0], e[1], e[2]]);
      return out;
    }
    function verify(name) {
      var s = sample(PLANS[name]);
      for (var i = 0; i < s.length; i++) { var r = check(s[i][0], s[i][1], s[i][2]); if (r) return { result: r, at: i, of: s.length }; }
      return { result: 'ok', of: s.length };
    }
    return { W: W, H: H, T: T, BAR: BAR, BW: BW, walls: walls, X: X, GAPS: GAPS, PLANS: PLANS, sample: sample, check: check, verify: verify };
  })();
  window.__narrow = NARROW;   // used by tests

  function demoNarrow(root) {
    var N = NARROW, canvas = $('canvas', root), W = N.W, H = N.H;
    var btns = $all('[data-plan]', root), status = $('[data-status]', root);
    var LABEL = { collide: 'Base model, try 1', outside: 'Base model, try 2', tuned: 'Fine-tuned model' };
    var st = { plan: null, path: null, k: 0, outcome: null, t: 0, auto: !reduceMotion, queue: ['collide', 'outside', 'tuned'], hold: 0 };

    function run(name) {
      st.plan = name; st.path = N.sample(N.PLANS[name]); st.k = 0; st.outcome = null; st.hold = 0;
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-plan') === name)); });
      if (status) status.textContent = LABEL[name] + ': following its waypoints…';
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { st.auto = false; run(b.getAttribute('data-plan')); stage.start(); });
    });

    function step(dt) {
      if (!dt || !st.path) return;
      if (st.outcome) {
        st.hold += dt;
        if (st.auto && st.hold > 1.8) { st.queue.push(st.queue.shift()); run(st.queue[0]); }
        return;
      }
      st.k = Math.min(st.path.length - 1, st.k + dt * 95);
      var p = st.path[Math.floor(st.k)];
      var r = N.check(p[0], p[1], p[2]);
      if (r) {
        st.outcome = r;
        if (status) status.textContent = r === 'collision' ? 'Collision with a wall. The base model ignored how the bar’s angle limits the next gap.' : 'Out of workspace. The plan swung the bar past the boundary.';
      } else if (st.k >= st.path.length - 1) {
        st.outcome = 'ok';
        if (status) status.textContent = 'Feasible: the fine-tuned model rotates the bar between gaps and reaches the goal.';
      }
    }

    function draw(ctx, dt) {
      step(dt);
      ctx.fillStyle = C.white; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = C.faint; ctx.lineWidth = 1;
      for (var gx = 0; gx <= W; gx += 32) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
      for (var gy = 0; gy <= H; gy += 32) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }
      ctx.strokeStyle = '#C5CDD4'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, W - 2, H - 2);
      ctx.fillStyle = '#B9C2CB';
      N.walls.forEach(function (w) { ctx.fillRect(w.x, w.y, w.w, w.h); });
      // goal
      ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
      ctx.strokeRect(565 - 64, 240 - 12, 128, 24); ctx.setLineDash([]);
      ctx.fillStyle = C.green; ctx.font = font(13); ctx.fillText('Goal', 548, 216);
      ctx.fillStyle = C.slate; ctx.fillText('Start', 54, 236);
      if (!st.plan) return;
      // planned waypoints
      var wp = N.PLANS[st.plan];
      ctx.strokeStyle = 'rgba(13,107,111,.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
      ctx.beginPath(); wp.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.setLineDash([]);
      wp.forEach(function (p) { ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI * 2); ctx.fill(); });
      // ghost poses
      for (var i = 0; i < st.k; i += 26) {
        var g = st.path[i];
        ctx.save(); ctx.translate(g[0], g[1]); ctx.rotate(g[2]);
        ctx.strokeStyle = 'rgba(242,182,50,.35)'; ctx.lineWidth = 2; ctx.strokeRect(-N.BAR / 2, -N.BW / 2, N.BAR, N.BW);
        ctx.restore();
      }
      // the bar
      var p = st.path[Math.floor(st.k)];
      var col = st.outcome === 'collision' || st.outcome === 'outside' ? C.red : (st.outcome === 'ok' ? C.green : C.amber);
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(p[2]);
      ctx.fillStyle = col; roundRect(ctx, -N.BAR / 2, -N.BW / 2, N.BAR, N.BW, 3); ctx.fill();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
      if (st.outcome && st.outcome !== 'ok') {
        var pulse = 14 + 6 * Math.sin(st.hold * 10);
        ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p[0], p[1], pulse + 50, 0, Math.PI * 2); ctx.stroke();
      }
      var text = st.outcome === 'collision' ? 'Collision' : st.outcome === 'outside' ? 'Out of workspace' : st.outcome === 'ok' ? 'Feasible' : LABEL[st.plan];
      var bg = st.outcome === 'ok' ? C.green : (st.outcome ? C.red : C.ink);
      chip(ctx, 14, 14, text, bg, C.white);
    }

    var stage = makeStage(canvas, W, H, draw);
    stage.onShow = function () { if (!st.plan) { run(st.auto ? st.queue[0] : 'tuned'); if (reduceMotion) { st.k = st.path.length - 1; } } };
  }

  /* ------------------------------------------------------------------ */
  /* Page interactions                                                  */
  /* ------------------------------------------------------------------ */
  function initNews() {
    var list = $('#newsList'), btn = $('#newsToggle');
    if (!list || !btn) return;
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Show less' : 'Show older news';
    });
  }

  function initLightbox() {
    var lb = $('#lb'); if (!lb) return;
    var img = $('#lbImg'), cap = $('#lbCap');
    $all('.fig').forEach(function (b) {
      b.addEventListener('click', function () {
        var src = $('img', b);
        img.src = src.src; img.alt = src.alt; cap.textContent = b.getAttribute('data-caption') || '';
        if (lb.showModal) lb.showModal();
      });
    });
    $('#lbClose').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  }

  // Hero: rotating phrase, each tied to one photo tile
  function initHero() {
    var hero = $('.hero'), words = $all('.cycle [data-i]'), tiles = $all('.tile');
    if (!hero || !words.length) return;
    var i = 0, timer = 0, paused = false;
    function show(n) {
      i = n;
      words.forEach(function (w, k) { w.classList.toggle('on', k === n); w.setAttribute('aria-hidden', String(k !== n)); });
      tiles.forEach(function (t, k) { t.classList.toggle('on', k === n); });
      hero.classList.add('cycling');
    }
    function tick() { if (!paused) show((i + 1) % words.length); }
    show(0);
    if (!reduceMotion) timer = setInterval(tick, 3200);
    tiles.forEach(function (t, k) {
      t.addEventListener('mouseenter', function () { paused = true; show(k); });
      t.addEventListener('mouseleave', function () { paused = false; });
      t.addEventListener('focus', function () { paused = true; show(k); });
      t.addEventListener('blur', function () { paused = false; });
    });
    // soft light that follows the cursor across the grid
    if (!reduceMotion) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
        hero.classList.add('lit');
      });
      hero.addEventListener('pointerleave', function () { hero.classList.remove('lit'); });
    }
  }

  // Research: highlight the theme you are reading
  function initScrollSpy() {
    var links = $all('.theme-nav a'); if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('active'); });
          var a = map[e.target.id]; if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  // Publications: copy BibTeX
  function initCite() {
    $all('.cite').forEach(function (d) {
      var btn = $('button', d), pre = $('pre', d);
      if (!btn || !pre) return;
      btn.addEventListener('click', function () {
        var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy BibTeX'; }, 1600); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(pre.textContent).then(done, function () { selectText(pre); btn.textContent = 'Press Ctrl/Cmd+C'; });
        } else { selectText(pre); btn.textContent = 'Press Ctrl/Cmd+C'; }
      });
    });
    // close other open cite boxes
    document.addEventListener('toggle', function (e) {
      if (e.target.classList && e.target.classList.contains('cite') && e.target.open) {
        $all('.cite[open]').forEach(function (o) { if (o !== e.target) o.open = false; });
      }
    }, true);
  }
  function selectText(el) { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }

  function init() {
    initNews(); initLightbox(); initHero(); initScrollSpy(); initCite();
    var d1 = $('#demo-mutual'), d2 = $('#demo-contact'), d3 = $('#demo-narrow');
    if (d1) demoMutual(d1);
    if (d2) demoContact(d2);
    if (d3) demoNarrow(d3);
    var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
