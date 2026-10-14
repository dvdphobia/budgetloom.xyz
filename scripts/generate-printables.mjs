#!/usr/bin/env node
// Deterministic, dependency-free BudgetLoom PDF generation for all 20 printable packs.
import fs from 'node:fs';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const folder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/printables');
fs.mkdirSync(folder, { recursive: true });

const WIDTH = 612, HEIGHT = 792, LEFT = 48;
const green = '0.020 0.475 0.340', dark = '0.075 0.169 0.165', gray = '0.36 0.42 0.41', pale = '0.945 0.978 0.965';
const escapeText = (s) => String(s).replace(/[–—]/g, '-').replace(/·/g, '|').replace(/[^\x20-\x7e]/g, '').replace(/[\\()]/g, '\\$&');
const tx = (x, y, s, size = 10, bold = false, color = dark) =>
  `${color} rg BT /${bold ? 'F2' : 'F1'} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapeText(s)}) Tj ET`;
const box = (x, y, w, h, color, stroke = false) =>
  `${color} ${stroke ? 'RG' : 'rg'} ${x} ${y} ${w} ${h} re ${stroke ? 'S' : 'f'}`;
const rule = (x, y, w, color = '0.80 0.86 0.83') => `${color} RG 0.7 w ${x} ${y} m ${x + w} ${y} l S`;

const header = (i, n, type) => [
  box(0, 0, WIDTH, HEIGHT, '1 1 1'),
  box(0, 780, WIDTH, 12, green),
  box(LEFT, 736, 26, 26, green), rule(LEFT+5, 742, 16, '1 1 1'), rule(LEFT+5, 749, 16, '1 1 1'), rule(LEFT+5, 756, 16, '1 1 1'),
  tx(82, 746, 'BudgetLoom', 13, true),
  tx(445, 748, type.slice(0, 24), 8, true, gray),
  rule(LEFT, 55, 516),
  tx(LEFT, 40, 'budgetloom.xyz  |  Free personal budgeting printables  |  Print at 100% scale', 8, false, gray),
  tx(525, 40, `Page ${i} of ${n}`, 8, false, gray),
];

function wrapTitle(title) {
  if (title.length <= 28) return [title];
  const words = title.split(' ');
  const lines = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length <= 28) {
      current = (current + ' ' + w).trim();
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2);
}

function cover(title, subtitle, n, names) {
  const parts = header(1, n, 'FREE PRINTABLE WORKBOOK');
  parts.push(box(48, 430, 516, 275, pale));
  const split = wrapTitle(title);
  parts.push(tx(72, 665, 'PLAN  /  TRACK  /  REVIEW', 10, true, green));
  split.forEach((line, i) => parts.push(tx(72, 612 - i * 38, line, 28, true)));
  parts.push(
    tx(72, 512, subtitle.slice(0, 68), 11, false, gray),
    box(72, 455, 150, 30, green),
    tx(84, 466, `${n} PAGES  |  FREE PDF`, 10, true, '1 1 1')
  );
  parts.push(tx(48, 392, 'INCLUDED WORKSHEETS & INSTRUCTIONS', 13, true));
  names.slice(0, 11).forEach((name, i) => {
    parts.push(
      box(52, 360 - i * 24, 6, 6, green),
      tx(68, 357 - i * 24, `Page ${i + 2}: ${name.slice(0, 68)}`, 10.5)
    );
  });
  parts.push(rule(48, 86, 516));
  parts.push(tx(48, 68, 'Tip: Print in grayscale or color at 100% scale. Review numbers once a week for 10 minutes.', 9, false, gray));
  return parts.join('\n');
}

function worksheet(i, n, title, sub, labels, colHeaders = ['ITEM / CATEGORY', 'PLANNED', 'ACTUAL', 'DONE']) {
  const p = header(i, n, 'WORKSHEET');
  p.push(tx(48, 692, title.slice(0, 48), 22, true), tx(48, 665, sub.slice(0, 82), 10, false, gray));
  p.push(box(48, 600, 516, 30, green));
  [
    [colHeaders[0] || 'ITEM / CATEGORY', 57],
    [colHeaders[1] || 'PLANNED', 285],
    [colHeaders[2] || 'ACTUAL', 391],
    [colHeaders[3] || 'DONE', 496],
  ].forEach(([name, x]) => p.push(tx(x, 611, name, 9, true, '1 1 1')));
  labels.slice(0, 12).forEach((label, j) => {
    const y = 564 - j * 34;
    if (j % 2 === 0) p.push(box(48, y - 12, 516, 31, pale));
    p.push(
      tx(58, y, label.slice(0, 36), 10),
      rule(48, y - 16, 516),
      rule(281, y - 4, 88),
      rule(385, y - 4, 88),
      box(503, y - 4, 12, 12, '0.70 0.78 0.75', true)
    );
  });
  p.push(tx(48, 142, 'WEEKLY NOTES & NEXT ADJUSTMENTS', 11, true));
  [122, 99, 76].forEach((y) => p.push(rule(48, y, 516)));
  return p.join('\n');
}

function amounts(target, count = 30) {
  const weights = Array.from({ length: count }, (_, i) => 3 + ((i * 7) % 15));
  const sum = weights.reduce((a, b) => a + b, 0);
  const a = weights.map((w) => Math.floor((target * w) / sum));
  let remainder = target - a.reduce((x, y) => x + y, 0);
  for (let i = 0; remainder > 0; i = (i + 1) % count, remainder--) a[i]++;
  if (a.reduce((x, y) => x + y, 0) !== target || a.length !== count) throw Error('Invalid savings amounts');
  return a;
}

