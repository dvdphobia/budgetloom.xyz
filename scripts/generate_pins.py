#!/usr/bin/env python3
"""
Generate beautiful Pinterest pin images for BudgetLoom.
1000x1500px vertical, optimized for Pinterest feed.
Requires Pillow (pip install Pillow).
"""
import os, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "pins")
os.makedirs(OUT, exist_ok=True)

# Brand colors
GREEN = (5, 150, 105)
GREEN_DARK = (6, 95, 70)
GREEN_MINT = (236, 253, 245)
GREEN_LIGHT = (209, 250, 229)
AMBER = (217, 119, 6)
AMBER_LIGHT = (254, 243, 199)
CREAM = (253, 252, 247)
DARK = (12, 26, 30)
WHITE = (255, 255, 255)
GRAY = (107, 114, 128)
GRAY_LIGHT = (156, 163, 175)

# Fonts
try:
    F_BLACK = ImageFont.truetype('/usr/share/fonts/noto/NotoSans-Black.ttf', 78)
    F_BOLD = ImageFont.truetype('/usr/share/fonts/noto/NotoSans-Bold.ttf', 52)
    F_BOLD_SM = ImageFont.truetype('/usr/share/fonts/noto/NotoSans-Bold.ttf', 32)
    F_REG = ImageFont.truetype('/usr/share/fonts/noto/NotoSans-Regular.ttf', 28)
    F_SERIF_BOLD = ImageFont.truetype('/usr/share/fonts/noto/NotoSerif-Bold.ttf', 64)
except Exception:
    F_BLACK = F_BOLD = F_BOLD_SM = F_REG = F_SERIF_BOLD = ImageFont.load_default()


def wrap_text(draw, text, font, max_width):
    """Wrap text to fit within max_width."""
    words = text.split()
    lines = []
    current = []
    for word in words:
        test = ' '.join(current + [word])
        bbox = draw.textbbox((0, 0), test, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current.append(word)
        else:
            if current:
                lines.append(' '.join(current))
            current = [word]
    if current:
        lines.append(' '.join(current))
    return lines


def draw_logo(draw, x, y, size=36):
    """Draw simplified loom logo mark."""
    # Background rounded rect
    draw.rounded_rectangle([x, y, x + size, y + size], radius=size * 0.22, fill=GREEN)
    # Horizontal lines
    for i in range(4):
        yy = y + size * (0.25 + i * 0.17)
        draw.line([x + size * 0.2, yy, x + size * 0.8, yy],
                  fill=(255, 255, 255, 100), width=2)
    # Vertical lines
    for i in range(3):
        xx = x + size * (0.32 + i * 0.18)
        draw.line([xx, y + size * 0.18, xx, y + size * 0.82],
                  fill=(255, 255, 255), width=2)
    # Center dot
    draw.ellipse([x + size * 0.42, y + size * 0.42, x + size * 0.58, y + size * 0.58],
                 fill=AMBER_LIGHT)


def draw_decorative_bg(draw, w, h, accent_color):
    """Draw decorative background pattern."""
    # Subtle dot grid
    for x in range(0, w, 40):
        for y in range(0, h, 40):
            r = 2
            draw.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, 8))


