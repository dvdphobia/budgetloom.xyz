#!/usr/bin/env python3
"""
Generate Pinterest pin images for each blog post + printable.
Uses Pillow (pip install Pillow).
Output: public/pins/*.png (1000x1500 px)
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUT = "../../public/pins"
os.makedirs(OUT, exist_ok=True)

BG_COLORS = ["#10b981", "#059669", "#047857", "#065f46"]

PINS = [
    ("Save $500 in 30 days", "Free printable challenge", "budgetloom.com", 0),
    ("Eat for $40 a week", "Budget meal plan printable", "budgetloom.com", 1),
    ("Budget when you feel broke", "Simple starter guide", "budgetloom.com", 2),
    ("No-spend weekend ideas", "Free fun activities", "budgetloom.com", 3),
    ("Budget Starter Bundle", "12-page planner printable", "budgetloom.com", 0),
    ("Meal Planner Budget Kit", "8-page grocery planner", "budgetloom.com", 1),
    ("Debt Payoff Planner", "Snowball + avalanche tracker", "budgetloom.com", 2),
]


def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def make_pin(title, subtitle, url, idx):
    img = Image.new('RGB', (1000, 1500), hex_to_rgb(BG_COLORS[idx % len(BG_COLORS)]))
    d = ImageDraw.Draw(img)
    try:
        f_title = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 72)
        f_sub = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 42)
        f_url = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 32)
    except Exception:
        f_title = f_sub = f_url = ImageFont.load_default()

    # Title wrapped roughly
    words = title.split()
    lines = []
    cur = ""
    for w in words:
        if len(cur + " " + w) < 14:
            cur = (cur + " " + w).strip()
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)

    y = 500
    for line in lines:
        d.text((500, y), line, font=f_title, fill=(255,255,255), anchor='mm')
        y += 90

    d.text((500, y+40), subtitle, font=f_sub, fill=(230,255,245), anchor='mm')
    d.text((500, 1350), url, font=f_url, fill=(200,255,230), anchor='mm')

    path = os.path.join(OUT, f"pin_{idx}_{title.lower().replace(' ', '_').replace('/', '')[:40]}.png")
    img.save(path)
    return path


if __name__ == "__main__":
    for i, (t, s, u, idx) in enumerate(PINS):
        path = make_pin(t, s, u, i)
        print(f"Created {path}")
    print(f"Done. {len(PINS)} pins ready in {OUT}/")
