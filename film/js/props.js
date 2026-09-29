// Props: the small hand-cut things that travel between chapters.
// Each draws centred on (0, 0) in the current transform unless noted.
(() => {
  const P = window.P, C = P.COL;

  // ---------- tiny pictures (drawn with paper + pencil) ----------
  P.pic = {
    sun(g, s = 1) {
      g.save(); g.scale(s, s);
      g.strokeStyle = C.mustard; g.lineWidth = 3; g.lineCap = 'round';
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(a) * 15, Math.sin(a) * 15); g.lineTo(Math.cos(a) * 22, Math.sin(a) * 22); g.stroke(); }
      g.fillStyle = C.mustard; g.beginPath(); g.arc(0, 0, 11, 0, 7); g.fill();
      g.restore();
    },
    house(g, s = 1) {
      g.save(); g.scale(s, s);
      g.fillStyle = C.orange; g.beginPath(); g.moveTo(-18, -2); g.lineTo(0, -18); g.lineTo(18, -2); g.fill();
      g.fillStyle = C.sky; g.fillRect(-13, -2, 26, 18);
      g.fillStyle = C.ink; g.fillRect(-4, 6, 8, 10);
      g.restore();
    },
    ball(g, s = 1) {
      g.save(); g.scale(s, s);
      g.fillStyle = C.orange; g.beginPath(); g.arc(0, 0, 16, 0, 7); g.fill();
      g.strokeStyle = C.cream; g.lineWidth = 2.5; g.beginPath(); g.arc(0, 0, 16, -0.4, 1.2); g.stroke();
      g.beginPath(); g.moveTo(-15, -4); g.quadraticCurveTo(0, 6, 14, -7); g.stroke();
      g.restore();
    },
    bee(g, s = 1) {
      g.save(); g.scale(s, s);
      g.fillStyle = 'rgba(214,226,232,0.95)'; g.beginPath(); g.ellipse(-5, -12, 7, 10, -0.5, 0, 7); g.ellipse(6, -12, 7, 10, 0.5, 0, 7); g.fill();
      g.fillStyle = C.mustard; g.beginPath(); g.ellipse(0, 0, 15, 10, 0, 0, 7); g.fill();
      g.fillStyle = C.ink; g.fillRect(-5, -9, 4, 18); g.fillRect(3, -9, 4, 18);
      g.beginPath(); g.arc(12, -2, 1.6, 0, 7); g.fill();
      g.restore();
    },
    apple(g, s = 1) {
      g.save(); g.scale(s, s);
      g.fillStyle = '#8fb35f'; g.beginPath(); g.arc(-6, 2, 13, 0, 7); g.arc(6, 2, 13, 0, 7); g.fill();
      g.fillStyle = '#5f8a3e'; g.beginPath(); g.ellipse(6, -14, 7, 3.5, -0.5, 0, 7); g.fill();
      g.strokeStyle = C.ink; g.lineWidth = 2.2; g.beginPath(); g.moveTo(0, -9); g.lineTo(2, -17); g.stroke();
      g.restore();
    },
    cat(g, s = 1) {
      g.save(); g.scale(s, s);
      g.fillStyle = C.ink2; g.beginPath(); g.arc(0, 0, 13, 0, 7); g.moveTo(-12, -4); g.lineTo(-10, -18); g.lineTo(-3, -11); g.moveTo(12, -4); g.lineTo(10, -18); g.lineTo(3, -11); g.fill();
      g.fillStyle = C.mustard; g.beginPath(); g.arc(-5, -1, 2.2, 0, 7); g.arc(5, -1, 2.2, 0, 7); g.fill();
      g.restore();
    },
    note(g, s = 1, col = C.ink) { // music note
      g.save(); g.scale(s, s);
      g.fillStyle = col; g.beginPath(); g.ellipse(-4, 10, 7, 5, -0.4, 0, 7); g.fill();
      g.fillRect(1.5, -16, 3, 27); g.beginPath(); g.moveTo(4.5, -16); g.quadraticCurveTo(14, -10, 11, -2); g.lineTo(4.5, -9); g.fill();
      g.restore();
    },
    hand(g, s = 1, col = C.ink) { // raised hand icon
      g.save(); g.scale(s, s); g.fillStyle = col;
      g.beginPath(); g.roundRect(-9, -4, 18, 18, 5); g.fill();
      [-7.5, -2.5, 2.5].forEach((x, i) => { g.beginPath(); g.roundRect(x - 2, -16 + (i === 1 ? -2 : 0), 4.4, 16, 2); g.fill(); });
      g.beginPath(); g.roundRect(6, -12, 4.4, 14, 2); g.fill();
      g.beginPath(); g.roundRect(-15, 0, 12, 4.4, 2); g.fill();
      g.restore();
    },
    speech(g, s = 1, col = C.ink) {
      g.save(); g.scale(s, s); g.fillStyle = col;
      g.beginPath(); g.ellipse(0, -2, 16, 11, 0, 0, 7); g.moveTo(-8, 6); g.lineTo(-12, 15); g.lineTo(-1, 8); g.fill();
      g.fillStyle = C.cream; [-7, 0, 7].forEach((x) => { g.beginPath(); g.arc(x, -2, 2, 0, 7); g.fill(); });
      g.restore();
    },
    eye(g, s = 1, col = C.ink) {
      g.save(); g.scale(s, s); g.fillStyle = col;
      g.beginPath(); g.moveTo(-16, 0); g.quadraticCurveTo(0, -14, 16, 0); g.quadraticCurveTo(0, 14, -16, 0); g.fill();
      g.fillStyle = C.cream; g.beginPath(); g.arc(0, 0, 5.5, 0, 7); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(0, 0, 2.6, 0, 7); g.fill();
      g.restore();
    },
    speaker(g, s = 1, col = C.ink) {
      g.save(); g.scale(s, s); g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-14, -6); g.lineTo(-6, -6); g.lineTo(3, -14); g.lineTo(3, 14); g.lineTo(-6, 6); g.lineTo(-14, 6); g.fill();
      g.beginPath(); g.arc(4, 0, 9, -0.8, 0.8); g.stroke(); g.beginPath(); g.arc(4, 0, 16, -0.8, 0.8); g.stroke();
      g.restore();
    },
    star(g, s = 1, col = C.mustard) {
      g.save(); g.scale(s, s); g.fillStyle = col; g.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 7 : 17; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      g.fill(); g.restore();
    },
    sparkle(g, s = 1, col = C.orange) {
      g.save(); g.scale(s, s); g.fillStyle = col; g.beginPath();
      g.moveTo(0, -20); g.quadraticCurveTo(2, -2, 20, 0); g.quadraticCurveTo(2, 2, 0, 20); g.quadraticCurveTo(-2, 2, -20, 0); g.quadraticCurveTo(-2, -2, 0, -20);
      g.fill(); g.restore();
    },
    access(g, s = 1, col = C.ink, bg = C.cream) { // universal access figure
      g.save(); g.scale(s, s);
      g.fillStyle = col; g.beginPath(); g.arc(0, 0, 22, 0, 7); g.fill();
      g.fillStyle = bg; g.beginPath(); g.arc(0, -11, 3.6, 0, 7); g.fill();
      g.strokeStyle = bg; g.lineWidth = 3.4; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-11, -4); g.lineTo(11, -4); g.moveTo(0, -4); g.lineTo(0, 5); g.lineTo(-6, 14); g.moveTo(0, 5); g.lineTo(6, 14); g.stroke();
      g.restore();
    },
    maple(g, s = 1, col = C.orange) {
      g.save(); g.scale(s, s); g.fillStyle = col; g.beginPath();
      const pts = [[0, -26], [5, -14], [12, -17], [10, -6], [22, -10], [18, 0], [24, 3], [12, 10], [14, 16], [2, 13], [2, 26], [-2, 26], [-2, 13], [-14, 16], [-12, 10], [-24, 3], [-18, 0], [-22, -10], [-10, -6], [-12, -17], [-5, -14]];
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.fill(); g.restore();
    },
  };

  // ---------- the small orange paper shape ----------
  // A hand-cut orange: a circle, a lighter segment, a dark leaf.
  P.orange = (ctx, x, y, s = 1, rot = 0, o = {}) => {
    if (s <= 0.01) return;
    const b = P.boil(4242, 0.7);
    ctx.save();
    ctx.translate(x + b.x, y + b.y); ctx.rotate(rot + b.r * 2); ctx.scale(s, s);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.save();
    ctx.shadowColor = 'rgba(25,23,20,0.3)'; ctx.shadowBlur = 8; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 4;
    ctx.fillStyle = C.orange; P.trace(ctx, P.shape('circle', 56, 56, 777)); ctx.fill();
    ctx.restore();
    ctx.save(); P.trace(ctx, P.shape('circle', 56, 56, 777)); ctx.clip();
    ctx.globalAlpha *= 0.28; ctx.fillStyle = P.pat(ctx, 'halftone', '#9c2410'); ctx.fillRect(-30, -30, 60, 60);
    ctx.restore();
    ctx.fillStyle = C.orange2; ctx.beginPath(); ctx.ellipse(-8, -8, 11, 7, -0.7, 0, 7); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(2, -27); ctx.quadraticCurveTo(14, -40, 24, -33); ctx.quadraticCurveTo(14, -24, 2, -27); ctx.fill();
    ctx.restore();
  };

  // ---------- reusable pieces ----------
  P.alphaTile = (ctx, ch, x, y, s, col, seed, rot = 0, txtCol = C.cream) =>
    P.piece(ctx, { x, y, w: 64, h: 64, seed, fill: col, rot, scale: s, tex: 'halftone', texAlpha: 0.12, draw: () => P.text(ctx, ch, 0, 3, { f: 'serif', size: 50, color: txtCol }) });

  P.bookPage = (g, w, h, seed) => {
    g.globalAlpha = 0.3; g.fillStyle = P.pat(g, 'text', C.ink); g.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h * 0.45); g.globalAlpha = 1;
    const k = seed % 4;
    g.save(); g.translate(0, h * 0.2);
    [P.pic.sun, P.pic.house, P.pic.cat, P.pic.apple][k](g, Math.min(w, h) / 70);
    g.restore();
  };

  P.sticky = (ctx, x, y, s, lines, col, seed, rot = 0, o = {}) => {
    const w = o.w || 170, h = o.h || 130;
    P.piece(ctx, {
      x, y, w, h, seed, fill: col, rot, scale: s, shadow: 1,
      draw: (g) => {
        g.fillStyle = 'rgba(25,23,20,0.06)'; g.fillRect(-w / 2, -h / 2, w, 16);
        lines.forEach((ln, i) => P.text(g, ln, 0, -((lines.length - 1) * (o.size || 22) * 0.62) + i * (o.size || 22) * 1.25 + 6, { f: o.f || 'sans', size: o.size || 22, weight: 500, color: o.color || C.ink }));
      },
    });
  };

  P.bubble = (ctx, x, y, s, content, o = {}) => {
    if (s <= 0.01) return;
    const w = o.w || 150, h = o.h || 90, tail = o.tail || [-0.25, 1];
    const b = P.boil(o.seed || 9, 0.8);
    ctx.save(); ctx.translate(x + b.x, y + b.y); ctx.scale(s, s); ctx.rotate(b.r);
    ctx.save();
    ctx.shadowColor = 'rgba(25,23,20,0.22)'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 3;
    ctx.fillStyle = o.fill || C.cream;
    P.trace(ctx, P.shape('blob', w, h, o.seed || 9));
    ctx.fill();
    ctx.beginPath(); const tx = tail[0] * w, ty = tail[1] * h * 0.5;
    ctx.moveTo(tx - 16, ty * 0.6); ctx.lineTo(tx - 8 + (o.tailX || -14), ty + 28 * Math.sign(tail[1] || 1)); ctx.lineTo(tx + 14, ty * 0.6); ctx.fill();
    ctx.restore();
    if (typeof content === 'string') P.text(ctx, content, 0, 2, { f: o.f || 'sans', size: o.size || 26, weight: 600, color: o.color || C.ink });
    else if (content) content(ctx);
    ctx.restore();
  };

  P.pinkBlock = (ctx, x, y, size, seed) =>
    P.piece(ctx, { x, y, w: size, h: size, seed, fill: '#ee9f94', tex: 'sand', texAlpha: 0.12, shadow: 0.8,
      draw: (g) => { g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(-size / 2, -size / 2, size, size * 0.18); } });

  // a folded paper cube, isometric-ish
  P.cube = (ctx, x, y, s, col = '#ee9f94', seed = 3) => {
    const b = P.boil(seed, 0.8);
    ctx.save(); ctx.translate(x + b.x, y + b.y); ctx.scale(s, s);
    ctx.shadowColor = 'rgba(25,23,20,0.25)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-30, -14); ctx.lineTo(0, -30); ctx.lineTo(30, -14); ctx.lineTo(30, 20); ctx.lineTo(0, 36); ctx.lineTo(-30, 20); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(-30, -14); ctx.lineTo(0, -30); ctx.lineTo(30, -14); ctx.lineTo(0, 2); ctx.fill();
    ctx.fillStyle = 'rgba(25,23,20,0.12)'; ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(30, -14); ctx.lineTo(30, 20); ctx.lineTo(0, 36); ctx.fill();
    ctx.restore();
  };

  // browser window frame; `body(g, w, h)` draws the page (origin at page top-left)
  P.browser = (ctx, x, y, w, h, s, seed, o, body) => {
    if (s <= 0.01) return;
    P.piece(ctx, {
      x, y, w, h, seed, fill: o.fill || C.cream, scale: s, kind: 'cut', shadow: 1.2, boil: 0.5, rot: o.rot || 0,
      draw: (g) => {
        g.fillStyle = o.chrome || C.paper2; g.fillRect(-w / 2, -h / 2, w, 34);
        [C.orange, C.mustard, C.leaf].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(-w / 2 + 20 + i * 18, -h / 2 + 17, 5.5, 0, 7); g.fill(); });
        g.fillStyle = 'rgba(25,23,20,0.08)'; g.beginPath(); g.roundRect(-w / 2 + 90, -h / 2 + 8, w - 120, 18, 9); g.fill();
        if (o.url) P.text(g, o.url, -w / 2 + 104, -h / 2 + 17.5, { f: 'mono', size: 11, align: 'left', color: C.muted });
        g.save(); g.translate(-w / 2, -h / 2 + 34); if (body) body(g, w, h - 34); g.restore();
      },
    });
  };

  P.pill = (g, x, y, w, h, fill, label, o = {}) => {
    g.fillStyle = fill; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.fill();
    if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = 2; g.stroke(); }
    if (label) P.text(g, label, x, y + 1, { f: o.f || 'sans', size: o.size || h * 0.42, weight: o.weight || 600, color: o.color || C.cream, ls: o.ls });
  };

  // wireframe-y sketch lines inside a box
  P.sketchBox = (g, x, y, w, h, seed, col = C.ink2) => {
    P.scribble(g, [[x, y], [x + w, y + 1], [x + w - 1, y + h], [x + 1, y + h - 1], [x, y]], { color: col, width: 1.8, seed, jit: 1.8 });
  };

  // picture card: rounded card with a little drawing and a word
  P.picCard = (ctx, x, y, s, picFn, word, seed, rot = 0, o = {}) => {
    const w = o.w || 120, h = o.h || 150;
    P.piece(ctx, {
      x, y, w, h, seed, rot, scale: s, kind: 'round', fill: o.fill || C.cream, shadow: 1,
      draw: (g) => {
        g.save(); g.translate(0, -h * 0.12); picFn(g, w / 55); g.restore();
        if (word) P.text(g, word, 0, h * 0.33, { f: o.wf || 'serif', size: o.ws || 30, color: C.ink });
      },
    });
  };
})();