def make_pin(slug, title, subtitle, category, accent=GREEN, bg_type='cream'):
    """Generate a beautiful pin image."""
    w, h = 1000, 1500

    # Background
    if bg_type == 'cream':
        img = Image.new('RGBA', (w, h), CREAM + (255,))
    elif bg_type == 'green':
        img = Image.new('RGBA', (w, h), GREEN + (255,))
    elif bg_type == 'dark':
        img = Image.new('RGBA', (w, h), DARK + (255,))
    else:
        img = Image.new('RGBA', (w, h), WHITE + (255,))

    draw = ImageDraw.Draw(img)

    # Decorative circles
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)

    if bg_type == 'cream':
        # Large accent circle top-right
        od.ellipse([700, -100, 1200, 400], fill=accent + (20,))
        # Small amber circle bottom-left
        od.ellipse([-80, 1100, 300, 1500], fill=AMBER + (15,))
        # Medium mint circle
        od.ellipse([50, 200, 350, 500], fill=GREEN_MINT + (200,))
    elif bg_type == 'green':
        # Darker green overlay
        od.ellipse([600, -100, 1200, 500], fill=GREEN_DARK + (100,))
        od.ellipse([-100, 1200, 400, 1700], fill=GREEN_DARK + (80,))
    elif bg_type == 'dark':
        od.ellipse([600, -50, 1200, 450], fill=accent + (30,))
        od.ellipse([-80, 1200, 350, 1600], fill=accent + (15,))

    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # Top bar
    draw.rectangle([0, 0, w, 12], fill=accent)

    # Logo top-left
    draw_logo(draw, 60, 50, 36)
    draw.text((106, 55), "BudgetLoom", font=F_BOLD_SM, fill=DARK if bg_type != 'dark' else WHITE)

    # Category badge
    cat_text = category.upper()
    cat_bbox = draw.textbbox((0, 0), cat_text, font=F_BOLD_SM)
    cat_w = cat_bbox[2] - cat_bbox[0] + 28
    cat_x = (w - cat_w) // 2
    cat_y = 140
    draw.rounded_rectangle([cat_x, cat_y, cat_x + cat_w, cat_y + 38], radius=19,
                           fill=accent if bg_type == 'cream' else WHITE)
    draw.text((cat_x + 14, cat_y + 3), cat_text, font=F_BOLD_SM,
              fill=WHITE if bg_type == 'cream' else DARK)

    # Title — big and bold, wrapped
    title_color = WHITE if bg_type in ('green', 'dark') else DARK
    title_font = F_BLACK if bg_type != 'cream' else F_BLACK

    # Manually break title into lines for control
    lines = wrap_text(draw, title, F_BLACK, w - 120)
    line_h = 90
    total_h = len(lines) * line_h
    start_y = (h - total_h) // 2 - 80

    for i, line in enumerate(lines):
        y = start_y + i * line_h
        # Text shadow for depth (except on dark bg)
        if bg_type != 'dark':
            draw.text((62, y + 2), line, font=title_font, fill=(0, 0, 0, 15))
        draw.text((60, y), line, font=title_font, fill=title_color)

    # Subtitle
    sub_y = start_y + total_h + 20
    sub_lines = wrap_text(draw, subtitle, F_BOLD, w - 160)
    for i, line in enumerate(sub_lines):
        bbox = draw.textbbox((0, 0), line, font=F_BOLD)
        lw = bbox[2] - bbox[0]
        lx = (w - lw) // 2
        draw.text((lx, sub_y + i * 55), line, font=F_BOLD,
                  fill=GREEN_LIGHT if bg_type == 'green' else AMBER if bg_type == 'cream' else accent)

    # Bottom section
    bottom_y = h - 180

    # Divider line
    draw.rounded_rectangle([w // 2 - 60, bottom_y, w // 2 + 60, bottom_y + 4], radius=2, fill=accent)

    # URL
    draw.text((w // 2, bottom_y + 25), "budgetloom.xyz", font=F_BOLD_SM,
              fill=WHITE if bg_type in ('green', 'dark') else GRAY, anchor='mm')

    # "Free printable" tag
    tag_text = "FREE PRINTABLE"
    tag_bbox = draw.textbbox((0, 0), tag_text, font=F_BOLD_SM)
    tag_w = tag_bbox[2] - tag_bbox[0] + 24
    tag_x = (w - tag_w) // 2
    tag_y = bottom_y + 60
    draw.rounded_rectangle([tag_x, tag_y, tag_x + tag_w, tag_y + 36], radius=18,
                           fill=AMBER if bg_type != 'cream' else GREEN)
    draw.text((tag_x + 12, tag_y + 2), tag_text, font=F_BOLD_SM,
              fill=WHITE)

    # Convert to RGB for PNG
    img = img.convert('RGB')
    path = os.path.join(OUT, f"pin_{slug}.png")
    img.save(path, 'PNG', optimize=True)
    return path


# ============================================================
# Blog post pins
# ============================================================
BLOG_PINS = [
    {
        "slug": "30_day_money_saving_challenge",
        "title": "Save $500 in 30 Days",
        "subtitle": "A simple daily challenge anyone can do",
        "category": "Savings",
        "accent": GREEN,
        "bg": "cream",
    },
    {
        "slug": "budget_meal_plan_for_one",
        "title": "Eat for $40 a Week",
        "subtitle": "7-day meal plan for one person",
        "category": "Food",
        "accent": AMBER,
        "bg": "cream",
    },
    {
        "slug": "how_to_build_a_budget_when_broke",
        "title": "Budget When You Feel Broke",
        "subtitle": "A step-by-step guide that actually works",
        "category": "Budgeting",
        "accent": GREEN,
        "bg": "green",
    },
    {
        "slug": "no_spend_weekend_ideas",
        "title": "No-Spend Weekend Ideas",
        "subtitle": "Free activities that are actually fun",
        "category": "Lifestyle",
        "accent": AMBER,
        "bg": "cream",
    },
    {
        "slug": "how_to_save_1000_emergency_fund",
        "title": "Build a $1,000 Emergency Fund Fast",
        "subtitle": "Your first savings goal, explained simply",
        "category": "Savings",
        "accent": GREEN,
        "bg": "dark",
    },
    {
        "slug": "frugal_grocery_shopping_tips",
        "title": "15 Grocery Tips That Save Money",
        "subtitle": "Cut your bill without eating rice and beans",
        "category": "Food",
        "accent": AMBER,
        "bg": "cream",
    },
    {
        "slug": "no_spend_month_guide",
        "title": "No-Spend Month Guide",
        "subtitle": "Save $300-$800 in 30 days",
        "category": "Savings",
        "accent": GREEN,
        "bg": "green",
    },
    {
        "slug": "how_to_pay_off_debt_fast",
        "title": "Pay Off Debt Faster",
        "subtitle": "Snowball vs avalanche, explained simply",
        "category": "Debt",
        "accent": AMBER,
        "bg": "dark",
    },
    {
        "slug": "cheap_date_ideas",
        "title": "50 Dates Under $10",
        "subtitle": "Memorable dates that don't feel cheap",
        "category": "Lifestyle",
        "accent": AMBER,
        "bg": "cream",
    },
    {
        "slug": "how_to_stop_impulse_buying",
        "title": "Stop Impulse Buying",
        "subtitle": "7 rules that actually work",
        "category": "Budgeting",
        "accent": GREEN,
        "bg": "green",
    },
    {
        "slug": "budget_printables_how_to_use",
        "title": "How to Use Budget Printables",
        "subtitle": "The system that actually saves money",
        "category": "Budgeting",
        "accent": GREEN,
        "bg": "cream",
    },
    {
        "slug": "save_money_on_utilities",
        "title": "Save Money on Utilities",
        "subtitle": "12 easy ways to cut your bills",
        "category": "Savings",
        "accent": GREEN,
        "bg": "green",
    },
    {
        "slug": "low_income_budget_tips",
        "title": "Budgeting on Low Income",
        "subtitle": "Real advice for tight budgets",
        "category": "Budgeting",
        "accent": AMBER,
        "bg": "dark",
    },
    {
        "slug": "free_fun_things_to_do",
        "title": "100 Free Things to Do",
        "subtitle": "Instead of spending money",
        "category": "Lifestyle",
        "accent": AMBER,
        "bg": "cream",
    },
]

# ============================================================
# Printable pins
# ============================================================
PRINTABLE_PINS = [
    {
        "slug": "budget_starter_bundle",
        "title": "Budget Starter Bundle",
        "subtitle": "12-page printable planner — free",
        "category": "Printable",
        "accent": GREEN,
        "bg": "cream",
    },
    {
        "slug": "30_day_savings_challenge",
        "title": "30-Day Savings Challenge",
        "subtitle": "Save $100, $300, or $500",
        "category": "Printable",
        "accent": AMBER,
        "bg": "green",
    },
    {
        "slug": "meal_planner_budget_kit",
        "title": "Meal Planner Budget Kit",
        "subtitle": "Plan meals, cut grocery costs",
        "category": "Printable",
        "accent": AMBER,
        "bg": "cream",
    },
    {
        "slug": "debt_payoff_planner",
        "title": "Debt Payoff Planner",
        "subtitle": "Snowball + avalanche trackers",
        "category": "Printable",
        "accent": GREEN,
        "bg": "dark",
    },
]


if __name__ == "__main__":
    all_pins = BLOG_PINS + PRINTABLE_PINS
    for pin in all_pins:
        path = make_pin(pin["slug"], pin["title"], pin["subtitle"],
                        pin["category"], pin["accent"], pin["bg"])
        print(f"Created {path}")
    print(f"\nDone. {len(all_pins)} pins ready in {OUT}/")