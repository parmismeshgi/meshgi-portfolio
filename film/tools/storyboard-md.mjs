// Write STORYBOARD.md from script.js, so the storyboard never drifts from the film.
//   node film/tools/storyboard-md.mjs
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'script.js'), 'utf8'), sandbox);
const F = sandbox.window.FILM;
const tc = (s) => { const d = Math.round(s * 10); return `${Math.floor(d / 600)}:${String(Math.floor(d / 10) % 60).padStart(2, '0')}.${d % 10}`; };

let md = `# ${F.title}: timed storyboard\n\nA ${F.duration}-second paper-cut portfolio film. Stop-motion at ${F.fps} fps, delivered at 24 fps.\n`;
md += `Generated from \`film/script.js\` by \`node film/tools/storyboard-md.mjs\`.\n\n`;
md += `| # | Time | Chapter |\n|---|---|---|\n` + F.scenes.map((s) => `| ${s.n} | ${tc(s.start)}–${tc(s.end)} | ${s.title} |`).join('\n') + '\n';
for (const s of F.scenes) {
  const lines = F.vo.filter(([a]) => a >= s.start - 0.01 && a < s.end - 0.01);
  md += `\n## ${s.n}. ${s.title} (${tc(s.start)}–${tc(s.end)}, ${Math.round(s.end - s.start)} s)\n\n`;
  md += `- **Image:** ${s.image}\n- **Dress:** ${s.dress}\n- **Movement:** ${s.movement}\n- **Transition:** ${s.transition}\n`;
  md += `- **On screen:** ${s.text.map((x) => `“${x}”`).join(' · ')}\n- **Voiceover:**\n`;
  md += lines.map(([a, b, x]) => `  - \`${tc(a)}–${tc(b)}\` ${x}`).join('\n') + '\n';
}
md += `\n## The small orange shape\n\nIt drops onto the title, becomes a doodle in the notebook, sits beside the “Orange” sign, rides a lesson sheet to the whiteboard, rides the folded cube into the Montessori room, becomes the ball on the online lesson slide, grows into the “play” button, becomes the sun outside the plane window, pins old teaching pieces to the capstone wall, rides the orange thread at Volante, becomes the logo on Orange’s website, and ends in my hands.\n`;
fs.writeFileSync(path.join(root, 'STORYBOARD.md'), md);
console.log('wrote film/STORYBOARD.md');
