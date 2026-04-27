from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter
import math
import random


ROOT = Path(__file__).resolve().parents[1]
BASE_DIR = ROOT / "assets" / "craft-items" / "class-base"
OUT_DIR = ROOT / "assets" / "craft-items" / "generated"

CLASSES = {
    "guc": {
        "primary": (245, 184, 61),
        "secondary": (239, 99, 81),
        "aura": (255, 211, 88),
        "shape": "slash",
    },
    "krit": {
        "primary": (239, 55, 70),
        "secondary": (245, 184, 61),
        "aura": (255, 65, 91),
        "shape": "spikes",
    },
    "tank": {
        "primary": (74, 144, 226),
        "secondary": (170, 190, 205),
        "aura": (84, 166, 255),
        "shape": "plates",
    },
    "uvorot": {
        "primary": (51, 209, 160),
        "secondary": (90, 240, 210),
        "aura": (62, 240, 185),
        "shape": "speed",
    },
    "mag": {
        "primary": (124, 94, 255),
        "secondary": (49, 199, 255),
        "aura": (87, 145, 255),
        "shape": "runes",
    },
}

SLOTS = ["helmet", "weapon", "offhand", "armor", "belt", "gloves", "leggings", "boots"]


def alpha_mask(image):
    return image.split()[-1]


def tint_subject(image, color, strength):
    overlay = Image.new("RGBA", image.size, color + (0,))
    overlay.putalpha(alpha_mask(image).point(lambda a: int(a * strength)))
    return Image.alpha_composite(image, overlay)


def glow_from_alpha(image, color, radius, opacity):
    mask = alpha_mask(image).filter(ImageFilter.GaussianBlur(radius))
    glow = Image.new("RGBA", image.size, color + (0,))
    glow.putalpha(mask.point(lambda a: int(a * opacity)))
    return glow


def polygon_star(cx, cy, outer, inner, points):
    coords = []
    for i in range(points * 2):
        angle = -math.pi / 2 + i * math.pi / points
        radius = outer if i % 2 == 0 else inner
        coords.append((cx + math.cos(angle) * radius, cy + math.sin(angle) * radius))
    return coords


