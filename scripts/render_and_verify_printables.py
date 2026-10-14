#!/usr/bin/env python3
"""
Render PNG previews for all 20 BudgetLoom printable PDFs and verify page counts & challenge sums.
"""
import pathlib
import re
import pypdf
import pypdfium2 as pdfium

pdf_dir = pathlib.Path("public/printables")
prev_dir = pdf_dir / "previews"
prev_dir.mkdir(parents=True, exist_ok=True)

expected_pages = {
    "budget-starter-bundle": 12,
    "30-day-savings-challenge": 6,
    "meal-planner-budget-kit": 8,
    "debt-payoff-planner": 10,
    "monthly-budget-planner": 4,
    "weekly-budget-planner": 4,
    "paycheck-budget-worksheet": 4,
    "biweekly-budget-planner": 4,
    "zero-based-budget-worksheet": 4,
    "annual-budget-overview": 4,
    "expense-tracker": 4,
    "bill-payment-tracker": 4,
    "subscription-tracker": 3,
    "sinking-fund-worksheet": 4,
    "savings-goal-tracker": 4,
    "52-week-savings-challenge": 4,
    "emergency-fund-tracker": 4,
    "no-spend-challenge-calendar": 4,
    "family-budget-planner": 4,
    "student-budget-worksheet": 4,
}

total_pages = 0

for slug, exp_count in expected_pages.items():
    pdf_path = pdf_dir / f"{slug}.pdf"
    assert pdf_path.exists(), f"Missing PDF: {pdf_path}"
    reader = pypdf.PdfReader(str(pdf_path))
    n = len(reader.pages)
    assert n == exp_count, f"{slug}: expected {exp_count} pages, got {n}"
    total_pages += n

    doc = pdfium.PdfDocument(str(pdf_path))
    cover_png = prev_dir / f"{slug}-cover.png"
    page2_png = prev_dir / f"{slug}-page2.png"
    doc[0].render(scale=1.5).to_pil().save(cover_png, optimize=True)
    if len(doc) > 1:
        doc[1].render(scale=1.5).to_pil().save(page2_png, optimize=True)
    doc.close()
    assert cover_png.exists() and cover_png.stat().st_size > 1000
    assert page2_png.exists() and page2_png.stat().st_size > 1000
    print(f"OK: {pdf_path.name:36s} | {n:2d} pages | cover & page2 PNGs verified")

# Verify 30-day savings challenge sums ($100, $300, $500, $300 reverse)
r30 = pypdf.PdfReader("public/printables/30-day-savings-challenge.pdf")
for page_idx, expected_sum in [(1, 100), (2, 300), (3, 500), (4, 300)]:
    txt = r30.pages[page_idx].extract_text()
    daily = [int(m) for m in re.findall(r"\$\s+(\d+)", txt)]
    assert len(daily) == 30, f"Page {page_idx+1}: expected 30 amounts, got {len(daily)}"
    assert sum(daily) == expected_sum, f"Page {page_idx+1}: sum {sum(daily)} != {expected_sum}"
    print(f"Verified 30-day challenge Page {page_idx+1}: 30 deposits sum to ${sum(daily)}")

# Verify 52-week savings challenge sums ($1,378 and $1,000)
r52 = pypdf.PdfReader("public/printables/52-week-savings-challenge.pdf")
for page_idx, expected_sum in [(1, 1378), (2, 1000)]:
    txt = r52.pages[page_idx].extract_text()
    weekly = [int(m) for m in re.findall(r"\$\s+(\d+)", txt)]
    assert len(weekly) == 52, f"52-week Page {page_idx+1}: expected 52 amounts, got {len(weekly)}"
    assert sum(weekly) == expected_sum, f"52-week Page {page_idx+1}: sum {sum(weekly)} != {expected_sum}"
    print(f"Verified 52-week challenge Page {page_idx+1}: 52 deposits sum to ${sum(weekly)}")

print(f"ALL {len(expected_pages)} PRINTABLE WORKBOOKS ({total_pages} TOTAL PAGES) AND {len(expected_pages)*2} PREVIEW IMAGES VERIFIED.")
