#!/usr/bin/env python3
"""
Generate beautiful printable PDFs for BudgetLoom.
Brand: green #059669, amber #d97706, cream #fdfcf7, dark #0c1a1e
Output: public/printables/*.pdf
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor

OUT = "../../public/printables"
os.makedirs(OUT, exist_ok=True)

# Brand colors
GREEN = HexColor("#059669")
GREEN_DARK = HexColor("#065f46")
GREEN_LIGHT = HexColor("#d1fae5")
GREEN_MINT = HexColor("#ecfdf5")
AMBER = HexColor("#d97706")
AMBER_LIGHT = HexColor("#fef3c7")
CREAM = HexColor("#fdfcf7")
DARK = HexColor("#0c1a1e")
GRAY = HexColor("#6b7280")
GRAY_LIGHT = HexColor("#9ca3af")
BORDER = HexColor("#e5e7eb")
WHITE = HexColor("#ffffff")

W, H = letter  # 612 x 792 points
MARGIN = 0.7 * inch


def draw_logo_mark(c, x, y, size=20):
    """Draw the BudgetLoom loom logo mark at (x, y) bottom-left."""
    c.saveState()
    c.translate(x, y)
    # Background
    c.setFillColor(GREEN)
    c.roundRect(0, 0, size, size, size * 0.22, fill=1, stroke=0)
    # Horizontal lines (warp)
    c.setStrokeColor(WHITE)
    c.setLineWidth(0.8)
    c.setStrokeAlpha(0.4)
    for i in range(4):
        yy = size * (0.25 + i * 0.17)
        c.line(size * 0.2, yy, size * 0.8, yy)
    # Vertical lines (weft)
    c.setStrokeAlpha(0.55)
    c.setLineWidth(1.0)
    for i in range(3):
        xx = size * (0.32 + i * 0.18)
        c.line(xx, size * 0.18, xx, size * 0.82)
    # Center dot
    c.setStrokeAlpha(1)
    c.setFillColor(AMBER_LIGHT)
    c.circle(size * 0.5, size * 0.5, size * 0.09, fill=1, stroke=0)
    c.restoreState()


def draw_brand(c, x, y, size=20):
    """Draw logo + wordmark."""
    draw_logo_mark(c, x, y - size * 0.2, size)
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(DARK)
    c.drawString(x + size + 6, y - size * 0.15, "BudgetLoom")


def draw_cover(c, title, subtitle, pages_label):
    """Draw a beautiful cover page."""
    # Cream background
    c.setFillColor(CREAM)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Decorative top band
    c.setFillColor(GREEN)
    c.rect(0, H - 0.5 * inch, W, 0.5 * inch, fill=1, stroke=0)

    # Decorative circles
    c.setFillColor(GREEN_MINT)
    c.circle(W - 1.2 * inch, H - 3 * inch, 2.5 * inch, fill=1, stroke=0)
    c.setFillColor(GREEN_LIGHT)
    c.circle(W - 0.5 * inch, H - 4.5 * inch, 1.5 * inch, fill=1, stroke=0)
    c.setFillColor(AMBER_LIGHT)
    c.circle(1 * inch, 2.5 * inch, 1.8 * inch, fill=1, stroke=0)

    # Logo
    draw_logo_mark(c, MARGIN, H - 1.3 * inch, 28)
    c.setFont("Helvetica-Bold", 16)
    c.setFillColor(DARK)
    c.drawString(MARGIN + 34, H - 1.25 * inch, "BudgetLoom")

    # Title — large, centered
    c.setFont("Helvetica-Bold", 32)
    c.setFillColor(DARK)
    c.drawCentredString(W / 2, H / 2 + 0.6 * inch, title)

    # Subtitle
    c.setFont("Helvetica", 14)
    c.setFillColor(GRAY)
    c.drawCentredString(W / 2, H / 2 - 0.1 * inch, subtitle)

    # Pages label badge
    badge_w = 120
    badge_x = W / 2 - badge_w / 2
    badge_y = H / 2 - 0.8 * inch
    c.setFillColor(GREEN)
    c.roundRect(badge_x, badge_y, badge_w, 30, 15, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(WHITE)
    c.drawCentredString(W / 2, badge_y + 10, pages_label)

    # Bottom decorative line
    c.setStrokeColor(GREEN_LIGHT)
    c.setLineWidth(2)
    c.line(W / 2 - 30, 2 * inch, W / 2 + 30, 2 * inch)

    # Footer
    c.setFont("Helvetica", 9)
    c.setFillColor(GRAY_LIGHT)
    c.drawCentredString(W / 2, 1.5 * inch, "budgetloom.xyz")
    c.setFont("Helvetica", 8)
    c.drawCentredString(W / 2, 1.2 * inch, "Print at home  .  Personal use only")

    c.showPage()


def draw_page_header(c, title, section_label=""):
    """Draw consistent page header with brand and title."""
    # White background
    c.setFillColor(WHITE)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Top accent line
    c.setFillColor(GREEN)
    c.rect(0, H - 0.12 * inch, W, 0.12 * inch, fill=1, stroke=0)

    # Brand top-right
    draw_logo_mark(c, W - MARGIN - 16, H - 0.6 * inch, 16)
    c.setFont("Helvetica-Bold", 9)
    c.setFillColor(GRAY)
    c.drawRightString(W - MARGIN - 20, H - 0.55 * inch, "BudgetLoom")

    # Title
    c.setFont("Helvetica-Bold", 20)
    c.setFillColor(DARK)
    c.drawString(MARGIN, H - 1.1 * inch, title)

    # Section label
    if section_label:
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(GREEN)
        c.drawString(MARGIN, H - 1.35 * inch, section_label.upper())

    # Divider line
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.line(MARGIN, H - 1.5 * inch, W - MARGIN, H - 1.5 * inch)


def draw_page_footer(c, page_num, total_pages):
    """Draw footer with page number and brand."""
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.line(MARGIN, 0.65 * inch, W - MARGIN, 0.65 * inch)

    c.setFont("Helvetica", 8)
    c.setFillColor(GRAY_LIGHT)
    c.drawString(MARGIN, 0.45 * inch, "BudgetLoom  .  budgetloom.xyz")
    c.drawRightString(W - MARGIN, 0.45 * inch, f"{page_num} / {total_pages}")


def draw_section_title(c, x, y, text, color=GREEN):
    """Draw a section title with a colored left bar."""
    c.setFillColor(color)
    c.roundRect(x, y - 2, 3, 16, 1.5, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(DARK)
    c.drawString(x + 8, y, text)


def draw_input_line(c, x, y, width, label=""):
    """Draw a labeled input line."""
    if label:
        c.setFont("Helvetica", 11)
        c.setFillColor(GRAY)
        c.drawString(x, y, label)
        label_w = c.stringWidth(label, "Helvetica", 11)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.8)
        c.line(x + label_w + 4, y - 2, x + width, y - 2)
    else:
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.8)
        c.line(x, y - 2, x + width, y - 2)


def draw_checkbox(c, x, y, size=10):
    """Draw a rounded checkbox."""
    c.setStrokeColor(GRAY_LIGHT)
    c.setLineWidth(0.8)
    c.roundRect(x, y, size, size, 2, fill=0, stroke=1)


def draw_fill_box(c, x, y, w, h, label="", r=4):
    """Draw a fillable rounded box with optional label inside."""
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.8)
    c.setFillColor(WHITE)
    c.roundRect(x, y, w, h, r, fill=1, stroke=1)
    if label:
        c.setFont("Helvetica", 8)
        c.setFillColor(GRAY_LIGHT)
        c.drawCentredString(x + w / 2, y + h / 2 - 3, label)


# ============================================================
def make_budget_starter_bundle():
    path = os.path.join(OUT, "budget-starter-bundle.pdf")
    c = canvas.Canvas(path, pagesize=letter)
    total = 5

    # Cover
    draw_cover(c, "Budget Starter\nBundle", "Everything you need to start budgeting", "12 pages  .  PDF")

    # Page 2: Monthly Budget
    draw_page_header(c, "Monthly Budget", "Budget Starter Bundle")
    y = H - 1.9 * inch

    draw_section_title(c, MARGIN, y, "Income")
    y -= 0.45 * inch
    income_items = ["Paycheck 1", "Paycheck 2", "Side income", "Other", "TOTAL"]
    for item in income_items:
        is_total = item == "TOTAL"
        c.setFont("Helvetica-Bold" if is_total else "Helvetica", 11)
        c.setFillColor(DARK if is_total else GRAY)
        c.drawString(MARGIN + 0.1 * inch, y, item)
        if is_total:
            c.setFillColor(GREEN_MINT)
            c.roundRect(MARGIN + 2.5 * inch, y - 4, 4.5 * inch, 20, 4, fill=1, stroke=0)
        draw_input_line(c, MARGIN + 2.5 * inch, y, 4.5 * inch)
        y -= 0.38 * inch

    y -= 0.2 * inch
    draw_section_title(c, MARGIN, y, "Expenses", AMBER)
    y -= 0.45 * inch
    expenses = ["Rent / Mortgage", "Utilities", "Groceries", "Transportation", "Insurance",
                "Debt payments", "Subscriptions", "Personal / Fun", "Other", "TOTAL"]
    for item in expenses:
        is_total = item == "TOTAL"
        c.setFont("Helvetica-Bold" if is_total else "Helvetica", 11)
        c.setFillColor(DARK if is_total else GRAY)
        c.drawString(MARGIN + 0.1 * inch, y, item)
        if is_total:
            c.setFillColor(AMBER_LIGHT)
            c.roundRect(MARGIN + 2.5 * inch, y - 4, 4.5 * inch, 20, 4, fill=1, stroke=0)
        draw_input_line(c, MARGIN + 2.5 * inch, y, 4.5 * inch)
        y -= 0.36 * inch

    y -= 0.15 * inch
    draw_section_title(c, MARGIN, y, "Summary", GREEN_DARK)
    y -= 0.4 * inch
    summary = ["Total Income", "Total Expenses", "Remaining"]
    for item in summary:
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(GRAY)
        c.drawString(MARGIN + 0.1 * inch, y, item)
        c.setFillColor(GREEN_MINT)
        c.roundRect(MARGIN + 2.5 * inch, y - 4, 4.5 * inch, 20, 4, fill=1, stroke=0)
        draw_input_line(c, MARGIN + 2.5 * inch, y, 4.5 * inch)
        y -= 0.38 * inch

    draw_page_footer(c, 2, total)
    c.showPage()

    # Page 3: Expense Tracker
    draw_page_header(c, "Expense Tracker", "Budget Starter Bundle")
    y = H - 1.9 * inch

    # Table header
    cols = [("Date", 1.0), ("Description", 2.8), ("Category", 1.8), ("Amount", 1.5)]
    x = MARGIN
    c.setFillColor(GREEN_MINT)
    c.roundRect(MARGIN, y - 4, W - 2 * MARGIN, 22, 4, fill=1, stroke=0)
    for label, w in cols:
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(GREEN_DARK)
        c.drawString(x + 6, y + 2, label)
        x += w * inch
    y -= 0.4 * inch

    # Table rows
    for i in range(16):
        x = MARGIN
        row_h = 0.35 * inch
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.5)
        c.line(MARGIN, y - 2, W - MARGIN, y - 2)
        for label, w in cols:
            c.setStrokeColor(BORDER)
            c.setLineWidth(0.4)
            if i % 2 == 0:
                c.setFillColor(CREAM)
                c.rect(x, y - row_h + 2, w * inch, row_h - 4, fill=1, stroke=0)
            x += w * inch
        y -= row_h

    draw_page_footer(c, 3, total)
    c.showPage()

    # Page 4: Savings Tracker
    draw_page_header(c, "Savings Tracker", "Budget Starter Bundle")
    y = H - 1.9 * inch

    goals = [
        ("Emergency Fund", "$1,000"),
        ("Vacation", "$______"),
        ("Big Purchase", "$______"),
        ("Other Goal", "$______"),
    ]

    for goal_name, goal_amount in goals:
        draw_section_title(c, MARGIN, y, goal_name)
        c.setFont("Helvetica", 10)
        c.setFillColor(GRAY)
        c.drawRightString(W - MARGIN, y, f"Goal: {goal_amount}")
        y -= 0.4 * inch

        # Progress bar
        bar_w = W - 2 * MARGIN - 2 * inch
        bar_x = MARGIN + 0.1 * inch
        c.setFillColor(GREEN_MINT)
        c.roundRect(bar_x, y, bar_w, 12, 6, fill=1, stroke=0)
        c.setFillColor(GREEN)
        c.roundRect(bar_x, y, bar_w * 0.25, 12, 6, fill=1, stroke=0)

        c.setFont("Helvetica", 8)
        c.setFillColor(GRAY_LIGHT)
        c.drawString(bar_x, y - 12, "$0")
        c.drawRightString(bar_x + bar_w, y - 12, goal_amount)

        y -= 0.7 * inch

        # Checkbox grid
        c.setFont("Helvetica", 9)
        c.setFillColor(GRAY)
        c.drawString(MARGIN + 0.1 * inch, y, "Mark each deposit:")
        y -= 0.25 * inch
        for i in range(20):
            col = i % 10
            row = i // 10
            cx = MARGIN + 0.1 * inch + col * 0.65 * inch
            cy = y - row * 0.3 * inch
            draw_checkbox(c, cx, cy)
            c.setFont("Helvetica", 7)
            c.setFillColor(GRAY_LIGHT)
            c.drawString(cx + 13, cy + 1, f"${(i+1)*20}")

        y -= 0.8 * inch

    draw_page_footer(c, 4, total)
    c.showPage()

    # Page 5: Debt Payoff Chart
    draw_page_header(c, "Debt Payoff Chart", "Budget Starter Bundle")
    y = H - 2.0 * inch

    # Info fields
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(GRAY)
    c.drawString(MARGIN, y, "Debt name:")
    draw_input_line(c, MARGIN + 1.2 * inch, y, 5 * inch)
    y -= 0.4 * inch
    c.drawString(MARGIN, y, "Balance:")
    draw_input_line(c, MARGIN + 1.2 * inch, y, 2 * inch)
    c.drawString(MARGIN + 4 * inch, y, "Payoff date:")
    draw_input_line(c, MARGIN + 5.2 * inch, y, 1.5 * inch)
    y -= 0.6 * inch

    # Visual progress grid — 100 squares
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(DARK)
    c.drawString(MARGIN, y, "Color one square for each $___ paid")
    y -= 0.5 * inch

    sq = 0.42 * inch
    gap = 0.08 * inch
    cols = 10
    start_x = MARGIN + 0.3 * inch
    for i in range(100):
        col = i % cols
        row = i // cols
        x = start_x + col * (sq + gap)
        yy = y - row * (sq + gap)
        c.setStrokeColor(GREEN_LIGHT)
        c.setLineWidth(1)
        c.setFillColor(GREEN_MINT)
        c.roundRect(x, yy, sq, sq, 3, fill=1, stroke=1)

    # Bottom note
    y_note = y - 10 * (sq + gap) - 0.3 * inch
    c.setFont("Helvetica-Oblique", 9)
    c.setFillColor(GRAY)
    c.drawString(MARGIN, y_note, "Tip: Each square = 1% of your debt. Fill them in as you pay it down.")

    draw_page_footer(c, 5, total)
    c.showPage()
    c.save()
    print(f"Created {path}")


# ============================================================
def make_savings_challenge():
    path = os.path.join(OUT, "30-day-savings-challenge.pdf")
    c = canvas.Canvas(path, pagesize=letter)
    total = 3

    # Cover
    draw_cover(c, "30-Day Savings\nChallenge", "Save $500 in 30 days", "6 pages  .  PDF")

    # Page 2: $100 Challenge
    draw_page_header(c, "$100 Challenge", "30-Day Savings Challenge")
    y = H - 2.0 * inch

    amounts_100 = [2, 3, 5, 2, 8, 3, 5, 4, 2, 6, 5, 3, 5, 4, 8, 3, 5, 4, 2, 6, 5, 3, 4, 5, 2, 3, 5, 4, 2, 3]
    c.setFont("Helvetica", 10)
    c.setFillColor(GRAY)
    c.drawCentredString(W / 2, y, "Save $100 in 30 days  .  Check each day as you save")
    y -= 0.5 * inch

    for i, amt in enumerate(amounts_100):
        col = i % 2
        row = i // 2
        x = MARGIN + col * (W - 2 * MARGIN) / 2
        yy = y - row * 0.42 * inch

        # Day number circle
        c.setFillColor(GREEN_MINT)
        c.circle(x + 12, yy + 4, 12, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(GREEN_DARK)
        c.drawCentredString(x + 12, yy + 1, str(i + 1))

        # Amount
        c.setFont("Helvetica", 11)
        c.setFillColor(DARK)
        c.drawString(x + 32, yy + 1, f"Save ${amt}")

        # Checkbox
        draw_checkbox(c, x + (W - 2 * MARGIN) / 2 - 25, yy, 12)

    draw_page_footer(c, 2, total)
    c.showPage()

    # Page 3: $300 Challenge
    draw_page_header(c, "$300 Challenge", "30-Day Savings Challenge")
    y = H - 2.0 * inch

    amounts_300 = [5, 10, 8, 15, 12, 8, 10, 15, 12, 8, 10, 12, 8, 15, 10, 12, 8, 10, 15, 12,
                   8, 10, 12, 8, 15, 10, 12, 8, 10, 3]
    c.setFont("Helvetica", 10)
    c.setFillColor(GRAY)
    c.drawCentredString(W / 2, y, "Save $300 in 30 days  .  Check each day as you save")
    y -= 0.5 * inch

    for i, amt in enumerate(amounts_300):
        col = i % 2
        row = i // 2
        x = MARGIN + col * (W - 2 * MARGIN) / 2
        yy = y - row * 0.42 * inch

        c.setFillColor(AMBER_LIGHT)
        c.circle(x + 12, yy + 4, 12, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(AMBER)
        c.drawCentredString(x + 12, yy + 1, str(i + 1))

        c.setFont("Helvetica", 11)
        c.setFillColor(DARK)
        c.drawString(x + 32, yy + 1, f"Save ${amt}")
        draw_checkbox(c, x + (W - 2 * MARGIN) / 2 - 25, yy, 12)

    draw_page_footer(c, 3, total)
    c.showPage()

    # Page 4: $500 Challenge + tracker
    draw_page_header(c, "$500 Challenge", "30-Day Savings Challenge")
    y = H - 2.0 * inch

    amounts_500 = [10, 15, 20, 10, 25, 15, 10, 20, 30, 10, 5, 15, 25, 10, 5, 20, 15, 10,
                   25, 10, 15, 20, 5, 30, 15, 10, 20, 15, 10, 50]
    c.setFont("Helvetica", 10)
    c.setFillColor(GRAY)
    c.drawCentredString(W / 2, y, "Save $500 in 30 days  .  Check each day as you save")
    y -= 0.5 * inch

    for i, amt in enumerate(amounts_500):
        col = i % 2
        row = i // 2
        x = MARGIN + col * (W - 2 * MARGIN) / 2
        yy = y - row * 0.42 * inch

        c.setFillColor(GREEN)
        c.circle(x + 12, yy + 4, 12, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(WHITE)
        c.drawCentredString(x + 12, yy + 1, str(i + 1))

        c.setFont("Helvetica", 11)
        c.setFillColor(DARK)
        c.drawString(x + 32, yy + 1, f"Save ${amt}")
        draw_checkbox(c, x + (W - 2 * MARGIN) / 2 - 25, yy, 12)

    draw_page_footer(c, 3, total)
    c.showPage()
    c.save()
    print(f"Created {path}")


# ============================================================
def make_meal_planner():
    path = os.path.join(OUT, "meal-planner-budget-kit.pdf")
    c = canvas.Canvas(path, pagesize=letter)
    total = 4

    # Cover
    draw_cover(c, "Meal Planner\nBudget Kit", "Plan meals, cut grocery costs", "8 pages  .  PDF")

    # Page 2: Weekly Meal Planner
    draw_page_header(c, "Weekly Meal Planner", "Meal Planner Budget Kit")
    y = H - 1.9 * inch

    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    meals = ["Breakfast", "Lunch", "Dinner"]

    # Header row
    c.setFillColor(GREEN_MINT)
    c.roundRect(MARGIN, y - 4, W - 2 * MARGIN, 24, 4, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 10)
    c.setFillColor(GREEN_DARK)
    c.drawString(MARGIN + 8, y + 2, "Day")
    for j, meal in enumerate(meals):
        c.drawString(MARGIN + 1.3 * inch + j * 2.0 * inch, y + 2, meal)
    c.drawRightString(W - MARGIN - 8, y + 2, "Cost")
    y -= 0.5 * inch

    for day in days:
        # Day label
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(DARK)
        c.drawString(MARGIN + 8, y + 2, day)

        # Meal input lines
        for j in range(3):
            x = MARGIN + 1.3 * inch + j * 2.0 * inch
            c.setStrokeColor(BORDER)
            c.setLineWidth(0.6)
            c.line(x, y - 6, x + 1.8 * inch, y - 6)

        # Cost input
        c.setStrokeColor(BORDER)
        c.line(W - MARGIN - 1.0 * inch, y - 6, W - MARGIN - 8, y - 6)

        # Row separator
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.3)
        c.line(MARGIN, y - 10, W - MARGIN, y - 10)

        y -= 0.65 * inch

    # Total
    y -= 0.1 * inch
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(DARK)
    c.drawString(MARGIN, y, "Weekly Total:")
    c.setFillColor(GREEN_MINT)
    c.roundRect(W - MARGIN - 2.0 * inch, y - 4, 2.0 * inch, 22, 4, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(GREEN_DARK)
    c.drawRightString(W - MARGIN - 8, y + 2, "$______")

    draw_page_footer(c, 2, total)
    c.showPage()

    # Page 3: Grocery List
    draw_page_header(c, "Grocery List", "Meal Planner Budget Kit")
    y = H - 1.9 * inch

    categories = [
        ("Produce", GREEN),
        ("Protein", AMBER),
        ("Pantry", GREEN_DARK),
        ("Dairy", GREEN),
        ("Frozen", AMBER),
        ("Other", GRAY),
    ]

    col_w = (W - 2 * MARGIN - 0.3 * inch) / 3
    for idx, (cat_name, cat_color) in enumerate(categories):
        col = idx % 3
        row = idx // 3
        x = MARGIN + col * (col_w + 0.15 * inch)
        yy = y - row * 3.5 * inch

        # Category header
        c.setFillColor(cat_color)
        c.roundRect(x, yy - 4, col_w, 22, 4, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(WHITE)
        c.drawString(x + 8, yy + 2, cat_name)

        # Checklist lines
        yy -= 0.4 * inch
        for i in range(10):
            draw_checkbox(c, x + 4, yy, 9)
            c.setStrokeColor(BORDER)
            c.setLineWidth(0.5)
            c.line(x + 18, yy - 2, x + col_w - 4, yy - 2)
            yy -= 0.28 * inch

    draw_page_footer(c, 3, total)
    c.showPage()

    # Page 4: Pantry Inventory + Budget
    draw_page_header(c, "Pantry Inventory & Budget", "Meal Planner Budget Kit")
    y = H - 1.9 * inch

    draw_section_title(c, MARGIN, y, "Pantry Inventory")
    y -= 0.45 * inch

    # Two column inventory
    for col in range(2):
        x = MARGIN + col * (W - 2 * MARGIN) / 2
        yy = y
        items = ["", "", "", "", "", "", "", "", "", ""]  # 10 blank rows per column
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(GRAY)
        c.drawString(x + 4, yy, "Item")
        c.drawString(x + 2.0 * inch, yy, "Qty")
        yy -= 0.3 * inch
        for _ in range(10):
            c.setStrokeColor(BORDER)
            c.setLineWidth(0.5)
            c.line(x + 4, yy - 2, x + 1.9 * inch, yy - 2)
            c.line(x + 2.0 * inch, yy - 2, x + 2.5 * inch, yy - 2)
            yy -= 0.3 * inch

    y -= 3.5 * inch

    draw_section_title(c, MARGIN, y, "Weekly Food Budget", AMBER)
    y -= 0.45 * inch
    budget_items = ["Grocery budget", "Actual spent", "Difference", "Saved this week"]
    for item in budget_items:
        c.setFont("Helvetica", 11)
        c.setFillColor(GRAY)
        c.drawString(MARGIN + 0.1 * inch, y, item)
        c.setFillColor(AMBER_LIGHT)
        c.roundRect(MARGIN + 3.0 * inch, y - 4, 3.0 * inch, 20, 4, fill=1, stroke=0)
        draw_input_line(c, MARGIN + 3.0 * inch, y, 3.0 * inch)
        y -= 0.38 * inch

    draw_page_footer(c, 4, total)
    c.showPage()
    c.save()
    print(f"Created {path}")


# ============================================================
def make_debt_payoff():
    path = os.path.join(OUT, "debt-payoff-planner.pdf")
    c = canvas.Canvas(path, pagesize=letter)
    total = 4

    # Cover
    draw_cover(c, "Debt Payoff\nPlanner", "Snowball & avalanche trackers", "10 pages  .  PDF")

    # Page 2: Debt Inventory
    draw_page_header(c, "Debt Inventory", "Debt Payoff Planner")
    y = H - 1.9 * inch

    cols = [("Debt Name", 2.2), ("Balance", 1.3), ("Min Payment", 1.2), ("Interest %", 1.0), ("Priority", 1.0)]
    total_w = sum(w for _, w in cols) * inch

    c.setFillColor(GREEN_MINT)
    c.roundRect(MARGIN, y - 4, total_w, 22, 4, fill=1, stroke=0)
    x = MARGIN
    for label, w in cols:
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(GREEN_DARK)
        c.drawString(x + 6, y + 2, label)
        x += w * inch
    y -= 0.45 * inch

    for i in range(12):
        x = MARGIN
        if i % 2 == 0:
            c.setFillColor(CREAM)
            c.rect(MARGIN, y - 8, total_w, 26, fill=1, stroke=0)
        for _, w in cols:
            c.setStrokeColor(BORDER)
            c.setLineWidth(0.4)
            c.line(x, y - 8, x, y + 18)
            x += w * inch
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.4)
        c.line(MARGIN, y - 8, MARGIN + total_w, y - 8)
        y -= 0.35 * inch

    y -= 0.3 * inch
    draw_section_title(c, MARGIN, y, "Totals", AMBER)
    y -= 0.4 * inch
    for item in ["Total Debt", "Total Monthly Payments", "Average Interest Rate"]:
        c.setFont("Helvetica", 11)
        c.setFillColor(GRAY)
        c.drawString(MARGIN + 0.1 * inch, y, item)
        c.setFillColor(AMBER_LIGHT)
        c.roundRect(MARGIN + 3.5 * inch, y - 4, 3.0 * inch, 20, 4, fill=1, stroke=0)
        draw_input_line(c, MARGIN + 3.5 * inch, y, 3.0 * inch)
        y -= 0.38 * inch

    draw_page_footer(c, 2, total)
    c.showPage()

    # Page 3: Snowball Tracker
    draw_page_header(c, "Debt Snowball Tracker", "Debt Payoff Planner")
    y = H - 1.9 * inch

    c.setFont("Helvetica", 10)
    c.setFillColor(GRAY)
    c.drawString(MARGIN, y, "Pay off smallest balance first  .  Build momentum with quick wins")
    y -= 0.5 * inch

    for debt_num in range(4):
        # Debt slot
        c.setFillColor(GREEN_MINT)
        c.roundRect(MARGIN, y - 4, W - 2 * MARGIN, 22, 4, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(GREEN_DARK)
        c.drawString(MARGIN + 8, y + 2, f"Debt #{debt_num + 1}")

        c.setFont("Helvetica", 10)
        c.setFillColor(GRAY)
        c.drawString(MARGIN + 2.5 * inch, y + 2, "Balance: $")
        draw_input_line(c, MARGIN + 3.3 * inch, y, 1.5 * inch)
        c.drawString(MARGIN + 5.0 * inch, y + 2, "Payoff date:")
        draw_input_line(c, MARGIN + 5.9 * inch, y, 1.0 * inch)
        y -= 0.5 * inch

        # Progress squares
        sq = 0.28 * inch
        gap = 0.06 * inch
        for i in range(40):
            col = i % 20
            row = i // 20
            x = MARGIN + 8 + col * (sq + gap)
            yy = y - row * (sq + gap)
            c.setStrokeColor(GREEN_LIGHT)
            c.setLineWidth(0.8)
            c.setFillColor(GREEN_MINT)
            c.roundRect(x, yy, sq, sq, 2, fill=1, stroke=1)

        y -= 0.85 * inch

    draw_page_footer(c, 3, total)
    c.showPage()

    # Page 4: Avalanche Tracker + Milestones
    draw_page_header(c, "Avalanche Tracker & Milestones", "Debt Payoff Planner")
    y = H - 1.9 * inch

    c.setFont("Helvetica", 10)
    c.setFillColor(GRAY)
    c.drawString(MARGIN, y, "Pay off highest interest first  .  Save the most money")
    y -= 0.5 * inch

    for debt_num in range(4):
        c.setFillColor(AMBER_LIGHT)
        c.roundRect(MARGIN, y - 4, W - 2 * MARGIN, 22, 4, fill=1, stroke=0)
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(AMBER)
        c.drawString(MARGIN + 8, y + 2, f"Debt #{debt_num + 1}")

        c.setFont("Helvetica", 10)
        c.setFillColor(GRAY)
        c.drawString(MARGIN + 2.5 * inch, y + 2, "Balance: $")
        draw_input_line(c, MARGIN + 3.3 * inch, y, 1.5 * inch)
        c.drawString(MARGIN + 5.0 * inch, y + 2, "Interest:")
        draw_input_line(c, MARGIN + 5.7 * inch, y, 1.2 * inch)
        y -= 0.5 * inch

        sq = 0.28 * inch
        gap = 0.06 * inch
        for i in range(40):
            col = i % 20
            row = i // 20
            x = MARGIN + 8 + col * (sq + gap)
            yy = y - row * (sq + gap)
            c.setStrokeColor(AMBER_LIGHT)
            c.setLineWidth(0.8)
            c.setFillColor(CREAM)
            c.roundRect(x, yy, sq, sq, 2, fill=1, stroke=1)

        y -= 0.85 * inch

    # Milestone section
    y -= 0.1 * inch
    draw_section_title(c, MARGIN, y, "Milestones", GREEN_DARK)
    y -= 0.4 * inch
    milestones = ["First debt paid off!", "25% of total debt gone", "50% milestone", "75% milestone", "DEBT FREE!"]
    for ms in milestones:
        draw_checkbox(c, MARGIN + 4, y, 12)
        c.setFont("Helvetica-Bold", 11)
        c.setFillColor(DARK)
        c.drawString(MARGIN + 22, y + 1, ms)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.5)
        c.line(MARGIN + 3.5 * inch, y - 2, W - MARGIN, y - 2)
        y -= 0.38 * inch

    draw_page_footer(c, 4, total)
    c.showPage()
    c.save()
    print(f"Created {path}")


if __name__ == "__main__":
    make_budget_starter_bundle()
    make_savings_challenge()
    make_meal_planner()
    make_debt_payoff()
    print("\nAll PDFs generated in public/printables/")