def draw_level_frame(draw, level, colors):
    primary = colors["primary"]
    secondary = colors["secondary"]
    tier = max(1, level - 3)
    border = 2 + min(5, tier // 2)
    inset = 8
    draw.rounded_rectangle((inset, inset, 248, 248), radius=24, outline=primary + (160,), width=border)
    draw.rounded_rectangle((inset + 6, inset + 6, 242, 242), radius=20, outline=secondary + (70,), width=1)
    for i in range(min(6, tier)):
        x = 28 + i * 18
        draw.line((x, 237, x + 10, 228), fill=primary + (110,), width=2)


def draw_class_marks(draw, class_id, level, rng):
    cfg = CLASSES[class_id]
    primary = cfg["primary"] + (150,)
    secondary = cfg["secondary"] + (135,)
    tier = level - 3
    if cfg["shape"] == "slash":
        for i in range(2 + tier // 3):
            x = rng.randint(36, 178)
            draw.line((x, 218, x + rng.randint(36, 58), 40), fill=secondary, width=2 + tier // 4)
    elif cfg["shape"] == "spikes":
        for i in range(3 + tier // 2):
            x = 32 + i * 30
            draw.polygon([(x, 224), (x + 13, 188 - tier * 2), (x + 26, 224)], fill=primary)
    elif cfg["shape"] == "plates":
        for i in range(3):
            y = 58 + i * 52
            draw.rounded_rectangle((24, y, 232, y + 22), radius=7, outline=primary, width=2)
    elif cfg["shape"] == "speed":
        for i in range(4 + tier // 2):
            y = rng.randint(48, 218)
            draw.line((22, y, 92 + tier * 8, y - rng.randint(12, 28)), fill=primary, width=2)
    elif cfg["shape"] == "runes":
        for i in range(3 + tier // 2):
            x = rng.randint(34, 220)
            y = rng.randint(38, 220)
            r = rng.randint(6, 11)
            draw.ellipse((x - r, y - r, x + r, y + r), outline=secondary, width=2)
            draw.line((x - r, y, x + r, y), fill=primary, width=1)


def draw_level_badge(draw, level, colors):
    primary = colors["primary"]
    secondary = colors["secondary"]
    cx, cy = 211, 44
    if level >= 12:
        draw.polygon(polygon_star(cx, cy, 25, 14, 7), fill=primary + (230,), outline=(255, 245, 210, 190))
    elif level >= 8:
        draw.polygon(polygon_star(cx, cy, 24, 15, 5), fill=primary + (220,), outline=secondary + (200,))
    else:
        draw.ellipse((cx - 22, cy - 22, cx + 22, cy + 22), fill=primary + (210,), outline=secondary + (180,), width=2)
    draw.text((cx - 10, cy - 7), str(level), fill=(18, 14, 10, 255))


def background(colors, level, rng):
    img = Image.new("RGBA", (256, 256), (8, 9, 10, 255))
    draw = ImageDraw.Draw(img, "RGBA")
    primary = colors["primary"]
    secondary = colors["secondary"]
    tier = (level - 4) / 11
    for y in range(256):
        mix = y / 255
        r = int(12 + primary[0] * 0.18 * (1 - mix) + secondary[0] * 0.12 * mix)
        g = int(14 + primary[1] * 0.18 * (1 - mix) + secondary[1] * 0.12 * mix)
        b = int(16 + primary[2] * 0.18 * (1 - mix) + secondary[2] * 0.12 * mix)
        draw.line((0, y, 256, y), fill=(r, g, b, 255))
    for i in range(18 + level):
        x = rng.randint(0, 255)
        y = rng.randint(0, 255)
        radius = rng.randint(8, 32)
        alpha = int(16 + tier * 28)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=primary + (alpha,))
    return img


def make_item(class_id, slot, level):
    rng = random.Random(f"{class_id}-{slot}-{level}")
    colors = CLASSES[class_id]
    base = Image.open(BASE_DIR / f"{class_id}-{slot}.png").convert("RGBA")
    base = ImageEnhance.Contrast(base).enhance(1.05 + (level - 4) * 0.025)
    base = ImageEnhance.Color(base).enhance(1.08 + (level - 4) * 0.018)
    base = tint_subject(base, colors["primary"], 0.08 + (level - 4) * 0.012)

    canvas = background(colors, level, rng)
    draw = ImageDraw.Draw(canvas, "RGBA")
    draw_class_marks(draw, class_id, level, rng)

    subject_shadow = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    subject_shadow.alpha_composite(glow_from_alpha(base, (0, 0, 0), 8, 0.55), (6, 10))
    canvas = Image.alpha_composite(canvas, subject_shadow)

    for radius, opacity in [(18, 0.34), (7, 0.22)]:
        canvas = Image.alpha_composite(canvas, glow_from_alpha(base, colors["aura"], radius, opacity))
    canvas = Image.alpha_composite(canvas, base)

    draw = ImageDraw.Draw(canvas, "RGBA")
    if level >= 8:
        for i in range(2 + (level - 8) // 2):
            x = rng.randint(36, 220)
            y = rng.randint(36, 220)
            draw.line((x - 8, y, x + 8, y), fill=colors["secondary"] + (150,), width=2)
            draw.line((x, y - 8, x, y + 8), fill=colors["secondary"] + (150,), width=2)
    if level >= 12:
        for i in range(12):
            x = rng.randint(20, 236)
            y = rng.randint(20, 236)
            draw.ellipse((x - 2, y - 2, x + 2, y + 2), fill=(255, 245, 190, 120))

    draw_level_frame(draw, level, colors)
    draw_level_badge(draw, level, colors)

    vignette = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette, "RGBA")
    vdraw.rectangle((0, 0, 256, 256), outline=(0, 0, 0, 110), width=12)
    canvas = Image.alpha_composite(canvas, vignette)
    return canvas


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    count = 0
    for class_id in CLASSES:
        for slot in SLOTS:
            for level in range(4, 16):
                item = make_item(class_id, slot, level)
                item.save(OUT_DIR / f"{class_id}-{slot}-{level:02d}.png", optimize=True)
                count += 1
    print(f"Generated {count} gear images in {OUT_DIR}")


if __name__ == "__main__":
    main()
