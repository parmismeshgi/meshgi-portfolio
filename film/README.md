# Parmis & Orange — portfolio film

A 90-second paper-cut animation about growing up with Orange Language Institute.
Open `index.html` through a local server (`npx serve film`) to play it, scrub
chapters, toggle the story lines and music, and read the timed storyboard.

- `script.js`: timings, storyboard and voiceover, the single source for everything
- `js/`: the canvas renderer (`core`, `props`, `people`, `dress`, `scenes`), music (`audio`) and player
- `assets/parmis-*-head.webp`: collage cut-outs of three portraits: childhood, age 20 and today (`tools/make_photo_cutouts.py`, `tools/make_cutout.py`)
- `STORYBOARD.md`: generated with `node film/tools/storyboard-md.mjs`

## Export

```sh
npm install --no-save playwright && npx playwright install chromium
node film/tools/export.mjs              # film/export/parmis-orange.mp4 + .srt
node film/tools/export.mjs --clean      # no story lines, for under your own voice
node film/tools/export.mjs --stills 12.6,44   # single frames as JPEG
```

Needs ffmpeg on PATH (or `FFMPEG=/path/to/ffmpeg`). The voiceover is a script:
record it in your own voice against the `.srt` timings; the music already dips
under each line.

## On the website

The film appears on `/teaching/` (`teaching.html`, copied to
`teaching/index.html` and `teaching.md` by `scripts/build-discovery.py`). The
frame is styled in `styles.css` (`.teaching-film*`), its playback lives in
`site.js` (`[data-teaching-film]`), and the web-sized video is in
`assets/teaching/`. It autoplays muted while on screen; "Tap for sound"
unmutes and starts the story from the beginning; Play/Pause stops it.

To refresh the website copy after re-exporting the film:

```sh
ffmpeg -i film/export/parmis-orange.mp4 -vf scale=1280:720 -c:v libvpx-vp9 -b:v 0 -crf 38 -c:a libopus -b:a 96k assets/teaching/parmis-orange-720.webm
ffmpeg -i film/export/parmis-orange.mp4 -vf scale=1280:720 -c:v libx264 -crf 25 -tune animation -c:a aac -b:a 128k -movflags +faststart assets/teaching/parmis-orange-720.mp4
```
