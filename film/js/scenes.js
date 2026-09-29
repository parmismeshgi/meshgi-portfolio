// The ten chapters. render(t) draws the frame at time t (seconds).
(() => {
  const P = window.P, C = P.COL, W = P.W, H = P.H;
  const { lerp, seg, E, steps, pop, vis, clamp } = P;

  const arcHop = (t, t0, t1, a, b, hgt = 160) => {
    const p = steps(seg(t, t0, t1), Math.max(3, Math.round((t1 - t0) * P.FPS)));
    const e = E.inOut(p);
    return [lerp(a[0], b[0], e), lerp(a[1], b[1], e) - Math.sin(p * Math.PI) * hgt, p];
  };
  const wave = (t, speed = 2, amp = 0.3) => Math.sin(Math.floor(t * 6) * speed) * amp; // stop-motion wave
  const chapter = (ctx, n) => P.text(ctx, String(n).padStart(2, '0') + ' / 10', W - 70, 62, { f: 'mono', size: 16, align: 'right', color: C.muted, ls: 2 });
  // Parmis's height and age over the whole film, stepped like stop-motion
  const growth = (t) => {
    if (t < 8.9) return { h: 470, age: 0 };
    if (t < 9.5) return [{ h: 500, age: 0.15 }, { h: 530, age: 0.3 }][Math.min(1, Math.floor((t - 8.9) * 4))];
    if (t < 16.2) return { h: 560, age: 0.4 };
    if (t < 16.9) return [{ h: 610, age: 0.6 }, { h: 660, age: 0.8 }, { h: 700, age: 0.95 }][Math.min(2, Math.floor((t - 16.2) * 4.3))];
    return { h: 720, age: 1 };
  };

  // ======================================================== 1. child, age 7
  function boardLetters(ctx, t, x0, y0) {
    const L = ['A a', 'B b', 'C c'];
    L.forEach((s, i) => {
      const p = seg(t, 2.5 + i * 0.65, 3.1 + i * 0.65);
      if (p <= 0) return;
      const n = Math.ceil(steps(p, 3) * s.length);
      P.text(ctx, s.slice(0, n), x0 + i * 220, y0, { f: 'serif', size: 96, color: '#efe9da' });
    });
    if (t > 4.3) P.text(ctx, 'Hello!', x0 + 470, y0 + 120, { f: 'serif', italic: true, size: 64, color: C.mustard, alpha: 0.95 });
  }

  function sceneChild(ctx, t) {
    P.background(ctx, C.paper);
    // title card
    if (t < 2.3) {
      const v = vis(t, 0.6, 2.3);
      const w = P.measure(ctx, 'Parmis & Orange', { f: 'serif', size: 104 }) + 90;
      if (v) P.piece(ctx, { x: 960, y: 330, w, h: 130, kind: 'torn', seed: 5, fill: C.cream, scale: v, rot: -0.012, shadow: 1.4,
        draw: () => P.text(ctx, 'Parmis & Orange', 0, 4, { f: 'serif', size: 104 }) });
      const lw = P.measure(ctx, 'A PORTFOLIO FILM', { f: 'mono', size: 17, weight: 500, ls: 2 }) + 58;
      P.label(ctx, 'a portfolio film', 960 - lw / 2, 440, t, 1.0, 2.3);
    }
    const out = seg(t, 7.9, 9.0); // classroom falls away
    const fall = (k) => Math.pow(steps(out, 7), 2) * (700 + k * 90);
    const build = (t0) => pop(t, t0);

    // wall + board
    ctx.save(); ctx.translate(0, fall(0));
    if (t > 2.3) {
      P.piece(ctx, { x: 960, y: 300, w: 1000, h: 400, seed: 11, fill: '#23201c', tex: 'fibre', texColor: C.cream, texAlpha: 0.25, scale: build(2.3), shadow: 1.4,
        draw: (g, w, h) => { g.strokeStyle = C.wood; g.lineWidth = 14; g.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14); } });
      if (t > 2.45) boardLetters(ctx, t, 640, 240);
      if (t > 2.6) { ctx.save(); ctx.translate(1340, 420); P.pic.apple(ctx, 1.6 * build(2.6)); ctx.restore(); }
    }
    ctx.restore();
    // classmates
    const kids = [{ x: 600, seed: 21, hairType: 1 }, { x: 1330, seed: 22, hairType: 2 }, { x: 1620, seed: 23, hairType: 0 }];
    kids.forEach((k, i) => {
      const s = build(2.5 + i * 0.15);
      if (!s) return;
      ctx.save(); ctx.translate((i === 0 ? -1 : 1) * steps(out, 6) * 900, 0);
      const up = t > 3.2 + i * 0.5 && t < 4.6 + i * 0.4;
      P.person(ctx, { x: k.x, y: 800, h: 280 * s, seed: k.seed, hairType: k.hairType, armL: i === 1 && up ? [2.7 + wave(t, 2, 0.15), 0.2] : [0.3, 1.3], armR: i !== 1 && up ? [2.7 + wave(t, 3, 0.15), 0.2] : [0.3, 1.3], mouth: up ? 'open' : 'smile', look: i === 0 ? 1 : -1 });
      P.piece(ctx, { x: k.x, y: 880, w: 260, h: 170, seed: 30 + i, fill: C.kraft, tex: 'wood', texAlpha: 0.3, shadow: 1.2 });
      ctx.restore();
    });
    // mother, from a child's height
    if (t > 2.3) {
      ctx.save(); ctx.translate(-steps(seg(t, 7.8, 8.4), 5) * 700, 0);
      const pt = seg(t, 2.5, 4.4);
      // her chalk hand travels along the letters
      const chalkArm = [lerp(0.55, 1.05, steps(pt, 9)) + Math.sin(Math.floor(t * 8)) * 0.04, lerp(-0.25, -0.6, steps(pt, 9))];
      ctx.translate(0, (1 - build(2.3)) * -500);
      P.motherBody(ctx, 250, -150, { arm: pt > 0 && pt < 1 ? chalkArm : t > 4.4 && t < 5.2 ? [1.0, -0.2] : [0.3, 0.2] });
      ctx.restore();
    }

    // Parmis, seven, at her desk
    const lift = seg(t, 7.8, 8.6); // she lifts the notebook overhead
    const g = growth(t);
    const writing = t > 5.0 && t < 7.7;
    const nbPos = [960, lerp(NB[1], 330, E.inOut(steps(lift, 6)))];
    // a small stool she perches on
    ctx.save(); ctx.translate(0, fall(1) * 0.9);
    if (build(1.95)) P.piece(ctx, { x: 960, y: 950, w: 240, h: 150, seed: 41, fill: C.kraft, tex: 'wood', texAlpha: 0.32, shadow: 1.2, scale: build(1.95) });
    ctx.restore();
    const pr = P.parmis(ctx, {
      x: 960, y: 1030, h: g.h, age: g.age,
      dress: 'kidbook', hair: { pigtails: t < 9.5 },
      armL: lift > 0 ? [lerp(0.3, 2.6, steps(lift, 6)), lerp(1.3, 0.3, steps(lift, 6))] : [0.3, 1.3],
      armR: lift > 0 ? [lerp(0.3, 2.6, steps(lift, 6)), lerp(1.3, 0.3, steps(lift, 6))] : writing ? [0.3 + wave(t, 5, 0.06), 1.35] : [0.3, 1.3],
      tilt: writing ? 0.04 : 0,
    });
    if (t > 2.0 && t < 8.6) {
      notebook(ctx, nbPos[0], nbPos[1], build(2.0), t, lift);
      if (writing) P.piece(ctx, { x: 925 + wave(t, 5, 26), y: NB[1] - 30, w: 10, h: 70, rot: 0.5, seed: 44, fill: C.mustard, shadow: 0.6 });
    }
    if (t >= 8.6) sign(ctx, t, seg(t, 8.6, 9.6));
    // alphabet tiles flutter from the board to the notebook and the dress
    if (t > 5.0 && t < 8.0) {
      const tiles = [['A', C.orange], ['b', C.sky], ['C', C.mustard], ['d', C.leaf], ['E', C.pink]];
      tiles.forEach(([ch, col], i) => {
        const t0 = 5.1 + i * 0.3;
        if (t < t0) return;
        const src = [700 + i * 120, 250], dst = i % 2 ? [900 + i * 25, NB[1]] : [920 + (i - 2) * 50, pr.sy + 60 + i * 12];
        const [x, y, p] = arcHop(t, t0, t0 + 1.1, src, dst, 120);
        if (p >= 1) return;
        P.alphaTile(ctx, ch, x, y, lerp(1, 0.5, p), col, 60 + i, p * 3);
      });
    }
    chapter(ctx, 1);
    P.label(ctx, 'age 7 · my mother’s English class', 70, 70, t, 2.4, 8.4);
    return { nb: nbPos, lift };
  }

  const NB = [960, 858];
  function notebook(ctx, x, y, s, t, lift) {
    if (s <= 0) return;
    P.piece(ctx, {
      x, y, w: 230, h: 104, seed: 51, fill: C.cream, tex: 'ruled', texColor: C.sky, texAlpha: 0.7, scale: s, shadow: 1.2, rot: lift > 0 ? 0 : -0.03,
      draw: (g, w, h) => {
        g.fillStyle = 'rgba(231,68,39,0.5)'; g.fillRect(-w / 2 + 26, -h / 2, 2, h);
        g.fillStyle = C.ink2; for (let k = 0; k < 7; k++) { g.beginPath(); g.arc(0, -h / 2 + 10 + k * 18, 3, 0, 7); g.fill(); }
        if (t > 5.3) P.text(g, 'A b C', -w * 0.2, -8, { f: 'serif', italic: true, size: 28, color: C.ink2 });
        if (t > 6.2) P.text(g, 'd E', -w * 0.2, 24, { f: 'serif', italic: true, size: 26, color: C.ink2 });
        // the orange doodle becomes paper
        if (t > 2.9) { g.strokeStyle = C.orange; g.lineWidth = 2.5; g.beginPath(); g.arc(w * 0.27, 2, 22, 0, Math.PI * 2 * steps(seg(t, 2.9, 3.4), 4)); g.stroke(); }
      },
    });
  }

  // =================================================== 2. Orange begins, 12
  const SIGN = { x: 960, y: 290, w: 820, h: 230 };
  function sign(ctx, t, p, o = {}) {
    // p: 0..1 unfold (notebook page -> sign), stepped
    const ps = steps(p, 4);
    const w = lerp(300, SIGN.w, ps), h = lerp(130, SIGN.h, ps);
    const x = o.x || SIGN.x, y = lerp(330, SIGN.y, ps) + (o.dy || 0);
    const flip = p < 0.25 ? Math.cos(ps * Math.PI * 2) : 1;
    P.piece(ctx, {
      x, y, w: w * Math.abs(flip), h, seed: 71, fill: C.cream, tex: 'fibre', texAlpha: 0.2, shadow: 1.5, boil: 0.5, scale: o.scale,
      draw: (g, ww, hh) => {
        if (ps < 0.5) { g.globalAlpha = 0.6; g.fillStyle = P.pat(g, 'ruled', C.sky); g.fillRect(-ww / 2, -hh / 2, ww, hh); g.globalAlpha = 1; }
        if (ps >= 0.5) {
          g.fillStyle = C.ink; g.fillRect(-ww / 2 + 12, -hh / 2 + 12, ww - 24, 3); g.fillRect(-ww / 2 + 12, hh / 2 - 15, ww - 24, 3);
        }
      },
    });
    if (ps >= 0.75) {
      // hand-cut letters, each its own piece
      const word = 'Orange', fs = { f: 'serif', size: 138 };
      const total = P.measure(ctx, word, fs);
      let cx = x - total / 2;
      word.split('').forEach((ch, i) => {
        const cw = P.measure(ctx, ch, fs);
        const lx = cx + cw / 2; cx += cw;
        const s = pop(t, (o.lettersAt || 9.6) + i * 0.08);
        if (!s) return;
        P.piece(ctx, { x: lx, y: y - 22, w: 96, h: 120, seed: 80 + i, fill: 'rgba(0,0,0,0)', shadow: 0, scale: s * (o.scale || 1), rot: (i % 2 ? 0.05 : -0.05),
          draw: (g) => { g.save(); g.shadowColor = 'rgba(25,23,20,0.3)'; g.shadowBlur = 5; g.shadowOffsetY = 3; P.text(g, ch, 0, 0, { f: 'serif', size: 138, color: C.orange }); g.restore(); } });
      });
      if (t > (o.lettersAt || 9.6) + 0.6) P.text(ctx, 'LANGUAGE INSTITUTE', x, y + 78, { f: 'mono', size: 22, weight: 500, ls: 6, color: C.ink });
    }
  }

  function facade(ctx, t, t0) {
    const b = (k) => pop(t, t0 + k * 0.1);
    P.background(ctx, C.paper3, false);
    P.piece(ctx, { x: 960, y: 590, w: 1960, h: 860, seed: 91, fill: '#e2cfae', tex: 'brick', texColor: C.wood, texAlpha: 0.35, shadow: 0, boil: 0.2, scale: b(0) });
    // awning
    if (b(1)) P.piece(ctx, { x: 960, y: 118, w: 1960, h: 100, seed: 92, fill: C.cream, shadow: 1.2, scale: b(1),
      draw: (g, w, h) => { for (let k = 0; k < 22; k++) { if (k % 2) continue; g.fillStyle = C.orange; g.fillRect(-w / 2 + k * (w / 22), -h / 2, w / 22, h); } g.fillStyle = 'rgba(25,23,20,0.12)'; g.fillRect(-w / 2, h / 2 - 12, w, 12); } });
    // door behind her
    P.piece(ctx, { x: 960, y: 800, w: 300, h: 460, seed: 93, fill: C.orange, tex: 'halftone', texAlpha: 0.18, shadow: 1, scale: b(2),
      draw: (g, w, h) => { g.strokeStyle = 'rgba(25,23,20,0.25)'; g.lineWidth = 3; g.strokeRect(-w / 2 + 24, -h / 2 + 24, w - 48, h * 0.4); g.strokeRect(-w / 2 + 24, -h / 2 + 48 + h * 0.4, w - 48, h * 0.45); g.fillStyle = C.mustard; g.beginPath(); g.arc(w / 2 - 40, 30, 10, 0, 7); g.fill(); } });
    // windows
    [[380, 560], [1540, 560]].forEach(([x, y], i) => P.piece(ctx, { x, y, w: 380, h: 300, seed: 94 + i, fill: C.skyPale, shadow: 1, scale: b(3 + i),
      draw: (g, w, h) => { g.strokeStyle = C.cream; g.lineWidth = 14; g.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14); g.beginPath(); g.moveTo(0, -h / 2); g.lineTo(0, h / 2); g.stroke(); } }));
    // family: a paper-doll chain in the left window
    if (t > t0 + 0.8) paperDolls(ctx, 380, 600, pop(t, t0 + 0.8));
    // ground
    P.piece(ctx, { x: 960, y: 1050, w: 1980, h: 80, seed: 97, fill: C.tan, tex: 'halftone', texAlpha: 0.2, shadow: 0, boil: 0.2 });
  }
  function paperDolls(ctx, x, y, s) {
    const b = P.boil(98, 0.6);
    ctx.save(); ctx.translate(x + b.x, y + b.y); ctx.scale(s, s);
    ctx.shadowColor = 'rgba(25,23,20,0.25)'; ctx.shadowBlur = 5; ctx.shadowOffsetY = 3;
    ctx.fillStyle = C.cream;
    for (let k = -2; k <= 2; k++) {
      const dx = k * 58, sc = k === 0 ? 0.8 : 1;
      ctx.beginPath(); ctx.arc(dx, -52 * sc, 15 * sc, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(dx - 29, -26); ctx.lineTo(dx + 29, -26); ctx.lineTo(dx + 29, -14); ctx.lineTo(dx + 14, -14); ctx.lineTo(dx + 22, 48 * sc); ctx.lineTo(dx + 6, 48 * sc); ctx.lineTo(dx, 16); ctx.lineTo(dx - 6, 48 * sc); ctx.lineTo(dx - 22, 48 * sc); ctx.lineTo(dx - 14, -14); ctx.lineTo(dx - 29, -14); ctx.fill();
    }
    ctx.restore();
  }

  function sceneOrange(ctx, t) {
    const lt = t;
    // the new place builds itself over the falling classroom
    facade(ctx, t, 9.0);
    // posters pinned to the walls
    const posters = [
      { x: 150, y: 880, w: 190, h: 240, t0: 12.5, draw: (g, w, h) => { P.text(g, 'ABC', 0, -h * 0.25, { f: 'serif', size: 62 }); [C.orange, C.mustard, C.sky].forEach((c, k) => { g.fillStyle = c; g.fillRect(-w * 0.35 + k * w * 0.25, 10, w * 0.2, w * 0.2); }); } },
      { x: 1780, y: 880, w: 180, h: 240, t0: 12.8, tex: 'ruled', draw: (g, w, h) => { P.text(g, 'lesson', 0, -h * 0.34, { f: 'mono', size: 18, color: C.orange }); g.fillStyle = 'rgba(25,23,20,0.4)'; for (let k = 0; k < 5; k++) g.fillRect(-w * 0.35, -h * 0.18 + k * 26, w * (0.5 + (k % 3) * 0.1), 3); } },
      { x: 1540, y: 560, w: 170, h: 210, t0: 13.1, draw: (g, w, h) => { P.text(g, 'hello', 0, -h * 0.22, { f: 'serif', italic: true, size: 44 }); g.save(); g.translate(0, h * 0.18); P.pic.sun(g, 1.6); g.restore(); } },
    ];
    posters.forEach((p, i) => {
      if (i === 1 && t > 16.0) return; // this one flies away
      const s = pop(t, p.t0);
      if (!s) return;
      P.piece(ctx, { x: p.x, y: p.y, w: p.w, h: p.h, seed: 110 + i, fill: C.cream, tex: p.tex, texColor: C.sky, texAlpha: 0.5, scale: s, rot: (i - 1) * 0.05, draw: p.draw });
      ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(p.x, p.y - p.h / 2 + 12, 7 * s, 0, 7); ctx.fill();
    });

    // the sign: unfolds, then her hands take it up from above
    const up = seg(t, 9.4, 10.6);
    const handsIn = seg(t, 9.6, 10.4), handsOut = seg(t, 11.6, 12.3);
    sign(ctx, t, seg(t, 8.6, 9.6), { dy: 0 });
    if (handsIn > 0 && handsOut < 1) {
      const k = steps(handsIn, 4) - steps(handsOut, 4);
      [[SIGN.x - SIGN.w / 2 + 50, -1], [SIGN.x + SIGN.w / 2 - 50, 1]].forEach(([hx, s], i) => {
        const hy = lerp(-120, SIGN.y - SIGN.h / 2 + 10, k);
        P.motherArm(ctx, hx + s * 120, -260, hx, hy, 130 + i * 5);
      });
    }
    // strings to the awning
    if (up >= 1) { ctx.strokeStyle = C.ink2; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(SIGN.x - 300, 160); ctx.lineTo(SIGN.x - 300, SIGN.y - SIGN.h / 2); ctx.moveTo(SIGN.x + 300, 160); ctx.lineTo(SIGN.x + 300, SIGN.y - SIGN.h / 2); ctx.stroke(); }

    // Parmis at twelve
    const g = growth(t);
    const cheer = t > 13.2 && t < 15.6;
    P.parmis(ctx, {
      x: 960, y: 1030, h: g.h, age: g.age,
      dress: P.dressAt(t, 'kidbook', t < 16.4 ? 'orange' : 'teacher', t < 16.4 ? 11.4 : 16.4, t < 16.4 ? 12.4 : 17.4),
      hair: { pigtails: t < 9.5, pony: t >= 9.5 && t < 16.6, pencil: t >= 16.6 },
      armL: t < 9.6 ? [lerp(2.6, 0.3, steps(seg(t, 9.0, 9.6), 3)), 0.3] : cheer ? [2.5 + wave(t, 2, 0.12), 0.3] : [0.25, 0.1],
      armR: t < 9.6 ? [lerp(2.6, 0.3, steps(seg(t, 9.0, 9.6), 3)), 0.3] : [0.35, 1.2],
      holdR: t >= 13.6 && t < 16.2 ? (c, x, y) => P.piece(c, { x: x + 10, y: y - 30, w: 90, h: 120, seed: 140, fill: C.cream, tex: 'ruled', texColor: C.sky, texAlpha: 0.6, rot: 0.1, scale: pop(t, 13.6), draw: (gg) => P.text(gg, 'my notes', 0, -36, { f: 'mono', size: 11, color: C.orange }) }) : null,
      tilt: cheer ? -0.05 : 0,
    });

    // flying lesson sheet (transition into chapter 3)
    if (t > 16.0) flyingSheet(ctx, t);
    chapter(ctx, 2);
    P.label(ctx, 'age 12 · my mother opens Orange', 70, 70, t, 9.8, 16.2);
    P.caption(ctx, ['My mother’s school.', 'Our family’s story.'], 90, 225, t, 12.8, 16.2, { size: 44 });
  }

  const BOARD = { x: 960, y: 330, w: 1080, h: 420 };
  function flyingSheet(ctx, t) {
    // the lesson sheet grows from the wall into the whiteboard behind her
    const p = steps(seg(t, 16.0, 17.2), 10);
    if (p >= 1) return;
    const e = E.inOut(p);
    const big = Math.sin(p * Math.PI) * 0.9;
    const x = lerp(1780, BOARD.x, e), y = lerp(880, BOARD.y, e);
    const w = lerp(180, BOARD.w, e) * (1 + big), h = lerp(240, BOARD.h, e) * (1 + big);
    P.piece(ctx, { x, y, w, h, seed: 111, fill: C.cream, tex: 'ruled', texColor: C.sky, texAlpha: lerp(0.5, 0, e), rot: Math.sin(p * Math.PI) * 0.5, shadow: 2 });
  }

  // ================================================== 3. teacher, at uni
  const KIDS10 = [{ x: 230, seed: 201, hairType: 3 }, { x: 520, seed: 202, hairType: 0 }, { x: 1400, seed: 203, hairType: 1 }, { x: 1690, seed: 204, hairType: 2 }];
  const LEARN = [P.pic.eye, P.pic.note, P.pic.hand, P.pic.speech];
  function sceneTeacher(ctx, t) {
    P.background(ctx, C.paper2);
    // whiteboard
    P.piece(ctx, { x: BOARD.x, y: BOARD.y, w: BOARD.w, h: BOARD.h, seed: 210, fill: C.cream, shadow: 1.2, boil: 0.3,
      draw: (g, w, h) => {
        g.strokeStyle = C.muted; g.lineWidth = 10; g.strokeRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10);
        P.text(g, 'Hello, class!', -w / 2 + 50, -h / 2 + 80, { f: 'serif', italic: true, size: 64, align: 'left', color: C.ink });
        g.save(); g.translate(w / 2 - 110, -h / 2 + 90); P.pic.sun(g, 2); g.restore();
        g.save(); g.translate(w / 2 - 120, h / 2 - 90); P.pic.apple(g, 2.2); g.restore();
      } });
    // a little Orange sign on the wall: this is Orange
    P.piece(ctx, { x: 1700, y: 90, w: 230, h: 70, seed: 211, fill: C.cream, shadow: 1, draw: () => { P.text(ctx, 'Orange', 20, 2, { f: 'serif', size: 44, color: C.orange }); } });
    P.orange(ctx, 1612, 90, 0.55);
    // the orange shape rides the sheet and lands on the board as a magnet
    const magnet = t < 25.0;

    // kids of ten at desks
    const handsUp = (i) => t > 19.3 + [0, 0.3, 0.15, 0.45][i] && t < 21.4;
    const cubeT = seg(t, 25.0, 25.7);
    KIDS10.forEach((k, i) => {
      const up = handsUp(i);
      P.person(ctx, { x: k.x, y: 850, h: 330, seed: k.seed, hairType: k.hairType, mouth: up ? 'open' : 'smile', look: k.x < 960 ? 1 : -1,
        armL: up && i % 2 ? [2.8 + wave(t, 3, 0.12), 0.2] : [0.3, 1.4], armR: up && !(i % 2) ? [2.8 + wave(t, 2, 0.12), 0.2] : [0.3, 1.4] });
      P.piece(ctx, { x: k.x, y: 950, w: 270, h: 200, seed: 220 + i, fill: C.kraft, tex: 'wood', texAlpha: 0.3, shadow: 1.3,
        draw: (g, w, h) => { if (i === 2 && cubeT > 0) return; P.piece(g, { x: 0, y: -40, w: 120, h: 80, seed: 230 + i, fill: C.cream, tex: 'grid', texAlpha: 0.2, rot: 0.08, draw: (gg) => { if (i === 2) P.pic.star(gg, 1, C.orange); } }); } });
    });
    // what each child answers
    const answers = ['Me!', 'An apple!', 'Apple!', 'Me, me!'];
    answers.forEach((s, i) => { const v = vis(t, 20.0 + i * 0.25, 21.8); if (v) P.bubble(ctx, KIDS10[i].x + (i < 2 ? 70 : -70), 470, v, s, { seed: 240 + i, w: 170, h: 80, size: 26, tail: [i < 2 ? -0.2 : 0.2, 1] }); });
    // how each child learns
    const sweep = seg(t, 21.6, 24.6);
    if (sweep > 0) {
      KIDS10.forEach((k, i) => {
        const t0 = 21.8 + i * 0.7;
        const v = pop(t, t0);
        if (v) P.bubble(ctx, k.x, 470, v, (g) => { LEARN[i](g, 1.6, C.ink); }, { seed: 250 + i, w: 120, h: 100, tail: [0, 1] });
      });
    }

    // Parmis at university
    const g = growth(t);
    const asking = t > 17.8 && t < 20.4;
    const lens = sweep > 0 && sweep < 1;
    const lensX = lerp(KIDS10[0].x, KIDS10[3].x, steps(sweep, 4) * 1.33 > 1 ? 1 : steps(sweep, 4) * 1.33);
    const pr = P.parmis(ctx, {
      x: 960, y: 1030, h: g.h, age: g.age, dress: P.dressAt(t, 'orange', 'teacher', 16.4, 17.4), hair: { pencil: true },
      armL: lens ? [1.3, 0.2] : [0.25, 0.15],
      armR: asking ? [2.2, 1.1] : [0.3, 0.5],
      holdR: asking ? (c, x, y) => P.picCard(c, x + 20, y - 70, pop(t, 17.8), P.pic.apple, '?', 260, 0.08) : null,
      tilt: lens ? (lensX < 960 ? -0.05 : 0.05) : 0,
    });
    if (asking) { const v = vis(t, 18.2, 20.4); if (v) P.bubble(ctx, 1260, 330, v, 'What’s this?', { seed: 261, w: 250, h: 90, size: 30, tail: [-0.35, 1] }); }
    if (lens) {
      // her magnifier moves across the class
      ctx.save();
      ctx.strokeStyle = C.orange; ctx.lineWidth = 12; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(pr.handL[0], pr.handL[1]); ctx.lineTo(lensX + (lensX < 960 ? 50 : -50), 700); ctx.stroke();
      ctx.restore();
      P.piece(ctx, { x: lensX, y: 640, w: 150, h: 150, kind: 'circle', seed: 262, fill: 'rgba(251,248,241,0.3)', shadow: 0.4,
        draw: (g2, w) => { g2.strokeStyle = C.ink; g2.lineWidth = 10; g2.beginPath(); g2.arc(0, 0, w / 2 - 6, 0, 7); g2.stroke(); } });
    }

    // the worksheet folds into a cube (transition)
    if (cubeT > 0) {
      const f = Math.floor(steps(cubeT, 4) * 4);
      const x = lerp(1400, 1180, cubeT), y = lerp(910, 820, cubeT);
      if (f < 3) P.piece(ctx, { x, y, w: [120, 90, 60][f], h: [80, 80, 60][f], seed: 270 + f, fill: C.cream, tex: 'grid', texAlpha: 0.3, rot: f * 0.3 });
      else P.cube(ctx, x, y, 0.9);
    }
    if (magnet && t < 24.4) P.orange(ctx, 1080, 150, 0.9);
    else if (t < 25.0) { const [x, y] = arcHop(t, 24.4, 25.0, [1080, 150], [1400, 880], 160); P.orange(ctx, x, y, 0.8); }
    else P.orange(ctx, lerp(1400, 1180, cubeT), lerp(880, 772, cubeT), 0.8);

    chapter(ctx, 3);
    P.label(ctx, 'university years · teaching at Orange', 70, 70, t, 17.3, 25.5);
    P.caption(ctx, ['Watching how they learn.'], 70, 1000, t, 22.2, 25.6, { size: 44 });
  }

  // ======================================== 4. Montessori, then phonics
  function montessoriRoom(ctx, t) {
    P.background(ctx, '#efe6d6');
    P.piece(ctx, { x: 1500, y: 230, w: 360, h: 250, seed: 302, fill: C.skyPale, shadow: 1, boil: 0.2,
      draw: (g, w, h) => { g.save(); g.translate(-w * 0.2, -h * 0.1); P.pic.sun(g, 2); g.restore(); g.strokeStyle = C.cream; g.lineWidth = 14; g.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14); g.beginPath(); g.moveTo(0, -h / 2); g.lineTo(0, h / 2); g.stroke(); } });
    P.piece(ctx, { x: 420, y: 250, w: 300, h: 190, seed: 303, fill: C.cream, shadow: 1, boil: 0.2, rot: -0.02,
      draw: (g, w, h) => { ['a', 'b', 'c', 'd', 'e'].forEach((ch, i) => P.text(g, ch, -w * 0.36 + i * w * 0.18, -10, { f: 'serif', size: 60, color: [C.orange, C.ink, C.leaf, C.sky, C.mustard][i] })); g.fillStyle = C.orange; g.fillRect(-w / 2 + 20, h / 2 - 34, w - 40, 6); } });
    for (let k = 0; k < 5; k++) P.piece(ctx, { x: 707 + k * 26, y: 380 - (k % 2) * 30, w: 22, h: 70, kind: 'blob', rot: (k - 2) * 0.35, seed: 305 + k, fill: C.leaf, shadow: 0.5 });
    P.piece(ctx, { x: 760, y: 430, w: 90, h: 70, seed: 311, fill: C.orange, shadow: 0.8, tex: 'halftone', texAlpha: 0.15 });
    // low shelf with materials
    P.piece(ctx, { x: 960, y: 610, w: 1760, h: 300, seed: 301, fill: C.wood, tex: 'wood', texAlpha: 0.35, shadow: 1.2, boil: 0.2,
      draw: (g, w, h) => { g.fillStyle = 'rgba(25,23,20,0.25)'; g.fillRect(-w / 2, -6, w, 12); } });
    // red rods (orange / cream)
    for (let k = 0; k < 5; k++) P.piece(ctx, { x: 260, y: 510 + k * 16, w: 300 - k * 50, h: 13, seed: 310 + k, fill: k % 2 ? C.cream : C.orange, shadow: 0.5, boil: 0.2,
      draw: (g, w) => { for (let s = 1; s < 6; s++) { g.fillStyle = s % 2 ? C.cream : C.orange; g.fillRect(-w / 2 + (s * w) / 6, -7, w / 12, 14); } } });
    // bead bars
    for (let k = 0; k < 4; k++) { const n = 6 + k * 2; for (let b = 0; b < n; b++) { ctx.fillStyle = C.mustard; ctx.beginPath(); ctx.arc(1520 + b * 13, 520 + k * 22, 6.5, 0, 7); ctx.fill(); } }
    // sandpaper letter boards on the shelf
    ['m', 'a', 't'].forEach((ch, i) => P.piece(ctx, { x: 1450 + i * 120, y: 690, w: 96, h: 120, seed: 320 + i, fill: C.leaf, shadow: 0.8,
      draw: (g, w, h) => { P.text(g, ch, 0, -6, { f: 'serif', size: 90, color: '#e8d6b0' }); g.globalAlpha = 0.45; g.fillStyle = P.pat(g, 'sand', C.ink); g.fillRect(-w / 2, -h / 2, w, h); g.globalAlpha = 1; } }));
    // small chairs
    [[190, 920], [1730, 920]].forEach(([x, y], i) => { P.piece(ctx, { x, y: y - 90, w: 130, h: 160, seed: 330 + i, fill: C.kraft, tex: 'wood', texAlpha: 0.3 }); P.piece(ctx, { x, y, w: 160, h: 30, seed: 332 + i, fill: C.wood }); });
    // round rug
    P.piece(ctx, { x: 960, y: 1080, w: 1500, h: 200, seed: 340, kind: 'circle', fill: C.tan, tex: 'stripes', texAlpha: 0.1, shadow: 0 });
  }

  const PH = ['s', 'a', 't', 'p', 'i', 'n'];
  const PHCOL = [C.orange, C.ink, C.mustard, C.sky, C.leaf, C.orange];
  function sceneEarly(ctx, t, o = {}) {
    // the new room pastes in from where the cube lands
    const reveal = steps(seg(t, 25.7, 26.7), 8);
    if (reveal < 1) { sceneTeacherStatic(ctx, t); }
    P.pasteReveal(ctx, 700, 830, reveal, 350, () => montessoriRoom(ctx, t));
    const phon = t > 31.8;

    // small children, about four
    const k1 = P.person(ctx, { x: 470, y: 900, h: 250 * pop(t, 26.1), seed: 361, hairType: 2, look: 1, mouth: t > 33.6 && t < 35 ? 'open' : 'smile',
      armR: t > 27 && t < 31 ? [1.2 + (Math.floor(t * 2) % 2) * 0.5, 1.2] : [0.4, 1.2], armL: [0.3, 0.9] });
    const k2 = P.person(ctx, { x: 1450, y: 900, h: 250 * pop(t, 26.3), seed: 362, hairType: 1, look: -1, mouth: t > 34 && t < 35.4 ? 'open' : 'smile',
      armL: t > 27.5 && t < 31.6 ? [0.9, 1.3 + wave(t, 2, 0.12)] : [0.3, 1.1], armR: [0.3, 0.9] });

    // Parmis kneels at child height
    const g = growth(t);
    const pr = o.noParmis ? { x: 960, sy: 655 } : P.parmis(ctx, {
      x: 960, y: lerp(1030, 1170, steps(seg(t, 25.7, 26.2), 3)), h: g.h, age: g.age, legs: false, hair: {},
      dress: t < 30 ? P.dressAt(t, 'teacher', 'montessori', 26.2, 27.2) : P.dressAt(t, 'montessori', 'phonics', 32.9, 33.9),
      armL: phon ? [1.9 + wave(t, 2, 0.12), 0.5] : [0.7, 1.1], armR: phon ? [1.9 + wave(t, 3, 0.12), 0.5] : [0.75, 1.2],
      tilt: t < 31 ? -0.06 : 0.02,
    });
    // low table
    P.piece(ctx, { x: 960, y: 980, w: 1180, h: 180, seed: 370, fill: C.kraft, tex: 'wood', texAlpha: 0.32, shadow: 1.3, boil: 0.2, scale: pop(t, 25.7) });

    // pink tower, block by block: small hands lead
    const tower = [96, 80, 66, 52, 40];
    let ty = 880;
    tower.forEach((s, i) => {
      const t0 = i === 0 ? 26.3 : 27.2 + i * 0.75;
      if (i === 0 && t < t0) { const k = steps(seg(t, 25.7, 26.3), 5); P.cube(ctx, lerp(1180, 700, k), lerp(820, 832, k) - Math.sin(k * Math.PI) * 120, 0.9); }
      if (t < t0) return;
      ty -= s / 2;
      P.pinkBlock(ctx, 700, ty - (1 - pop(t, t0)) * 40, s, 380 + i);
      ty -= s / 2;
    });
    // sandpaper "s" on the table; a small finger traces it
    const sLift = seg(t, 31.6, 32.4);
    P.piece(ctx, { x: 1230, y: 860, w: 110, h: 130, seed: 390, fill: C.leaf, shadow: 1, rot: 0.04,
      draw: (g2, w, h) => { if (sLift <= 0) P.text(g2, 's', 0, -6, { f: 'serif', size: 104, color: '#e8d6b0' }); g2.globalAlpha = 0.45; g2.fillStyle = P.pat(g2, 'sand', C.ink); g2.fillRect(-w / 2, -h / 2, w, h); g2.globalAlpha = 1; } });

    // phonics: letters with sounds
    if (sLift > 0) {
      PH.forEach((ch, i) => {
        const t0 = 31.9 + i * 0.14;
        if (t < t0) return;
        const a = Math.PI * (1.08 + (i / (PH.length - 1)) * 0.84);
        const home = [960 + Math.cos(a) * 560, 560 + Math.sin(a) * 330];
        const intoDress = seg(t, 33.0 + i * 0.1, 33.7 + i * 0.1);
        const keep = i < 3; // s, a, t stay and make a word
        let x = i === 0 ? lerp(1230, home[0], E.out(steps(seg(t, 31.6, 32.2), 5))) : home[0], y = i === 0 ? lerp(860, home[1], E.out(steps(seg(t, 31.6, 32.2), 5))) : home[1];
        let s = pop(t, t0);
        if (keep) {
          const join = E.inOut(steps(seg(t, 33.4, 34.2), 6));
          x = lerp(x, 1440 + i * 92, join); y = lerp(y, 330, join);
        } else if (intoDress > 0) {
          const e = steps(intoDress, 5);
          x = lerp(x, pr.x + (i - 4) * 40, e); y = lerp(y, pr.sy + 150, e); s *= lerp(1, 0.3, e);
          if (intoDress >= 1) return;
        }
        P.alphaTile(ctx, ch, x, y, s * 1.35, PHCOL[i], 400 + i, (i - 2.5) * 0.06, PHCOL[i] === C.mustard ? C.ink : C.cream);
        if (t < 33.3) {
          const tag = '/' + ch + '/';
          P.text(ctx, tag, x, y + 64, { f: 'mono', size: 22, weight: 500, color: C.orange, alpha: s });
          // sound arcs
          if (Math.floor(t * 6 + i) % 2) { ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 3; ctx.globalAlpha = 0.7; for (let k = 1; k <= 2; k++) { ctx.beginPath(); ctx.arc(x + 20, y - 10, 38 + k * 12, -0.9, -0.1); ctx.stroke(); } ctx.restore(); }
        }
      });
      if (t > 34.2) { const v = pop(t, 34.2); P.piece(ctx, { x: 1532, y: 420, w: 280, h: 60, kind: 'torn', seed: 410, fill: C.paper2, scale: v, draw: () => P.text(ctx, '→ sat', 0, 2, { f: 'serif', italic: true, size: 40 }) }); }
      [['sss!', k1, 0], ['a-a-a!', k2, 1]].forEach(([s, k, i]) => { const v = vis(t, 33.6 + i * 0.5, 35.2); if (v) P.bubble(ctx, k.handL ? (i ? 1560 : 360) : 0, 560, v, s, { seed: 420 + i, w: 150, h: 76, size: 26, tail: [i ? -0.2 : 0.2, 1] }); });
    }
    // the orange shape rides the cube, then waits on the table
    if (!o.noParmis) {
      if (t < 26.3) { const k = steps(seg(t, 25.7, 26.3), 5); P.orange(ctx, lerp(1180, 700, k), lerp(772, 784, k) - Math.sin(k * Math.PI) * 120, 0.8); }
      else if (t < 26.8) { const [x, y] = arcHop(t, 26.3, 26.8, [700, 784], [840, 866], 80); P.orange(ctx, x, y, 0.8); }
      else P.orange(ctx, 840, 866, 0.8);
    }
    chapter(ctx, 4);
    P.label(ctx, 'training · Montessori', 70, 70, t, 26.4, 31.8);
    P.label(ctx, 'training · phonics', 70, 70, t, 32.0, 35.4);
  }
  // chapter-3 backdrop frozen, for the paste-over
  function sceneTeacherStatic(ctx, t) {
    P.background(ctx, C.paper2);
    P.piece(ctx, { x: BOARD.x, y: BOARD.y, w: BOARD.w, h: BOARD.h, seed: 210, fill: C.cream, shadow: 1.2, boil: 0.3,
      draw: (g, w, h) => { g.strokeStyle = C.muted; g.lineWidth = 10; g.strokeRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10); P.text(g, 'Hello, class!', -w / 2 + 50, -h / 2 + 80, { f: 'serif', italic: true, size: 64, align: 'left' }); } });
    KIDS10.forEach((k, i) => { P.person(ctx, { x: k.x, y: 850, h: 330, seed: k.seed, hairType: k.hairType, look: k.x < 960 ? 1 : -1, armL: [0.3, 1.4], armR: [0.3, 1.4] }); P.piece(ctx, { x: k.x, y: 950, w: 270, h: 200, seed: 220 + i, fill: C.kraft, tex: 'wood', texAlpha: 0.3, shadow: 1.3 }); });
  }

  // ============================================= 5. teaching during COVID
  const MON = { x: 60, y: 40, w: 1800, h: 900, bez: 26 };
  const TILES = [[120, 110], [120, 380], [120, 650], [1340, 110], [1340, 380], [1340, 650]].map(([x, y]) => ({ x, y, w: 460, h: 250 }));
  const TILE_BG = [C.mustard, C.skyPale, C.pink, C.leaf, C.orangeTint, C.tan];
  function monitor(ctx, t, o = {}) {
    const m = o.rect || MON;
    ctx.save();
    ctx.shadowColor = 'rgba(25,23,20,0.3)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
    if (!o.noStand) { ctx.fillStyle = C.ink2; ctx.beginPath(); ctx.moveTo(880, 930); ctx.lineTo(1040, 930); ctx.lineTo(1080, 1040); ctx.lineTo(840, 1040); ctx.fill(); ctx.fillRect(760, 1030, 400, 26); }
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(m.x, m.y, m.w, m.h, o.radius || 24); ctx.fill();
    ctx.restore();
    ctx.fillStyle = o.screen || C.cream; ctx.beginPath(); ctx.roundRect(m.x + MON.bez, m.y + MON.bez, m.w - MON.bez * 2, m.h - MON.bez * 2, Math.max(6, (o.radius || 24) - 16)); ctx.fill();
  }
  function kidTile(ctx, t, i, o = {}) {
    const T = TILES[i];
    const s = o.s == null ? pop(t, 36.6 + i * 0.12) : o.s;
    if (!s) return;
    ctx.save();
    ctx.translate(T.x + T.w / 2, T.y + T.h / 2); ctx.scale(s, s); ctx.translate(-T.x - T.w / 2, -T.y - T.h / 2);
    ctx.save(); ctx.beginPath(); ctx.roundRect(T.x, T.y, T.w, T.h, 14); ctx.clip();
    ctx.fillStyle = TILE_BG[i]; ctx.fillRect(T.x, T.y, T.w, T.h);
    ctx.globalAlpha = 0.18; ctx.fillStyle = P.pat(ctx, ['stripes', 'dots', 'check', 'halftoneBig', 'grid', 'dots'][i], C.cream); ctx.fillRect(T.x, T.y, T.w, T.h); ctx.globalAlpha = 1;
    // each child does their own thing, then all hold up a card
    const cards = t > 42.7;
    const act = (k) => {
      switch (k) {
        case 0: return { armR: [2.6 + wave(t, 2, 0.35), 0.3], mouth: 'open' }; // waves
        case 1: return { armL: [0.9, 2.0], armR: [0.9, 2.0 + wave(t, 3, 0.1)], mouth: 'smile', bounce: (Math.floor(t * 6) % 2) * -8 }; // claps
        case 2: return { mouth: Math.floor(t * 3) % 2 ? 'open' : 'o', armL: [0.4, 1.0], armR: [0.4, 1.0], bounce: (Math.floor(t * 6) % 2) * -10 }; // sings, bounces
        case 3: return { armL: [2.9, 0.1], mouth: 'smile' }; // hand up
        case 4: return { armR: [0.8, 1.6 + wave(t, 5, 0.15)], mouth: 'smile', look: 1 }; // drawing
        default: return { armL: [2.2 + wave(t, 3, 0.3), 0.5], armR: [2.2 - wave(t, 3, 0.3), 0.5], mouth: 'open' }; // dancing
      }
    };
    const a = cards ? { armL: [1.0, 1.9], armR: [1.0, 1.9], mouth: 'open' } : act(i);
    const pp = P.person(ctx, { x: T.x + T.w / 2, y: T.y + T.h + 20 + (a.bounce || 0), h: 230, seed: 500 + i, ...a });
    if (cards) {
      const v = pop(t, 42.7 + i * 0.1);
      const cx = T.x + T.w / 2 + (i % 2 ? 110 : -110);
      P.picCard(ctx, cx, T.y + T.h * 0.52, v * 0.85, i % 2 ? P.pic.ball : P.pic.bee, 'b', 510 + i, (i - 2.5) * 0.06, { w: 110, h: 140 });
    } else if (i === 4 && t > 40) {
      P.piece(ctx, { x: T.x + T.w / 2 + 120, y: T.y + T.h * 0.5, w: 120, h: 100, seed: 520, fill: C.cream, scale: pop(t, 40), draw: (g) => P.pic.ball(g, 1.5) });
    }
    ctx.restore();
    // tile chrome: mic dot and a little reaction
    ctx.fillStyle = 'rgba(25,23,20,0.6)'; ctx.beginPath(); ctx.roundRect(T.x + 12, T.y + T.h - 38, 34, 26, 8); ctx.fill();
    ctx.fillStyle = i === 2 || i === 0 || cards ? C.leaf : C.cream; ctx.beginPath(); ctx.arc(T.x + 29, T.y + T.h - 25, 6, 0, 7); ctx.fill();
    if (i === 3 && !cards) { ctx.save(); ctx.translate(T.x + T.w - 40, T.y + 40); P.pic.hand(ctx, 1.2 * pop(t, 38.2), C.orange); ctx.restore(); }
    ctx.restore();
  }
  const CENTER_TILE = { x: 640, y: 110, w: 640, h: 790 };
  function sceneOnline(ctx, t) {
    const fold = seg(t, 35.2, 36.4);
    P.background(ctx, C.paper);
    monitor(ctx, t);
    // the Montessori room folds shut into the screen
    if (fold < 1) {
      const room = P.layer('room', (g) => { sceneEarly(g, 35.15, { noParmis: true }); P.setTime(t); });
      const f = steps(fold, 6);
      const L = 960 - f * 900;
      // two halves close like a book toward the centre
      ctx.save();
      const k = Math.cos(f * Math.PI / 2);
      ctx.globalAlpha = 1;
      ctx.drawImage(room, 0, 0, 960, H, 960 - 960 * k, 0, 960 * k, H);
      ctx.drawImage(room, 960, 0, 960, H, 960, 0, 960 * k, H);
      ctx.fillStyle = `rgba(25,23,20,${0.35 * f})`; ctx.fillRect(960 - 960 * k, 0, 1920 * k, H);
      ctx.restore();
    }
    // kid tiles
    if (t > 36.4) for (let i = 0; i < 6; i++) kidTile(ctx, t, i);
    // centre tile: her virtual background is the lesson slide
    const ct = CENTER_TILE, cs = pop(t, 36.3);
    if (cs) {
      ctx.save();
      ctx.translate(960, 505); ctx.scale(cs, cs); ctx.translate(-960, -505);
      ctx.fillStyle = C.paper; ctx.beginPath(); ctx.roundRect(ct.x, ct.y, ct.w, ct.h, 14); ctx.fill();
      slide(ctx, t, ct.x + 20, ct.y + 20, ct.w - 40, 190);
      ctx.restore();
    }
    // Parmis, inside her tile
    const card = t > 40.2 && t < 41.4, puppet = t > 41.4 && t < 42.7, cardsUp = t > 42.7, sing = t > 39.1 && t < 40.2, wav = t > 37.0 && t < 39.1;
    ctx.save(); ctx.beginPath(); ctx.roundRect(ct.x, ct.y, ct.w, ct.h, 14); ctx.clip();
    const y = lerp(1170, 1090, steps(seg(t, 35.8, 36.6), 3));
    const cardFace = Math.floor(steps(seg(t, 40.2, 41.4), 4) * 3);
    P.parmis(ctx, {
      x: 960, y, h: 720, age: 1, legs: false, dress: P.dressAt(t, 'phonics', 'online', 36.6, 37.6),
      hair: { headset: steps(seg(t, 36.8, 37.2), 3) },
      armL: wav ? [2.6 + wave(t, 2, 0.3), 0.3] : sing ? [1.4, 0.8] : cardsUp ? [1.3, 1.6] : puppet ? [1.2, 1.4] : [0.3, 0.4],
      armR: card ? [1.2, 1.5] : sing ? [1.4, 0.8] : cardsUp ? [1.3, 1.6] : [0.3, 0.4],
      holdR: card || cardsUp ? (c, x, yy) => P.picCard(c, x + 10, yy - 70, 1, [P.pic.ball, P.pic.bee, P.pic.ball][cardFace] || P.pic.ball, ['ball', 'bee', 'b'][cardsUp ? 2 : cardFace] || 'b', 530 + cardFace, 0.05, { w: 130, h: 160, ws: 30 }) : null,
      holdL: puppet ? (c, x, yy) => sockPuppet(c, x, yy - 40, t) : null,
    });
    if (sing) [0, 1, 2].forEach((k) => { const v = pop(t, 39.2 + k * 0.25); if (v) { c2(ctx, 960 + (k - 1) * 90, 400 - k * 30 - (t - 39.2) * 30, v, k); } });
    ctx.restore();
    // the orange shape hops up and becomes the ball on the slide
    if (t < 36.3) { const [x, y] = arcHop(t, 35.2, 36.3, [840, 866], [ct.x + ct.w - 140, ct.y + 118], 220); P.orange(ctx, x, y, lerp(0.8, 1.1, seg(t, 35.2, 36.3))); }
    else P.orange(ctx, ct.x + ct.w - 140, ct.y + 118, 1.1);
    chapter(ctx, 5);
    P.label(ctx, 'COVID · teaching online', 70, 70, t, 36.5, 44.8);
    P.caption(ctx, ['Keeping little learners close.'], 90, 1006, t, 39.4, 44.9, { size: 42 });
  }
  function c2(ctx, x, y, v, k) { ctx.save(); ctx.translate(x, y); P.pic.note(ctx, 1.6 * v, k % 2 ? C.orange : C.ink); ctx.restore(); }
  function sockPuppet(ctx, x, y, t) {
    const open = Math.floor(t * 6) % 2;
    const b = P.boil(540, 1);
    ctx.save(); ctx.translate(x + b.x, y + b.y);
    ctx.shadowColor = 'rgba(25,23,20,0.3)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
    ctx.fillStyle = C.mustard; ctx.beginPath(); ctx.roundRect(-44, -70, 88, 120, 40); ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = C.orange; ctx.beginPath(); ctx.ellipse(0, -8, 30, open ? 14 : 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = C.cream; ctx.beginPath(); ctx.arc(-16, -44, 10, 0, 7); ctx.arc(16, -44, 10, 0, 7); ctx.fill();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-14, -42, 4.5, 0, 7); ctx.arc(18, -42, 4.5, 0, 7); ctx.fill();
    ctx.restore();
    P.bubble(ctx, x + 110, y - 150, pop(t, 41.6), 'hi!', { seed: 541, w: 110, h: 70, size: 30, tail: [-0.3, 1] });
  }
  function slide(ctx, t, x, y, w, h) {
    ctx.save();
    ctx.fillStyle = C.cream; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = C.ink; ctx.fillRect(x, y, w, 34);
    P.text(ctx, 'LETTER OF THE DAY', x + 16, y + 17, { f: 'mono', size: 14, align: 'left', color: C.cream, ls: 2 });
    P.text(ctx, 'b', x + 70, y + 110, { f: 'serif', size: 130, color: C.orange });
    P.text(ctx, 'ball · bee', x + 150, y + 118, { f: 'serif', italic: true, size: 50, align: 'left' });
    ctx.save(); ctx.translate(x + w - 230, y + 110); P.pic.bee(ctx, 2); ctx.restore();
    ctx.restore();
  }

  // ================================================ 6. the design question
  function toolbar(ctx, x, y, w, t) {
    ctx.fillStyle = C.ink2; ctx.beginPath(); ctx.roundRect(x, y, w, 46, 10); ctx.fill();
    for (let k = 0; k < 14; k++) { ctx.fillStyle = k % 5 === 3 ? C.orange : '#8a8276'; ctx.beginPath(); ctx.roundRect(x + 16 + k * ((w - 30) / 14), y + 13, 20, 20, 5); ctx.fill(); }
  }
  const UI = [
    // imagined platform pieces: position, size, draw
    { x: 330, y: 250, w: 250, h: 250, t0: 49.2, draw: (g, w, h) => { P.text(g, 'listen', 0, h * 0.34, { f: 'mono', size: 20 }); g.save(); g.translate(0, -16); P.pic.speaker(g, 3.2); g.restore(); }, fill: C.cream, kind: 'round' },
    { x: 330, y: 620, w: 300, h: 250, t0: 49.5, draw: (g, w, h) => { [['b', -80], ['a', 0], ['t', 80]].forEach(([ch, dx], i) => P.alphaTile(g, ch, dx, -30, 1, [C.orange, C.ink, C.mustard][i], 600 + i, 0, i === 2 ? C.ink : C.cream)); [-80, 0, 80].forEach((dx) => { g.setLineDash([6, 6]); g.strokeStyle = C.ink2; g.lineWidth = 2; g.strokeRect(dx - 32, 44, 64, 64); g.setLineDash([]); }); }, fill: C.cream, kind: 'round' },
    { x: 1600, y: 250, w: 280, h: 230, t0: 49.8, draw: (g, w, h) => { [-70, 0, 70].forEach((dx, i) => { g.save(); g.translate(dx, -10); P.pic.star(g, 1.8, i < 2 ? C.orange : C.line); g.restore(); }); P.text(g, 'well done!', 0, 70, { f: 'serif', italic: true, size: 36 }); }, fill: C.cream, kind: 'round' },
    { x: 1600, y: 620, w: 300, h: 260, t0: 50.1, draw: (g, w, h) => { [[P.pic.ball, -70], [P.pic.bee, 70]].forEach(([f, dx]) => { g.fillStyle = C.paper2; g.beginPath(); g.roundRect(dx - 58, -90, 116, 150, 16); g.fill(); g.save(); g.translate(dx, -20); f(g, 2); g.restore(); }); P.text(g, 'tap the “b”', 0, 100, { f: 'sans', size: 22, weight: 600 }); }, fill: C.cream, kind: 'round' },
  ];
  function sceneQuestion(ctx, t) {
    P.background(ctx, C.paper);
    const grow = E.inOut(steps(seg(t, 45.0, 45.8), 5));
    const open = steps(seg(t, 48.5, 49.3), 4);
    monitor(ctx, t);
    if (t < 45.6) for (let i = 0; i < 6; i++) kidTile(ctx, t, i, { s: 1 - steps(seg(t, 45.0, 45.6), 4) });
    const sx = lerp(CENTER_TILE.x + 20, MON.x + 60, grow), sy = lerp(CENTER_TILE.y + 20, MON.y + 60, grow);
    const sw = lerp(600, MON.w - 120, grow), sh = lerp(190, MON.h - 190, grow);
    // behind the slide: the imagined platform, on sketch paper
    if (open > 0) {
      ctx.save(); ctx.fillStyle = C.cream; ctx.fillRect(MON.x + 26, MON.y + 26, MON.w - 52, MON.h - 52);
      ctx.globalAlpha = 0.25; ctx.fillStyle = P.pat(ctx, 'grid', C.sky); ctx.fillRect(MON.x + 26, MON.y + 26, MON.w - 52, MON.h - 52); ctx.restore();
    }
    // the slide, opening like two doors
    const k = 1 - open;
    if (k > 0.01) {
      const slideLayer = P.layer('slide', (g) => { g.save(); g.translate(sx, sy); g.scale(sw / 600, sh / 190); slide(g, t, 0, 0, 600, 190); g.restore(); toolbar(g, sx + sw * 0.2, sy + sh - 70, sw * 0.6, t); });
      ctx.drawImage(slideLayer, sx, sy, sw / 2, sh, sx, sy, (sw / 2) * k, sh);
      ctx.drawImage(slideLayer, sx + sw / 2, sy, sw / 2, sh, sx + sw - (sw / 2) * k, sy, (sw / 2) * k, sh);
    }
    // the pencil circles the tiny buttons
    const circ = seg(t, 46.0, 47.2);
    if (circ > 0 && open < 1) {
      const pts = P.arcPts(sx + sw * 0.5, sy + sh - 47, sw * 0.33, 44, 0, Math.PI * 2.1, 40);
      P.scribble(ctx, P.partial(pts, steps(circ, 8)), { color: C.orange, width: 6, seed: 610, jit: 3 });
      if (circ > 0.9) P.sticky(ctx, sx + sw * 0.84, sy + sh - 150, pop(t, 47.0), ['tiny!'], C.mustard, 611, 0.1, { w: 150, h: 90, size: 30 });
    }
    // platform pieces fly out of the screen
    if (open > 0) {
      UI.forEach((u, i) => {
        const p = steps(seg(t, u.t0, u.t0 + 0.5), 5);
        if (p <= 0) return;
        const e = E.back(p);
        const off = seg(t, 52.2, 52.8);
        P.piece(ctx, { x: lerp(960, u.x, e) + (u.x < 960 ? -1 : 1) * steps(off, 4) * 900, y: lerp(500, u.y, e), w: u.w, h: u.h, seed: 620 + i, fill: u.fill, kind: u.kind, scale: lerp(0.3, 1, Math.min(1, e)), rot: (1 - p) * (i % 2 ? 0.5 : -0.5) + (i % 2 ? 0.03 : -0.03), draw: u.draw, shadow: 1.2 });
      });
      // sketch arrows between them
      if (t > 50.4 && t < 52.2) {
        P.scribble(ctx, P.partial([[480, 380], [520, 470], [480, 520]], steps(seg(t, 50.4, 50.9), 4)), { width: 3, seed: 630, color: C.ink2 });
        P.scribble(ctx, P.partial([[1460, 380], [1420, 470], [1460, 520]], steps(seg(t, 50.6, 51.1), 4)), { width: 3, seed: 631, color: C.ink2 });
      }
      // feedback notes
      [['bigger buttons', 560, 140, -0.06], ['read it aloud', 1370, 130, 0.05], ['fewer clicks', 1330, 840, -0.04]].forEach(([s, x, y, r], i) => {
        const v = vis(t, 50.6 + i * 0.35, 52.4);
        if (v) P.sticky(ctx, x, y, v, [s], C.mustard, 640 + i, r, { w: 230, h: 84, size: 26 });
      });
    }
    // Parmis steps out in front of the screen
    const q = t > 46.8 && t < 49.2;
    const step = steps(seg(t, 45.0, 45.8), 4);
    P.parmis(ctx, {
      x: 960, y: lerp(1090, 1050, step), h: 720, age: 1, legs: step >= 1, dress: P.dressAt(t, 'online', 'design', 49.4, 50.4),
      hair: { headset: 1 - steps(seg(t, 45.0, 45.4), 3) },
      armL: q ? [0.9, 2.2] : open > 0 ? [2.3 + wave(t, 2, 0.12), 0.4] : [0.3, 0.3],
      armR: open > 0 ? [2.3 - wave(t, 2, 0.12), 0.4] : [0.3, 0.3],
      tilt: q ? 0.08 : 0,
    });
    if (q || t > 49.2) {
      const v = vis(t, 46.9, 49.4);
      if (v) P.piece(ctx, { x: 1170, y: 300, w: 120, h: 150, kind: 'torn', seed: 650, fill: C.cream, scale: v, rot: 0.1, draw: () => P.text(ctx, '?', 0, 10, { f: 'serif', size: 150, color: C.orange }) });
    }
    // the ball becomes the big play button
    const ob = steps(seg(t, 49.0, 49.6), 5);
    const ball = [sx + 480 * (sw / 600), sy + 98 * (sh / 190)];
    const os = lerp(1.1 * lerp(1, 2, grow), 2.2, ob) * lerp(1, 0.5, steps(seg(t, 52.0, 52.8), 4));
    P.orange(ctx, lerp(ball[0], 960, E.inOut(ob)), lerp(ball[1], 150, E.inOut(ob)), os);
    if (ob >= 1 && t < 52) { ctx.fillStyle = C.cream; ctx.beginPath(); ctx.moveTo(950, 132); ctx.lineTo(950, 168); ctx.lineTo(978, 150); ctx.fill(); }
    chapter(ctx, 6);
    P.label(ctx, 'the design question', 70, 70, t, 45.4, 52.8);
    P.caption(ctx, ['What if the screen', 'were built for them?'], 90, 930, t, 48.8, 52.8, { size: 42 });
  }

  // =============================================== 7. Canada, BrainStation
  function cabin(ctx) {
    P.background(ctx, '#e7e2d8', false);
    ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = C.line; ctx.lineWidth = 3;
    for (let y = 120; y < H; y += 190) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();
  }
  const WIN = { x: 1440, y: 440, w: 380, h: 520, r: 170 };
  function planeWindow(ctx, t, rect, rad) {
    ctx.save();
    ctx.shadowColor = 'rgba(25,23,20,0.3)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#d3cdc1'; ctx.beginPath(); ctx.roundRect(rect.x - 30, rect.y - 30, rect.w + 60, rect.h + 60, rad + 30); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.roundRect(rect.x, rect.y, rect.w, rect.h, rad); ctx.clip();
    ctx.fillStyle = '#cbdbe4'; ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.globalAlpha = 0.18; ctx.fillStyle = P.pat(ctx, 'halftoneBig', C.cream); ctx.fillRect(rect.x, rect.y, rect.w, rect.h); ctx.globalAlpha = 1;
    // clouds slide by in steps
    const off = Math.floor(t * 4) * 18;
    for (let k = 0; k < 6; k++) {
      const cx = rect.x + ((k * 260 - off) % 1300 + 1300) % 1300 - 300, cy = rect.y + 100 + (k % 3) * rect.h * 0.28;
      P.piece(ctx, { x: cx, y: cy, w: 220, h: 90, kind: 'blob', seed: 700 + k, fill: C.cream, shadow: 0.6, boil: 0.5 });
    }
    ctx.restore();
    // window shade
    ctx.fillStyle = '#d3cdc1'; ctx.fillRect(rect.x + 10, rect.y - 24, rect.w - 20, 40);
  }
  function suitcase(ctx, x, y, s) {
    P.piece(ctx, { x, y: y + 80, w: 220, h: 170, seed: 710, fill: C.kraft, kind: 'round', tex: 'wood', texAlpha: 0.2, scale: s, shadow: 1.2,
      draw: (g, w, h) => {
        g.fillStyle = C.orange; g.fillRect(-w * 0.3, -h / 2, 22, h); g.fillRect(w * 0.3 - 22, -h / 2, 22, h);
        g.save(); g.translate(-8, 8); P.pic.maple(g, 1.3); g.restore();
        g.fillStyle = C.cream; g.save(); g.rotate(0.2); g.fillRect(w * 0.12, -h * 0.35, 60, 34); g.restore();
        P.text(g, 'CANADA', w * 0.17, -h * 0.24, { f: 'mono', size: 11, rot: 0.2, color: C.ink });
      } });
    ctx.save(); ctx.strokeStyle = C.ink2; ctx.lineWidth = 8 * s; ctx.beginPath(); ctx.roundRect(x - 40 * s, y - 20 * s, 80 * s, 40 * s, 14); ctx.stroke(); ctx.restore();
  }
  const NOTES_L = [
    ['big, clear', 'targets', 300, 330, C.mustard], ['pictures', '+ sound', 520, 320, C.pink], ['short, playful', 'steps', 330, 530, C.cream], ['let them', 'try again', 560, 540, C.mustard],
  ];
  const NOTES_R = [
    ['too many', 'tabs', 1370, 320, C.pink], ['who’s', 'lost?', 1590, 330, C.mustard], ['prep takes', 'hours', 1380, 530, C.cream], ['hard to', 'see work', 1610, 545, C.pink],
  ];
  function capstoneWall(ctx, t) {
    P.background(ctx, C.paper);
    P.piece(ctx, { x: 960, y: 430, w: 1800, h: 700, seed: 720, fill: '#d6bd96', tex: 'cork', texColor: C.wood, texAlpha: 0.5, shadow: 1.2, boil: 0.2 });
    // headings
    [['children’s needs', 430, 190], ['teacher pain points', 1490, 190]].forEach(([s, x, y], i) => {
      const v = pop(t, 56.6 + i * 0.3); if (!v) return;
      const w = P.measure(ctx, s.toUpperCase(), { f: 'mono', size: 20, weight: 500, ls: 3 }) + 44;
      P.piece(ctx, { x, y, w, h: 50, seed: 730 + i, fill: C.ink, scale: v, draw: () => P.text(ctx, s.toUpperCase(), 0, 1, { f: 'mono', size: 20, weight: 500, ls: 3, color: C.cream }) });
    });
    [...NOTES_L, ...NOTES_R].forEach(([a, b, x, y, col], i) => {
      const v = pop(t, 57.0 + i * 0.22);
      if (v) P.sticky(ctx, x, y, v, [a, b], col, 740 + i, ((i * 37) % 7 - 3) * 0.02, { w: 190, h: 150, size: 24 });
    });
    // simple flow
    const fl = ['join', 'warm-up', 'play', 'share'];
    fl.forEach((s, i) => {
      const v = pop(t, 58.6 + i * 0.15); if (!v) return;
      const x = 330 + i * 150 + (i > 1 ? 0 : 0), y = 700;
      P.piece(ctx, { x, y, w: 120, h: 56, seed: 760 + i, fill: C.cream, scale: v, draw: () => P.text(ctx, s, 0, 1, { f: 'mono', size: 17 }) });
      if (i < 3) P.scribble(ctx, [[x + 64, y], [x + 86, y]], { color: C.orange, width: 4, seed: 770 + i });
    });
    // accessibility reminders
    [['contrast', 1330, 700], ['read-aloud', 1520, 700], ['captions', 1700, 700]].forEach(([s, x, y], i) => {
      const v = pop(t, 59.0 + i * 0.15); if (!v) return;
      P.piece(ctx, { x, y, w: 170, h: 48, seed: 780 + i, fill: C.orange, scale: v, rot: (i - 1) * 0.04, draw: () => P.text(ctx, s, 0, 1, { f: 'mono', size: 18, color: C.cream }) });
    });
    // what teaching gave her, pinned and tied with orange thread
    const oldV = pop(t, 59.8);
    if (oldV) {
      P.picCard(ctx, 150, 700, oldV, P.pic.ball, 'b', 790, -0.1, { w: 110, h: 140 });
      P.piece(ctx, { x: 1810, y: 250, w: 120, h: 150, seed: 791, fill: C.cream, tex: 'grid', texAlpha: 0.25, scale: oldV, rot: 0.08, draw: (g) => P.pic.star(g, 1.4, C.orange) });
      const th = steps(seg(t, 60.1, 61.6), 8);
      [[[150, 640], [300, 400], [520, 380]], [[150, 640], [330, 590]], [[1810, 200], [1600, 250]], [[1810, 200], [1500, 400], [1380, 460]]].forEach((pts, i) => P.scribble(ctx, P.partial(pts, th), { color: C.orange, width: 3, seed: 800 + i, jit: 0.6 }));
    }
    // early screens
    [[1180, 880], [1320, 900]].forEach(([x, y], i) => {
      const v = pop(t, 60.4 + i * 0.2); if (!v) return;
      P.piece(ctx, { x, y, w: 150, h: 230, kind: 'round', seed: 810 + i, fill: C.cream, scale: v, rot: (i ? 0.08 : -0.05), shadow: 1.2,
        draw: (g, w, h) => { g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(-w * 0.38, -h * 0.4, w * 0.76, h * 0.8); P.sketchBox(g, -w * 0.3, -h * 0.32, w * 0.6, h * 0.3, i); P.pill(g, 0, h * 0.14, w * 0.5, 30, C.orange, i ? 'listen' : 'play', { size: 13 }); P.pill(g, 0, h * 0.28, w * 0.5, 22, C.ink); } });
    });
  }
  function sceneCanada(ctx, t) {
    const morph = steps(seg(t, 52.8, 53.8), 5);
    const toWall = steps(seg(t, 56.0, 57.0), 8);
    if (toWall < 1) {
      cabin(ctx);
      // monitor rounds into a plane window
      const rect = { x: lerp(MON.x + 26, WIN.x - WIN.w / 2, morph), y: lerp(MON.y + 26, WIN.y - WIN.h / 2, morph), w: lerp(MON.w - 52, WIN.w, morph), h: lerp(MON.h - 52, WIN.h, morph) };
      const rad = lerp(10, WIN.r, morph);
      if (morph < 1) { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(rect.x - 26 * (1 - morph), rect.y - 26 * (1 - morph), rect.w + 52 * (1 - morph), rect.h + 52 * (1 - morph), rad + 10); ctx.fill(); }
      planeWindow(ctx, t, rect, rad);
    }
    P.pasteReveal(ctx, WIN.x, WIN.y, toWall, 830, () => capstoneWall(ctx, t));
    // maple leaf drifts down
    const leaf = seg(t, 54.6, 57.4);
    if (leaf > 0 && leaf < 1) { const k = steps(leaf, 30); ctx.save(); ctx.translate(lerp(1300, 700, k) + Math.sin(k * 12) * 60, lerp(-60, 1000, k)); ctx.rotate(Math.sin(k * 9) * 0.8); P.pic.maple(ctx, 2.2); ctx.restore(); }

    const pr = P.parmis(ctx, {
      x: 960, y: 1050, h: 720, age: 1, dress: P.dressAt(t, 'design', 'research', 56.6, 57.6),
      armL: t < 56.2 ? [0.2, 0.1] : [0.4, 1.4], armR: t < 56.2 ? [0.25, 0] : t > 59.9 ? [2.2, 0.6] : [0.3, 1.0],
      holdL: t >= 56.2 ? (c, x, y) => P.piece(c, { x: x + 20, y: y - 20, w: 110, h: 80, seed: 820, fill: C.cream, tex: 'ruled', texColor: C.sky, texAlpha: 0.5, rot: -0.1, scale: pop(t, 56.4) }) : null,
      holdR: t < 56.2 ? (c, x, y) => suitcase(c, x + 10, y + 16, pop(t, 53.2)) : null,
    });
    // the orange shape: the sun outside, then a pin on the wall
    if (toWall < 0.5) P.orange(ctx, lerp(960, WIN.x + 90, morph), lerp(150, WIN.y - 130, morph), lerp(1.1, 1.3, morph));
    else P.orange(ctx, 150, 626, 0.7);
    chapter(ctx, 7);
    P.label(ctx, 'Canada', 70, 70, t, 53.4, 56.3);
    P.label(ctx, 'BrainStation · capstone', 70, 70, t, 56.5, 62.8);
    P.caption(ctx, ['A teaching platform', 'for young children.'], 90, 900, t, 57.2, 62.9, { size: 42 });
  }

  // ======================================================= 8. Volante
  function studio(ctx, t, pull) {
    P.background(ctx, '#f1ece2');
    // the orange thread, quietly in the background
    ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(25,23,20,0.2)'; ctx.shadowBlur = 3; ctx.shadowOffsetY = 2;
    ctx.beginPath();
    const sway = Math.sin(Math.floor(t * 3)) * 10 * (1 - pull);
    for (let x = -20; x <= 1940; x += 40) ctx.lineTo(x, 820 + Math.sin(x / 170 + 1) * 40 * (1 - pull) + sway * Math.sin(x / 300));
    ctx.stroke(); ctx.restore();
    // accessibility pieces, pinned high
    const acc = [
      { x: 380, y: 170, t0: 66.4, d: (g) => P.pic.access(g, 1.8), w: 110, h: 110, fill: C.cream },
      { x: 560, y: 175, t0: 66.6, d: () => P.text(ctx, 'Aa', 0, 4, { f: 'serif', size: 56, color: C.cream }), w: 110, h: 100, fill: C.ink },
      { x: 700, y: 165, t0: 66.8, d: () => P.text(ctx, 'Aa', 0, 4, { f: 'serif', size: 56, color: C.ink }), w: 110, h: 100, fill: C.cream },
      { x: 1250, y: 170, t0: 67.0, d: () => P.text(ctx, 'CC', 0, 2, { f: 'mono', size: 36, weight: 500, color: C.cream }), w: 110, h: 80, fill: C.ink },
      { x: 1410, y: 175, t0: 67.2, d: () => P.text(ctx, 'tab ⇥', 0, 2, { f: 'mono', size: 26, color: C.ink }), w: 140, h: 80, fill: C.cream, kind: 'round' },
      { x: 1580, y: 165, t0: 67.4, d: () => P.text(ctx, 'alt text', 0, 2, { f: 'mono', size: 22, color: C.cream }), w: 150, h: 60, fill: C.orange },
    ];
    acc.forEach((a, i) => { const v = pop(t, a.t0); if (v) P.piece(ctx, { x: a.x, y: a.y, w: a.w, h: a.h, seed: 900 + i, fill: a.fill, kind: a.kind, scale: v, rot: ((i * 5) % 3 - 1) * 0.05, draw: a.d }); });
  }
  const USERS = [{ x: 330, seed: 911, glasses: true, hairType: 0 }, { x: 1590, seed: 912, hairType: 4 }, { x: 1370, seed: 913, hairType: 1, laptop: true }];
  function volantePeople(ctx, t) {
    // users, in conversation
    const talk = (i) => Math.floor(Math.max(0, t - 63.6) / 1.1) % 3 === i && t < 69;
    P.person(ctx, { x: USERS[0].x, y: 1000, h: 420, adult: true, seed: USERS[0].seed, glasses: true, hairType: 0, mouth: talk(0) ? 'open' : 'smile', look: 1, armR: talk(0) ? [0.9, 1.4] : [0.2, 0.3] });
    P.person(ctx, { x: USERS[1].x, y: 1000, h: 420, adult: true, seed: USERS[1].seed, hairType: 4, mouth: talk(1) ? 'open' : 'smile', look: -1, armL: talk(1) ? [0.9, 1.5] : [0.2, 0.3] });
    // one joins from a laptop
    const lv = pop(t, 64.4);
    P.piece(ctx, { x: 560, y: 620, w: 260, h: 170, seed: 915, fill: C.ink, kind: 'round', shadow: 1.2, scale: lv,
      draw: (g, w, h) => { g.fillStyle = C.skyPale; g.fillRect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24); } });
    if (lv >= 1) { ctx.save(); ctx.beginPath(); ctx.rect(442, 547, 236, 146); ctx.clip(); P.person(ctx, { x: 560, y: 720, h: 200, adult: true, seed: 913, hairType: 1, mouth: talk(2) ? 'open' : 'smile' }); ctx.restore(); }
    // bubbles: scribbles only, no invented quotes
    [[USERS[0].x + 60, 560, 0], [USERS[1].x - 60, 560, 1], [560, 470, 2]].forEach(([x, y, i]) => {
      if (!talk(i)) return;
      P.bubble(ctx, x, y, pop(t, 63.6 + i * 1.1 + Math.floor((t - 63.6) / 3.3) * 3.3), (g) => { g.fillStyle = 'rgba(25,23,20,0.5)'; [[-50, -12, 100], [-50, 4, 70], [-50, 20, 84]].forEach(([a, b, w]) => g.fillRect(a, b, w, 4)); }, { seed: 920 + i, w: 170, h: 100, tail: [i === 1 ? 0.2 : -0.2, 1] });
    });
    [['user interviews', 330, 430, 63.8], ['accessibility', 470, 280, 66.4], ['equal access', 1390, 280, 67.2]].forEach(([s, x, y, t0], i) => {
      const v = vis(t, t0, 69.4);
      if (!v) return;
      const w = P.measure(ctx, s.toUpperCase(), { f: 'mono', size: 16, ls: 2 }) + 30;
      P.piece(ctx, { x, y, w, h: 36, seed: 930 + i, fill: i === 2 ? C.orange : C.cream, scale: v, rot: (i - 1) * 0.03, draw: () => P.text(ctx, s.toUpperCase(), 0, 1, { f: 'mono', size: 16, ls: 2, color: i === 2 ? C.cream : C.ink }) });
    });
  }
  const THREAD_Y = (x) => 820 + Math.sin(x / 170 + 1) * 40;
  function sceneVolante(ctx, t) {
    const reveal = steps(seg(t, 62.6, 63.6), 8);
    const pull = steps(seg(t, 69.2, 70.0), 5);
    if (reveal < 1) capstoneWall(ctx, t);
    P.pasteReveal(ctx, 1590, 330, reveal, 930, () => studio(ctx, t, pull));
    if (reveal < 1) { const v = 1 + steps(seg(t, 62.4, 63.0), 4) * 0.8; P.sticky(ctx, 1590, 330, v, ['who’s', 'lost?'], C.mustard, 745, 0, { w: 190, h: 150, size: 24 }); }
    if (reveal > 0.3) volantePeople(ctx, t);
    // Parmis listens and takes notes
    P.parmis(ctx, {
      x: 960, y: 1050, h: 720, age: 1, dress: P.dressAt(t, 'research', 'volante', 63.8, 64.8),
      armL: [0.5, 1.5], armR: [0.5, 1.2 + wave(t, 4, 0.08)],
      holdL: (c, x, y) => P.piece(c, { x: x + 30, y: y - 30, w: 120, h: 150, seed: 940, fill: C.cream, tex: 'ruled', texColor: C.sky, texAlpha: 0.5, rot: 0.1, draw: (g, w, h) => { g.fillStyle = 'rgba(25,23,20,0.4)'; for (let k = 0; k < Math.min(5, Math.floor((t - 63) * 1.2)); k++) g.fillRect(-w * 0.35, -h * 0.3 + k * 22, w * (0.4 + (k % 3) * 0.12), 3); } }),
      tilt: Math.floor(t / 1.1) % 2 ? 0.04 : -0.04,
    });
    // the orange shape hops from the pin to the thread, rides it, then comes forward
    if (t < 63.6) { const [x, y] = arcHop(t, 62.6, 63.6, [150, 626], [1780, THREAD_Y(1780)], 300); P.orange(ctx, x, y, lerp(0.7, 0.55, seg(t, 62.6, 63.6))); }
    else if (t < 69.2) P.orange(ctx, 1780, THREAD_Y(1780) + Math.sin(Math.floor(t * 3)) * 10 * Math.sin(1780 / 300), 0.55);
    else { const along = steps(seg(t, 69.2, 70.2), 6); P.orange(ctx, lerp(1780, 960, along), lerp(THREAD_Y(1780), 330, along), lerp(0.55, 1, along)); }
    // the thread tugs a browser window in
    if (pull > 0) P.browser(ctx, lerp(2300, 1525, pull), 500, 610, 660, 1, 1001, { url: 'orange / team' }, null);
    chapter(ctx, 8);
    P.label(ctx, 'Volante · UX designer', 70, 70, t, 63.5, 69.6);
    P.caption(ctx, ['Designing for equal access.'], 90, 1010, t, 66.8, 69.8, { size: 42 });
  }

  // ================================================= 9. back to Orange
  const PUB = { x: 395, y: 500, w: 610, h: 660 }, TEAM = { x: 1525, y: 500, w: 610, h: 660 };
  function publicSite(g, w, h, t) {
    const b = (k) => pop(t, 70.8 + k * 0.25);
    const page = t < 75.9 ? 0 : t < 77.3 ? 1 : 2; // home, question, result
    g.fillStyle = C.cream; g.fillRect(0, 0, w, h);
    if (b(0)) { g.fillStyle = C.paper2; g.fillRect(0, 0, w, 56); P.text(g, 'Orange Language Institute', 64, 29, { f: 'serif', size: 26, align: 'left' }); P.text(g, 'classes   about   contact', w - 20, 29, { f: 'mono', size: 12, align: 'right', color: C.muted }); }
    if (page === 0) {
      if (b(1)) { P.text(g, 'Learn English', 30, 118, { f: 'serif', size: 50, align: 'left' }); P.text(g, 'with us.', 30, 168, { f: 'serif', italic: true, size: 50, align: 'left', color: C.orange }); }
      if (b(2)) { g.save(); g.translate(w - 150, 150); g.scale(0.28, 0.28); g.fillStyle = '#e2cfae'; g.fillRect(-300, -220, 600, 440); g.fillStyle = C.orange; g.fillRect(-90, -40, 180, 260); g.fillStyle = C.cream; g.fillRect(-260, -200, 520, 110); P.text(g, 'Orange', 0, -145, { f: 'serif', size: 90, color: C.orange }); g.restore(); }
      if (b(3)) ['kids', 'teens', 'adults'].forEach((s, i) => { g.fillStyle = C.paper2; g.beginPath(); g.roundRect(30 + i * 185, 240, 170, 120, 12); g.fill(); P.text(g, s, 115 + i * 185, 330, { f: 'serif', size: 28 }); g.save(); g.translate(115 + i * 185, 285); P.pic[['sun', 'star', 'speech'][i]](g, 1.1, i === 2 ? C.ink : undefined); g.restore(); });
      if (b(4)) { const pressed = t > 75.6; P.pill(g, w / 2, 450, 360, 70, pressed ? C.ink : C.orange, 'Take the placement test', { size: 22 }); }
      if (b(4)) P.text(g, 'our team reviews every result', w / 2, 510, { f: 'mono', size: 12, color: C.muted });
    } else if (page === 1) {
      P.text(g, 'PLACEMENT TEST', 30, 100, { f: 'mono', size: 14, align: 'left', color: C.orange, ls: 3 });
      P.text(g, 'Choose the best word:', 30, 150, { f: 'sans', size: 24, weight: 500, align: 'left' });
      P.text(g, 'She ____ to school every day.', 30, 215, { f: 'serif', size: 40, align: 'left' });
      const chosen = t > 76.6;
      ['go', 'goes', 'going'].forEach((s, i) => { const sel = chosen && i === 1; g.fillStyle = sel ? C.orange : C.paper2; g.beginPath(); g.roundRect(30, 270 + i * 80, w - 60, 64, 12); g.fill(); P.text(g, s, 60, 302 + i * 80, { f: 'serif', size: 32, align: 'left', color: sel ? C.cream : C.ink }); });
    } else {
      P.text(g, 'THANK YOU', 30, 100, { f: 'mono', size: 14, align: 'left', color: C.orange, ls: 3 });
      P.text(g, 'Your suggested level', 30, 160, { f: 'serif', size: 44, align: 'left' });
      g.fillStyle = C.paper2; g.beginPath(); g.roundRect(30, 200, w - 60, 150, 14); g.fill();
      g.fillStyle = 'rgba(25,23,20,0.35)'; g.fillRect(60, 240, 220, 10); g.fillRect(60, 270, 160, 10);
      g.save(); g.translate(w - 150, 300); g.rotate(-0.12); g.strokeStyle = C.orange; g.lineWidth = 3; g.strokeRect(-100, -26, 200, 52); P.text(g, 'PROVISIONAL', 0, 1, { f: 'mono', size: 18, weight: 500, color: C.orange, ls: 3 }); g.restore();
      P.text(g, 'Our team will review this', 30, 410, { f: 'sans', size: 22, weight: 500, align: 'left' });
      P.text(g, 'and help you choose a class.', 30, 442, { f: 'sans', size: 22, weight: 500, align: 'left' });
    }
  }
  function teamSite(g, w, h, t) {
    const b = (k) => pop(t, 71.5 + k * 0.25);
    g.fillStyle = C.cream; g.fillRect(0, 0, w, h);
    if (b(0)) { g.fillStyle = C.ink; g.fillRect(0, 0, w, 56); P.text(g, 'Orange · team', 24, 29, { f: 'serif', size: 26, align: 'left', color: C.cream }); P.text(g, 'INTERNAL', w - 20, 29, { f: 'mono', size: 12, align: 'right', color: C.mustard, ls: 2 }); }
    if (b(1)) P.text(g, 'New placement results', 24, 100, { f: 'serif', size: 32, align: 'left' });
    const stage = t < 78.6 ? 0 : t < 79.4 ? 1 : t < 80.2 ? 2 : 3;
    [0, 1, 2].forEach((r) => {
      if (!b(2 + r)) return;
      const y = 140 + r * 120, hl = r === 0 && t > 78.3;
      g.fillStyle = hl ? C.orangeTint : C.paper2; g.beginPath(); g.roundRect(20, y, w - 40, 100, 12); g.fill();
      g.fillStyle = C.tan; g.beginPath(); g.arc(62, y + 50, 24, 0, 7); g.fill();
      g.fillStyle = 'rgba(25,23,20,0.4)'; g.fillRect(100, y + 32, 140, 9); g.fillRect(100, y + 56, 90, 8);
      const chip = r === 0 ? ['to review', 'reviewed ✓', 'talk with learner', 'find a class'][stage] : 'to review';
      const cw = P.measure(g, chip, { f: 'mono', size: 14 }) + 30;
      P.pill(g, w - 40 - cw / 2, y + 50, cw, 34, r === 0 && stage > 0 ? C.orange : C.cream, chip, { f: 'mono', size: 14, weight: 500, color: r === 0 && stage > 0 ? C.cream : C.ink, stroke: C.ink2 });
    });
    if (stage === 3) {
      P.text(g, 'Class options — confirm with the learner', 24, 530, { f: 'sans', size: 17, weight: 500, align: 'left' });
      [0, 1, 2].forEach((k) => { g.fillStyle = k === 1 ? C.orange : C.paper2; g.beginPath(); g.roundRect(24 + k * 190, 555, 170, 70, 12); g.fill(); g.fillStyle = k === 1 ? 'rgba(251,248,241,0.8)' : 'rgba(25,23,20,0.35)'; g.fillRect(44 + k * 190, 580, 100, 8); g.fillRect(44 + k * 190, 600, 60, 8); });
    }
  }
  function sceneReturn(ctx, t) {
    // the studio peels away from the browser the thread pulled in
    const clear = steps(seg(t, 70.2, 71.0), 8);
    if (clear < 1) { studio(ctx, t, 1); volantePeople(ctx, t); }
    P.pasteReveal(ctx, TEAM.x, TEAM.y, clear, 1050, () => P.background(ctx, C.paper));
    const shrink = steps(seg(t, 81.0, 81.9), 6);
    const sc = 1 - shrink;
    // browsers fly onto her dress at the end
    const pos = (B) => [lerp(B.x, 960, E.in(shrink)), lerp(B.y, 780, E.in(shrink))];
    if (sc > 0.02) {
      const [px, py] = pos(PUB), [tx, ty] = pos(TEAM);
      P.browser(ctx, px, py, PUB.w, PUB.h, pop(t, 70.4) * sc, 1000, { url: 'orange / public site' }, (g, w, h) => publicSite(g, w, h, t));
      P.browser(ctx, tx, ty, TEAM.w, TEAM.h, sc, 1001, { url: 'orange / team' }, (g, w, h) => teamSite(g, w, h, t));
    }
    // a visitor explores the site; a staff member reviews
    if (sc > 0.5) {
      const vv = pop(t, 72.8), sv = pop(t, 78.0);
      if (vv) P.person(ctx, { x: 110, y: 1100, h: 300 * vv, adult: true, seed: 1011, hairType: 3, look: 1, armR: t > 75.3 && t < 76.8 ? [1.9, 0.6] : [0.3, 0.6] });
      if (sv) P.person(ctx, { x: 1830, y: 1100, h: 300 * sv, adult: true, seed: 1012, hairType: 0, glasses: true, look: -1, armL: [1.6, 0.9], mouth: t > 79.3 && t < 80.2 ? 'open' : 'smile' });
      if (t > 79.3 && t < 80.4) P.bubble(ctx, 1700, 880, pop(t, 79.3), (g) => P.pic.speech(g, 1.4), { seed: 1013, w: 110, h: 80, tail: [0.2, 1] });
      // the visitor's cursor
      const cp = seg(t, 74.6, 75.6);
      if (t > 74.0 && t < 77.3) {
        const cx = lerp(250, PUB.x + 20, E.inOut(steps(cp, 6))) + (t > 76.3 ? -160 : 0), cy = lerp(900, PUB.y - PUB.h / 2 + 34 + 450, E.inOut(steps(cp, 6))) + (t > 76.3 ? -60 : 0);
        ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 34); ctx.lineTo(9, 26); ctx.lineTo(16, 40); ctx.lineTo(22, 37); ctx.lineTo(15, 23); ctx.lineTo(26, 22); ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
    // tools: AI sparkles and code brackets orbit her hands while she builds
    const building = t > 70.4 && t < 73.6;
    const g = P.parmis(ctx, {
      x: 960, y: 1050, h: 720, age: 1, dress: t < 81 ? P.dressAt(t, 'volante', 'builder', 70.8, 71.8) : P.dressAt(t, 'builder', 'all', 81.6, 82.6),
      armL: building ? [1.5 + wave(t, 2, 0.15), 0.7] : [0.35, 0.3], armR: building ? [1.5 - wave(t, 2, 0.15), 0.7] : t > 80.4 ? [0.8, 1.9] : [0.35, 0.3],
    });
    if (building) {
      const k = Math.floor(t * 6);
      [0, 1, 2, 3].forEach((i) => {
        const a = k * 0.5 + i * (Math.PI / 2), hand = i % 2 ? g.handR : g.handL;
        ctx.save(); ctx.translate(hand[0] + Math.cos(a) * 70, hand[1] - 40 + Math.sin(a) * 50);
        if (i < 2) P.pic.sparkle(ctx, 1.2, i ? C.mustard : C.orange);
        else P.piece(ctx, { x: 0, y: 0, w: 70, h: 36, seed: 1020 + i, fill: C.ink, draw: () => P.text(ctx, '</>', 0, 1, { f: 'mono', size: 18, color: C.mustard }) });
        ctx.restore();
      });
    }
    // the orange shape: logo of the public site, then into her hands
    {
      const toHands = steps(seg(t, 80.4, 81.2), 6);
      const lx = PUB.x - PUB.w / 2 + 32, ly = PUB.y - PUB.h / 2 + 34 + 28;
      const hx = (g.handL[0] + g.handR[0]) / 2, hy = Math.min(g.handL[1], g.handR[1]) - 10;
      if (t < 71.0) { const [x, y] = arcHop(t, 70.2, 71.0, [960, 330], [lx, ly], 160); P.orange(ctx, x, y, lerp(1, 0.42, seg(t, 70.2, 71.0))); }
      else { const [x, y] = toHands > 0 ? arcHop(t, 80.4, 81.2, [lx, ly], [hx, hy], 200) : [lx, ly]; P.orange(ctx, x, y, lerp(0.42, 1.1, toHands)); }
    }
    chapter(ctx, 9);
    P.label(ctx, 'years later · back to Orange', 70, 70, t, 70.4, 80.8);
    [['public site', PUB.x - PUB.w / 2, 125, 72.6], ['team site', TEAM.x - TEAM.w / 2, 125, 78.0]].forEach(([s, x, y, t0]) => { const v = vis(t, t0, 80.9); if (v) P.text(ctx, '↓ ' + s.toUpperCase(), x + 8, y + 18, { f: 'mono', size: 15, align: 'left', color: C.muted, ls: 2, alpha: v > 0.9 ? 1 : v }); });
  }

  // ======================================================= 10. closing
  const BURST = [];
  (() => {
    const r = P.rng(1100);
    const kinds = ['page', 'tile', 'sign', 'sheet', 'block', 'phon', 'cam', 'slide', 'sticky', 'flow', 'bubble', 'access', 'browser', 'spark'];
    for (let i = 0; i < 30; i++) {
      const ring = i < 14 ? 0 : 1;
      const a = (i / (ring ? 16 : 14)) * Math.PI * 2 + (ring ? 0.2 : 0) + (r() - 0.5) * 0.2;
      const d = (ring ? 700 : 480) + (r() - 0.5) * 80;
      BURST.push({ a, d, kind: kinds[i % kinds.length], rot: (r() - 0.5) * 0.7, t0: 82.0 + r() * 1.8, seed: 1100 + i });
    }
  })();
  function burstPiece(ctx, b, x, y, s) {
    const S = (o) => P.piece(ctx, { x, y, rot: b.rot, seed: b.seed, scale: s, ...o });
    switch (b.kind) {
      case 'page': return S({ w: 140, h: 110, kind: 'torn', fill: C.cream, draw: (g, w, h) => P.bookPage(g, w, h, b.seed) });
      case 'tile': return P.alphaTile(ctx, 'A', x, y, s * 1.2, C.sky, b.seed, b.rot);
      case 'sign': return S({ w: 200, h: 70, fill: C.cream, draw: () => P.text(ctx, 'Orange', 0, 2, { f: 'serif', size: 50, color: C.orange }) });
      case 'sheet': return S({ w: 110, h: 140, fill: C.cream, tex: 'grid', texAlpha: 0.25, draw: (g) => P.pic.star(g, 1.3, C.orange) });
      case 'block': return P.pinkBlock(ctx, x, y, 70 * s, b.seed);
      case 'phon': return P.alphaTile(ctx, 's', x, y, s * 1.3, C.orange, b.seed, b.rot);
      case 'cam': return S({ w: 150, h: 100, fill: C.ink, kind: 'round', draw: (g, w, h) => { g.fillStyle = C.mustard; g.fillRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12); g.fillStyle = C.ink2; g.beginPath(); g.arc(0, 0, 18, 0, 7); g.fill(); g.fillRect(-26, 18, 52, 30); } });
      case 'slide': return S({ w: 190, h: 110, fill: C.cream, draw: (g, w, h) => { g.fillStyle = C.ink; g.fillRect(-w / 2, -h / 2, w, 20); P.text(g, 'b', -40, 16, { f: 'serif', size: 60, color: C.orange }); g.save(); g.translate(40, 14); P.pic.bee(g, 1.2); g.restore(); } });
      case 'sticky': return P.sticky(ctx, x, y, s, ['who’s', 'lost?'], C.mustard, b.seed, b.rot, { w: 140, h: 110, size: 20 });
      case 'flow': return S({ w: 190, h: 60, fill: C.cream, draw: (g) => { P.text(g, 'join → play', 0, 1, { f: 'mono', size: 18 }); } });
      case 'bubble': return P.bubble(ctx, x, y, s, (g) => { g.fillStyle = 'rgba(25,23,20,0.5)'; g.fillRect(-40, -8, 80, 4); g.fillRect(-40, 6, 56, 4); }, { seed: b.seed, w: 130, h: 80 });
      case 'access': { ctx.save(); ctx.translate(x, y); P.pic.access(ctx, 1.8 * s); ctx.restore(); return; }
      case 'browser': return P.browser(ctx, x, y, 200, 150, s, b.seed, {}, (g, w, h) => { g.fillStyle = C.orange; g.fillRect(0, 0, w, 24); P.pill(g, w / 2, h - 36, 110, 26, C.orange); });
      default: { ctx.save(); ctx.translate(x, y); P.pic.sparkle(ctx, 1.4 * s, C.mustard); ctx.restore(); }
    }
  }
  function sceneClose(ctx, t) {
    P.background(ctx, C.paper);
    const cx = 960, cy = 470;
    // sunburst rays
    const rv = steps(seg(t, 81.9, 82.9), 5);
    if (rv > 0) {
      ctx.save(); ctx.translate(cx, cy);
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2 + Math.floor(t * 2) * 0.004;
        ctx.fillStyle = k % 2 ? 'rgba(231,68,39,0.13)' : 'rgba(239,180,63,0.12)';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 1300 * rv, a, a + Math.PI / 24); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    // every chapter flies in and settles around her
    BURST.forEach((b) => {
      const p = steps(seg(t, b.t0, b.t0 + 0.7), 6);
      if (p <= 0) return;
      const e = E.out(p);
      const d = lerp(1500, b.d, e);
      const x = cx + Math.cos(b.a) * d * 1.25, y = cy + Math.sin(b.a) * d * 0.72;
      if (t > 87.6 && Math.abs(x - 960) < 360 && y < 240) return; // clear the space for her name
      burstPiece(ctx, b, x, y, 1);
    });
    const g = P.parmis(ctx, {
      x: 960, y: 1000, h: 700, age: 1, dress: P.dressAt(t, 'builder', 'all', 81.6, 82.6),
      armL: [0.8, 1.9], armR: [0.8, 1.9],
    });
    const hx = (g.handL[0] + g.handR[0]) / 2, hy = Math.min(g.handL[1], g.handR[1]) - 10;
    P.orange(ctx, hx, hy, 1.1);
    // closing words
    const lines = [['I grew up with Orange.', 85.0], ['Then I helped it grow in a new way.', 86.6]];
    lines.forEach(([s, t0], i) => {
      const v = pop(t, t0);
      if (!v) return;
      const w = P.measure(ctx, s, { f: 'serif', size: 54, italic: i === 1 }) + 70;
      P.piece(ctx, { x: 960, y: 900 + i * 86, w, h: 80, kind: 'torn', seed: 1200 + i, fill: C.cream, scale: v, rot: i ? 0.006 : -0.008, shadow: 1.2,
        draw: () => P.text(ctx, s, 0, 2, { f: 'serif', size: 54, italic: i === 1, color: i ? C.orange : C.ink }) });
    });
    const nv = pop(t, 88.0);
    if (nv) {
      const w = P.measure(ctx, 'Parmis Meshgi', { f: 'serif', size: 66 }) + 80;
      P.piece(ctx, { x: 960, y: 90, w, h: 96, seed: 1210, fill: C.ink, scale: nv, rot: -0.01, shadow: 1.4, draw: () => P.text(ctx, 'Parmis Meshgi', 0, 3, { f: 'serif', size: 66, color: C.cream }) });
      if (t > 88.4) P.text(ctx, 'UX DESIGNER · PORTFOLIO FILM', 960, 170, { f: 'mono', size: 15, ls: 3, color: C.ink2 });
    }
    chapter(ctx, 10);
  }

  // ============================================================ timeline
  const SCENES = [
    [0, 9, sceneChild], [9, 17, sceneOrange], [17, 25.7, sceneTeacher], [25.7, 35.2, sceneEarly], [35.2, 45, sceneOnline],
    [45, 52.8, sceneQuestion], [52.8, 62.6, sceneCanada], [62.6, 70.2, sceneVolante], [70.2, 81.9, sceneReturn], [81.9, 90.01, sceneClose],
  ];
  P.render = (ctx, t) => {
    P.setTime(t);
    t = P.T;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const sc = SCENES.find(([a, b]) => t >= a && t < b) || SCENES[SCENES.length - 1];
    sc[2](ctx, t);
    // the orange shape in chapters 1–2 (other chapters place it themselves)
    if (t < 9.6) orangeEarly(ctx, t);
    else if (t < 17) orangeMid(ctx, t);
    P.finish(ctx);
    ctx.restore();
  };

  function orangeEarly(ctx, t) {
    // drops in, bounces on the title, hops into the notebook, becomes paper
    if (t < 0.25) return;
    if (t < 1.6) {
      const p = steps(seg(t, 0.25, 0.9), 6);
      const y = lerp(-80, 232, E.in(p)) - (t > 0.9 ? Math.abs(Math.sin((t - 0.9) * 7)) * 40 * Math.max(0, 1 - (t - 0.9) * 1.5) : 0);
      P.orange(ctx, 960, y, 1.2);
      return;
    }
    const nb = t < 7.8 ? [960 + 78, 800] : [960 + 78, lerp(800, 330, E.inOut(steps(seg(t, 7.8, 8.6), 6)))];
    if (t < 2.9) { const [x, y] = arcHop(t, 1.6, 2.9, [960, 232], nb, 200); P.orange(ctx, x, y, lerp(1.2, 0.8, seg(t, 1.6, 2.9))); return; }
    if (t < 8.6) P.orange(ctx, nb[0], nb[1] + 4, 0.8 * (t < 3.4 ? steps(seg(t, 2.9, 3.4), 3) * 0.2 + 0.8 : 1));
    else { const k = steps(seg(t, 8.6, 9.6), 6); P.orange(ctx, lerp(nb[0], ORANGE_ON_SIGN[0], k), lerp(330, ORANGE_ON_SIGN[1], k), 0.8); }
  }
  const ORANGE_ON_SIGN = [SIGN.x + 250, SIGN.y - 70];
  function orangeMid(ctx, t) {
    const home = ORANGE_ON_SIGN;
    if (t < 15.8) { P.orange(ctx, home[0], home[1], 0.8); return; }
    if (t < 16.4) { const [x, y] = arcHop(t, 15.8, 16.4, home, [1780, 780], 120); P.orange(ctx, x, y, 0.8); return; }
    // rides the flying sheet, lands as a magnet on the whiteboard
    const p = E.inOut(steps(seg(t, 16.4, 17.2), 8));
    P.orange(ctx, lerp(1780, 1080, p), lerp(780, 150, p), lerp(0.8, 0.9, p));
  }
})();
