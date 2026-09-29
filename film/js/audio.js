// Light, rhythmic music plus paper sound effects, built with WebAudio.
// Everything is scheduled from the script's timeline, so the same score plays
// live (from any start time) and renders offline for the video export.
// The music ducks under every voiceover line to leave room for narration.
(() => {
  const P = window.P, F = window.FILM;
  const BPM = 100, BEAT = 60 / BPM, BAR = BEAT * 4;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // F – Dm – Bb – C, as MIDI chord tones
  const CHORDS = [[53, 57, 60, 65], [50, 53, 57, 62], [46, 50, 53, 58], [48, 52, 55, 60]];
  const TRANSITIONS = [9, 17, 25.7, 35.2, 45, 48.5, 52.8, 56.0, 62.6, 70.2, 81.9];
  const POPS = [0.9, 2.9, 9.7, 16.4, 26.3, 36.3, 49.6, 53.6, 63.6, 71.0, 81.2, 85.0, 86.6, 88.0];

  // where the groove thins out or rests
  const drumsOn = (t) => t > 2.2 && !(t > 36 && t < 39) && !(t > 45 && t < 48.5) && !(t > 52.8 && t < 56) && t < 88.2;
  const kickOn = (t) => drumsOn(t) && !(t > 39 && t < 45);

  function noiseBuffer(ac) {
    const len = ac.sampleRate * 1.5, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0);
    const r = P.rng(4242);
    for (let i = 0; i < len; i++) d[i] = r() * 2 - 1;
    return b;
  }

  // Schedule everything from film time `from` onward. `at` = context time
  // that corresponds to film time `from`. Returns the nodes, so a live
  // player can stop them on pause.
  P.scheduleAudio = (ac, dest, from = 0, at = ac.currentTime + 0.05, opts = {}) => {
    const nodes = [];
    const noise = noiseBuffer(ac);
    const when = (ft) => at + (ft - from);
    const live = (ft) => ft >= from - 0.01;

    // master bus with voiceover ducking
    const music = ac.createGain();
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3;
    music.connect(comp); comp.connect(dest);
    const base = opts.volume == null ? 0.95 : opts.volume, duck = base * 0.5;
    music.gain.setValueAtTime(from < 0.1 ? base : duck, at);
    F.vo.forEach(([a, b]) => {
      if (b < from) return;
      music.gain.setTargetAtTime(duck, Math.max(at, when(a - 0.25)), 0.08);
      music.gain.setTargetAtTime(base, Math.max(at, when(b + 0.1)), 0.25);
    });
    music.gain.setTargetAtTime(0, when(89.2), 0.4);
    const sfx = ac.createGain(); sfx.gain.value = 0.7; sfx.connect(dest);
    nodes.push(music, sfx);

    function tone(ft, freq, dur, type, gain, out = music, filt = 3200) {
      if (!live(ft)) return;
      const t0 = when(ft);
      const o = ac.createOscillator(); o.type = type; o.frequency.value = freq;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filt;
      o.connect(f); f.connect(g); g.connect(out);
      o.start(t0); o.stop(t0 + dur + 0.05); nodes.push(o);
    }
    function noiseHit(ft, dur, gain, type, freq, q = 1, out = music, sweepTo) {
      if (!live(ft)) return;
      const t0 = when(ft);
      const s = ac.createBufferSource(); s.buffer = noise;
      const f = ac.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t0); f.Q.value = q;
      if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.02, dur * 0.3)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      s.connect(f); f.connect(g); g.connect(out);
      s.start(t0, (ft * 7.3) % 1); s.stop(t0 + dur + 0.05); nodes.push(s);
    }
    function kick(ft) {
      if (!live(ft)) return;
      const t0 = when(ft);
      const o = ac.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(130, t0); o.frequency.exponentialRampToValueAtTime(48, t0 + 0.14);
      const g = ac.createGain(); g.gain.setValueAtTime(0.5, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
      o.connect(g); g.connect(music); o.start(t0); o.stop(t0 + 0.3); nodes.push(o);
    }

    // --- the groove
    const bars = Math.ceil(F.duration / BAR) + 1;
    const PLUCK = [1, 0, 1, 1, 0, 1, 0, 1]; // syncopated 8ths
    const ORDER = [0, 2, 1, 3, 2, 1, 3, 2];
    for (let b = 0; b < bars; b++) {
      const ch = CHORDS[b % 4], t0 = b * BAR;
      if (t0 > 89.5) break;
      // pad: soft sustained chord
      ch.forEach((m, i) => tone(t0, hz(m + 12), BAR * 1.05, 'sine', 0.035 - i * 0.004, music, 1200));
      for (let s = 0; s < 8; s++) {
        const ft = t0 + s * (BEAT / 2);
        if (ft > 88.6) break;
        // marimba-ish pluck line (sparser in the quiet passages)
        const quiet = (ft > 45 && ft < 48.5) || (ft > 52.8 && ft < 56) || ft < 2.2;
        if (PLUCK[s] && (!quiet || s % 4 === 0)) {
          const m = ch[ORDER[(s + b) % 8]] + 12 + (s === 7 && b % 2 ? 12 : 0);
          tone(ft, hz(m), 0.42, 'triangle', 0.11);
          tone(ft, hz(m) * 4, 0.12, 'sine', 0.018);
        }
        if (drumsOn(ft)) {
          noiseHit(ft, 0.05, s % 2 ? 0.05 : 0.028, 'highpass', 7000); // shaker
          if (s === 2 || s === 6) noiseHit(ft, 0.09, 0.11, 'bandpass', 1900, 1.4); // finger snap
          if (kickOn(ft) && (s === 0 || s === 5)) kick(ft);
        }
      }
      // bass: root, the "and" of two, octave on four
      if (t0 > 2.2 && t0 < 88.5 && !(t0 > 45 && t0 < 48)) {
        tone(t0, hz(ch[0] - 12), 0.5, 'triangle', 0.2, music, 700);
        tone(t0 + BEAT * 1.5, hz(ch[2] - 12), 0.3, 'triangle', 0.14, music, 700);
        tone(t0 + BEAT * 3, hz(ch[0]), 0.28, 'triangle', 0.12, music, 700);
      }
    }
    // closing flourish: an F major arpeggio that rings out
    [65, 69, 72, 77, 81].forEach((m, i) => tone(88.2 + i * 0.12, hz(m), 2.4, 'triangle', 0.1));
    tone(88.2, hz(41), 2.6, 'triangle', 0.18, music, 600);

    // --- paper sound effects
    TRANSITIONS.forEach((ft) => noiseHit(ft - 0.1, 0.42, 0.16, 'bandpass', 700, 0.8, sfx, 3600));
    POPS.forEach((ft, i) => { tone(ft, hz(84 + (i % 3) * 2), 0.1, 'sine', 0.09, sfx, 8000); tone(ft + 0.05, hz(91 + (i % 3) * 2), 0.09, 'sine', 0.05, sfx, 8000); });
    return nodes;
  };

  // Offline render for the exporter: returns a 16-bit stereo WAV as base64
  P.renderAudioWav = async (sampleRate = 48000) => {
    const ac = new OfflineAudioContext(2, Math.ceil(F.duration * sampleRate), sampleRate);
    P.scheduleAudio(ac, ac.destination, 0, 0);
    const buf = await ac.startRendering();
    const n = buf.length, ch = [buf.getChannelData(0), buf.getChannelData(1)];
    const ab = new ArrayBuffer(44 + n * 4), v = new DataView(ab);
    const str = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    str(0, 'RIFF'); v.setUint32(4, 36 + n * 4, true); str(8, 'WAVE'); str(12, 'fmt ');
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 2, true); v.setUint32(24, sampleRate, true);
    v.setUint32(28, sampleRate * 4, true); v.setUint16(32, 4, true); v.setUint16(34, 16, true); str(36, 'data'); v.setUint32(40, n * 4, true);
    let o = 44;
    for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) { const s = Math.max(-1, Math.min(1, ch[c][i])); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
    let bin = ''; const bytes = new Uint8Array(ab);
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
})();