function challenge(i, n, title, target, values, unitLabel = 'Day') {
  const p = header(i, n, 'SAVINGS CHALLENGE');
  p.push(tx(48, 690, title, 22, true));
  p.push(
    tx(
      48,
      662,
      target
        ? `${values.length} deposits add up to exactly $${target}. Check off each box as you save.`
        : 'Enter your custom deposit amounts, check off each milestone, and track your target.',
      10,
      false,
      gray
    )
  );
  const perCol = Math.ceil(values.length / 2);
  const rowStep = values.length > 30 ? 18 : 28;
  const boxHeight = values.length > 30 ? 16 : 24;
  values.forEach((value, k) => {
    const col = Math.floor(k / perCol);
    const r = k % perCol;
    const x = 48 + col * 260;
    const y = 618 - r * rowStep;
    if (r % 2 === 0) p.push(box(x, y - (boxHeight - 11), 246, boxHeight, pale));
    p.push(
      tx(x + 10, y, `${unitLabel} ${String(k + 1).padStart(2, '0')}`, values.length > 30 ? 8.5 : 10, true),
      tx(x + 95, y, value === null ? '$ ______' : `$ ${value}`, values.length > 30 ? 9 : 10.5, true, green),
      box(x + 220, y - 2, 11, 11, '0.70 0.78 0.75', true)
    );
  });
  p.push(tx(48, 128, target ? `VERIFIED TARGET TOTAL: $${target}` : 'MY SAVINGS TARGET: $ __________', 12, true, green));
  p.push(tx(48, 102, 'Start date: _____________________   Completion date: _____________________', 10));
  p.push(tx(48, 78, 'Where this money is held (account/envelope): ______________________________', 9.5, false, gray));
  return p.join('\n');
}

const row = (s) => s.split('|');

// 1. Budget Starter Bundle (12 pages)
const budget = [
  ['Monthly Budget Summary', 'Plan net income, fixed obligations, flexible needs, and savings.', 'Take-home pay (Primary)|Take-home pay (Secondary)|Side or freelance income|Housing (Rent or mortgage)|Utilities & internet|Groceries & household|Transportation & fuel|Insurance & healthcare|Minimum debt payments|Flexible wants & dining|Savings & sinking funds|Unallocated buffer'],
  ['Paycheck Allocation', 'Assign upcoming bills to each payday before spending begins.', 'Paycheck 1 net deposit|Paycheck 2 net deposit|Extra paycheck / bonus|Housing reserve|Utilities due|Phone & internet|Insurance premiums|Two-week groceries|Transit & fuel|Minimum debt due|Automatic savings|Checking buffer'],
  ['Fixed Bills Tracker', 'Track due dates and confirm fixed monthly payments.', 'Rent or mortgage|Electricity|Water & trash|Heating / gas|Home internet|Mobile phone plan|Auto insurance|Health / life insurance|Childcare / tuition|Auto loan payment|Minimum debt total|Subscriptions total'],
  ['Variable Expenses', 'Set realistic limits for everyday flexible spending.', 'Supermarket groceries|Household paper & cleaning|Fuel & public transit|Dining out & coffee|Clothing & shoes|Personal care|Pharmacy & copays|Pet food & care|Family entertainment|Gifts & celebrations|Home supplies|Miscellaneous buffer'],
  ['Savings Goal Tracker', 'Give every savings priority a target and monthly deposit.', 'Starter emergency cushion|3-month core expenses|Vehicle maintenance|Medical deductible fund|Annual insurance reserve|Home repair reserve|Holiday & gift fund|Travel / vacation fund|Education & courses|Replacement tech fund|Long-term investing|Next priority goal'],
  ['Sinking Funds', 'Convert quarterly and annual bills into monthly transfers.', 'Auto insurance renewal|Vehicle registration & tires|Annual memberships|Back-to-school costs|Seasonal utility spike|Appliance replacement|Dental & vision care|Veterinary checkups|Holiday travel|Family birthdays|Home upkeep|Tax reserve'],
  ['Debt Payment Planner', 'List balances, minimum payments, and targeted extra principal.', 'Credit card #1|Credit card #2|Store / retail card|Personal loan|Auto loan|Student loan|Medical payment plan|Past-due utility / bill|Other balance|Targeted extra payment|Monthly interest total|Remaining debt balance'],
  ['Subscriptions Audit', 'Review recurring charges and cancel unused memberships.', 'Video streaming #1|Video streaming #2|Music / audio app|Cloud storage|Software subscriptions|Gym / fitness app|Gaming membership|News / magazines|Delivery membership|App store recurring|Other membership|Monthly subscription total'],
  ['Weekly Spending Review', 'Run a 10-minute check-in at the end of each week.', 'Week 1 groceries & gas|Week 1 flexible wants|Week 2 groceries & gas|Week 2 flexible wants|Week 3 groceries & gas|Week 3 flexible wants|Week 4 groceries & gas|Week 4 flexible wants|Unplanned purchases|Refunds or credits|Buffer adjustment|Next week focus'],
  ['Budget Buffer Planner', 'Maintain a transparent cushion for minor cost variations.', 'Opening checking buffer|Grocery price variance|Utility bill variance|Transport / parking|Medical / pharmacy copay|School or household fee|Small repair item|Deposits added to buffer|Total buffer used|Replenishment transfer|Ending checking buffer|Target buffer for next month'],
  ['Monthly Closeout', 'Compare planned vs. actual totals before starting next month.', 'Total net income received|Total fixed bills paid|Total groceries & essentials|Total discretionary wants|Total savings transferred|Total debt principal paid|Unexpected expenses|Total money allocated|Ending unspent balance|Biggest win this month|Category to adjust|Next month priority'],
];

