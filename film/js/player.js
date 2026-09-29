// Player: playback, scrubbing, captions, music, storyboard, export hooks.
(() => {
  const P = window.P, F = window.FILM;
  const $ = (id) => document.getElementById(id);
  const canvas = $('film'), ctx = canvas.getContext('2d');
  const params = new URLSearchParams(location.search);
  const EXPORT = params.has('export');
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const tc = (s) => { const d = Math.round(s * 10); return `${Math.floor(d / 600)}:${String(Math.floor(d / 10) % 60).padStart(2, '0')}.${d % 10}`; };
  const voAt = (t) => F.vo.find(([a, b]) => t >= a && t < b);

  // captions burned into the picture (export --captions)
  P.afterRender = (g, t) => {
    if (!P.burnCaptions) return;
    const line = voAt(t);
    if (!line) return;
    g.save();
    g.font = `500 34px ${P.FONT.sans}`;
    const w = g.measureText(line[2]).width + 44;
    g.fillStyle = 'rgba(25,23,20,0.84)'; g.fillRect(960 - w / 2, 1080 - 118, w, 58);
    g.fillStyle = P.COL.cream; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(line[2], 960, 1080 - 88);
    g.restore();
  };

  const ready = (async () => {
    const load = async (src) => { const im = new Image(); im.src = src; await im.decode(); return im; };
    [P.HEAD, P.HEAD_CHILD] = await Promise.all([load('assets/parmis-head.webp'), load('assets/parmis-child-head.webp')]);
    await Promise.all([
      document.fonts.load(`400 40px 'Instrument Serif'`), document.fonts.load(`italic 400 40px 'Instrument Serif'`),
      document.fonts.load(`500 20px 'Inter'`), document.fonts.load(`600 20px 'Inter'`), document.fonts.load(`500 20px 'JetBrains Mono'`),
    ]);
  })();

  // ---------- export mode: the Node exporter drives these ----------
  if (EXPORT) {
    document.body.classList.add('export');
    P.burnCaptions = params.has('captions');
    window.filmReady = ready;
    window.renderAt = (t) => { P.render(ctx, t); if (P.afterRender) P.afterRender(ctx, P.T); };
    window.frameJpeg = (t, q = 0.93) => { window.renderAt(t); return canvas.toDataURL('image/jpeg', q); };
    window.renderAudio = () => P.renderAudioWav(48000);
    return;
  }

  // ---------- live player ----------
  let t = 0, playing = false, lastFr = -1, poster = true;
  let ac = null, nodes = [], clock0 = 0, t0 = 0, spoken = -1;
  let opts = { cc: true, music: true, voice: false };
  try { opts = { ...opts, ...JSON.parse(localStorage.getItem('film-opts') || '{}') }; } catch (e) {}
  const saveOpts = () => { try { localStorage.setItem('film-opts', JSON.stringify(opts)); } catch (e) {} };

  const now = () => (ac && opts.music ? ac.currentTime : performance.now() / 1000);
  function stopAudio() { nodes.forEach((n) => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} }); nodes = []; }
  function startAudio() {
    stopAudio();
    if (!opts.music) return;
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    nodes = P.scheduleAudio(ac, ac.destination, t, ac.currentTime + 0.05);
  }
  function play() {
    if (t >= F.duration - 0.05) t = 0;
    poster = false; playing = true; startAudio();
    t0 = t; clock0 = now() + (opts.music && ac ? 0.05 : 0);
    spoken = -1; if (window.speechSynthesis) speechSynthesis.cancel();
    $('start').hidden = true; $('play').textContent = 'Pause';
  }
  function pause() {
    playing = false; stopAudio();
    if (window.speechSynthesis) speechSynthesis.cancel();
    $('play').textContent = t >= F.duration - 0.05 ? 'Replay' : 'Play';
  }
  function seek(nt) {
    t = Math.max(0, Math.min(F.duration, nt));
    poster = false; $('start').hidden = true;
    if (playing) play(); else { lastFr = -1; draw(); }
  }

  // scrubber: one segment per chapter, proportional to its length
  const scrub = $('scrub');
  F.scenes.forEach((s) => {
    const seg = document.createElement('div');
    seg.className = 'seg'; seg.style.flex = `${s.end - s.start} 1 0`;
    seg.innerHTML = `<i></i><b>${String(s.n).padStart(2, '0')}</b>`;
    scrub.appendChild(seg);
  });
  const segs = [...scrub.querySelectorAll('.seg')];
  const posToTime = (clientX) => {
    for (let i = 0; i < segs.length; i++) {
      const r = segs[i].getBoundingClientRect(), s = F.scenes[i];
      if (clientX <= r.right + 1.5 || i === segs.length - 1) return s.start + Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * (s.end - s.start);
    }
    return 0;
  };
  let dragging = false;
  scrub.addEventListener('pointerdown', (e) => { dragging = true; scrub.setPointerCapture(e.pointerId); seek(posToTime(e.clientX)); });
  scrub.addEventListener('pointermove', (e) => { if (dragging) seek(posToTime(e.clientX)); });
  scrub.addEventListener('pointerup', () => { dragging = false; });
  scrub.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { seek(t + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { seek(t - 1); e.preventDefault(); }
    if (e.key === 'Home') { seek(0); e.preventDefault(); }
    if (e.key === 'End') { seek(F.duration); e.preventDefault(); }
  });

  // chapters + storyboard
  const chapters = $('chapters'), board = $('board');
  F.scenes.forEach((s) => {
    const li = document.createElement('li');
    li.innerHTML = `<button type="button" data-t="${s.start}"><span class="n">${String(s.n).padStart(2, '0')} · ${fmt(s.start)}</span><span class="t">${s.title}</span></button>`;
    chapters.appendChild(li);
    const lines = F.vo.filter(([a]) => a >= s.start - 0.01 && a < s.end - 0.01);
    const el = document.createElement('article');
    el.className = 'shot';
    el.innerHTML = `
      <div class="when"><span class="n">${s.n}</span><span class="tc">${tc(s.start)} – ${tc(s.end)}<br>${(s.end - s.start).toFixed(0)} s</span><button class="btn" type="button" data-t="${s.start}">Watch</button></div>
      <div class="body">
        <h3>${s.title}</h3>
        <dl>
          <dt>Image</dt><dd>${s.image}</dd>
          <dt>Dress</dt><dd>${s.dress}</dd>
          <dt>Movement</dt><dd>${s.movement}</dd>
          <dt>Transition</dt><dd>${s.transition}</dd>
          <dt>On screen</dt><dd class="chips">${s.text.map((x) => `<span>${x}</span>`).join('')}</dd>
          <dt>Voiceover</dt><dd><ul class="vo">${lines.map(([a, b, x]) => `<li><time>${tc(a)}</time><q>${x}</q></li>`).join('')}</ul></dd>
        </dl>
      </div>`;
    board.appendChild(el);
  });
  document.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
    seek(+b.dataset.t + 0.01);
    if (!playing) play();
    $('stage').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  }));

  // controls
  $('start').addEventListener('click', play);
  $('play').addEventListener('click', () => (playing ? pause() : play()));
  const toggle = (id, key, after) => {
    const b = $(id);
    b.setAttribute('aria-pressed', String(opts[key]));
    b.addEventListener('click', () => { opts[key] = !opts[key]; b.setAttribute('aria-pressed', String(opts[key])); saveOpts(); if (after) after(); });
  };
  toggle('cc-btn', 'cc', () => { lastFr = -1; });
  toggle('music-btn', 'music', () => { if (playing) { const keep = t; pause(); t = keep; play(); } });
  toggle('voice-btn', 'voice', () => { if (!opts.voice && window.speechSynthesis) speechSynthesis.cancel(); });
  if (!window.speechSynthesis) $('voice-btn').hidden = true;
  $('full-btn').addEventListener('click', () => {
    const s = $('stage');
    const req = s.requestFullscreen || s.webkitRequestFullscreen;
    if (req) Promise.resolve(req.call(s)).catch(() => {});
  });
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (e.code === 'Space' && !e.target.closest('button, [role="slider"]')) { e.preventDefault(); playing ? pause() : play(); }
  });

  // in-browser recording (only where the canvas can be captured: a local server)
  const canRecord = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && window.MediaRecorder && canvas.captureStream;
  if (canRecord) $('export-btn').hidden = false;
  $('export-btn').addEventListener('click', async () => {
    pause(); t = 0;
    const stream = canvas.captureStream(24);
    ac = ac || new AudioContext();
    await ac.resume();
    const dest = ac.createMediaStreamDestination();
    dest.stream.getAudioTracks().forEach((tr) => stream.addTrack(tr));
    const type = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m));
    const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 12e6 });
    const chunks = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
      a.download = 'parmis-orange.webm'; a.click();
      $('note').textContent = 'Recording saved as parmis-orange.webm.';
    };
    P.burnCaptions = opts.cc;
    $('note').textContent = 'Recording… keep this tab in front for 90 seconds.';
    rec.start(1000);
    nodes = opts.music ? P.scheduleAudio(ac, dest, 0, ac.currentTime + 0.05) : [];
    if (opts.music) P.scheduleAudio(ac, ac.destination, 0, ac.currentTime + 0.05).forEach((n) => nodes.push(n));
    playing = true; t0 = 0; clock0 = now() + 0.05; $('start').hidden = true; $('play').textContent = 'Pause';
    const stopWhenDone = () => { if (t >= F.duration - 0.02 || !playing) { rec.stop(); P.burnCaptions = false; } else requestAnimationFrame(stopWhenDone); };
    requestAnimationFrame(stopWhenDone);
  });

  function draw() {
    const fr = Math.round(t * P.FPS);
    if (!poster && fr !== lastFr) {
      lastFr = fr;
      P.render(ctx, t);
      if (P.afterRender) P.afterRender(ctx, P.T);
    }
    const line = voAt(t);
    const cc = $('cc');
    const show = opts.cc && line && !P.burnCaptions;
    cc.hidden = !show;
    if (show && cc.textContent !== line[2]) cc.textContent = line[2];
    $('time').textContent = `${fmt(t)} / ${fmt(F.duration)}`;
    scrub.setAttribute('aria-valuenow', String(Math.round(t)));
    scrub.setAttribute('aria-valuetext', fmt(t));
    segs.forEach((s, i) => { const sc = F.scenes[i]; s.firstChild.style.width = `${Math.max(0, Math.min(1, (t - sc.start) / (sc.end - sc.start))) * 100}%`; });
    const cur = F.scenes.findIndex((s) => t >= s.start && t < s.end);
    chapters.querySelectorAll('button').forEach((b, i) => b.classList.toggle('on', i === cur));
  }

  function loop() {
    if (playing) {
      t = t0 + (now() - clock0);
      if (t >= F.duration) { t = F.duration; pause(); }
      // scratch voice: read each line as it starts
      if (opts.voice && window.speechSynthesis) {
        const i = F.vo.findIndex(([a, b]) => t >= a && t < b);
        if (i >= 0 && i !== spoken) { spoken = i; const u = new SpeechSynthesisUtterance(F.vo[i][2]); u.rate = 1.02; speechSynthesis.speak(u); }
      }
    }
    draw();
    requestAnimationFrame(loop);
  }
  ready.then(() => {
    // open on a frame that shows what the film is
    if (params.has('t')) { t = +params.get('t') || 0; poster = false; }
    else P.render(ctx, 5.6);
    requestAnimationFrame(loop);
  });
})();
