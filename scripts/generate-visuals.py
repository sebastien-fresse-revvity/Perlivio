#!/usr/bin/env python3
from __future__ import annotations

import argparse
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
BEADS = ROOT / "assets" / "beads"
MEDIA = ROOT / "assets" / "media"

NAVY = (28, 42, 68, 255)
CREAM = (247, 244, 238, 255)
PAPER = (251, 250, 246, 255)


def gradient(size: tuple[int, int], top: tuple[int, int, int, int], bottom: tuple[int, int, int, int]) -> Image.Image:
    w, h = size
    out = Image.new("RGBA", size)
    px = out.load()
    for y in range(h):
        t = y / max(1, h - 1)
        c = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(4))
        for x in range(w):
            px[x, y] = c
    return out


def warm_background(size: tuple[int, int], wood: bool = False) -> Image.Image:
    w, h = size
    bg = gradient(size, (252, 250, 245, 255), (231, 225, 215, 255))
    draw = ImageDraw.Draw(bg, "RGBA")
    if wood:
        step = max(42, h // 22)
        for y in range(-h // 4, h + h // 3, step):
            draw.line((0, y, w, y + h // 5), fill=(151, 112, 76, 32), width=max(3, h // 260))
            draw.line((0, y + step // 3, w, y + h // 5 + step // 3), fill=(255, 255, 255, 35), width=max(2, h // 330))
    return bg


def load_bead(slug: str, size: int = 220) -> Image.Image:
    im = Image.open(BEADS / f"{slug}.webp").convert("RGBA")
    alpha = im.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.thumbnail((size - 8, size - 8), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(im, ((size - im.width) // 2, (size - im.height) // 2))
    return canvas


def paste_center(base: Image.Image, obj: Image.Image, center: tuple[float, float]) -> None:
    base.alpha_composite(obj, (int(center[0] - obj.width / 2), int(center[1] - obj.height / 2)))


def add_shadow(base: Image.Image, obj: Image.Image, center: tuple[float, float], blur: int = 12, opacity: int = 70, dy: int = 9) -> None:
    alpha = obj.getchannel("A")
    pad = blur * 3
    shadow = Image.new("RGBA", (obj.width + pad * 2, obj.height + pad * 2), (16, 24, 34, 0))
    a = Image.new("L", shadow.size, 0)
    a.paste(alpha, (pad, pad + dy))
    a = a.filter(ImageFilter.GaussianBlur(blur))
    a = a.point(lambda p: int(p * opacity / 255))
    shadow.putalpha(a)
    paste_center(base, shadow, center)


def metallic_clasp(size: tuple[int, int] = (1000, 600)) -> Image.Image:
    scale = 2
    w, h = size[0] * scale, size[1] * scale
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))

    shadow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow, "RGBA")
    sd.ellipse((120 * scale, 245 * scale, 470 * scale, 465 * scale), fill=(10, 20, 35, 70))
    sd.rounded_rectangle((420 * scale, 285 * scale, 775 * scale, 395 * scale), radius=45 * scale, fill=(10, 20, 35, 55))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22 * scale))
    layer.alpha_composite(shadow)

    shaft_mask = Image.new("L", (w, h), 0)
    sm = ImageDraw.Draw(shaft_mask)
    sm.rounded_rectangle((430 * scale, 255 * scale, 800 * scale, 365 * scale), radius=35 * scale, fill=255)
    shaft_grad = gradient((w, h), (252, 253, 254, 255), (111, 124, 138, 255))
    layer.alpha_composite(Image.composite(shaft_grad, Image.new("RGBA", (w, h)), shaft_mask))
    d = ImageDraw.Draw(layer, "RGBA")
    d.rounded_rectangle((485 * scale, 268 * scale, 765 * scale, 293 * scale), radius=12 * scale, fill=(255, 255, 255, 145))

    body_mask = Image.new("L", (w, h), 0)
    bm = ImageDraw.Draw(body_mask)
    bm.ellipse((125 * scale, 205 * scale, 490 * scale, 450 * scale), fill=255)
    body_grad = gradient((w, h), (225, 232, 237, 255), (78, 91, 104, 255))
    layer.alpha_composite(Image.composite(body_grad, Image.new("RGBA", (w, h)), body_mask))
    d.ellipse((135 * scale, 320 * scale, 480 * scale, 465 * scale), fill=(85, 96, 108, 215))

    face_mask = Image.new("L", (w, h), 0)
    fm = ImageDraw.Draw(face_mask)
    fm.ellipse((120 * scale, 170 * scale, 480 * scale, 395 * scale), fill=255)
    face_grad = gradient((w, h), (255, 255, 255, 255), (167, 181, 193, 255))
    layer.alpha_composite(Image.composite(face_grad, Image.new("RGBA", (w, h)), face_mask))
    d = ImageDraw.Draw(layer, "RGBA")
    d.ellipse((128 * scale, 178 * scale, 472 * scale, 386 * scale), outline=(91, 104, 118, 225), width=4 * scale)
    d.ellipse((155 * scale, 190 * scale, 425 * scale, 255 * scale), fill=(255, 255, 255, 65))
    d.line((300 * scale, 390 * scale, 300 * scale, 438 * scale), fill=(55, 66, 78, 220), width=7 * scale)
    d.line((300 * scale, 438 * scale, 360 * scale, 438 * scale), fill=(55, 66, 78, 220), width=7 * scale)

    d.rounded_rectangle((755 * scale, 225 * scale, 835 * scale, 395 * scale), radius=38 * scale, fill=(14, 18, 23, 255))
    d.rounded_rectangle((766 * scale, 236 * scale, 794 * scale, 382 * scale), radius=12 * scale, fill=(72, 79, 86, 110))

    bbox = layer.getbbox()
    obj = layer.crop(bbox).rotate(-7, expand=True, resample=Image.Resampling.BICUBIC)
    obj.thumbnail((920 * scale, 500 * scale), Image.Resampling.LANCZOS)
    final = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    final.alpha_composite(obj, ((w - obj.width) // 2, (h - obj.height) // 2))
    return final.resize(size, Image.Resampling.LANCZOS)


def stage(stones: list[str], spacer: str | None = None, size: int = 1400, clasp_angle: float = 0) -> Image.Image:
    result = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx, cy = size / 2, size * 0.455
    radius = size * 0.368
    gap = 48
    start = 90 + gap / 2
    span = 360 - gap
    bead_size = int(size * 0.123)

    points = []
    for i in range(260):
        angle = math.radians(start + span * i / 259)
        points.append((cx + math.cos(angle) * radius, cy + math.sin(angle) * radius))
    cord = Image.new("RGBA", result.size, (0, 0, 0, 0))
    ImageDraw.Draw(cord).line(points, fill=(39, 43, 48, 205), width=max(9, size // 90), joint="curve")
    result.alpha_composite(cord)

    centers = []
    for i in range(len(stones)):
        angle = math.radians(start + span * i / max(1, len(stones) - 1))
        centers.append((cx + math.cos(angle) * radius, cy + math.sin(angle) * radius, angle))

    if spacer:
        colors = {
            "metal": ((92, 100, 110, 255), (178, 185, 192, 170)),
            "inox": ((192, 201, 208, 255), (255, 255, 255, 190)),
            "argent": ((228, 232, 236, 255), (255, 255, 255, 220)),
        }
        fill, hi = colors[spacer]
        for index in (2, 7, 12):
            if index >= len(stones) - 1:
                continue
            angle = (centers[index][2] + centers[index + 1][2]) / 2
            x = cx + math.cos(angle) * radius
            y = cy + math.sin(angle) * radius
            sp = Image.new("RGBA", (92, 48), (0, 0, 0, 0))
            dd = ImageDraw.Draw(sp, "RGBA")
            dd.rounded_rectangle((8, 10, 84, 38), radius=10, fill=fill, outline=(83, 91, 100, 170), width=2)
            dd.rounded_rectangle((18, 12, 74, 18), radius=3, fill=hi)
            sp = sp.rotate(-math.degrees(angle) - 90, expand=True, resample=Image.Resampling.BICUBIC)
            paste_center(result, sp, (x, y))

    for (x, y, _), slug in zip(centers, stones):
        bead = load_bead(slug, bead_size)
        add_shadow(result, bead, (x, y), blur=max(5, size // 210), opacity=75, dy=max(4, size // 170))
        paste_center(result, bead, (x, y))

    clasp = metallic_clasp((1000, 600))
    clasp.thumbnail((int(size * 0.225), int(size * 0.135)), Image.Resampling.LANCZOS)
    clasp = clasp.rotate(clasp_angle, expand=True, resample=Image.Resampling.BICUBIC)
    add_shadow(result, clasp, (cx, size * 0.82), blur=max(6, size // 170), opacity=60, dy=max(4, size // 180))
    paste_center(result, clasp, (cx, size * 0.82))
    return result


def packshot(stones: list[str], spacer: str | None = None, angle: float = 0) -> Image.Image:
    bg = warm_background((1400, 1400))
    ring = stage(stones, spacer=spacer, size=1400, clasp_angle=angle)
    shadow = ring.getchannel("A").filter(ImageFilter.GaussianBlur(22))
    sh = Image.new("RGBA", bg.size, (18, 28, 42, 0))
    sh.putalpha(shadow.point(lambda p: int(p * 0.13)))
    bg.alpha_composite(sh, (0, 14))
    bg.alpha_composite(ring)
    return bg.convert("RGB")


def save_webp(image: Image.Image, name: str, quality: int = 88) -> None:
    image.save(MEDIA / name, "WEBP", quality=quality, method=6)


def reserve_image(wide: bool = False) -> Image.Image:
    size = (1600, 1200) if wide else (1400, 1200)
    bg = warm_background(size)
    pw, ph = (720, 820) if wide else (620, 720)
    pouch = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    sh = Image.new("RGBA", pouch.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh, "RGBA")
    sd.rounded_rectangle((70, 80, pw - 45, ph - 35), radius=80, fill=(10, 20, 35, 90))
    sh = sh.filter(ImageFilter.GaussianBlur(25))
    pouch.alpha_composite(sh, (10, 16))
    d = ImageDraw.Draw(pouch, "RGBA")
    d.rounded_rectangle((55, 55, pw - 55, ph - 55), radius=72, fill=NAVY)
    d.rounded_rectangle((65, 75, pw - 65, 160), radius=28, fill=(18, 31, 52, 255))
    d.line((85, 125, pw - 85, 125), fill=(215, 199, 168, 170), width=6)
    for i in range(9):
        x = 85 + i * max(42, (pw - 170) // 9)
        d.line((x, 175, x - 12, ph - 100), fill=(255, 255, 255, 10), width=3)
    d.rounded_rectangle((pw // 2 - 120, ph // 2 - 55, pw // 2 + 120, ph // 2 + 55), radius=14, fill=(246, 243, 237, 245))
    d.text((pw // 2, ph // 2), "PERLIVIO", anchor="mm", fill=NAVY)

    pouch_center = (size[0] * (0.72 if wide else 0.56), size[1] * 0.52)
    add_shadow(bg, pouch, pouch_center, blur=22, opacity=55, dy=14)
    paste_center(bg, pouch, pouch_center)

    loose = [
        ("agate-blanche", (0.23, 0.64)), ("onyx-noir", (0.32, 0.75)),
        ("aventurine-verte", (0.21, 0.82)), ("oeil-de-tigre", (0.39, 0.88)),
        ("amethyste", (0.46, 0.78)),
    ]
    if wide:
        loose = [
            ("agate-rouge", (0.18, 0.35)), ("quartz-rose", (0.31, 0.44)),
            ("lapis-lazuli", (0.41, 0.57)), ("howlite", (0.29, 0.68)),
            ("aventurine-jaune", (0.18, 0.78)), ("onyx-noir", (0.45, 0.82)),
        ]
    for slug, (fx, fy) in loose:
        bead = load_bead(slug, 165 if wide else 155)
        center = (size[0] * fx, size[1] * fy)
        add_shadow(bg, bead, center, blur=9, opacity=75, dy=8)
        paste_center(bg, bead, center)
    return bg.convert("RGB")


def hero_scene(stones: list[str]) -> Image.Image:
    bg = warm_background((1800, 1350), wood=True)
    ring = stage(stones, size=1400, clasp_angle=-3)
    ring = ring.rotate(7, expand=True, resample=Image.Resampling.BICUBIC)
    ring.thumbnail((1260, 1260), Image.Resampling.LANCZOS)
    center = (900, 710)
    add_shadow(bg, ring, center, blur=28, opacity=58, dy=18)
    paste_center(bg, ring, center)
    bg = ImageEnhance.Contrast(bg.convert("RGB")).enhance(1.03)
    return bg


def clasp_detail() -> Image.Image:
    bg = warm_background((1600, 1200), wood=True)
    clasp = metallic_clasp((1200, 720))
    clasp = clasp.rotate(-9, expand=True, resample=Image.Resampling.BICUBIC)
    clasp.thumbnail((1280, 900), Image.Resampling.LANCZOS)
    center = (820, 610)
    add_shadow(bg, clasp, center, blur=30, opacity=70, dy=20)
    paste_center(bg, clasp, center)
    return bg.convert("RGB")


def apply_code_fixes() -> None:
    app_path = ROOT / "assets" / "js" / "app.js"
    app = app_path.read_text(encoding="utf-8")
    old = '''    const radius = count >= 18 ? 34.2 : count === 17 ? 33.9 : count === 16 ? 33.6 : 33.1;\n    const beadSize = count >= 18 ? 12.5 : count === 17 ? 13.1 : count === 16 ? 13.8 : count === 15 ? 14.4 : 15;\n    // A wider opening at the bottom leaves room for the real, low-profile opening mechanism.\n    const gapCenter = 90, gapSpan = 46, start = gapCenter + gapSpan/2, span = 360-gapSpan;'''
    new = '''    // Keep 8 mm beads physically separated: the previous radius made 16–18 beads overlap.\n    const radius = 39;\n    const beadSize = count >= 18 ? 12 : count === 17 ? 12.5 : count === 16 ? 13 : count === 15 ? 13.5 : 14;\n    // Preserve a real opening for the low-profile bayonet mechanism instead of hiding it under beads.\n    const gapCenter = 90, gapSpan = 42, start = gapCenter + gapSpan/2, span = 360-gapSpan;'''
    if old in app:
        app = app.replace(old, new)
    app_path.write_text(app, encoding="utf-8")

    css_path = ROOT / "assets" / "css" / "site.css"
    css = css_path.read_text(encoding="utf-8")
    marker = "/* visual-integrity-2026-08-29 */"
    if marker not in css:
        css += f'''\n\n{marker}\n.bracelet-clasp{{width:24%;height:auto;aspect-ratio:auto;left:50%;top:86.8%;transform:translate(-50%,-50%) rotate(-2deg);z-index:5;border-radius:0;background:transparent;box-shadow:none;filter:drop-shadow(0 5px 6px rgba(19,35,61,.22));object-fit:contain}}\n.collection-packshot{{object-fit:cover;aspect-ratio:1/1}}\n@media(max-width:760px){{.bracelet-clasp{{width:25%;top:87%}}}}\n'''
        css_path.write_text(css, encoding="utf-8")

    index_path = ROOT / "index.html"
    index = index_path.read_text(encoding="utf-8")
    index = index.replace('alt="Bracelet Perlivio en pierres naturelles porté au poignet"', 'alt="Bracelet Perlivio en pierres naturelles, vue produit sur fond chaleureux"')
    index_path.write_text(index, encoding="utf-8")


def generate_assets() -> None:
    MEDIA.mkdir(parents=True, exist_ok=True)
    clasp = metallic_clasp()
    clasp.save(MEDIA / "clasp-cutout.webp", "WEBP", quality=92, method=6)

    packs = {
        "essentiel": ["agate-blanche", "quartz-clair", "howlite", "agate-blanche", "aventurine-verte", "agate-blanche", "quartz-clair", "howlite", "agate-blanche", "quartz-clair", "onyx-noir", "agate-blanche", "aventurine-verte", "howlite", "quartz-clair", "agate-blanche"],
        "metal": ["howlite", "onyx-noir", "oeil-de-tigre", "howlite", "onyx-noir", "oeil-de-tigre", "howlite", "onyx-noir", "oeil-de-tigre", "howlite", "onyx-noir", "oeil-de-tigre", "howlite", "onyx-noir", "oeil-de-tigre", "howlite"],
        "inox": ["sodalite", "lapis-lazuli", "onyx-noir", "howlite", "sodalite", "lapis-lazuli", "onyx-noir", "howlite", "sodalite", "lapis-lazuli", "onyx-noir", "howlite", "sodalite", "lapis-lazuli", "onyx-noir", "howlite"],
        "argent": ["quartz-rose", "amethyste", "quartz-clair", "agate-blanche", "quartz-rose", "amethyste", "quartz-clair", "agate-blanche", "quartz-rose", "amethyste", "quartz-clair", "agate-blanche", "quartz-rose", "amethyste", "quartz-clair", "agate-blanche"],
        "signature": ["onyx-noir"] * 16,
    }
    for name, stones in packs.items():
        spacer = name if name in {"metal", "inox", "argent"} else None
        save_webp(packshot(stones, spacer=spacer, angle={"essentiel": -2, "metal": 2, "inox": -3, "argent": 1, "signature": -1}[name]), f"packshot-{name}.webp")

    mixed = ["howlite", "agate-rouge", "oeil-de-tigre", "agate-blanche", "aventurine-verte", "onyx-noir", "quartz-rose", "sodalite", "lapis-lazuli", "amethyste", "quartz-clair", "jaspe", "agate-verte", "aventurine-jaune", "obsidienne-or", "gres-bleu"]
    save_webp(packshot(mixed, angle=-4), "bracelet-single-a.webp")
    save_webp(packshot(packs["essentiel"], angle=4), "bracelet-single-b.webp")
    save_webp(packshot(packs["metal"], spacer="metal", angle=3), "bracelet-single-d.webp")
    save_webp(packshot(packs["argent"], spacer="argent", angle=-2), "bracelet-single-e.webp")
    save_webp(packshot(mixed, angle=0), "collections-overview.webp")
    save_webp(hero_scene(mixed), "hero-lifestyle.webp", quality=90)
    save_webp(clasp_detail(), "clasp-detail.webp", quality=90)
    save_webp(reserve_image(False), "packshot-reserve.webp")
    save_webp(reserve_image(True), "reserve-lifestyle.webp")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assets-only", action="store_true")
    args = parser.parse_args()
    generate_assets()
    if not args.assets_only:
        apply_code_fixes()


if __name__ == "__main__":
    main()
