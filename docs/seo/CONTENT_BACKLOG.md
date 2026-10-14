# BudgetLoom — Content Strategy & 130-Topic Backlog Status (`CONTENT_BACKLOG.md`)

**Last Updated:** 2026-10-14  
**Machine-Readable Source:** `content/seo-backlog.json`  
**Published Articles Source:** `lib/posts.ts` & PostgreSQL `posts` table

---

## 1. Exact Content Inventory Summary

| Metric | Exact Count | Notes |
|---|---:|---|
| **Original Static Guides (Pre-Backlog)** | **23** | Preserved at original indexed `/blog/[slug]` URLs |
| **Total Candidate Topics in `content/seo-backlog.json`** | **130** | Organized across 13 distinct topic clusters (10 per cluster) |
| **Backlog Topics Published in PR #3** | **5** | `BL-001`, `BL-002`, `BL-005`, `BL-006`, `BL-010` |
| **New Backlog Topics Researched, Written & Published in This Rebuild** | **15** | Covering all 13 topic clusters with worked examples & tables |
| **Total Backlog Topics Now Published** | **20** | 5 + 15 = 20 backlog topics live |
| **Total Live Published Money Guides on BudgetLoom** | **43** | 23 original + 20 backlog guides = **43 live published guides** |
| **Backlog Topics in Review / Completed Briefs (`in_review`)** | **12** | Priority P1/P2 topics queued for next editorial review wave |
| **Merged / Retired Duplicate-Intent Topics (`merged_duplicate`)** | **3** | Consolidated into canonical guides to prevent keyword cannibalization |
| **Remaining Queued Candidate Topics (`idea`)** | **95** | Retained in `content/seo-backlog.json` for ongoing editorial pipeline |

---

## 2. Cluster-by-Cluster Coverage & Published Cornerstone Guides

| # | Topic Cluster | Hub Route | Published Guides in Cluster | Matched Calculators | Matched Printable PDFs |
|---|---|---|---|---|---|
| 1 | **Budget Systems** | `/topics/budget-systems` | 10 guides (incl. `how-to-make-a-monthly-budget`, `how-to-build-a-bare-bones-budget-for-essential-expenses`, `how-to-fix-a-month-when-you-overspend-your-budget`) | `/budget-calculator`, `/tools/zero-based-budget-calculator`, `/tools/50-30-20-budget-calculator` | `budget-starter-bundle`, `monthly-budget-planner`, `zero-based-budget-worksheet` |
| 2 | **Paycheck and Variable Income** | `/topics/paycheck-and-variable-income` | 5 guides (incl. `biweekly-budgeting-for-beginners`, `how-to-split-monthly-bills-across-two-paychecks`, `planning-for-a-three-paycheck-month`) | `/tools/paycheck-budget-planner`, `/tools/biweekly-budget-calculator` | `paycheck-budget-worksheet`, `biweekly-budget-planner` |
| 3 | **Budget Printables and Binders** | `/topics/budget-printables-and-binders` | 4 guides (incl. `budget-printables-how-to-use`, `how-to-build-a-budget-binder-from-free-printables`, `cash-envelope-categories`) | `/budget-calculator`, `/tools/expense-tracker` | `budget-starter-bundle`, `weekly-budget-planner` |
| 4 | **Savings and Sinking Funds** | `/topics/savings-and-sinking-funds` | 4 guides (incl. `how-to-save-1000-emergency-fund`, `one-month-versus-three-months-of-emergency-savings`, `how-to-start-a-car-repair-sinking-fund`) | `/tools/emergency-fund-calculator`, `/tools/sinking-fund-calculator`, `/tools/savings-goal-calculator` | `emergency-fund-tracker`, `sinking-fund-worksheet`, `savings-goal-tracker` |
| 5 | **Groceries and Meal Planning** | `/topics/groceries-and-meal-planning` | 3 guides (`frugal-grocery-shopping-tips`, `budget-meal-plan-for-one`, `grocery-budget-worksheet-for-two-adults`) | `/tools/grocery-budget-calculator` | `meal-planner-budget-kit`, `weekly-budget-planner` |
| 6 | **Debt Tracking and Payoff Planning** | `/topics/debt-tracking-and-payoff-planning` | 2 guides (`how-to-pay-off-debt-fast`, `how-to-list-all-debts-before-picking-a-payoff-method`) | `/tools/debt-snowball-calculator`, `/tools/debt-avalanche-calculator` | `debt-payoff-planner` |
| 7 | **Bills and Utilities** | `/topics/bills-and-utilities` | 2 guides (`save-money-on-utilities`, `how-to-audit-every-monthly-subscription`) | `/tools/bill-and-subscription-tracker` | `bill-payment-tracker`, `subscription-tracker` |
| 8 | **Household and Family Budgets** | `/topics/household-and-family-budgets` | 3 guides (`how-to-split-shared-bills-fairly-with-a-partner`, `cheap-date-ideas`, `modern-home-office-setup-on-a-budget`) | `/tools/expense-split-calculator` | `family-budget-planner` |
| 9 | **Students and First Jobs** | `/topics/students-and-first-jobs` | 1 cornerstone guide (`first-paycheck-budget-for-a-new-employee`) | `/tools/50-30-20-budget-calculator` | `student-budget-worksheet` |
| 10 | **No-Spend Challenges and Habits** | `/topics/no-spend-challenges-and-habits` | 6 guides (`30-day-money-saving-challenge`, `no-spend-month-guide`, `seven-day-no-buy-challenge-with-a-free-checklist`, `how-to-stop-impulse-buying`, `no-spend-weekend-ideas`, `free-fun-things-to-do`) | `/tools/savings-challenge-generator` | `30-day-savings-challenge`, `no-spend-challenge-calendar`, `52-week-savings-challenge` |
| 11 | **Seasonal and Event Budgeting** | `/topics/seasonal-and-event-budgeting` | 1 cornerstone guide (`holiday-gift-budget-planner-with-per-person-limits`) | `/tools/sinking-fund-calculator` | `annual-budget-overview` |
| 12 | **Calculator Tutorials and Worked Examples** | `/topics/calculator-tutorials-and-worked-examples` | 1 cornerstone guide (`how-to-use-a-zero-based-budget-calculator`) | `/tools/zero-based-budget-calculator` | `zero-based-budget-worksheet` |
| 13 | **Spreadsheets and Expense Tracking** | `/topics/spreadsheets-and-expense-tracking` | 1 cornerstone guide (`how-to-make-a-monthly-budget-in-google-sheets`) | `/tools/expense-tracker` | `expense-tracker` |

---

## 3. Merged Duplicate-Intent Topics

To prevent internal keyword cannibalization, three candidate topics in `content/seo-backlog.json` were marked `"status": "merged_duplicate"` and consolidated into canonical published guides:
1. `BL-014` (`how-to-budget-with-two-paydays-per-month`) → Merged into `/blog/how-to-split-monthly-bills-across-two-paychecks`
2. `BL-113` (`how-to-use-a-paycheck-allocation-planner`) → Merged into `/blog/how-to-split-monthly-bills-across-two-paychecks`
3. `BL-121` (`budget-spreadsheet-with-editable-spending-categories`) → Merged into `/blog/how-to-make-a-monthly-budget-in-google-sheets`
