// People. Parmis is built around her real portrait (a photo cut-out); her body
// and clothes are paper. Everyone else is simple paper, kept secondary.
(() => {
  const P = window.P, C = P.COL, lerp = P.lerp;
  // Three photo cut-outs: childhood (ages 7 and 12), age 20 (university years) and today.
  // sy = shoulder line as a fraction of the cut-out's height, just under the chin.
  const HEADS = { adult: { key: 'HEAD', ar: 651 / 837, sy: 0.86 }, child: { key: 'HEAD_CHILD', ar: 477 / 611, sy: 0.9 }, twenty: { key: 'HEAD_20', ar: 406 / 390, sy: 0.9 } };

  const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

  // a limb segment as a paper strip from (x0,y0) to (x1,y1)
  function limb(ctx, x0, y0, x1, y1, w, fill, seed, tex, texColor) {
    const L = Math.hypot(x1 - x0, y1 - y0);
    P.piece(ctx, {
      x: (x0 + x1) / 2, y: (y0 + y1) / 2, w, h: L + w * 0.5, seed, fill, kind: 'cut', shadow: 0.6, boil: 0.4,
      rot: Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2, tex, texAlpha: 0.18, texColor,
    });
  }
  function handPiece(ctx, x, y, r, fill, seed) {
    P.piece(ctx, { x, y, w: r * 2, h: r * 2.1, seed, fill, kind: 'circle', shadow: 0.6, boil: 0.4 });
  }

  // arm: returns the hand position. side -1 = screen-left, +1 = screen-right.
  // ang = [upper, bend]; upper swings outward, bend folds the forearm in.
  function arm(ctx, sx, sy, side, ang, ua, fa, w, sleeve, skin, seed, o = {}) {
    const [a1, a2] = ang || [0.12, 0];
    const rU = side < 0 ? a1 : -a1;
    const rF = side < 0 ? a1 - a2 : -(a1 - a2);
    const [ex, ey] = rot(0, ua, rU).map((v, i) => v + (i ? sy : sx));
    const [hx, hy] = rot(0, fa, rF).map((v, i) => v + (i ? ey : ex));
    limb(ctx, ex, ey, hx, hy, w * 0.82, skin, seed + 2);
    limb(ctx, sx, sy, ex, ey, w, sleeve.fill, seed + 1, sleeve.tex, sleeve.texColor);
    if (!o.noHand) handPiece(ctx, hx, hy, w * 0.6, skin, seed + 3);
    return [hx, hy];
  }
  P.arm = arm;

  // ---------------------------------------------------------------- Parmis
  // o: x, y (feet line), h (height), age (0 = seven, 0.4 = twelve, 1 = adult),
  //    dress (stage name or {from, to, p}), armL/armR ([upper, bend]),
  //    holdL/holdR(ctx, x, y), tilt, head ('child' | 'twenty' | 'adult'), hair {pencil, headset},
  //    legs (default true), sleeve {fill, tex}
  P.parmis = (ctx, o) => {
    const a = o.age == null ? 1 : o.age;
    const hd = HEADS[o.head || 'adult'];
    const h = o.h, hf = lerp(0.45, 0.33, a), hh = h * hf, hw = hh * hd.ar;
    const b = P.boil(9001, 0.7);
    const x = o.x + b.x * 0.6, top = o.y - h;
    const sy = top + hh * hd.sy;
    const sw = hh * lerp(0.3, 0.37, a);
    const hemY = o.y - h * lerp(0.19, 0.085, a);
    const hemW = sw * lerp(1.38, 1.5, a);
    const hair = o.hair || {};
    const ua = h * lerp(0.15, 0.16, a), fa = h * lerp(0.14, 0.15, a), aw = hh * lerp(0.14, 0.125, a);
    const st = P.dressStage(o.dress);
    const sleeve = o.sleeve || st.sleeve;
    const out = { x, top, sy, hh, hw, hemY, headCy: top + hh * 0.5 };

    ctx.save();
    // legs
    if (o.legs !== false) {
      const legW = sw * 0.34;
      [-1, 1].forEach((s, i) => {
        const lx = x + s * hemW * 0.32, footY = o.y;
        P.piece(ctx, { x: lx, y: (hemY + footY) / 2 - 8, w: legW, h: footY - hemY + 12, seed: 300 + i, fill: C.skin, boil: 0.3, shadow: 0.5 });
        if (a < 0.6) P.piece(ctx, { x: lx, y: footY - (footY - hemY) * 0.28, w: legW * 1.12, h: (footY - hemY) * 0.42, seed: 310 + i, fill: C.cream, boil: 0.3, shadow: 0.4,
          draw: (g, w2, h2) => { g.fillStyle = C.orange; g.fillRect(-w2 / 2, -h2 / 2 + 6, w2, 5); } });
        P.piece(ctx, { x: lx + s * 5, y: footY - 4, w: legW * 1.7, h: legW * 0.72, seed: 320 + i, fill: a < 0.6 ? C.orange : C.ink, kind: 'round', boil: 0.3, shadow: 0.6 });
      });
    }

    // hair behind the head
    // the dress
    const dressPath = () => {
      ctx.beginPath();
      ctx.moveTo(x - hh * 0.13, sy - hh * 0.03);
      ctx.lineTo(x - sw, sy + hh * 0.05);
      ctx.lineTo(x - sw * 0.98, sy + hh * 0.26);
      ctx.lineTo(x - sw * 0.84, sy + (hemY - sy) * 0.4);
      ctx.lineTo(x - hemW, hemY);
      const n = 14;
      for (let i = 1; i <= n; i++) ctx.lineTo(x - hemW + (2 * hemW * i) / n - (i % 2 ? hemW / n : 0), hemY + (i % 2 ? 9 : 0));
      ctx.lineTo(x + sw * 0.84, sy + (hemY - sy) * 0.4);
      ctx.lineTo(x + sw * 0.98, sy + hh * 0.26);
      ctx.lineTo(x + sw, sy + hh * 0.05);
      ctx.lineTo(x + hh * 0.13, sy - hh * 0.03);
      ctx.quadraticCurveTo(x, sy + hh * 0.1, x - hh * 0.13, sy - hh * 0.03);
      ctx.closePath();
    };
    ctx.save();
    ctx.shadowColor = 'rgba(25,23,20,0.28)'; ctx.shadowBlur = 12; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 6;
    dressPath(); ctx.fillStyle = C.cream; ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.lineWidth = 9; ctx.strokeStyle = C.cream; ctx.lineJoin = 'round'; dressPath(); ctx.stroke();
    dressPath(); ctx.clip();
    P.fillDress(ctx, o.dress, { x: x - hemW, y: sy - hh * 0.06, w: hemW * 2, h: hemY - sy + hh * 0.08 + 10 });
    ctx.restore();

    // arms
    const shY = sy + hh * 0.07;
    out.handL = arm(ctx, x - sw * 0.9, shY, -1, o.armL, ua, fa, aw, sleeve, C.skin, 340);
    out.handR = arm(ctx, x + sw * 0.9, shY, 1, o.armR, ua, fa, aw, sleeve, C.skin, 350);

    // the head: her portrait, glued on
    const neckY = sy + hh * 0.04;
    ctx.save();
    ctx.translate(x, neckY); ctx.rotate((o.tilt || 0) + b.r * 0.6); ctx.translate(-x, -neckY);
    ctx.shadowColor = 'rgba(25,23,20,0.3)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 5;
    if (P[hd.key]) ctx.drawImage(P[hd.key], x - hw / 2, top, hw, hh);
    ctx.shadowColor = 'transparent';
    // collar strip covers the torn neck
    P.piece(ctx, { x, y: sy + hh * 0.045, w: hh * 0.34, h: hh * 0.07, seed: 360, fill: st.collar || C.cream, kind: 'torn', boil: 0.3, shadow: 0.5 });

    // hair accessories in front
    if (hair.pencil) {
      P.piece(ctx, { x: x + hw * 0.4, y: top + hh * 0.36, w: hh * 0.035, h: hh * 0.3, rot: 0.55, seed: 385, fill: C.mustard, shadow: 0.5,
        draw: (g, w2, h2) => { g.fillStyle = C.pink; g.fillRect(-w2 / 2, -h2 / 2, w2, h2 * 0.14); g.fillStyle = C.tan; g.fillRect(-w2 / 2, h2 / 2 - h2 * 0.14, w2, h2 * 0.14); } });
    }
    if (hair.headset) headset(ctx, x, top, hw, hh, hair.headset);
    ctx.restore();

    if (o.holdL) o.holdL(ctx, out.handL[0], out.handL[1]);
    if (o.holdR) o.holdR(ctx, out.handR[0], out.handR[1]);
    ctx.restore();
    return out;
  };

  function headset(ctx, x, top, hw, hh, v) {
    if (v <= 0) return;
    ctx.save();
    const cx = x, cy = top + hh * 0.5;
    ctx.translate(cx, cy); ctx.scale(v, v); ctx.translate(-cx, -cy);
    ctx.shadowColor = 'rgba(25,23,20,0.25)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
    ctx.strokeStyle = C.ink; ctx.lineWidth = hh * 0.035; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - hw * 0.44, top + hh * 0.5); ctx.bezierCurveTo(x - hw * 0.5, top - hh * 0.06, x + hw * 0.5, top - hh * 0.06, x + hw * 0.44, top + hh * 0.5); ctx.stroke();
    // mic boom to the corner of the mouth
    ctx.lineWidth = hh * 0.014;
    ctx.beginPath(); ctx.moveTo(x - hw * 0.44, top + hh * 0.58); ctx.quadraticCurveTo(x - hw * 0.36, top + hh * 0.78, x - hw * 0.17, top + hh * 0.76); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(x - hw * 0.16, top + hh * 0.76, hh * 0.025, hh * 0.018, 0, 0, 7); ctx.fill();
    [-1, 1].forEach((s) => {
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.roundRect(x + s * hw * 0.44 - hh * 0.045, top + hh * 0.44, hh * 0.09, hh * 0.17, hh * 0.03); ctx.fill();
      ctx.fillStyle = C.orange; ctx.beginPath(); ctx.roundRect(x + s * hw * 0.44 - hh * 0.03, top + hh * 0.47, hh * 0.06, hh * 0.11, hh * 0.02); ctx.fill();
    });
    ctx.restore();
  }

  // ---------------------------------------------------------------- others
  const SKINS = ['#f0c8a4', '#d9a17f', '#b87a58', '#8d5a3e', '#e6b48f', '#a86b4c'];
  const HAIRS = ['#2a1c16', '#5a3a26', '#1f1a17', '#8a5a33', '#3b2a20'];
  const SHIRTS = [[C.sky, 'stripes'], [C.mustard, 'dots'], [C.leaf, 'halftone'], [C.pink, 'check'], ['#b9a3d6', 'stripes'], [C.tan, 'dots']];

  // simple paper person, waist up. o: x, y (waist), h, seed, adult, armL/armR,
  // holdL/holdR, mouth ('smile' | 'open' | 'o'), look, glasses, hairType
  P.person = (ctx, o) => {
    const r = P.rng(o.seed * 7 + 1);
    const skin = o.skin || SKINS[Math.floor(r() * SKINS.length)];
    const hairCol = o.hairCol || HAIRS[Math.floor(r() * HAIRS.length)];
    const [shirt, tex] = o.shirt || SHIRTS[Math.floor(r() * SHIRTS.length)];
    const hairType = o.hairType == null ? Math.floor(r() * 5) : o.hairType;
    const b = P.boil(o.seed + 500, 0.8);
    const x = o.x + b.x, y = o.y + (o.bounce || 0);
    const R = o.h * (o.adult ? 0.17 : 0.22);
    const torsoH = o.h * (o.adult ? 0.58 : 0.5);
    const tTop = y - torsoH, cy = tTop - R * 0.82;
    const shw = R * (o.adult ? 1.3 : 1.05);
    const out = { cy, R };

    // long hair behind
    if (hairType === 1 || hairType === 4) {
      P.piece(ctx, hairType === 1
        ? { x, y: cy + R * 0.1, w: R * 2.35, h: R * 2.1, seed: o.seed + 1, fill: hairCol, kind: 'round', shadow: 0.5, boil: 0.5 }
        : { x, y: cy - R * 0.1, w: R * 2.5, h: R * 2.4, seed: o.seed + 1, fill: hairCol, kind: 'blob', shadow: 0.5, boil: 0.5 });
    }
    if (hairType === 3) P.piece(ctx, { x: x + R * 1.05, y: cy + R * 0.3, w: R * 0.55, h: R * 1.4, rot: -0.3, seed: o.seed + 2, fill: hairCol, kind: 'blob', shadow: 0.5 });
    // torso
    P.piece(ctx, {
      x, y: tTop + torsoH / 2, w: shw * 2, h: torsoH, seed: o.seed + 3, fill: shirt, tex, texAlpha: 0.2, shadow: 0.8, boil: 0.5,
      draw: (g, w, hh2) => { g.fillStyle = skin; g.beginPath(); g.ellipse(0, -hh2 / 2, R * 0.38, R * 0.24, 0, 0, 7); g.fill(); },
    });
    // arms
    const sl = { fill: shirt, tex };
    const ua = o.h * (o.adult ? 0.2 : 0.21), fa = o.h * (o.adult ? 0.19 : 0.19), aw = R * 0.36;
    out.handL = arm(ctx, x - shw * 0.86, tTop + R * 0.25, -1, o.armL, ua, fa, aw, sl, skin, o.seed + 10);
    out.handR = arm(ctx, x + shw * 0.86, tTop + R * 0.25, 1, o.armR, ua, fa, aw, sl, skin, o.seed + 20);
    // head
    P.piece(ctx, { x, y: cy, w: R * 2, h: R * 2.08, seed: o.seed + 4, fill: skin, kind: 'circle', shadow: 0.7, boil: 0.5 });
    const lk = o.look || 0;
    ctx.save(); ctx.translate(x, cy);
    // hair on top
    ctx.fillStyle = hairCol;
    ctx.beginPath();
    if (hairType === 2) { ctx.arc(-R * 0.9, -R * 0.7, R * 0.45, 0, 7); ctx.arc(R * 0.9, -R * 0.7, R * 0.45, 0, 7); }
    ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -R * 0.42, R * 1.06, R * 0.72, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.quadraticCurveTo(R * 0.3, -R * 0.35, -R * 1.02, -R * 0.4); ctx.fill();
    if (o.adult && hairType === 0) { ctx.beginPath(); ctx.arc(0, -R * 1.02, R * 0.36, 0, 7); ctx.fill(); }
    // face: dots and a line, kept simple
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.arc(-R * 0.34 + lk * R * 0.08, R * 0.02, R * 0.085, 0, 7); ctx.arc(R * 0.34 + lk * R * 0.08, R * 0.02, R * 0.085, 0, 7); ctx.fill();
    if (o.glasses) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-R * 0.34, R * 0.02, R * 0.22, 0, 7); ctx.moveTo(R * 0.56, R * 0.02); ctx.arc(R * 0.34, R * 0.02, R * 0.22, 0, 7); ctx.moveTo(-R * 0.12, 0); ctx.lineTo(R * 0.12, 0); ctx.stroke(); }
    ctx.fillStyle = 'rgba(231,68,39,0.28)';
    ctx.beginPath(); ctx.arc(-R * 0.56, R * 0.3, R * 0.13, 0, 7); ctx.arc(R * 0.56, R * 0.3, R * 0.13, 0, 7); ctx.fill();
    const m = o.mouth || 'smile';
    if (m === 'open') { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.ellipse(lk * R * 0.06, R * 0.42, R * 0.17, R * 0.14, 0, 0, 7); ctx.fill(); }
    else if (m === 'o') { ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(lk * R * 0.06, R * 0.42, R * 0.08, 0, 7); ctx.fill(); }
    else { ctx.strokeStyle = C.ink; ctx.lineWidth = Math.max(1.6, R * 0.06); ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(lk * R * 0.06, R * 0.18, R * 0.28, 0.55, Math.PI - 0.55); ctx.stroke(); }
    ctx.restore();
    if (o.holdL) o.holdL(ctx, out.handL[0], out.handL[1]);
    if (o.holdR) o.holdR(ctx, out.handR[0], out.handR[1]);
    return out;
  };

  // --------------------------------------------------------------- mother
  // No likeness: we only ever see her from a child's height, head out of frame.
  const CARDI = '#9a6a52', MSKIN = '#c08867';
  P.motherBody = (ctx, x, yTop, o = {}) => {
    const b = P.boil(7100, 0.6);
    x += b.x;
    // skirt, legs
    [-1, 1].forEach((s, i) => {
      P.piece(ctx, { x: x + s * 50, y: yTop + 1010, w: 44, h: 150, seed: 7110 + i, fill: MSKIN, shadow: 0.5, boil: 0.4 });
      P.piece(ctx, { x: x + s * 58, y: yTop + 1082, w: 80, h: 30, seed: 7115 + i, fill: C.ink, kind: 'round', shadow: 0.5, boil: 0.4 });
    });
    P.piece(ctx, { x, y: yTop + 760, w: 330, h: 440, seed: 7120, fill: C.ink2, shadow: 1, boil: 0.5,
      draw: (g, w, h) => { g.strokeStyle = 'rgba(243,238,228,0.18)'; g.lineWidth = 2; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(k * 36, -h / 2); g.lineTo(k * 48, h / 2); g.stroke(); } } });
    // other arm, holding a book
    const bookHand = arm(ctx, x - 130, yTop + 70, -1, [0.12, -0.05], 250, 230, 62, { fill: CARDI, tex: 'knit', texColor: C.ink }, MSKIN, 7130);
    P.piece(ctx, { x: bookHand[0] + 6, y: bookHand[1] + 18, w: 110, h: 150, rot: 0.12, seed: 7140, fill: C.orange, shadow: 1, tex: 'halftone', texAlpha: 0.15,
      draw: () => P.text(ctx, 'ABC', 0, -20, { f: 'serif', size: 34, color: C.cream }) });
    // cardigan
    P.piece(ctx, { x, y: yTop + 300, w: 320, h: 640, seed: 7150, fill: CARDI, tex: 'knit', texColor: C.ink, texAlpha: 0.16, shadow: 1.2, boil: 0.5,
      draw: (g, w, h) => {
        g.fillStyle = C.cream; g.fillRect(-18, -h / 2, 36, h);
        g.fillStyle = C.orange; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(0, -h / 2 + 90 + k * 105, 9, 0, 7); g.fill(); }
        g.fillStyle = 'rgba(25,23,20,0.12)'; g.fillRect(-w / 2 + 40, 120, 80, 70); g.fillRect(w / 2 - 120, 120, 80, 70);
      } });
    // pointing arm with chalk
    const hand = arm(ctx, x + 132, yTop + 70, 1, o.arm || [1.9, 0.5], 250, 220, 62, { fill: CARDI, tex: 'knit', texColor: C.ink }, MSKIN, 7160);
    P.piece(ctx, { x: hand[0] + 10, y: hand[1] - 22, w: 12, h: 42, rot: 0.7, seed: 7170, fill: C.cream, shadow: 0.6 });
    return hand;
  };

  // an arm reaching in from outside the frame (hanging the sign)
  P.motherArm = (ctx, sx, sy, hx, hy, seed) => {
    const L = Math.hypot(hx - sx, hy - sy);
    P.piece(ctx, { x: (sx + hx) / 2, y: (sy + hy) / 2, w: 70, h: L + 30, rot: Math.atan2(hy - sy, hx - sx) - Math.PI / 2, seed, fill: CARDI, tex: 'knit', texColor: C.ink, texAlpha: 0.16, shadow: 1, boil: 0.5,
      draw: (g, w, h) => { g.fillStyle = 'rgba(25,23,20,0.14)'; g.fillRect(-w / 2, h / 2 - 34, w, 10); } });
    P.piece(ctx, { x: hx, y: hy, w: 56, h: 60, seed: seed + 1, fill: MSKIN, kind: 'circle', shadow: 0.7, boil: 0.5 });
  };
})();
