// Core drawing kit: seeded randomness, hand-cut paper shapes, printed
// textures, stop-motion timing. Everything is deterministic in `t`, so any
// frame can be rendered on its own (the exporter relies on this).
(() => {
  const P = (window.P = window.P || {});
  const W = (P.W = 1920), H = (P.H = 1080);

  P.COL = {
    paper: '#f3eee4', paper2: '#ebe3d4', paper3: '#e3d9c6', cream: '#fbf8f1',
    ink: '#191714', ink2: '#3b3630', muted: '#8a8276', line: '#d9d1c1',
    orange: '#e74427', orange2: '#f07a4a', orangeTint: '#f7cdbd',
    tan: '#d9c7a6', kraft: '#c9a67c', wood: '#b98d5f', mustard: '#efb43f',
    sky: '#9dbdd6', skyPale: '#d6e2e8', leaf: '#87ad72', pink: '#f1aaa0',
    hair: '#2a1c16', skin: '#bb7f62', skinShade: '#a56c52',
  };
  const C = P.COL;
  P.FONT = {
    serif: "'Instrument Serif', Georgia, serif",
    sans: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  };

  // ---------- numbers & time ----------
  const clamp = (P.clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v));
  P.lerp = (a, b, p) => a + (b - a) * p;
  P.seg = (t, a, b) => clamp((t - a) / (b - a));
  P.E = {
    inOut: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
    out: (p) => 1 - Math.pow(1 - p, 3),
    in: (p) => p * p * p,
    back: (p) => { const c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },
  };
  // stop-motion stepping: quantise a 0..1 progress into n visible poses
  P.steps = (p, n) => (p >= 1 ? 1 : Math.floor(p * n) / n);

  P.T = 0; P.FR = 0; P.BI = 0;
  P.setTime = (t) => {
    P.FR = Math.round(t * P.FPS);
    P.T = P.FR / P.FPS;
    P.BI = Math.floor(P.FR / 2); // paper "boil" changes every other frame
  };
  P.FPS = 12;

  // ---------- randomness ----------
  function mulberry(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  P.rng = (seed) => { const r = mulberry((seed * 2654435761) >>> 0); r(); r(); return r; };
  P.r1 = (seed) => P.rng(seed)();

  // small, slow jitter that makes paper look hand-animated
  P.boil = (id, amp = 1) => {
    if (!amp) return { x: 0, y: 0, r: 0 };
    const r = P.rng(id * 131 + P.BI * 7919 + 17);
    return { x: (r() - 0.5) * 2.4 * amp, y: (r() - 0.5) * 2.4 * amp, r: (r() - 0.5) * 0.014 * amp };
  };

  // pop-in with squash: 0 before t0, then a few stop-motion poses
  const POP = [0, 0.5, 1.16, 0.94, 1];
  P.pop = (t, t0) => {
    if (t < t0) return 0;
    const k = Math.floor((t - t0) * P.FPS + 1e-6) + 1;
    return k >= POP.length ? 1 : POP[k];
  };
  // visible between t0 and t1, popping in and shrinking out
  P.vis = (t, t0, t1 = 1e9) => (t < t0 ? 0 : t >= t1 ? 0 : 1) * (t < t1 - 0.34 ? P.pop(t, t0) : [1, 0.94, 1.1, 0.5, 0][Math.min(4, Math.floor((t - (t1 - 0.34)) * P.FPS))]);

  // ---------- hand-cut shapes (cached, drawn around the origin) ----------
  const cache = new Map();
  P.shape = (kind, w, h, seed = 1) => {
    w = Math.round(w); h = Math.round(h);
    const key = kind + '|' + w + '|' + h + '|' + seed;
    let pts = cache.get(key);
    if (pts) return pts;
    const r = P.rng(seed * 977 + w * 13 + h);
    pts = [];
    const hw = w / 2, hh = h / 2;
    if (kind === 'cut') {
      // scissors: slightly skewed corners, a kink or two along each edge
      const j = Math.min(5, Math.min(w, h) * 0.035);
      const cs = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => [x + (r() - 0.5) * 2 * j, y + (r() - 0.5) * 2 * j]);
      for (let i = 0; i < 4; i++) {
        const a = cs[i], b = cs[(i + 1) % 4];
        pts.push(a);
        const n = 1 + Math.floor(r() * 2);
        for (let k = 1; k <= n; k++) {
          const f = k / (n + 1) + (r() - 0.5) * 0.15;
          const nx = -(b[1] - a[1]), ny = b[0] - a[0], L = Math.hypot(nx, ny) || 1;
          const o = (r() - 0.5) * 2.2;
          pts.push([a[0] + (b[0] - a[0]) * f + (nx / L) * o, a[1] + (b[1] - a[1]) * f + (ny / L) * o]);
        }
      }
    } else if (kind === 'torn') {
      const amp = Math.min(4.5, Math.min(w, h) * 0.05);
      const edge = (x0, y0, x1, y1) => {
        const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(3, Math.round(L / 9));
        let d = 0;
        for (let k = 0; k < n; k++) {
          const f = k / n; d = d * 0.55 + (r() - 0.5) * amp * 1.6;
          const nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
          pts.push([x0 + (x1 - x0) * f + nx * d, y0 + (y1 - y0) * f + ny * d]);
        }
      };
      edge(-hw, -hh, hw, -hh); edge(hw, -hh, hw, hh); edge(hw, hh, -hw, hh); edge(-hw, hh, -hw, -hh);
    } else if (kind === 'circle' || kind === 'blob') {
      const n = kind === 'circle' ? Math.max(16, Math.round((w + h) / 7)) : 11;
      const jit = kind === 'circle' ? 0.025 : 0.13;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2, f = 1 + (r() - 0.5) * 2 * jit;
        pts.push([Math.cos(a) * hw * f, Math.sin(a) * hh * f]);
      }
    } else if (kind === 'round') {
      // rounded rectangle, hand-cut
      const rad = Math.min(hw, hh) * 0.3, n = 5;
      const corner = (cx, cy, a0) => {
        for (let k = 0; k <= n; k++) {
          const a = a0 + (k / n) * Math.PI / 2;
          pts.push([cx + Math.cos(a) * rad + (r() - 0.5) * 1.2, cy + Math.sin(a) * rad + (r() - 0.5) * 1.2]);
        }
      };
      corner(hw - rad, -hh + rad, -Math.PI / 2); corner(hw - rad, hh - rad, 0);
      corner(-hw + rad, hh - rad, Math.PI / 2); corner(-hw + rad, -hh + rad, Math.PI);
    }
    pts.smooth = kind === 'blob';
    cache.set(key, pts);
    if (cache.size > 6000) cache.clear();
    return pts;
  };

  P.trace = (ctx, pts) => {
    ctx.beginPath();
    if (pts.smooth) {
      const n = pts.length;
      const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      let m = mid(pts[n - 1], pts[0]);
      ctx.moveTo(m[0], m[1]);
      for (let i = 0; i < n; i++) { const nm = mid(pts[i], pts[(i + 1) % n]); ctx.quadraticCurveTo(pts[i][0], pts[i][1], nm[0], nm[1]); }
    } else {
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.closePath();
  };

  // ---------- printed textures ----------
  const pats = new Map();
  function tile(w, h, fn) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    fn(c.getContext('2d'), w, h); return c;
  }
  P.pat = (ctx, name, color = C.ink) => {
    const key = name + color;
    if (pats.has(key)) return pats.get(key);
    const r = P.rng(name.length * 71 + 3);
    let c;
    switch (name) {
      case 'halftone': c = tile(9, 9, (g) => { g.fillStyle = color; g.beginPath(); g.arc(2.5, 2.5, 1.5, 0, 7); g.arc(7, 7, 1.5, 0, 7); g.fill(); }); break;
      case 'halftoneBig': c = tile(18, 18, (g) => { g.fillStyle = color; g.beginPath(); g.arc(4.5, 4.5, 3.4, 0, 7); g.arc(13.5, 13.5, 3.4, 0, 7); g.fill(); }); break;
      case 'grain': c = tile(256, 256, (g) => { for (let i = 0; i < 5200; i++) { g.fillStyle = r() < 0.5 ? 'rgba(25,23,20,0.55)' : 'rgba(255,255,255,0.7)'; g.fillRect(r() * 256, r() * 256, r() < 0.8 ? 1 : 2, 1); } }); break;
      case 'fibre': c = tile(300, 300, (g) => { g.strokeStyle = color; g.lineWidth = 0.6; for (let i = 0; i < 90; i++) { const x = r() * 300, y = r() * 300, a = r() * 7, L = 4 + r() * 14; g.globalAlpha = 0.2 + r() * 0.4; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + 3, y + Math.sin(a) * L * 0.5, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); } }); break;
      case 'ruled': c = tile(64, 26, (g) => { g.fillStyle = color; g.fillRect(0, 24, 64, 1.3); }); break;
      case 'grid': c = tile(22, 22, (g) => { g.fillStyle = color; g.fillRect(0, 21, 22, 1); g.fillRect(21, 0, 1, 22); }); break;
      case 'stripes': c = tile(24, 24, (g) => { g.fillStyle = color; g.beginPath(); g.moveTo(0, 0); g.lineTo(9, 0); g.lineTo(0, 9); g.fill(); g.beginPath(); g.moveTo(24, 3); g.lineTo(24, 12); g.lineTo(12, 24); g.lineTo(3, 24); g.fill(); }); break;
      case 'dots': c = tile(26, 26, (g) => { g.fillStyle = color; g.beginPath(); g.arc(6, 6, 3.5, 0, 7); g.arc(19, 19, 3.5, 0, 7); g.fill(); }); break;
      case 'check': c = tile(28, 28, (g) => { g.fillStyle = color; g.globalAlpha = 0.5; g.fillRect(0, 0, 14, 28); g.fillRect(0, 0, 28, 14); g.globalAlpha = 1; g.fillRect(0, 0, 14, 14); }); break;
      case 'text': c = tile(180, 84, (g) => { g.fillStyle = color; for (let y = 6; y < 84; y += 7) { let x = 4; while (x < 170) { const w = 6 + r() * 22; if (x + w > 176) break; g.fillRect(x, y, w, 2.2); x += w + 3.5; } } }); break;
      case 'wood': c = tile(240, 90, (g) => { g.strokeStyle = color; for (let i = 0; i < 16; i++) { const y0 = r() * 90, a = 2 + r() * 5, ph = r() * 7; g.lineWidth = 0.6 + r() * 1.3; g.globalAlpha = 0.35 + r() * 0.4; g.beginPath(); for (let x = -5; x <= 245; x += 8) g.lineTo(x, y0 + Math.sin(x / 40 + ph) * a); g.stroke(); } }); break;
      case 'sand': c = tile(64, 64, (g) => { g.fillStyle = color; for (let i = 0; i < 420; i++) { g.globalAlpha = 0.3 + r() * 0.6; g.fillRect(r() * 64, r() * 64, 1.2, 1.2); } }); break;
      case 'knit': c = tile(16, 14, (g) => { g.strokeStyle = color; g.lineWidth = 1.6; g.beginPath(); g.moveTo(1, 2); g.lineTo(8, 11); g.lineTo(15, 2); g.stroke(); }); break;
      case 'crosshatch': c = tile(12, 12, (g) => { g.strokeStyle = color; g.lineWidth = 0.8; g.beginPath(); g.moveTo(0, 12); g.lineTo(12, 0); g.moveTo(0, 0); g.lineTo(12, 12); g.stroke(); }); break;
      case 'brick': c = tile(60, 32, (g) => { g.strokeStyle = color; g.lineWidth = 1.4; g.strokeRect(0.7, 0.7, 60, 16); g.strokeRect(-29.3, 16.7, 60, 16); g.strokeRect(30.7, 16.7, 60, 16); }); break;
      case 'dotgrid': c = tile(20, 20, (g) => { g.fillStyle = color; g.beginPath(); g.arc(10, 10, 1, 0, 7); g.fill(); }); break;
      case 'cork': c = tile(90, 90, (g) => { g.fillStyle = color; for (let i = 0; i < 260; i++) { g.globalAlpha = 0.25 + r() * 0.5; g.beginPath(); g.arc(r() * 90, r() * 90, 0.6 + r() * 1.6, 0, 7); g.fill(); } }); break;
      default: c = tile(4, 4, () => {});
    }
    const p = ctx.createPattern(c, 'repeat');
    pats.set(key, p);
    return p;
  };

  // ---------- paper pieces ----------
  // o: x, y, w, h, rot, seed, fill, kind ('cut' | 'torn' | 'circle' | 'blob' | 'round'),
  //    tex, texColor, texAlpha, shadow, boil, scale, alpha, draw(ctx, w, h)
  P.piece = (ctx, o) => {
    const sc = o.scale == null ? 1 : o.scale;
    if (sc <= 0.001 || o.alpha === 0) return;
    const b = P.boil(o.seed || 1, o.boil == null ? 1 : o.boil);
    ctx.save();
    ctx.translate(o.x + b.x, o.y + b.y);
    ctx.rotate((o.rot || 0) + b.r);
    if (sc !== 1) ctx.scale(sc, sc);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    const kind = o.kind || 'cut';
    const pts = P.shape(kind, o.w, o.h, o.seed || 1);
    if (o.shadow !== 0) {
      const s = o.shadow || 1;
      ctx.save();
      ctx.shadowColor = 'rgba(25,23,20,0.26)'; ctx.shadowBlur = 7 * s; ctx.shadowOffsetX = 2 * s; ctx.shadowOffsetY = 4 * s;
      ctx.fillStyle = kind === 'torn' ? C.cream : o.fill || C.cream;
      P.trace(ctx, pts); ctx.fill();
      ctx.restore();
    }
    let inner = pts;
    if (kind === 'torn') {
      ctx.fillStyle = C.cream; P.trace(ctx, pts); ctx.fill();
      inner = P.shape('torn', o.w - 7, o.h - 7, (o.seed || 1) + 1);
    }
    ctx.fillStyle = o.fill || C.cream; P.trace(ctx, inner); ctx.fill();
    if (o.tex || o.draw) {
      ctx.save(); P.trace(ctx, inner); ctx.clip();
      if (o.tex) {
        ctx.globalAlpha *= o.texAlpha == null ? 0.22 : o.texAlpha;
        ctx.fillStyle = P.pat(ctx, o.tex, o.texColor || C.ink);
        ctx.fillRect(-o.w / 2, -o.h / 2, o.w, o.h);
        ctx.globalAlpha /= o.texAlpha == null ? 0.22 : o.texAlpha;
      }
      if (o.draw) o.draw(ctx, o.w, o.h);
      ctx.restore();
    }
    ctx.restore();
  };

  P.text = (ctx, s, x, y, o = {}) => {
    ctx.save();
    ctx.translate(x, y);
    if (o.rot) ctx.rotate(o.rot);
    ctx.font = `${o.italic ? 'italic ' : ''}${o.weight || 400} ${o.size || 24}px ${P.FONT[o.f || 'sans']}`;
    ctx.fillStyle = o.color || C.ink;
    ctx.textAlign = o.align || 'center';
    ctx.textBaseline = o.base || 'middle';
    if (o.ls) ctx.letterSpacing = o.ls + 'px';
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.fillText(s, 0, 0);
    ctx.restore();
  };
  P.measure = (ctx, s, o = {}) => {
    ctx.save();
    ctx.font = `${o.italic ? 'italic ' : ''}${o.weight || 400} ${o.size || 24}px ${P.FONT[o.f || 'sans']}`;
    if (o.ls) ctx.letterSpacing = o.ls + 'px';
    const w = ctx.measureText(s).width; ctx.restore(); return w;
  };

  // hand-drawn line: slightly wobbly polyline through points
  P.scribble = (ctx, pts, o = {}) => {
    const r = P.rng(o.seed || 5);
    ctx.save();
    ctx.strokeStyle = o.color || C.ink; ctx.lineWidth = o.width || 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.dash) ctx.setLineDash(o.dash);
    ctx.beginPath();
    pts.forEach((p, i) => { const jx = (r() - 0.5) * (o.jit || 1.5), jy = (r() - 0.5) * (o.jit || 1.5); i ? ctx.lineTo(p[0] + jx, p[1] + jy) : ctx.moveTo(p[0] + jx, p[1] + jy); });
    ctx.stroke(); ctx.restore();
  };
  // a partial path: draw first p (0..1) of the polyline, for "being drawn" strokes
  P.partial = (pts, p) => {
    if (p >= 1) return pts;
    let L = 0; const seglen = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seglen.push(d); L += d; }
    let want = L * p; const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (want >= seglen[i - 1]) { out.push(pts[i]); want -= seglen[i - 1]; }
      else { const f = want / seglen[i - 1]; out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]); break; }
    }
    return out;
  };
  P.arcPts = (cx, cy, rx, ry, a0, a1, n = 24) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * (i / n); o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };

  // ---------- scene furniture ----------
  P.background = (ctx, fill = C.paper, dots = true) => {
    ctx.fillStyle = fill; ctx.fillRect(0, 0, W, H);
    if (dots) { ctx.save(); ctx.globalAlpha = 0.09; ctx.fillStyle = P.pat(ctx, 'dotgrid', C.ink); ctx.fillRect(0, 0, W, H); ctx.restore(); }
  };

  // Reveal `drawNew` through torn paper patches that spread from (cx, cy).
  P.pasteReveal = (ctx, cx, cy, p, seed, drawNew) => {
    if (p <= 0) return;
    if (p >= 1) { drawNew(); return; }
    const r = P.rng(seed);
    ctx.save();
    ctx.beginPath();
    const n = 26, reach = 1500;
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = Math.pow(r(), 0.7) * reach;
      const px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d;
      const t0 = (d / reach) * 0.55, loc = clamp((p - t0) / 0.45);
      const rad = P.E.out(loc) * (260 + r() * 260);
      if (rad < 2) continue;
      const pts = P.shape('blob', rad * 2, rad * 2, seed * 31 + i);
      const m = (pts.length);
      const mid = (a1, b1) => [(a1[0] + b1[0]) / 2 + px, (a1[1] + b1[1]) / 2 + py];
      let mm = mid(pts[m - 1], pts[0]); ctx.moveTo(mm[0], mm[1]);
      for (let k = 0; k < m; k++) { const nm = mid(pts[k], pts[(k + 1) % m]); ctx.quadraticCurveTo(pts[k][0] + px, pts[k][1] + py, nm[0], nm[1]); }
      ctx.closePath();
    }
    ctx.clip('nonzero');
    drawNew();
    ctx.restore();
  };

  // Render `fn` into an offscreen layer (for folds and flips)
  const layers = {};
  P.layer = (name, fn) => {
    let c = layers[name];
    if (!c) { c = layers[name] = document.createElement('canvas'); c.width = W; c.height = H; }
    const g = c.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    fn(g);
    return c;
  };

  // mono label strip: small caps note in the corner of each chapter
  P.label = (ctx, s, x, y, t, t0, t1) => {
    const v = P.vis(t, t0, t1);
    if (!v) return;
    const w = P.measure(ctx, s.toUpperCase(), { f: 'mono', size: 17, weight: 500, ls: 2 }) + 58;
    P.piece(ctx, {
      x: x + w / 2, y, w, h: 42, seed: s.length * 7 + 3, fill: C.cream, scale: v, boil: 0.5, shadow: 0.8,
      draw: (g) => {
        g.fillStyle = C.orange; g.beginPath(); g.arc(-w / 2 + 22, 0, 6, 0, 7); g.fill();
        P.text(g, s.toUpperCase(), -w / 2 + 38, 1, { f: 'mono', size: 17, weight: 500, ls: 2, align: 'left', color: C.ink });
      },
    });
  };

  // serif caption on a torn strip; lines appear one after another
  P.caption = (ctx, lines, x, y, t, t0, t1, o = {}) => {
    const size = o.size || 46;
    lines.forEach((s, i) => {
      const v = P.vis(t, t0 + i * 0.35, t1);
      if (!v) return;
      const w = P.measure(ctx, s, { f: 'serif', size, italic: o.italic }) + 56;
      const yy = y + i * (size + 22);
      P.piece(ctx, {
        x: x + w / 2, y: yy, w, h: size + 26, kind: 'torn', seed: 40 + i * 13 + s.length, fill: o.fill || C.cream, scale: v,
        rot: (i % 2 ? 0.008 : -0.01), boil: 0.6,
        draw: () => P.text(ctx, s, -w / 2 + 28, 2, { f: 'serif', size, italic: o.italic, align: 'left', color: o.color || C.ink }),
      });
    });
  };

  // film grain and a soft vignette over the finished frame
  P.finish = (ctx) => {
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.translate((P.BI * 37) % 256, (P.BI * 91) % 256);
    ctx.fillStyle = P.pat(ctx, 'grain');
    ctx.fillRect(-256, -256, W + 512, H + 512);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.05; ctx.fillStyle = P.pat(ctx, 'fibre', C.ink2); ctx.fillRect(0, 0, W, H);
    ctx.restore();
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05);
    g.addColorStop(0, 'rgba(25,23,20,0)'); g.addColorStop(1, 'rgba(25,23,20,0.16)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  };
})();
