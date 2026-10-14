#!/usr/bin/env python3
"""
Render BudgetLoom redesigned UI pages in Headless Chromium across mobile (360px, 390px),
tablet (768px), laptop (1024px), and desktop (1440px) viewports using base64 data URIs,
verify zero horizontal overflow, and capture visual QA screenshots into docs/design/screenshots/.
"""
import base64
import pathlib
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

root = pathlib.Path(__file__).resolve().parent.parent
out_dir = root / "docs/design/screenshots"
out_dir.mkdir(parents=True, exist_ok=True)

css_text = (root / "app/globals.css").read_text(encoding="utf-8")
# Remove @theme inline { ... } and @layer base { ... } blocks cleanly while preserving :root and all site rules
clean_css = re.sub(r"@theme\s+inline\s*\{[^}]*\}", "", css_text)
clean_css = re.sub(r"@layer\s+base\s*\{[\s\S]*?\n\}", "", clean_css)
clean_css = "\n".join(
    line
    for line in clean_css.splitlines()
    if not line.strip().startswith(("@source", "@import", "@custom-variant"))
)


def to_data_uri(p: pathlib.Path) -> str:
    b64 = base64.b64encode(p.read_bytes()).decode("ascii")
    return f"data:image/png;base64,{b64}"


cover_1 = to_data_uri(root / "public/printables/previews/budget-starter-bundle-cover.png")
cover_2 = to_data_uri(root / "public/printables/previews/30-day-savings-challenge-cover.png")
cover_3 = to_data_uri(root / "public/printables/previews/meal-planner-budget-kit-cover.png")
logo_uri = to_data_uri(root / "public/logo.png")

preview_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>BudgetLoom — Redesigned UI Visual QA</title>
  <style>
    {clean_css}
    body {{ margin: 0; padding: 0; font-family: 'Noto Sans', system-ui, -apple-system, sans-serif; }}
  </style>
</head>
<body>
  <header class="header">
    <div class="container header-inner">
      <a href="#" class="logo">
        <img src="{logo_uri}" alt="" width="28" height="28" style="border-radius:6px">
        <span>BudgetLoom</span>
      </a>
      <button class="mobile-toggle" aria-label="Open navigation menu">☰</button>
      <nav class="nav" aria-label="Main navigation">
        <a href="#" class="active">Guides</a>
        <a href="#">Topics</a>
        <a href="#">Calculators</a>
        <a href="#">Printables</a>
        <a href="#">About</a>
        <a href="#" class="nav-cta">Free Template</a>
      </nav>
    </div>
  </header>

  <main id="main">
    <section class="hero">
      <div class="container hero-split">
        <div class="hero-copy">
          <span class="eyebrow">100% Free Personal Finance Education · No Bank Login Required</span>
          <h1>Give every dollar a clear job. <span class="accent">Stress less</span> about money.</h1>
          <p>Practical budgeting guides, 15 browser-private financial calculators, and 20 print-ready PDF workbooks built for real everyday incomes—not textbook perfection.</p>
          <div class="hero-cta left">
            <a href="#" class="btn btn-primary btn-lg">Get Free 12-Page Budget Template</a>
            <a href="#" class="btn btn-ghost btn-lg">Try Monthly Budget Calculator</a>
          </div>
          <div class="trust-row">
            <span>✓ 20 Free Printable PDFs</span>
            <span>✓ 15 Interactive Calculators</span>
            <span>✓ Instant Download (No Email Wall)</span>
          </div>
        </div>
        <div class="hero-showcase">
          <div class="hero-showcase-card">
            <div class="hero-showcase-header">
              <span class="badge-pill">Monthly Budget Snapshot</span>
              <span style="font-size:0.78rem;color:var(--gray)">Example: $4,000 Take-Home</span>
            </div>
            <div class="hero-showcase-rows">
              <div class="showcase-row"><span>Fixed Bills & Housing (50%)</span><strong>$2,000.00</strong></div>
              <div class="showcase-row"><span>Groceries, Fuel & Essentials (20%)</span><strong>$800.00</strong></div>
              <div class="showcase-row"><span>Emergency & Sinking Funds (15%)</span><strong style="color:var(--green-dark)">$600.00</strong></div>
              <div class="showcase-row"><span>Flexible Wants & Buffer (15%)</span><strong>$600.00</strong></div>
              <div class="showcase-row total"><span>Unallocated Remaining Balance</span><strong style="color:var(--green)">$0.00 (Balanced)</strong></div>
            </div>
            <div class="hero-showcase-footer">
              <a href="#">Enter your own numbers →</a>
              <a href="#">Download 12-page PDF →</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="eyebrow">Print-Ready PDF Library</span>
          <h2>Popular Printable Workbooks & Trackers</h2>
          <p>Genuine multi-page US Letter PDFs designed to print cleanly in color or grayscale—no signup wall required.</p>
        </div>
        <div class="grid">
          <div class="card printable-marketplace-card">
            <div class="printable-card-media">
              <img src="{cover_1}" alt="Budget Starter Bundle" class="printable-thumb-img">
              <span class="card-cover-tag free">Free · 12 Pages</span>
            </div>
            <div class="card-body">
              <span class="card-badge">Core Bundles</span>
              <h3>Budget Starter Bundle</h3>
              <p>Monthly budget summary, paycheck allocation, fixed/variable trackers, sinking funds, and debt planner.</p>
            </div>
          </div>
          <div class="card printable-marketplace-card">
            <div class="printable-card-media">
              <img src="{cover_2}" alt="30-Day Savings Challenge" class="printable-thumb-img">
              <span class="card-cover-tag free">Free · 6 Pages</span>
            </div>
            <div class="card-body">
              <span class="card-badge">Savings Challenges</span>
              <h3>30-Day Savings Challenge Pack</h3>
              <p>Exact-sum $100, $300, and $500 schedules, reverse $300 challenge, and custom 30-day grid.</p>
            </div>
          </div>
          <div class="card printable-marketplace-card">
            <div class="printable-card-media">
              <img src="{cover_3}" alt="Meal Planner Budget Kit" class="printable-thumb-img">
              <span class="card-cover-tag free">Free · 8 Pages</span>
            </div>
            <div class="card-body">
              <span class="card-badge">Core Bundles</span>
              <h3>Meal Planner Budget Kit</h3>
              <p>7-day meal planner, categorized grocery list, pantry & freezer inventories, and recipe cost calculator.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</body>
</html>
"""

html_b64 = base64.b64encode(preview_html.encode("utf-8")).decode("ascii")
data_url = f"data:text/html;base64,{html_b64}"

options = Options()
options.add_argument("--headless=new")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--hide-scrollbars")

driver = webdriver.Chrome(options=options)
viewports = [
    ("360px-mobile", 360, 960),
    ("390px-mobile", 390, 960),
    ("768px-tablet", 768, 1024),
    ("1024px-laptop", 1024, 960),
    ("1440px-desktop", 1440, 1080),
]

try:
    driver.get(data_url)
    for label, w, h in viewports:
        driver.set_window_size(w, h)
        scroll_w = driver.execute_script("return document.documentElement.scrollWidth")
        client_w = driver.execute_script("return document.documentElement.clientWidth")
        assert scroll_w <= client_w + 2, f"Horizontal overflow on {label}: scrollWidth={scroll_w} > clientWidth={client_w}"
        shot_path = out_dir / f"homepage-{label}.png"
        driver.save_screenshot(str(shot_path))
        print(f"Captured & verified zero horizontal overflow: {shot_path.name} ({w}x{h}, scrollWidth={scroll_w})")
finally:
    driver.quit()
