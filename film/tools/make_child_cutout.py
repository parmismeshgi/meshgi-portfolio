"""Cut the head out of the childhood portrait as a collage piece.

The studio backdrop is mottled, so this one uses rembg (isnet-general-use) to
find the child; the paper margin and torn neck match make_cutout.py.

    pip install rembg onnxruntime pillow
    python3 film/tools/make_child_cutout.py
"""
import random
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance
from rembg import remove, new_session

SRC = "film/assets/parmis-child-portrait.webp"
OUT = "film/assets/parmis-child-head.webp"
CROP = (230, 130, 1000, 1115)      # flowers, hair, face and neck
NECK_Y = 1082                      # torn edge, in source pixels
MARGIN = 18
SCALE = 0.62

random.seed(11)
im = Image.open(SRC).convert("RGB")
w, h = im.size
fg = remove(im, session=new_session("isnet-general-use"), only_mask=True).convert("L")
fg = fg.point(lambda v: 255 if v > 110 else 0)
fg = fg.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(5))
fg = fg.filter(ImageFilter.GaussianBlur(1.2)).point(lambda v: 255 if v > 128 else 0)

tear = Image.new("L", (w, h), 255)
pts, y = [], NECK_Y
for x in range(0, w + 24, 24):
    y += random.uniform(-8, 8)
    y = max(NECK_Y - 18, min(NECK_Y + 18, y))
    pts.append((x, y + random.uniform(-6, 6)))
ImageDraw.Draw(tear).polygon(pts + [(w, h), (0, h)], fill=0)
fg = ImageChops.multiply(fg, tear)

paper = fg.filter(ImageFilter.MaxFilter(2 * (MARGIN // 2) + 1)).filter(ImageFilter.MaxFilter(2 * (MARGIN // 2) + 1))
paper = paper.filter(ImageFilter.GaussianBlur(7)).point(lambda v: 255 if v > 90 else 0)
paper = ImageChops.multiply(paper, tear)
tear2 = Image.new("L", (w, h), 255)
ImageDraw.Draw(tear2).polygon([(x, y + 10 + random.uniform(-4, 7)) for x, y in pts] + [(w, h), (0, h)], fill=0)
paper = ImageChops.lighter(ImageChops.multiply(paper, tear2), fg)

photo = ImageEnhance.Contrast(im).enhance(1.08)
warm = Image.new("RGB", (w, h), (243, 228, 205))
photo = Image.blend(photo, ImageChops.multiply(photo, warm), 0.15)

out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
out.paste(Image.new("RGBA", (w, h), (251, 248, 240, 255)), mask=paper)
out.paste(photo.convert("RGBA"), mask=fg.filter(ImageFilter.GaussianBlur(0.8)))
out = out.crop(CROP)
out = out.resize((round(out.width * SCALE), round(out.height * SCALE)), Image.LANCZOS)
out.save(OUT, "WEBP", quality=90, method=6)
print(OUT, out.size)