// 2. Meal Planner Budget Kit (8 pages)
const meal = [
  ['Weekly Meal Planner', 'Plan seven days of meals around ingredients you already own.', 'Monday breakfast & lunch|Monday dinner|Tuesday breakfast & lunch|Tuesday dinner|Wednesday meals|Thursday meals|Friday meals|Saturday meals|Sunday family meal|Planned leftovers night|Batch prep items|Weekly grocery limit'],
  ['Grocery Shopping List', 'Shop with a categorized list and estimate prices before checkout.', 'Fresh produce & fruit|Fresh & frozen vegetables|Meat, poultry & fish|Eggs, tofu & beans|Rice, pasta & grains|Milk, cheese & yogurt|Bread, tortillas & oats|Canned tomatoes & broth|Cooking oils & spices|Snacks & lunch items|Household paper goods|Estimated checkout total'],
  ['Pantry Inventory', 'Check shelf-stable staples before writing your shopping list.', 'Rice, quinoa & grains|Dry pasta & noodles|Canned beans & lentils|Canned tomatoes & sauces|Broth & soup bases|Cooking oil & vinegar|Flour, sugar & baking|Oats & breakfast cereal|Nutella / peanut butter|Spices & seasonings|Shelf-stable milk|Restock priority items'],
  ['Freezer Inventory', 'Track dated freezer portions so food never goes to waste.', 'Frozen vegetables|Frozen berries & fruit|Chicken breasts / thighs|Ground beef / turkey|Fish fillets / shrimp|Sliced bread & rolls|Cooked beans / grains|Homemade soup / broth|Batch-cooked entrees|Leftover portions|Freezer staples|Use-first item this week'],
  ['Meal Prep Checklist', 'Follow a repeatable 60-minute weekly prep routine.', 'Check calendar for busy nights|Audit fridge & freezer first|Pick 3 core dinner recipes|Write categorized store list|Eat before grocery shopping|Wash & chop produce|Cook 1 grain & 1 protein|Portion work/school lunches|Label freezer containers|Freeze extra sauce/broth|Update grocery spending log|Note cheapest staple swaps'],
  ['Recipe Cost Calculator', 'Estimate total recipe cost and price per serving.', 'Primary protein ingredient|Vegetables & produce|Starch, rice, or pasta|Dairy, cheese, or sauce|Canned goods or broth|Aromatics (onion, garlic)|Cooking oil & spices|Side dish accompaniment| Garnish or topping|Total batch cost ($)|Number of servings|Cost per serving ($)'],
  ['Weekly Grocery Review', 'Compare planned food spending with actual receipts.', 'Planned weekly grocery cap|Actual supermarket receipt|Mid-week fill-in trip|Takeout & restaurant spend|Coffee & convenience items|Meals cooked from pantry|Value of wasted/spoiled food|Store-brand swap savings|Unit-price bulk savings|Most expensive item bought|Net under / over budget|Adjustment for next week'],
];

// 3. Debt Payoff Planner (10 pages)
const debt = [
  ['Debt Inventory', 'Record every creditor, balance, APR, and required minimum payment.', 'Creditor #1 (Card/Loan)|Creditor #2 (Card/Loan)|Creditor #3 (Card/Loan)|Creditor #4 (Card/Loan)|Creditor #5 (Card/Loan)|Creditor #6 (Medical/Other)|Creditor #7 (Auto/Student)|Creditor #8 (Personal)|Creditor #9 (Other)|Total starting debt|Total required minimums|Monthly extra available'],
  ['Snowball Priority Plan', 'Order debts from smallest balance to largest for quick wins.', 'Priority #1 (Smallest balance)|Priority #2 balance|Priority #3 balance|Priority #4 balance|Priority #5 balance|Priority #6 balance|Sum of other minimums|Initial extra payment|Rollover from paid debts|Total snowball payment|Target payoff month|Next balance in line'],
  ['Avalanche Priority Plan', 'Order debts from highest APR to lowest to minimize total interest.', 'Priority #1 (Highest APR)|Priority #2 APR & balance|Priority #3 APR & balance|Priority #4 APR & balance|Priority #5 APR & balance|Priority #6 APR & balance|Monthly interest on #1|Minimums on all others|Extra principal toward #1|Total avalanche payment|Estimated interest saved|Target payoff date'],
  ['Payment Log', 'Record each minimum and extra principal payment as it clears.', 'Payment #1 date & creditor|Payment #2 date & creditor|Payment #3 date & creditor|Payment #4 date & creditor|Payment #5 date & creditor|Payment #6 date & creditor|Payment #7 date & creditor|Payment #8 date & creditor|Payment #9 date & creditor|Payment #10 date & creditor|Extra principal applied|Total paid this month'],
  ['Due Date Calendar', 'Map every statement closing date and due date to prevent late fees.', '1st–5th due dates|6th–10th due dates|11th–15th due dates|16th–20th due dates|21st–25th due dates|26th–31st due dates|Autopay verified (Y/N)|Paycheck #1 coverage|Paycheck #2 coverage|Grace period check|Account buffer check|Due-date change request'],
  ['Interest and Fee Audit', 'Inspect monthly statements for interest charges and preventable fees.', 'Card #1 monthly interest|Card #2 monthly interest|Card #3 monthly interest|Loan monthly interest|Late payment fees|Annual membership fees|Balance transfer fees|Overdraft / return fees|Total monthly interest|APR reduction call made|Fee waiver requested|Monthly interest trend'],
  ['Extra Payment Plan', 'Find realistic extra principal dollars inside your monthly budget.', 'Monthly net take-home pay|Essential housing & utilities|Groceries & transport|Insurance & healthcare|Required debt minimums|Starter emergency buffer|Subscription cancellations|Meal-plan grocery savings|Side / overtime income|Selling unused items|Committed extra payment|Target creditor receiving extra'],
  ['Debt Milestone Tracker', 'Celebrate 10%, 25%, 50%, 75%, and 100% debt reduction milestones.', 'Starting total debt balance|10% paid off milestone|25% paid off milestone|First individual debt cleared|50% halfway debt-free|Second individual debt cleared|75% paid off milestone|Final debt target remaining|100% Debt-Free Date|Freed-up monthly cash flow|First post-debt savings goal|Long-term wealth goal'],
  ['Monthly Debt Review', 'Close out the month and update remaining principal balances.', 'Opening total debt balance|Total minimum payments made|Total extra principal paid|Total interest charged|Any new charges added|Net principal reduction|Closing total debt balance|Months remaining on plan|Emergency buffer intact?|Upcoming irregular expenses|Rollover payment amount|Focus for next month'],
];

