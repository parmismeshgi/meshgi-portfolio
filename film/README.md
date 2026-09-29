# Parmis & Orange — portfolio film

A 90-second paper-cut animation about growing up with Orange Language Institute.
Open `index.html` through a local server (`npx serve film`) to play it, scrub
chapters, toggle captions and music, and read the timed storyboard.

- `script.js`: timings, storyboard and voiceover, the single source for everything
- `js/`: the canvas renderer (`core`, `props`, `people`, `dress`, `scenes`), music (`audio`) and player
- `assets/parmis-*-head.webp`: collage cut-outs of three portraits: childhood, age 20 and today (`tools/make_photo_cutouts.py`, `tools/make_cutout.py`)
- `STORYBOARD.md`: generated with `node film/tools/storyboard-md.mjs`

## Export

```sh
npm install --no-save playwright && npx playwright install chromium
node film/tools/export.mjs              # film/export/parmis-orange.mp4 + .srt
node film/tools/export.mjs --captions   # captions burned into the picture
node film/tools/export.mjs --stills 12.6,44   # single frames as JPEG
```

Needs ffmpeg on PATH (or `FFMPEG=/path/to/ffmpeg`). The voiceover is a script:
record it in your own voice against the `.srt` timings; the music already dips
under each line.
