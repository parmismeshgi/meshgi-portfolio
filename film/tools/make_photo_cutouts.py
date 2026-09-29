"""Cut heads out of the childhood and age-20 portraits as collage pieces.

These photos have busy backgrounds, so rembg (isnet-general-use) finds the
person; an optional hand-cut outline keeps only head, hair and neck. The paper
margin and torn neck match make_cutout.py.

    pip install rembg onnxruntime pillow
    python3 film/tools/make_photo_cutouts.py
"""
import random
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance
from rembg import remove, new_session

PROFILES = {
    "child": dict(src="film/assets/parmis-child-portrait.webp", out="film/assets/parmis-child-head.webp",
                  crop=(230, 130, 1000, 1115), neck_y=1082, scale=0.62, seed=11, keep=None),
    # age 20: leave out the jacket and its collar
    "twenty": dict(src="film/assets/parmis-20-portrait.webp", out="film/assets/parmis-20-head.webp",
                   crop=(112, 150, 518, 540), neck_y=512, scale=1.0, seed=20,
                   keep=[(200, 150), (410, 150), (475, 260), (485, 420), (470, 540), (175, 540), (160, 440), (170, 260)]),
}
MARGIN = 18
session = new_session("isnet-general-use")


def cutout(src, out, crop, neck_y, scale, seed, keep):
    random.seed(seed)
    im = Image.open(src).convert("RGB")
    w, h = im.size
    fg = remove(im, session=session, only_mask=True).convert("L")
    fg = fg.point(lambda v: 255 if v > 110 else 0)
    fg = fg.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(5))
    fg = fg.filter(ImageFilter.GaussianBlur(1.2)).point(lambda v: 255 if v > 128 else 0)

    tear = Image.new("L", (w, h), 255)
    pts, y = [], neck_y
    for x in range(0, w + 24, 24):
        y += random.uniform(-8, 8)
        y = max(neck_y - 18, min(neck_y + 18, y))
        pts.append((x, y + random.uniform(-6, 6)))
    ImageDraw.Draw(tear).polygon(pts + [(w, h), (0, h)], fill=0)
    fg = ImageChops.multiply(fg, tear)
    if keep:
        k = Image.new("L", (w, h), 0)
        ImageDraw.Draw(k).polygon(keep, fill=255)
        fg = ImageChops.multiply(fg, k)

    paper = fg.filter(ImageFilter.MaxFilter(2 * (MARGIN // 2) + 1)).filter(ImageFilter.MaxFilter(2 * (MARGIN // 2) + 1))
    paper = paper.filter(ImageFilter.GaussianBlur(7)).point(lambda v: 255 if v > 90 else 0)
    paper = ImageChops.multiply(paper, tear)
    tear2 = Image.new("L", (w, h), 255)
    ImageDraw.Draw(tear2).polygon([(x, y + 10 + random.uniform(-4, 7)) for x, y in pts] + [(w, h), (0, h)], fill=0)
    paper = ImageChops.lighter(ImageChops.multiply(paper, tear2), fg)

    photo = ImageEnhance.Contrast(im).enhance(1.08)
    warm = Image.new("RGB", (w, h), (243, 228, 205))
    photo = Image.blend(photo, ImageChops.multiply(photo, warm), 0.15)

    out_path = out
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(Image.new("RGBA", (w, h), (251, 248, 240, 255)), mask=paper)
    out.paste(photo.convert("RGBA"), mask=fg.filter(ImageFilter.GaussianBlur(0.8)))
    out = out.crop(crop)
    out = out.resize((round(out.width * scale), round(out.height * scale)), Image.LANCZOS)
    out.save(out_path, "WEBP", quality=90, method=6)
    print(out_path, out.size)


for name, prof in PROFILES.items():
    cutout(**prof)
