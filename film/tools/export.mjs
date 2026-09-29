// Export the film to MP4, frame by frame.
//
//   node film/tools/export.mjs [--out film/export/parmis-orange.mp4]
//        [--clean] [--no-music] [--from 0] [--to 90] [--stills 5,20.5]
//
// Needs Playwright (npm install --no-save playwright && npx playwright install chromium)
// and ffmpeg on PATH (or FFMPEG=/path/to/ffmpeg). Frames are rendered at the
// film's stop-motion rate (12 fps) and delivered at 24 fps.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const OUT = path.resolve(opt('--out', path.join(root, 'export', 'parmis-orange.mp4')));
const FROM = +opt('--from', 0), TO = +opt('--to', 90), FPS = 12;
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

function loadPlaywright() {
  const req = createRequire(import.meta.url);
  try { return req('playwright'); } catch (e) {}
  try { return req(path.join(execSync('npm root -g').toString().trim(), 'playwright')); } catch (e) {}
  console.error('Playwright not found. Run: npm install --no-save playwright && npx playwright install chromium');
  process.exit(1);
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.webp': 'image/webp', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.css': 'text/css' };
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/index.html?export${flag('--clean') ? '&clean' : ''}`;

const { chromium } = loadPlaywright();
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto(base);
await page.evaluate(() => window.filmReady);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const stem = OUT.replace(/\.mp4$/, '');

// stills only (for checking a moment): --stills 5,20.5
if (opt('--stills')) {
  for (const s of opt('--stills').split(',').map(Number)) {
    const url = await page.evaluate((t) => window.frameJpeg(t, 0.9), s);
    const f = `${stem}-${String(s).replace('.', '_')}.jpg`;
    fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    console.log(f);
  }
  await browser.close(); server.close(); process.exit(0);
}

// subtitles
const vo = await page.evaluate(() => window.FILM.vo);
const srtTime = (s) => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const srt = vo.map(([a, b, s], i) => `${i + 1}\n${srtTime(Math.max(0, a - FROM))} --> ${srtTime(Math.max(0, b - FROM))}\n${s}\n`).filter((_, i) => vo[i][1] > FROM && vo[i][0] < TO).join('\n');
fs.writeFileSync(`${stem}.srt`, srt);

// music
let wav = null;
if (!flag('--no-music')) {
  wav = `${stem}.wav`;
  fs.writeFileSync(wav, Buffer.from(await page.evaluate(() => window.renderAudio()), 'base64'));
}

// frames -> ffmpeg
const inputs = ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-'];
if (wav) inputs.push('-ss', String(FROM), '-t', String(TO - FROM), '-i', wav);
inputs.push('-i', `${stem}.srt`);
const maps = ['-map', '0:v', ...(wav ? ['-map', '1:a'] : []), '-map', `${wav ? 2 : 1}:s`];
const ff = spawn(FFMPEG, [...inputs, ...maps,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p', '-r', '24', '-tune', 'animation',
  ...(wav ? ['-c:a', 'aac', '-b:a', '192k'] : []), '-c:s', 'mov_text', '-metadata:s:s:0', 'language=eng',
  '-t', String(TO - FROM), '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });
const total = Math.round((TO - FROM) * FPS);
const started = Date.now();
for (let i = 0; i < total; i++) {
  const url = await page.evaluate((t) => window.frameJpeg(t), FROM + i / FPS);
  if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % 60 === 0) process.stdout.write(`\rframe ${i}/${total}  ${((Date.now() - started) / 1000).toFixed(0)}s   `);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close(); server.close();
if (wav) fs.unlinkSync(wav);
console.log(`\nwrote ${OUT}\nwrote ${stem}.srt`);
