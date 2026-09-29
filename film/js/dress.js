// Parmis's dress: one collage pattern per stage of her work. A change of
// stage pastes new scraps over the old ones, patch by patch.
(() => {
  const P = window.P, C = P.COL;

  const ticks = (g, x, y, s, col = C.orange) => { g.strokeStyle = col; g.lineWidth = 3 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 7 * s, y); g.lineTo(x - 2 * s, y + 6 * s); g.lineTo(x + 9 * s, y - 8 * s); g.stroke(); };
  const lines = (g, w, h, n, col = 'rgba(25,23,20,0.35)') => { g.fillStyle = col; for (let i = 0; i < n; i++) g.fillRect(-w / 2 + 8, -h / 2 + 12 + i * ((h - 20) / n), (w - 16) * (0.5 + ((i * 37) % 10) / 20), 2.4); };
  const word = (s, f = 'serif', col = C.ink, k = 0.55) => (g, w, h) => P.text(g, s, 0, 2, { f, size: Math.min(h * k * 1.4, (w / Math.max(1, s.length)) * 1.5), color: col });

  // Each stage: base fill, sleeve, collar, and scraps in box units
  // (u, v = centre as a fraction of the box; w, h = fraction of box width)
  const STAGES = {
    kidbook: {
      base: C.cream, baseTex: 'text', sleeve: { fill: C.sky, tex: 'dots', texColor: C.cream }, collar: C.mustard,
      make: (r) => {
        const out = [];
        const tiles = ['A', 'b', 'C', 'd', 'E', 'f', 'g'];
        const cols = [C.orange, C.sky, C.mustard, C.leaf, C.pink];
        for (let i = 0; i < 5; i++) out.push({ u: r(), v: 0.08 + i * 0.2, w: 0.42, h: 0.34, rot: (r() - 0.5) * 0.5, fill: C.cream, kind: 'torn', draw: (g, w, h) => P.bookPage(g, w, h, i) });
        for (let i = 0; i < 6; i++) out.push({ u: r(), v: r(), w: 0.26 + r() * 0.2, h: 0.2 + r() * 0.16, rot: (r() - 0.5), fill: cols[i % 5], kind: 'torn', tex: i % 2 ? 'halftoneBig' : 'halftone', texAlpha: 0.2 });
        for (let i = 0; i < 3; i++) out.push({ u: r(), v: r(), w: 0.5, h: 0.14, rot: (r() - 0.5) * 0.6, fill: C.cream, draw: (g, w, h) => P.scribble(g, P.arcPts(0, 0, w * 0.4, h * 0.25, 0, Math.PI * 5, 30).map(([x, y], k) => [x * 0 + (-w * 0.42 + (k / 30) * w * 0.84), y]), { color: [C.orange, C.sky, C.leaf][i], width: 4, seed: i }) });
        tiles.forEach((ch, i) => out.push({ u: r(), v: r(), w: 0.16, h: 0.16, rot: (r() - 0.5) * 0.6, fill: cols[(i + 2) % 5], draw: word(ch, 'serif', C.cream) }));
        return out;
      },
    },
    orange: {
      base: C.orange, baseTex: 'halftone', sleeve: { fill: C.orange, tex: 'halftone', texColor: '#9c2410' }, collar: C.cream,
      make: (r) => {
        const out = [];
        for (let i = 0; i < 3; i++) out.push({ u: 0.2 + r() * 0.6, v: 0.12 + i * 0.32, w: 0.46, h: 0.56, rot: (r() - 0.5) * 0.4, fill: C.cream, draw: (g, w, h) => { P.text(g, ['ABC', 'hello', 'colours'][i], 0, -h * 0.24, { f: 'serif', size: w * 0.26, color: C.ink }); [C.orange, C.mustard, C.sky, C.leaf].forEach((c, k) => { g.fillStyle = c; g.fillRect(-w * 0.36 + k * w * 0.19, h * 0.02, w * 0.15, w * 0.15); }); } });
        for (let i = 0; i < 4; i++) out.push({ u: r(), v: r(), w: 0.44, h: 0.52, rot: (r() - 0.5) * 0.5, fill: C.cream, tex: 'ruled', texColor: C.sky, texAlpha: 0.6, draw: (g, w, h) => P.text(g, 'lesson', -w * 0.4, -h * 0.4, { f: 'mono', size: w * 0.1, align: 'left', color: C.orange }) });
        for (let i = 0; i < 5; i++) out.push({ u: r(), v: r(), w: 0.22 + r() * 0.2, h: 0.14 + r() * 0.12, rot: (r() - 0.5), fill: [C.orange2, C.orangeTint, C.mustard][i % 3], kind: 'torn', tex: 'halftoneBig', texAlpha: 0.16 });
        for (let i = 0; i < 3; i++) out.push({ u: r(), v: r(), w: 0.4, h: 0.07, rot: (r() - 0.5) * 1.2, fill: 'rgba(251,248,241,0.7)' });
        return out;
      },
    },
    teacher: {
      base: C.paper2, baseTex: 'grid', sleeve: { fill: C.mustard, tex: 'knit', texColor: C.ink }, collar: C.cream,
      make: (r) => {
        const out = [];
        for (let i = 0; i < 5; i++) out.push({ u: r(), v: 0.1 + i * 0.2, w: 0.5, h: 0.62, rot: (r() - 0.5) * 0.35, fill: C.cream, tex: 'grid', texAlpha: 0.14, draw: (g, w, h) => { lines(g, w, h * 0.5, 4); g.translate(0, h * 0.18); ticks(g, -w * 0.2, 0, w / 90); P.pic.star(g, w / 160, C.orange); g.translate(0, -h * 0.18); P.text(g, 'name: ____', -w * 0.4, h * 0.38, { f: 'mono', size: w * 0.07, align: 'left', color: C.ink2 }); } });
        for (let i = 0; i < 5; i++) out.push({ u: r(), v: r(), w: 0.3, h: 0.3, rot: (r() - 0.5) * 0.4, fill: [C.mustard, C.pink, C.orangeTint][i % 3], draw: (g, w, h) => lines(g, w, h, 3) });
        for (let i = 0; i < 3; i++) out.push({ u: r(), v: r(), w: 0.42, h: 0.36, rot: (r() - 0.5) * 0.3, fill: C.cream, tex: 'ruled', texColor: C.sky, texAlpha: 0.6, draw: (g, w, h) => { lines(g, w, h, 3, 'rgba(25,23,20,0.5)'); ticks(g, w * 0.3, h * 0.25, w / 80); } });
        return out;
      },
    },
    montessori: {
      base: C.kraft, baseTex: 'wood', sleeve: { fill: C.leaf, tex: 'check', texColor: C.cream }, collar: C.cream,
      make: (r) => {
        const out = [];
        for (let i = 0; i < 4; i++) out.push({ u: r(), v: r(), w: 0.7, h: 0.18, rot: (r() - 0.5) * 0.3, fill: C.wood, tex: 'wood', texAlpha: 0.35 });
        for (let i = 0; i < 5; i++) { const s = 0.3 - i * 0.045; out.push({ u: 0.25 + r() * 0.5, v: 0.1 + i * 0.2, w: s, h: s, rot: (r() - 0.5) * 0.3, fill: '#ee9f94', tex: 'sand', texAlpha: 0.14 }); }
        for (let i = 0; i < 4; i++) out.push({ u: r(), v: r(), w: 0.46, h: 0.08, rot: (r() - 0.5) * 0.8, fill: 'rgba(0,0,0,0)', shadowless: true, draw: (g, w, h) => { const n = 6; for (let k = 0; k < n; k++) { g.fillStyle = C.mustard; g.beginPath(); g.arc(-w / 2 + (k + 0.5) * (w / n), 0, h * 0.45, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.arc(-w / 2 + (k + 0.4) * (w / n), -h * 0.12, h * 0.14, 0, 7); g.fill(); } } });
        ['a', 'm', 's'].forEach((ch, i) => out.push({ u: r(), v: r(), w: 0.34, h: 0.42, rot: (r() - 0.5) * 0.4, fill: C.leaf, draw: (g, w, h) => { P.text(g, ch, 0, -h * 0.04, { f: 'serif', size: w * 0.9, color: '#e9d9b8' }); g.globalAlpha = 0.5; g.fillStyle = P.pat(g, 'sand', C.ink); g.fillRect(-w / 2, -h / 2, w, h); g.globalAlpha = 1; } }));
        return out;
      },
    },
    phonics: {
      base: C.cream, baseTex: 'halftone', sleeve: { fill: C.orange, tex: 'dots', texColor: C.cream }, collar: C.mustard,
      make: (r) => {
        const out = [];
        const L = ['s', 'a', 't', 'p', 'i', 'n', 'sh', 'ch', 'm', 'o'];
        const cols = [C.orange, C.ink, C.mustard, C.sky, C.leaf];
        L.forEach((ch, i) => out.push({ u: (i % 3) / 2.4 + 0.08 + r() * 0.08, v: Math.floor(i / 3) * 0.28 + 0.06 + r() * 0.06, w: 0.3, h: 0.3, rot: (r() - 0.5) * 0.5, fill: cols[i % 5], draw: word(ch, 'serif', i % 5 === 2 ? C.ink : C.cream, 0.62) }));
        ['/s/', '/a/', '/t/', '/sh/'].forEach((s, i) => out.push({ u: r(), v: r(), w: 0.26, h: 0.1, rot: (r() - 0.5) * 0.4, fill: C.cream, draw: word(s, 'mono', C.orange, 0.5) }));
        ['sat', 'pin', 'tap'].forEach((s, i) => out.push({ u: r(), v: r(), w: 0.44, h: 0.15, rot: (r() - 0.5) * 0.3, fill: C.paper2, kind: 'torn', draw: word(s, 'serif', C.ink, 0.6) }));
        for (let i = 0; i < 3; i++) out.push({ u: r(), v: r(), w: 0.3, h: 0.3, rot: r() * 3, fill: 'rgba(0,0,0,0)', shadowless: true, draw: (g, w) => { g.strokeStyle = C.orange; g.lineWidth = 3; g.lineCap = 'round'; for (let k = 1; k <= 3; k++) { g.beginPath(); g.arc(-w * 0.3, 0, k * w * 0.13, -0.7, 0.7); g.stroke(); } } });
        return out;
      },
    },
    online: {
      base: '#e8e1d2', baseTex: 'grid', sleeve: { fill: C.sky, tex: 'grid', texColor: C.ink }, collar: C.cream,
      make: (r) => {
        const out = [];
        for (let i = 0; i < 4; i++) out.push({ u: r(), v: 0.1 + i * 0.26, w: 0.5, h: 0.32, rot: (r() - 0.5) * 0.3, fill: C.cream, draw: (g, w, h) => { g.fillStyle = C.ink; g.fillRect(-w / 2, -h / 2, w, h * 0.2); P.text(g, ['b', 'a', 's', 'm'][i], -w * 0.2, h * 0.14, { f: 'serif', size: h * 0.6 }); g.save(); g.translate(w * 0.22, h * 0.12); [P.pic.ball, P.pic.apple, P.pic.sun, P.pic.cat][i](g, h / 70); g.restore(); } });
        for (let i = 0; i < 5; i++) out.push({ u: r(), v: r(), w: 0.3, h: 0.22, rot: (r() - 0.5) * 0.4, fill: C.ink, kind: 'round', draw: (g, w, h) => { g.fillStyle = [C.mustard, C.pink, C.leaf, C.sky, C.orange][i]; g.fillRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10); g.fillStyle = C.ink2; g.beginPath(); g.arc(0, h * 0.05, h * 0.2, 0, 7); g.fill(); g.fillRect(-h * 0.3, h * 0.26, h * 0.6, h * 0.3); g.fillStyle = C.orange; g.beginPath(); g.arc(w * 0.36, h * 0.3, 3, 0, 7); g.fill(); } });
        for (let i = 0; i < 4; i++) out.push({ u: r(), v: r(), w: 0.34, h: 0.28, rot: (r() - 0.5) * 0.4, fill: C.cream, draw: (g, w, h) => { g.fillStyle = C.paper2; g.fillRect(-w / 2, -h / 2, w, h * 0.22); [C.orange, C.mustard, C.leaf].forEach((c, k) => { g.fillStyle = c; g.beginPath(); g.arc(-w / 2 + 8 + k * 9, -h / 2 + h * 0.11, 2.8, 0, 7); g.fill(); }); lines(g, w, h * 0.6, 2); } });
        return out;
      },
    },
    design: {
      base: C.cream, baseTex: 'grid', sleeve: { fill: C.ink, tex: 'grid', texColor: C.cream }, collar: C.orange,
      make: (r) => {
        const out = [];
        for (let i = 0; i < 4; i++) out.push({ u: r(), v: 0.12 + i * 0.25, w: 0.52, h: 0.5, rot: (r() - 0.5) * 0.25, fill: C.cream, draw: (g, w, h) => { P.sketchBox(g, -w * 0.4, -h * 0.4, w * 0.8, h * 0.22, i); P.sketchBox(g, -w * 0.4, -h * 0.1, w * 0.36, h * 0.44, i + 5); P.sketchBox(g, w * 0.04, -h * 0.1, w * 0.36, h * 0.2, i + 9); } });
        for (let i = 0; i < 4; i++) out.push({ u: r(), v: r(), w: 0.4, h: 0.13, rot: (r() - 0.5) * 0.4, fill: 'rgba(0,0,0,0)', shadowless: true, draw: (g, w, h) => P.pill(g, 0, 0, w, h, i % 2 ? C.ink : C.orange, ['play', 'next', 'listen', 'go!'][i], { size: h * 0.5 }) });
        for (let i = 0; i < 3; i++) out.push({ u: r(), v: r(), w: 0.36, h: 0.3, rot: (r() - 0.5) * 0.3, fill: C.mustard, draw: word(['bigger!', 'read it', 'fewer clicks'][i], 'sans', C.ink, 0.3) });
        for (let i = 0; i < 4; i++) out.push({ u: r(), v: r(), w: 0.2, h: 0.2, rot: r(), fill: 'rgba(0,0,0,0)', shadowless: true, draw: (g, w) => (i % 2 ? P.pic.star(g, w / 36, C.orange) : P.pic.speaker(g, w / 40)) });
        return out;
      },
    },
    research: {
      base: C.paper, baseTex: 'ruled', sleeve: { fill: C.tan, tex: 'text', texColor: C.ink }, collar: C.cream,
      make: (r) => {
        const out = [];
        ['needs', 'pain points', 'flow', 'a11y'].forEach((s, i) => out.push({ u: r(), v: 0.1 + i * 0.25, w: 0.56, h: 0.36, rot: (r() - 0.5) * 0.25, fill: C.cream, tex: 'ruled', texColor: C.sky, texAlpha: 0.5, draw: (g, w, h) => { g.fillStyle = C.orange; g.fillRect(-w / 2, -h / 2, w, h * 0.06); P.text(g, s, -w * 0.42, -h * 0.28, { f: 'mono', size: w * 0.085, align: 'left', color: C.ink }); lines(g, w, h * 0.5, 3); } }));
        for (let i = 0; i < 3; i++) out.push({ u: r(), v: r(), w: 0.6, h: 0.18, rot: (r() - 0.5) * 0.3, fill: C.cream, draw: (g, w, h) => { [-1, 0, 1].forEach((k) => { g.strokeStyle = C.ink; g.lineWidth = 1.8; g.strokeRect(k * w * 0.32 - w * 0.1, -h * 0.25, w * 0.2, h * 0.5); }); g.fillStyle = C.orange; [-0.16, 0.16].forEach((k) => { g.beginPath(); g.moveTo(k * w + 6, 0); g.lineTo(k * w - 3, -5); g.lineTo(k * w - 3, 5); g.fill(); }); } });
        ['contrast', 'captions', 'focus', 'alt text'].forEach((s, i) => out.push({ u: r(), v: r(), w: 0.4, h: 0.11, rot: (r() - 0.5) * 0.5, fill: i % 2 ? C.ink : C.mustard, draw: word(s, 'mono', i % 2 ? C.cream : C.ink, 0.4) }));
        for (let i = 0; i < 2; i++) out.push({ u: r(), v: r(), w: 0.24, h: 0.42, rot: (r() - 0.5) * 0.3, fill: C.cream, kind: 'round', draw: (g, w, h) => { g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(-w * 0.36, -h * 0.4, w * 0.72, h * 0.8); P.pill(g, 0, h * 0.2, w * 0.5, h * 0.12, C.orange); P.sketchBox(g, -w * 0.28, -h * 0.3, w * 0.56, h * 0.3, i); } });
        return out;
      },
    },
    volante: {
      base: '#f4efe6', baseTex: 'halftone', sleeve: { fill: C.ink2, tex: 'halftone', texColor: C.cream }, collar: C.cream,
      make: (r) => {
        const out = [];
        for (let i = 0; i < 6; i++) out.push({ u: r(), v: 0.05 + i * 0.18, w: 0.44, h: 0.26, rot: (r() - 0.5) * 0.3, fill: i % 3 === 1 ? C.ink : C.cream, kind: 'blob', draw: (g, w, h) => lines(g, w * 0.8, h * 0.6, 2, i % 3 === 1 ? 'rgba(243,238,228,0.6)' : 'rgba(25,23,20,0.45)') });
        for (let i = 0; i < 3; i++) out.push({ u: r(), v: r(), w: 0.26, h: 0.26, rot: 0, fill: 'rgba(0,0,0,0)', shadowless: true, draw: (g, w) => P.pic.access(g, w / 48) });
        for (let i = 0; i < 3; i++) out.push({ u: r(), v: r(), w: 0.26, h: 0.24, rot: (r() - 0.5) * 0.3, fill: i % 2 ? C.cream : C.ink, draw: word('Aa', 'serif', i % 2 ? C.ink : C.cream, 0.6) });
        out.push({ u: r(), v: r(), w: 0.2, h: 0.14, rot: 0.1, fill: C.ink, draw: word('CC', 'mono', C.cream, 0.5) });
        for (let i = 0; i < 2; i++) out.push({ u: r(), v: r(), w: 0.6, h: 0.12, rot: (r() - 0.5) * 0.4, fill: C.orange, draw: word('equal access', 'mono', C.cream, 0.4) });
        return out;
      },
    },
    builder: {
      base: C.cream, baseTex: 'dotgrid', sleeve: { fill: C.orange, tex: 'grid', texColor: C.cream }, collar: C.ink,
      make: (r) => {
        const out = [];
        for (let i = 0; i < 4; i++) out.push({ u: r(), v: 0.1 + i * 0.25, w: 0.56, h: 0.4, rot: (r() - 0.5) * 0.25, fill: C.cream, draw: (g, w, h) => { g.fillStyle = C.paper2; g.fillRect(-w / 2, -h / 2, w, h * 0.15); g.fillStyle = i % 2 ? C.ink : C.orange; g.fillRect(-w / 2, -h / 2 + h * 0.15, w, h * 0.16); P.text(g, i % 2 ? 'team' : 'Orange', -w * 0.42, -h / 2 + h * 0.23, { f: 'serif', size: h * 0.14, align: 'left', color: C.cream }); lines(g, w, h * 0.3, 2); P.pill(g, 0, h * 0.28, w * 0.5, h * 0.14, C.orange); } });
        for (let i = 0; i < 4; i++) out.push({ u: r(), v: r(), w: 0.3, h: 0.14, rot: (r() - 0.5) * 0.5, fill: C.ink, draw: word('</>', 'mono', C.mustard, 0.5) });
        for (let i = 0; i < 5; i++) out.push({ u: r(), v: r(), w: 0.2, h: 0.2, rot: 0, fill: 'rgba(0,0,0,0)', shadowless: true, draw: (g, w) => P.pic.sparkle(g, w / 44, i % 2 ? C.mustard : C.orange) });
        for (let i = 0; i < 2; i++) out.push({ u: r(), v: r(), w: 0.44, h: 0.12, rot: (r() - 0.5) * 0.3, fill: C.orangeTint, draw: word('provisional', 'mono', C.orange, 0.42) });
        return out;
      },
    },
  };
  STAGES.all = { base: C.cream, sleeve: { fill: C.orange, tex: 'halftone', texColor: '#9c2410' }, collar: C.mustard, bands: ['kidbook', 'phonics', 'online', 'research', 'builder'] };

  const itemCache = {};
  const items = (name) => (itemCache[name] = itemCache[name] || STAGES[name].make(P.rng(name.length * 101 + name.charCodeAt(0))));

  function fillStage(ctx, name, box) {
    const st = STAGES[name];
    if (st.bands) {
      const n = st.bands.length;
      st.bands.forEach((b, i) => {
        ctx.save();
        ctx.beginPath();
        const y0 = box.y + (box.h * i) / n - 4, y1 = box.y + (box.h * (i + 1)) / n + 4;
        const r = P.rng(i * 17 + 3);
        ctx.moveTo(box.x - 10, y0);
        for (let x = box.x; x <= box.x + box.w + 10; x += 12) ctx.lineTo(x, y0 + (r() - 0.5) * 8);
        ctx.lineTo(box.x + box.w + 10, y1);
        for (let x = box.x + box.w; x >= box.x - 10; x -= 12) ctx.lineTo(x, y1 + (r() - 0.5) * 8);
        ctx.closePath(); ctx.clip();
        fillStage(ctx, b, box);
        ctx.restore();
      });
      return;
    }
    ctx.fillStyle = st.base; ctx.fillRect(box.x, box.y, box.w, box.h);
    if (st.baseTex) { ctx.save(); ctx.globalAlpha = 0.16; ctx.fillStyle = P.pat(ctx, st.baseTex, C.ink); ctx.fillRect(box.x, box.y, box.w, box.h); ctx.restore(); }
    const bw = box.w;
    items(name).forEach((it, i) => P.piece(ctx, {
      x: box.x + it.u * box.w, y: box.y + it.v * box.h, w: it.w * bw, h: it.h * bw, rot: it.rot, seed: name.length * 50 + i,
      fill: it.fill, kind: it.kind, tex: it.tex, texAlpha: it.texAlpha, texColor: it.texColor, draw: it.draw, shadow: it.shadowless ? 0 : 0.45, boil: 0.35,
    }));
  }

  P.dressStage = (d) => STAGES[typeof d === 'string' ? d : d && d.p >= 0.5 ? d.to : d ? d.from : 'kidbook'];

  P.fillDress = (ctx, d, box) => {
    if (!d) return;
    if (typeof d === 'string') return fillStage(ctx, d, box);
    const p = d.p;
    if (p <= 0) return fillStage(ctx, d.from, box);
    if (p >= 1) return fillStage(ctx, d.to, box);
    fillStage(ctx, d.from, box);
    // paste patches of the new pattern
    const r = P.rng(d.to.length * 13 + 7);
    ctx.save(); ctx.beginPath();
    const n = 16;
    for (let i = 0; i < n; i++) {
      const cx = box.x + ((i % 4) + 0.5) / 4 * box.w + (r() - 0.5) * 30;
      const cy = box.y + (Math.floor(i / 4) + 0.5) / 4 * box.h + (r() - 0.5) * 30;
      const t0 = r() * 0.6, loc = P.clamp((p - t0) / 0.4);
      const rad = P.E.back(loc) * Math.max(box.w, box.h) * 0.3;
      if (rad < 1) continue;
      const pts = P.shape('torn', rad * 2, rad * 1.8, 60 + i);
      ctx.moveTo(cx + pts[0][0], cy + pts[0][1]);
      for (let k = 1; k < pts.length; k++) ctx.lineTo(cx + pts[k][0], cy + pts[k][1]);
      ctx.closePath();
    }
    ctx.clip('nonzero');
    fillStage(ctx, d.to, box);
    ctx.restore();
  };

  // dress helper for scenes: from -> to between t0 and t1
  P.dressAt = (t, from, to, t0, t1 = t0 + 1) => (t <= t0 ? from : t >= t1 ? to : { from, to, p: P.steps((t - t0) / (t1 - t0), 8) });
})();
