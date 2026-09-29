"""Cut the head out of the reference portrait as a collage piece.

The portrait has a near-white studio background, so a flood fill from the
image border finds it reliably. The cut-out gets a hand-cut paper margin and a
torn edge at the neck, the way a magazine clipping would.

    python3 film/tools/make_cutout.py
"""
import random
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance

SRC = "film/assets/parmis-portrait.jpg"
OUT = "film/assets/parmis-head.webp"
CROP = (215, 150, 1265, 1500)      # head, hair and neck
NECK_Y = 1405                      # torn edge, in source pixels
MARGIN = 16                        # paper margin around the cut-out
SCALE = 0.62

random.seed(7)
im = Image.open(SRC).convert("RGB")
w, h = im.size

# 1. background candidates: bright, unsaturated pixels
r, g, b = im.split()
lo = ImageChops.darker(ImageChops.darker(r, g), b)
hi = ImageChops.lighter(ImageChops.lighter(r, g), b)
bright = lo.point(lambda v: 255 if v > 206 else 0)
grey = ImageChops.subtract(hi, lo).point(lambda v: 255 if v < 34 else 0)
cand = ImageChops.multiply(bright, grey)

# 2. keep only the background connected to the frame edge
for x in range(0, w, 40):
    for y in (0, h - 1):
        if cand.getpixel((x, y)) == 255:
            ImageDraw.floodfill(cand, (x, y), 128)
for y in range(0, h, 40):
    for x in (0, w - 1):
        if cand.getpixel((x, y)) == 255:
            ImageDraw.floodfill(cand, (x, y), 128)
fg = cand.point(lambda v: 0 if v == 128 else 255)

# 3. tidy the mask: close small holes, drop stray single hairs
fg = fg.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(7))
fg = fg.filter(ImageFilter.GaussianBlur(1.2)).point(lambda v: 255 if v > 128 else 0)

# 4. torn edge at the neck
tear = Image.new("L", (w, h), 255)
d = ImageDraw.Draw(tear)
pts, y = [], NECK_Y
for x in range(0, w + 24, 24):
    y += random.uniform(-9, 9)
    y = max(NECK_Y - 22, min(NECK_Y + 22, y))
    pts.append((x, y + random.uniform(-6, 6)))
d.polygon(pts + [(w, h), (0, h)], fill=0)
fg = ImageChops.multiply(fg, tear)

# 5. paper margin: grow the mask and roughen it like scissor cuts
paper = fg.filter(ImageFilter.MaxFilter(2 * (MARGIN // 2) + 1))
paper = paper.filter(ImageFilter.MaxFilter(2 * (MARGIN // 2) + 1))
paper = paper.filter(ImageFilter.GaussianBlur(7)).point(lambda v: 255 if v > 90 else 0)
paper = ImageChops.multiply(paper, tear)
tear2 = Image.new("L", (w, h), 255)
d2 = ImageDraw.Draw(tear2)
pts2 = [(x, y + 10 + random.uniform(-4, 7)) for x, y in pts]
d2.polygon(pts2 + [(w, h), (0, h)], fill=0)
paper = ImageChops.lighter(ImageChops.multiply(paper, tear2), fg)

# 6. a warm, lightly printed photo
photo = ImageEnhance.Contrast(im).enhance(1.06)
photo = ImageEnhance.Color(photo).enhance(1.04)
warm = Image.new("RGB", (w, h), (243, 228, 205))
photo = Image.blend(photo, ImageChops.multiply(photo, warm), 0.22)

out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
out.paste(Image.new("RGBA", (w, h), (251, 248, 240, 255)), mask=paper)
out.paste(photo.convert("RGBA"), mask=fg.filter(ImageFilter.GaussianBlur(0.8)))
out = out.crop(CROP)
out = out.resize((round(out.width * SCALE), round(out.height * SCALE)), Image.LANCZOS)
out.save(OUT, "WEBP", quality=90, method=6)
print(OUT, out.size)