function toPage(p, i, n) {
  return worksheet(i, n, p[0], p[1], row(p[2]), p[3]);
}

function createPdf(pageStreams) {
  const objects = [null];
  const put = (data) => (objects.push(Buffer.isBuffer(data) ? data : Buffer.from(data, 'latin1')), objects.length - 1);
  const pagesRef = put('');
  const font1 = put('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const font2 = put('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const references = [];
  for (const raw of pageStreams) {
    const compressed = deflateSync(Buffer.from(raw, 'latin1'), { level: 9 });
    const contentRef = put(
      Buffer.concat([
        Buffer.from(`<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n`),
        compressed,
        Buffer.from('\nendstream'),
      ])
    );
    const pageRef = put(
      `<< /Type /Page /Parent ${pagesRef} 0 R /MediaBox [0 0 ${WIDTH} ${HEIGHT}] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${contentRef} 0 R >>`
    );
    references.push(pageRef);
  }
  objects[pagesRef] = Buffer.from(
    `<< /Type /Pages /Kids [${references.map((n) => `${n} 0 R`).join(' ')}] /Count ${references.length} >>`
  );
  const root = put(`<< /Type /Catalog /Pages ${pagesRef} 0 R >>`);
  const chunks = [Buffer.from('%PDF-1.4\n%BudgetLoom\n', 'latin1')];
  const offsets = [0];
  let offset = chunks[0].length;
  for (let i = 1; i < objects.length; i++) {
    offsets.push(offset);
    const chunk = Buffer.concat([Buffer.from(`${i} 0 obj\n`), objects[i], Buffer.from('\nendobj\n')]);
    chunks.push(chunk);
    offset += chunk.length;
  }
  const xref = offset;
  let index = `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objects.length; i++) index += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  index += `trailer\n<< /Size ${objects.length} /Root ${root} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  chunks.push(Buffer.from(index));
  return Buffer.concat(chunks);
}

function save(file, title, desc, pages) {
  const count = pages.length + 1;
  const stream = [cover(title, desc, count, pages.map((p) => p[1] || p[0]))];
  pages.forEach((p, j) =>
    stream.push(
      typeof p === 'string'
        ? p
        : p[0] === 'worksheet'
        ? toPage(p.slice(1), j + 2, count)
        : challenge(j + 2, count, p[1], p[2], p[3], p[4] || 'Day')
    )
  );
  const binary = createPdf(stream);
  fs.writeFileSync(path.join(folder, file), binary);
  const match = binary.toString('latin1').match(/\/Type \/Page\b/g) || [];
  if (match.length !== count) throw Error(`${file}: expected ${count} pages, wrote ${match.length}`);
  console.log(file, count + ' pages', binary.length + ' bytes');
}

// Generate 4 Core Bundles
save('budget-starter-bundle.pdf', 'Budget Starter Bundle', 'A complete 12-page monthly budgeting workbook', budget.map((p) => ['worksheet', ...p]));
save('30-day-savings-challenge.pdf', '30-Day Savings Challenge', 'Choose a 30-day savings target and track daily progress', [
  ['challenge', '$100 in 30 Days Challenge', 100, amounts(100, 30)],
  ['challenge', '$300 in 30 Days Challenge', 300, amounts(300, 30)],
  ['challenge', '$500 in 30 Days Challenge', 500, amounts(500, 30)],
  ['challenge', 'Reverse $300 Challenge', 300, amounts(300, 30).reverse()],
  ['challenge', 'Custom 30-Day Savings Challenge', 0, Array(30).fill(null)],
]);
save('meal-planner-budget-kit.pdf', 'Meal Planner Budget Kit', 'Plan meals, shop with a list, and lower food waste', meal.map((p) => ['worksheet', ...p]));
save('debt-payoff-planner.pdf', 'Debt Payoff Planner', 'Snowball and avalanche worksheets plus milestone logs', debt.map((p) => ['worksheet', ...p]));

// Generate 16 Additional Focused Multi-Page Printable Planners & Trackers
save('monthly-budget-planner.pdf', 'Monthly Budget Planner', 'Focused 4-page monthly income, bills, and closeout planner', [
  ['worksheet', 'Income & Fixed Obligations', 'Record net take-home pay and fixed monthly bills with due dates.', 'Paycheck 1 (Net)|Paycheck 2 (Net)|Other monthly income|Rent or mortgage|Electricity & gas|Water & trash|Home internet & phone|Auto & renters insurance|Childcare / school|Minimum debt payments|Total fixed obligations|Net income remaining'],
  ['worksheet', 'Flexible Spending & Sinking Funds', 'Set realistic limits for variable essentials, wants, and savings.', 'Groceries & supermarket|Household supplies|Fuel & public transit|Healthcare & pharmacy|Dining out & coffee|Personal spending & fun|Emergency fund transfer|Auto repair sinking fund|Annual bill sinking fund|Extra debt principal|Checking account buffer|Total flexible & goals'],
  ['worksheet', 'Month-End Variance Review', 'Compare planned numbers with actual spending to improve next month.', 'Total net income|Fixed bills total|Groceries actual vs plan|Transport actual vs plan|Wants actual vs plan|Savings transferred|Extra debt paid|Buffer used|Net monthly difference|Category that ran high|What worked well|One change for next month'],
]);

save('weekly-budget-planner.pdf', 'Weekly Budget Planner', '4-page weekly spending cap and 10-minute check-in workbook', [
  ['worksheet', 'Weeks 1 & 2 Safe-to-Spend Plan', 'Break monthly variable categories into manageable weekly caps.', 'Week 1 Groceries cap|Week 1 Fuel & transit|Week 1 Dining & coffee|Week 1 Personal & misc|Week 1 Subtotal|Week 2 Groceries cap|Week 2 Fuel & transit|Week 2 Dining & coffee|Week 2 Personal & misc|Week 2 Subtotal|Bills due Weeks 1-2|Mid-month buffer check'],
  ['worksheet', 'Weeks 3 & 4 Safe-to-Spend Plan', 'Track the second half of the month before overspending occurs.', 'Week 3 Groceries cap|Week 3 Fuel & transit|Week 3 Dining & coffee|Week 3 Personal & misc|Week 3 Subtotal|Week 4 Groceries cap|Week 4 Fuel & transit|Week 4 Dining & coffee|Week 4 Personal & misc|Week 4 Subtotal|Bills due Weeks 3-4|End-of-month buffer'],
  ['worksheet', '10-Minute Weekly Check-In Log', 'Complete once a week to reconcile receipts and adjust categories.', 'Check current bank balance|Subtract pending bills|Log week receipts|Check remaining grocery cap|Check remaining fuel cap|Verify upcoming autopays|Move flexible funds if needed|Cancel unused trial/sub|Transfer weekly savings|Note any surprise expense|Confirm checking cushion|Schedule next check-in'],
]);

save('paycheck-budget-worksheet.pdf', 'Paycheck Budget Worksheet', 'Assign bills and essentials to each payday before spending', [
  ['worksheet', 'Paycheck #1 Assignment Sheet', 'Cover bills due before your next deposit plus two-week essentials.', 'Paycheck #1 Net Deposit|Rent / mortgage share|Utilities due this period|Phone / internet due|Insurance due|Minimum debts due|Groceries for pay period|Fuel & transit for period|Personal / fun allowance|Savings & sinking transfer|Checking buffer left|Unassigned balance ($0 target)'],
  ['worksheet', 'Paycheck #2 Assignment Sheet', 'Allocate your second paycheck across remaining monthly bills.', 'Paycheck #2 Net Deposit|Rent / mortgage share|Utilities due this period|Subscriptions due|Loan minimums due|Other fixed bill due|Groceries for pay period|Fuel & transit for period|Personal / fun allowance|Emergency fund transfer|Extra debt payment|Unassigned balance ($0 target)'],
  ['worksheet', 'Pay-Period Bill Timing Map', 'Match every bill due date to the paycheck that arrives before it.', 'Bill #1 (Due 1st-5th)|Bill #2 (Due 1st-5th)|Bill #3 (Due 6th-10th)|Bill #4 (Due 6th-10th)|Bill #5 (Due 11th-15th)|Bill #6 (Due 16th-20th)|Bill #7 (Due 21st-25th)|Bill #8 (Due 26th-31st)|Sinking fund transfer|Buffer verification|Next payday date|Total reserved for bills'],
]);

save('biweekly-budget-planner.pdf', 'Biweekly Budget Planner', '26-paycheck planner with half-bill reserves and 3-paycheck guide', [
  ['worksheet', 'Biweekly Half-Bill Reserve Sheet', 'Set aside half of major monthly bills from each two-week check.', 'Rent / mortgage (50%)|Electricity & gas (50%)|Water & trash (50%)|Internet & phone (50%)|Auto insurance (50%)|Childcare / tuition (50%)|Minimum debt payments (50%)|Subscriptions total (50%)|Total half-bill reserve|Two-week grocery budget|Two-week fuel & transit|Remaining per paycheck'],
  ['worksheet', 'Biweekly Pay Period Tracker', 'Track two consecutive two-week paychecks in one view.', 'Biweekly Check A Net|Check A Bill Reserve|Check A Groceries & Gas|Check A Savings & Debt|Check A Wants & Buffer|Biweekly Check B Net|Check B Bill Reserve|Check B Groceries & Gas|Check B Savings & Debt|Check B Wants & Buffer|Bills Account Balance|Monthly Bills Paid in Full'],
  ['worksheet', 'Three-Paycheck Month Planner', 'Plan your two extra biweekly paychecks each year intentionally.', '3rd Paycheck Net Deposit|Two weeks of groceries|Two weeks of fuel/transit|Two weeks personal allowance|Remaining bonus cash flow|Option 1: Emergency fund|Option 2: One-month buffer|Option 3: Annual sinking fund|Option 4: High-APR debt|Option 5: Car/home maintenance|Total bonus allocated|Remaining unallocated ($0)'],
]);

save('zero-based-budget-worksheet.pdf', 'Zero-Based Budget Worksheet', 'Give every dollar a job until Income Minus Outgo Equals $0.00', [
  ['worksheet', 'Tier 1: Income & Core Essentials', 'Subtract essential survival bills from net income first.', 'Primary net income|Secondary / side income|Total monthly income|Housing (Rent/Mortgage)|Utilities (Power/Water/Heat)|Supermarket groceries|Essential transportation|Healthcare & insurance|Required debt minimums|Childcare / obligations|Subtotal Core Essentials|Income left for Tier 2'],
  ['worksheet', 'Tier 2: Sinking Funds, Goals & Wants', 'Assign every remaining dollar until unassigned cash equals $0.00.', 'Income brought forward|Emergency fund deposit|Auto & home sinking funds|Annual bill sinking funds|Extra debt principal|Dining out & coffee|Entertainment & hobbies|Clothing & personal care|Gifts & charitable giving|Permanent checking buffer|Total Tier 1 + Tier 2|Income Minus Outgo ($0.00)'],
  ['worksheet', 'Mid-Month Reallocation Log', 'When a category changes, move dollars from another line item.', 'Reallocation #1 (From -> To)|Reallocation #2 (From -> To)|Reallocation #3 (From -> To)|Reallocation #4 (From -> To)|Grocery adjustment|Utility adjustment|Transport adjustment|Buffer withdrawal|Buffer replenishment|Updated Total Allocated|Updated Income Minus Outgo|Zero-balance verified'],
]);

save('annual-budget-overview.pdf', 'Annual Budget Overview', '12-month bill calendar and non-monthly renewal planner', [
  ['worksheet', 'Months 1 to 6 Financial Calendar', 'Map irregular bills, renewals, and seasonal costs for Jan–Jun.', 'January irregular bills|February irregular bills|March irregular bills|April irregular bills|May irregular bills|June irregular bills|Q1 tax / insurance due|Q2 tax / insurance due|Spring maintenance reserve|School / camp deposits|Half-year savings target|6-month review check'],
  ['worksheet', 'Months 7 to 12 Financial Calendar', 'Map back-to-school, winter utilities, and holiday expenses for Jul–Dec.', 'July irregular bills|August back-to-school|September renewals|October seasonal prep|November holiday food/travel|December gifts & year-end|Q3 insurance / registration|Q4 property / annual fees|Winter heating buffer|Annual subscriptions due|Full-year savings target|Year-end closeout check'],
  ['worksheet', 'Annual Sinking Fund Master List', 'Divide every annual charge by 12 to find your monthly reserve.', 'Auto insurance annual total|Vehicle registration & tags|Home / renters insurance|Property tax / HOA annual|Medical / dental out-of-pocket|Holiday & birthday gifts|Vacation & family travel|Home / car maintenance|Annual software & memberships| Vet & pet annual care|Total annual irregular costs|Required monthly reserve (/12)'],
]);

save('expense-tracker.pdf', 'Daily & Weekly Expense Tracker', 'Log everyday transactions and spot spending leaks early', [
  ['worksheet', 'Expense Ledger — Weeks 1 & 2', 'Record purchases as they happen and mark Need vs. Want.', 'Transaction 01 (Date / Item)|Transaction 02 (Date / Item)|Transaction 03 (Date / Item)|Transaction 04 (Date / Item)|Transaction 05 (Date / Item)|Transaction 06 (Date / Item)|Transaction 07 (Date / Item)|Transaction 08 (Date / Item)|Transaction 09 (Date / Item)|Transaction 10 (Date / Item)|Transaction 11 (Date / Item)|Weeks 1-2 Subtotal', ['DATE & MERCHANT', 'CATEGORY', 'AMOUNT', 'NEED?']],
  ['worksheet', 'Expense Ledger — Weeks 3 & 4', 'Continue logging spending through the end of the month.', 'Transaction 12 (Date / Item)|Transaction 13 (Date / Item)|Transaction 14 (Date / Item)|Transaction 15 (Date / Item)|Transaction 16 (Date / Item)|Transaction 17 (Date / Item)|Transaction 18 (Date / Item)|Transaction 19 (Date / Item)|Transaction 20 (Date / Item)|Transaction 21 (Date / Item)|Transaction 22 (Date / Item)|Weeks 3-4 Subtotal', ['DATE & MERCHANT', 'CATEGORY', 'AMOUNT', 'NEED?']],
  ['worksheet', 'Monthly Category Rollup & Audit', 'Total your logged transactions by category and compare with your plan.', 'Groceries & household|Fuel & public transit|Dining out & takeout|Coffee & convenience|Online shopping|Entertainment & streaming|Personal care & clothing|Pet & family expenses|Unplanned / impulse buys|Total Needs spent|Total Wants spent|One habit to adjust next month'],
]);

save('bill-payment-tracker.pdf', 'Bill Payment Tracker', 'Organize monthly due dates, autopay settings, and confirmation numbers', [
  ['worksheet', 'Monthly Fixed Bills Checklist', 'Verify every fixed bill is paid on time each month.', 'Housing (Rent / Mortgage)|Electric utility|Gas / heating utility|Water, sewer & trash|Home internet service|Mobile phone plan|Auto insurance policy|Health / dental insurance|Childcare / tuition|Auto loan payment|Credit card minimums|Student / personal loan', ['BILL & DUE DATE', 'AMOUNT DUE', 'PAID DATE', 'PAID']],
  ['worksheet', 'Quarterly & Annual Bills Checklist', 'Track non-monthly bills so they never catch you off guard.', 'Water / trash quarterly|Auto insurance 6-month|Vehicle registration / tags|Renters / home insurance|Amazon / warehouse club|Tax estimate payment|Software annual renewal|Medical / dental billing|HOA / community fee|School / activity fee|Pest / HVAC maintenance|Other annual obligation', ['BILL & MONTH DUE', 'ESTIMATED', 'ACTUAL', 'PAID']],
  ['worksheet', 'Billing Date & Autopay Directory', 'Record which account pays each bill and whether autopay is active.', 'Bill #1 account & autopay|Bill #2 account & autopay|Bill #3 account & autopay|Bill #4 account & autopay|Bill #5 account & autopay|Bill #6 account & autopay|Bill #7 account & autopay|Bill #8 account & autopay|Bill #9 account & autopay|Bill #10 account & autopay|Checking buffer minimum|Statement audit completed'],
]);

save('subscription-tracker.pdf', 'Subscription Audit Tracker', 'Find forgotten recurring charges and calculate annual savings', [
  ['worksheet', 'Recurring Subscription Inventory', 'Convert every subscription into its true 12-month cost.', 'Streaming video #1|Streaming video #2|Music / podcast app|Cloud storage plan|Software / productivity|Fitness / wellness app|Gaming subscription|Delivery / shipping club|News / Substack / Patreon|Mobile app subscriptions|Other recurring charge|Total Monthly & Annual Cost', ['SERVICE & BILL DATE', 'MONTHLY $', 'ANNUAL $', 'KEEP?']],
  ['worksheet', 'Cancellation & Free-Trial Log', 'Cancel unused services before renewal dates and redirect the savings.', 'Cancel item #1 & renewal date|Cancel item #2 & renewal date|Cancel item #3 & renewal date|Cancel item #4 & renewal date|Free trial #1 cancel-by date|Free trial #2 cancel-by date|Downgrade plan #1 savings|Annual-to-monthly check|Total monthly dollars freed|Total annual dollars freed|Redirected to emergency fund|Redirected to debt payoff', ['SERVICE TO CANCEL', 'MONTHLY $', 'ANNUAL $', 'DONE']],
]);

save('sinking-fund-worksheet.pdf', 'Sinking Fund Worksheet', 'Save monthly for predictable car, home, medical, and holiday expenses', [
  ['worksheet', 'Sinking Fund Calculator Sheet', 'Divide each target amount by months remaining until due.', 'Auto maintenance & tires|Auto insurance renewal|Medical & dental copays|Home / appliance repair|Vet & pet emergencies|Annual memberships|Holiday & gift budget|Family vacation / travel|Back-to-school & kids|Clothing replacement|Taxes / registration|Total Sinking Funds', ['FUND & DUE DATE', 'TARGET $', 'MONTHLY $', 'DONE']],
  ['worksheet', 'Sinking Fund Balance Ledger', 'Track starting balances, monthly additions, and spent withdrawals.', 'Fund #1 balance update|Fund #2 balance update|Fund #3 balance update|Fund #4 balance update|Fund #5 balance update|Fund #6 balance update|Fund #7 balance update|Fund #8 balance update|Fund #9 balance update|Fund #10 balance update|Total across all funds|Matches bank sub-account', ['FUND NAME', 'ADDED +', 'ENDING $', 'OK']],
  ['worksheet', '90-Day Approaching Bill Catch-Up', 'Create a short-term plan when an irregular bill is due within 3 months.', 'Bill due within 30 days|Bill due within 60 days|Bill due within 90 days|Already saved toward bill|Shortfall still needed|Paychecks left before due|Required per paycheck|Category to trim temporarily|Items to pause this month|Provider payment plan check|Transfer scheduled|Full amount ready on time'],
]);

save('savings-goal-tracker.pdf', 'Savings Goal Tracker', 'Break major savings targets into clear monthly deposits and milestones', [
  ['worksheet', 'Primary Savings Goal Roadmap', 'Break your #1 financial goal into 10% to 100% milestones.', '10% Milestone reached|20% Milestone reached|30% Milestone reached|40% Milestone reached|50% Halfway milestone|60% Milestone reached|70% Milestone reached|80% Milestone reached|90% Milestone reached|100% Goal Completed!|Automatic transfer set|High-yield account verified', ['MILESTONE STEP', 'TARGET $', 'DATE HIT', 'DONE']],
  ['worksheet', 'Multi-Goal Monthly Deposit Log', 'Track monthly contributions across up to four active savings goals.', 'Month 1 deposits|Month 2 deposits|Month 3 deposits|Month 4 deposits|Month 5 deposits|Month 6 deposits|Month 7 deposits|Month 8 deposits|Month 9 deposits|Month 10 deposits|Month 11 deposits|Month 12 deposits', ['MONTH / PAYDAY', 'DEPOSIT $', 'BALANCE $', 'DONE']],
  ['worksheet', 'Windfall & Extra Savings Plan', 'Pre-commit how tax refunds, bonuses, or rebates will boost your goals.', 'Tax refund allocation|Work bonus / overtime|Cash-back / rebates|Selling unused items|Canceled bill savings|No-spend week savings|3rd biweekly paycheck|Gift money received|Grocery under-budget surplus|Utility bill savings|Total extra added|Months shaved off timeline'],
]);

const classic52 = Array.from({ length: 52 }, (_, i) => i + 1); // Sums to 1378
save('52-week-savings-challenge.pdf', '52-Week Savings Challenge', 'Save $1,378 or $1,000 across 52 weekly deposits', [
  ['challenge', 'Classic $1,378 52-Week Challenge', 1378, classic52, 'Wk'],
  ['challenge', '$1,000 in 52 Weeks Challenge', 1000, amounts(1000, 52), 'Wk'],
  ['challenge', 'Custom 52-Week Savings Challenge', 0, Array(52).fill(null), 'Wk'],
]);

save('emergency-fund-tracker.pdf', 'Emergency Fund Tracker', 'Build your $1,000 starter cushion and 3-to-6-month survival reserve', [
  ['worksheet', 'Bare-Bones Monthly Survival Baseline', 'Calculate what 1 month of essential living expenses actually costs.', 'Rent or mortgage|Basic electric, heat & water|Essential home internet/phone|Supermarket groceries only|Work commute & fuel|Health insurance & prescriptions|Auto insurance|Childcare / essential care|Minimum debt payments|Other non-negotiable bill|1-Month Survival Total|3-Month Target (x3)'],
  ['challenge', 'Stage 1: $1,000 Starter Cushion (30 Steps)', 1000, amounts(1000, 30), 'Step'],
  ['worksheet', 'Stage 2: 3-to-6 Month Reserve Log', 'Track progress from 1 month of core expenses up to 6 full months.', 'Month 1 core expenses saved|1.5 Months saved|2 Months core expenses saved|2.5 Months saved|3 Months Full Milestone!|3.5 Months saved|4 Months core expenses saved|4.5 Months saved|5 Months core expenses saved|5.5 Months saved|6 Months Complete Reserve!|Replenishment rule set'],
]);

save('no-spend-challenge-calendar.pdf', 'No-Spend Challenge Calendar', 'Reset spending habits with a 30-day freeze and 48-hour impulse log', [
  ['worksheet', 'No-Spend Challenge Ground Rules', 'Define allowed essentials vs. paused discretionary categories before Day 1.', 'Allowed: Rent & utilities|Allowed: Supermarket groceries|Allowed: Work transit & gas|Allowed: Medical & prescriptions|Allowed: Minimum debt bills|Paused: Takeout & delivery|Paused: Online impulse shopping|Paused: Clothing & decor|Paused: Unplanned convenience|Approved exception #1|Approved exception #2|Target savings for this month'],
  ['challenge', '30-Day No-Spend Daily Streak & Savings', 300, amounts(300, 30), 'Day'],
  ['worksheet', '48-Hour Impulse Waiting List', 'Write down any non-essential item and wait 48 hours before deciding.', 'Impulse item #1 & price|Impulse item #2 & price|Impulse item #3 & price|Impulse item #4 & price|Impulse item #5 & price|Impulse item #6 & price|Impulse item #7 & price|Impulse item #8 & price|Impulse item #9 & price|Impulse item #10 & price|Total resisted ($) saved|Transferred to savings goal', ['ITEM & TRIGGER', 'PRICE $', '48H LATER', 'SKIP?']],
]);

save('family-budget-planner.pdf', 'Family & Household Budget Planner', 'Coordinate two incomes, shared bills, proportional splits, and kids costs', [
  ['worksheet', 'Combined Income & Fair Bill Split', 'Plan Partner A and Partner B contributions using proportional or 50/50 split.', 'Partner A net monthly income|Partner B net monthly income|Combined household income|Partner A income share (%)|Partner B income share (%)|Total shared household bills|Partner A shared bill transfer|Partner B shared bill transfer|Joint savings transfer|Partner A personal allowance|Partner B personal allowance|Joint checking buffer'],
  ['worksheet', 'Family & Childcare Sinking Funds', 'Plan ahead for kids, medical, school, and household expenses.', 'Childcare / after-school care|School lunches & supplies|Kids clothing & shoes|Sports, music & activities|Pediatric / dental / vision|Family birthdays & holidays|Babysitting & date night|Pet food & veterinary|Home maintenance & yard|Family vehicle maintenance|Summer camp / break fund|Total family sinking funds'],
  ['worksheet', 'Monthly Family Money Meeting', 'Review shared goals together in 20 minutes once a month.', 'All shared bills paid on time|Grocery & meal plan review|Upcoming calendar events|School / activity fees due|Emergency fund balance|Debt payoff progress|Sinking fund balances|Upcoming travel or holidays|Household repair needs|Personal fun money check|Biggest win as a team|Priority for next month'],
]);

save('student-budget-worksheet.pdf', 'Student & First-Job Budget', 'Manage semester aid, part-time pay, rent, textbooks, and starter savings', [
  ['worksheet', 'Semester & Monthly Income Plan', 'Spread financial aid, family support, or part-time pay across every month.', 'Part-time / campus job pay|Internship / work-study pay|Financial aid refund (/4 mos)|Scholarship / grant stipend|Family contribution|Summer savings drawdown|Total monthly cash available|Rent & dorm housing share|Utilities & Wi-Fi share|Campus meal plan / groceries|Bus pass, transit & gas|Remaining for books & goals'],
  ['worksheet', 'Student Expense & Textbook Tracker', 'Keep variable college and first-apartment costs within your monthly limit.', 'Used / rented textbooks|Course software & lab fees|Supermarket groceries|Coffee & campus snacks|Laundry & toiletries|Phone plan|Streaming & student apps|Social events & clubs|Weekend travel home|Clothing & essentials|Starter emergency cushion|Unspent checking buffer'],
  ['worksheet', 'First Apartment & Graduation Fund', 'Prepare for security deposits, moving costs, and student loan grace periods.', 'First month rent deposit|Security deposit reserve|Utility connection fees|Basic kitchen & bed essentials|Moving truck / boxes|Professional interview attire|Commute / transit pass|Starter $500 emergency fund|Know student loan servicer|Verify grace period end date|Set up first paycheck split|Total launch fund saved'],
]);