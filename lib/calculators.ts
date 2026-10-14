// Deterministic, cent-accurate financial calculation engine and 15-tool catalog for BudgetLoom.
// All currency arithmetic operates on integer cents to prevent IEEE-754 floating-point drift.

export const MAX_SAFE_DOLLARS = 10_000_000 // $10,000,000 upper bound for household budgeting inputs

export function toCents(value: number | string): number {
  const num = typeof value === 'string' ? Number(value.trim()) : value
  if (!Number.isFinite(num) || num < 0) return 0
  const clamped = Math.min(MAX_SAFE_DOLLARS, num)
  return Math.round(clamped * 100)
}

export function fromCents(cents: number): number {
  if (!Number.isFinite(cents)) return 0
  return Math.round(cents) / 100
}

export function isValidPositiveMoney(value: number | string, allowZero = true): boolean {
  if (typeof value === 'string' && value.trim() === '') return allowZero
  const num = typeof value === 'string' ? Number(value.trim()) : value
  if (!Number.isFinite(num)) return false
  if (allowZero ? num < 0 : num <= 0) return false
  return num <= MAX_SAFE_DOLLARS
}

// 1. Monthly & Zero-Based Budget Calculation
export interface BudgetLineItem {
  id: string
  name: string
  category: 'Needs' | 'Wants' | 'Savings & Debt'
  planned: number | string
  actual?: number | string
}

export interface MonthlyBudgetResult {
  takeHomeCents: number
  plannedCents: number
  actualCents: number
  remainingPlannedCents: number
  remainingActualCents: number
  needsPlannedCents: number
  wantsPlannedCents: number
  savingsPlannedCents: number
  takeHome: number
  planned: number
  actual: number
  remainingPlanned: number
  remainingActual: number
  isZeroBasedBalanced: boolean
  isOverAllocated: boolean
  groupShares: {
    needsPct: number
    wantsPct: number
    savingsPct: number
  }
}

export function calculateMonthlyBudget(
  income: number | string,
  items: BudgetLineItem[]
): MonthlyBudgetResult {
  const takeHomeCents = toCents(income)
  let needsPlannedCents = 0
  let wantsPlannedCents = 0
  let savingsPlannedCents = 0
  let actualCents = 0

  for (const item of items) {
    const pCents = toCents(item.planned)
    const aCents = toCents(item.actual ?? 0)
    actualCents += aCents
    if (item.category === 'Needs') needsPlannedCents += pCents
    else if (item.category === 'Wants') wantsPlannedCents += pCents
    else savingsPlannedCents += pCents
  }

  const plannedCents = needsPlannedCents + wantsPlannedCents + savingsPlannedCents
  const remainingPlannedCents = takeHomeCents - plannedCents
  const remainingActualCents = takeHomeCents - actualCents

  const pct = (part: number) =>
    takeHomeCents > 0 ? Math.round((part / takeHomeCents) * 1000) / 10 : 0

  return {
    takeHomeCents,
    plannedCents,
    actualCents,
    remainingPlannedCents,
    remainingActualCents,
    needsPlannedCents,
    wantsPlannedCents,
    savingsPlannedCents,
    takeHome: fromCents(takeHomeCents),
    planned: fromCents(plannedCents),
    actual: fromCents(actualCents),
    remainingPlanned: fromCents(remainingPlannedCents),
    remainingActual: fromCents(remainingActualCents),
    isZeroBasedBalanced: takeHomeCents > 0 && remainingPlannedCents === 0,
    isOverAllocated: remainingPlannedCents < 0,
    groupShares: {
      needsPct: pct(needsPlannedCents),
      wantsPct: pct(wantsPlannedCents),
      savingsPct: pct(savingsPlannedCents),
    },
  }
}

// 2. 50/30/20 Rule & Custom Split Calculator
export interface SplitBudgetResult {
  income: number
  needsAmount: number
  wantsAmount: number
  savingsAmount: number
  annualSavings: number
  valid: boolean
  error?: string
}

export function calculatePercentageSplit(
  income: number | string,
  needsPct = 50,
  wantsPct = 30,
  savingsPct = 20
): SplitBudgetResult {
  const incomeCents = toCents(income)
  const totalPct = Math.round((Number(needsPct) + Number(wantsPct) + Number(savingsPct)) * 100) / 100
  if (incomeCents <= 0) {
    return { income: 0, needsAmount: 0, wantsAmount: 0, savingsAmount: 0, annualSavings: 0, valid: false, error: 'Enter a positive monthly take-home income.' }
  }
  if (
    !Number.isFinite(needsPct) ||
    !Number.isFinite(wantsPct) ||
    !Number.isFinite(savingsPct) ||
    needsPct < 0 ||
    wantsPct < 0 ||
    savingsPct < 0 ||
    Math.abs(totalPct - 100) > 0.01
  ) {
    return {
      income: fromCents(incomeCents),
      needsAmount: 0,
      wantsAmount: 0,
      savingsAmount: 0,
      annualSavings: 0,
      valid: false,
      error: 'Needs, Wants, and Savings percentages must be non-negative and add up to 100%.',
    }
  }

  const needsCents = Math.round((incomeCents * needsPct) / 100)
  const wantsCents = Math.round((incomeCents * wantsPct) / 100)
  // Assign exact remainder to savings so Needs + Wants + Savings === Income to the exact cent
  const savingsCents = incomeCents - needsCents - wantsCents

  return {
    income: fromCents(incomeCents),
    needsAmount: fromCents(needsCents),
    wantsAmount: fromCents(wantsCents),
    savingsAmount: fromCents(savingsCents),
    annualSavings: fromCents(savingsCents * 12),
    valid: true,
  }
}

// 3. Paycheck & Biweekly Budget Calculator
export interface BiweeklyBudgetResult {
  paycheckAmount: number
  annualPaychecks: number
  annualTakeHome: number
  standardTwoCheckMonthIncome: number
  averageMonthlyIncome: number
  monthlyBillsTotal: number
  billReservePerPaycheck: number
  flexibleAndGoalsPerPaycheck: number
  extraPaycheckNetAfterEssentials: number
  valid: boolean
  error?: string
}

export function calculateBiweeklyBudget(
  paycheck: number | string,
  monthlyFixedBills: number | string,
  twoWeekEssentials: number | string
): BiweeklyBudgetResult {
  const checkCents = toCents(paycheck)
  const billsCents = toCents(monthlyFixedBills)
  const essentialsCents = toCents(twoWeekEssentials)

  if (checkCents <= 0) {
    return {
      paycheckAmount: 0,
      annualPaychecks: 26,
      annualTakeHome: 0,
      standardTwoCheckMonthIncome: 0,
      averageMonthlyIncome: 0,
      monthlyBillsTotal: 0,
      billReservePerPaycheck: 0,
      flexibleAndGoalsPerPaycheck: 0,
      extraPaycheckNetAfterEssentials: 0,
      valid: false,
      error: 'Enter a positive biweekly paycheck amount.',
    }
  }

  const twoCheckIncomeCents = checkCents * 2
  const annualCents = checkCents * 26
  const avgMonthlyCents = Math.round(annualCents / 12)
  const billHalfCents = Math.ceil(billsCents / 2)
  const remainingPerCheckCents = checkCents - billHalfCents - essentialsCents
  const extraCheckNetCents = Math.max(0, checkCents - essentialsCents)

  return {
    paycheckAmount: fromCents(checkCents),
    annualPaychecks: 26,
    annualTakeHome: fromCents(annualCents),
    standardTwoCheckMonthIncome: fromCents(twoCheckIncomeCents),
    averageMonthlyIncome: fromCents(avgMonthlyCents),
    monthlyBillsTotal: fromCents(billsCents),
    billReservePerPaycheck: fromCents(billHalfCents),
    flexibleAndGoalsPerPaycheck: fromCents(remainingPerCheckCents),
    extraPaycheckNetAfterEssentials: fromCents(extraCheckNetCents),
    valid: true,
  }
}

// 4. Savings Goal Calculator (with optional APY interest projection)
export interface SavingsGoalResult {
  goal: number
  existing: number
  remaining: number
  months: number
  monthlySimple: number
  monthlyWithInterest: number
  projectedInterestEarned: number
  progressPercent: number
  valid: boolean
  error?: string
}

export function calculateSavingsGoal(
  target: number | string,
  alreadySaved: number | string,
  months: number | string,
  annualApyPercent: number | string = 0
): SavingsGoalResult {
  const goalCents = toCents(target)
  const savedCents = toCents(alreadySaved)
  const dur = Number(months)
  const apy = Number(annualApyPercent) || 0

  if (goalCents <= 0) {
    return {
      goal: 0,
      existing: fromCents(savedCents),
      remaining: 0,
      months: 0,
      monthlySimple: 0,
      monthlyWithInterest: 0,
      projectedInterestEarned: 0,
      progressPercent: 0,
      valid: false,
      error: 'Enter a positive savings target.',
    }
  }

  if (!Number.isInteger(dur) || dur < 1 || dur > 600) {
    return {
      goal: fromCents(goalCents),
      existing: fromCents(savedCents),
      remaining: fromCents(Math.max(0, goalCents - savedCents)),
      months: dur,
      monthlySimple: 0,
      monthlyWithInterest: 0,
      projectedInterestEarned: 0,
      progressPercent: Math.min(100, Math.round((savedCents / goalCents) * 100)),
      valid: false,
      error: 'Timeline must be an integer between 1 and 600 months.',
    }
  }

  const remainingCents = Math.max(0, goalCents - savedCents)
  const monthlySimpleCents = Math.ceil(remainingCents / dur)
  const progressPercent = Math.min(100, Math.round((savedCents / goalCents) * 100))

  if (apy <= 0 || apy > 50 || remainingCents === 0) {
    return {
      goal: fromCents(goalCents),
      existing: fromCents(savedCents),
      remaining: fromCents(remainingCents),
      months: dur,
      monthlySimple: fromCents(monthlySimpleCents),
      monthlyWithInterest: fromCents(monthlySimpleCents),
      projectedInterestEarned: 0,
      progressPercent,
      valid: true,
    }
  }

  const r = apy / 100 / 12
  const fvExisting = savedCents * Math.pow(1 + r, dur)
  const neededFromContributions = Math.max(0, goalCents - fvExisting)
  const annuityFactor = (Math.pow(1 + r, dur) - 1) / r
  const monthlyWithInterestCents = annuityFactor > 0 ? Math.ceil(neededFromContributions / annuityFactor) : monthlySimpleCents
  const totalContributedCents = monthlyWithInterestCents * dur
  const interestEarnedCents = Math.max(0, goalCents - savedCents - totalContributedCents)

  return {
    goal: fromCents(goalCents),
    existing: fromCents(savedCents),
    remaining: fromCents(remainingCents),
    months: dur,
    monthlySimple: fromCents(monthlySimpleCents),
    monthlyWithInterest: fromCents(monthlyWithInterestCents),
    projectedInterestEarned: fromCents(interestEarnedCents),
    progressPercent,
    valid: true,
  }
}

// 5. Sinking Fund Calculator (Multi-fund planner)
export interface SinkingFundInput {
  id: string
  name: string
  targetAmount: number | string
  alreadySaved: number | string
  monthsUntilDue: number | string
}

export interface SinkingFundSummary {
  items: {
    id: string
    name: string
    target: number
    saved: number
    remaining: number
    months: number
    monthlyContribution: number
    perBiweeklyPaycheck: number
  }[]
  totalTarget: number
  totalSaved: number
  totalRemaining: number
  totalMonthlyRequired: number
  totalPerBiweeklyPaycheck: number
}

export function calculateSinkingFunds(funds: SinkingFundInput[]): SinkingFundSummary {
  let totalTargetCents = 0
  let totalSavedCents = 0
  let totalRemainingCents = 0
  let totalMonthlyCents = 0

  const items = funds.map((f) => {
    const targetCents = toCents(f.targetAmount)
    const savedCents = Math.min(targetCents, toCents(f.alreadySaved))
    const remainingCents = Math.max(0, targetCents - savedCents)
    const months = Math.max(1, Math.min(120, Math.round(Number(f.monthsUntilDue) || 1)))
    const monthlyCents = Math.ceil(remainingCents / months)
    const biweeklyCents = Math.ceil((monthlyCents * 12) / 26)

    totalTargetCents += targetCents
    totalSavedCents += savedCents
    totalRemainingCents += remainingCents
    totalMonthlyCents += monthlyCents

    return {
      id: f.id,
      name: f.name,
      target: fromCents(targetCents),
      saved: fromCents(savedCents),
      remaining: fromCents(remainingCents),
      months,
      monthlyContribution: fromCents(monthlyCents),
      perBiweeklyPaycheck: fromCents(biweeklyCents),
    }
  })

  return {
    items,
    totalTarget: fromCents(totalTargetCents),
    totalSaved: fromCents(totalSavedCents),
    totalRemaining: fromCents(totalRemainingCents),
    totalMonthlyRequired: fromCents(totalMonthlyCents),
    totalPerBiweeklyPaycheck: fromCents(Math.ceil((totalMonthlyCents * 12) / 26)),
  }
}

// 6. Emergency Fund Calculator
export interface EmergencyFundResult {
  monthlyCoreExpenses: number
  targetMonths: number
  starterGoal: number
  fullTargetAmount: number
  currentSavings: number
  remainingToStarter: number
  remainingToFull: number
  monthsCoveredCurrently: number
  monthsToFullGoal: number | null
  valid: boolean
}

export function calculateEmergencyFund(
  monthlyEssentials: number | string,
  targetMonths: number | string,
  currentSaved: number | string,
  monthlyContribution: number | string
): EmergencyFundResult {
  const essentialsCents = toCents(monthlyEssentials)
  const months = Math.max(1, Math.min(24, Math.round(Number(targetMonths) || 3)))
  const savedCents = toCents(currentSaved)
  const contribCents = toCents(monthlyContribution)

  if (essentialsCents <= 0) {
    return {
      monthlyCoreExpenses: 0,
      targetMonths: months,
      starterGoal: 1000,
      fullTargetAmount: 0,
      currentSavings: fromCents(savedCents),
      remainingToStarter: 0,
      remainingToFull: 0,
      monthsCoveredCurrently: 0,
      monthsToFullGoal: null,
      valid: false,
    }
  }

  const starterGoalCents = Math.min(100_000, essentialsCents) // $1,000 or 1 month if smaller
  const fullTargetCents = essentialsCents * months
  const remainingStarterCents = Math.max(0, starterGoalCents - savedCents)
  const remainingFullCents = Math.max(0, fullTargetCents - savedCents)
  const monthsCovered = Math.round((savedCents / essentialsCents) * 10) / 10
  const monthsToFullGoal =
    remainingFullCents === 0 ? 0 : contribCents > 0 ? Math.ceil(remainingFullCents / contribCents) : null

  return {
    monthlyCoreExpenses: fromCents(essentialsCents),
    targetMonths: months,
    starterGoal: fromCents(starterGoalCents),
    fullTargetAmount: fromCents(fullTargetCents),
    currentSavings: fromCents(savedCents),
    remainingToStarter: fromCents(remainingStarterCents),
    remainingToFull: fromCents(remainingFullCents),
    monthsCoveredCurrently: monthsCovered,
    monthsToFullGoal,
    valid: true,
  }
}

// 7 & 8. Debt Snowball & Debt Avalanche Amortization Engine
export interface DebtInput {
  id: string
  name: string
  balance: number | string
  aprPercent: number | string
  minPayment: number | string
}

export interface DebtPayoffResult {
  strategy: 'snowball' | 'avalanche'
  valid: boolean
  nonAmortizing: boolean
  error?: string
  monthsToPayoff: number
  totalPrincipal: number
  totalInterestPaid: number
  totalPaid: number
  payoffOrder: {
    id: string
    name: string
    startingBalance: number
    aprPercent: number
    paidOffMonth: number
    interestPaid: number
  }[]
}

export function calculateDebtPayoff(
  debts: DebtInput[],
  extraMonthlyPayment: number | string,
  strategy: 'snowball' | 'avalanche'
): DebtPayoffResult {
  const activeDebts = debts
    .map((d) => ({
      id: d.id,
      name: d.name || 'Debt',
      balanceCents: toCents(d.balance),
      startingCents: toCents(d.balance),
      apr: Math.max(0, Math.min(100, Number(d.aprPercent) || 0)),
      minCents: toCents(d.minPayment),
      interestPaidCents: 0,
      paidOffMonth: 0,
    }))
    .filter((d) => d.balanceCents > 0)

  const extraCents = toCents(extraMonthlyPayment)

  if (activeDebts.length === 0) {
    return {
      strategy,
      valid: false,
      nonAmortizing: false,
      error: 'Enter at least one debt with a positive balance.',
      monthsToPayoff: 0,
      totalPrincipal: 0,
      totalInterestPaid: 0,
      totalPaid: 0,
      payoffOrder: [],
    }
  }

  // Sort priority order:
  // Snowball: smallest balance first (tie-break: highest APR)
  // Avalanche: highest APR first (tie-break: smallest balance)
  activeDebts.sort((a, b) => {
    if (strategy === 'snowball') {
      return a.balanceCents !== b.balanceCents ? a.balanceCents - b.balanceCents : b.apr - a.apr
    }
    return b.apr !== a.apr ? b.apr - a.apr : a.balanceCents - b.balanceCents
  })

  const totalPrincipalCents = activeDebts.reduce((s, d) => s + d.startingCents, 0)
  const totalMinCents = activeDebts.reduce((s, d) => s + d.minCents, 0)
  const monthlyBudgetCents = totalMinCents + extraCents

  // Check if initial monthly interest exceeds total monthly payment (non-amortizing scenario)
  const firstMonthInterestCents = activeDebts.reduce(
    (s, d) => s + Math.round((d.balanceCents * (d.apr / 100)) / 12),
    0
  )

  if (monthlyBudgetCents <= firstMonthInterestCents || totalMinCents === 0) {
    return {
      strategy,
      valid: false,
      nonAmortizing: true,
      error:
        'Total monthly payments do not cover monthly interest charges. Increase minimum or extra payments so the balances can amortize.',
      monthsToPayoff: 0,
      totalPrincipal: fromCents(totalPrincipalCents),
      totalInterestPaid: 0,
      totalPaid: 0,
      payoffOrder: [],
    }
  }

  let month = 0
  const MAX_MONTHS = 600 // 50 years cap

  while (activeDebts.some((d) => d.balanceCents > 0) && month < MAX_MONTHS) {
    month++
    let availableExtraCents = extraCents

    // 1. Accrue monthly interest and apply minimum payments (or freed-up minimums rolled into snowball/avalanche)
    for (const d of activeDebts) {
      if (d.balanceCents <= 0) {
        availableExtraCents += d.minCents
        continue
      }
      const monthlyInterest = Math.round((d.balanceCents * (d.apr / 100)) / 12)
      d.interestPaidCents += monthlyInterest
      d.balanceCents += monthlyInterest

      const payment = Math.min(d.balanceCents, d.minCents)
      d.balanceCents -= payment
      const unusedMin = d.minCents - payment
      availableExtraCents += unusedMin

      if (d.balanceCents === 0 && d.paidOffMonth === 0) {
        d.paidOffMonth = month
      }
    }

    // 2. Apply available extra + rolled-over minimums to highest-priority remaining debt(s)
    for (const d of activeDebts) {
      if (d.balanceCents <= 0 || availableExtraCents <= 0) continue
      const extraApplied = Math.min(d.balanceCents, availableExtraCents)
      d.balanceCents -= extraApplied
      availableExtraCents -= extraApplied
      if (d.balanceCents === 0 && d.paidOffMonth === 0) {
        d.paidOffMonth = month
      }
    }
  }

  if (activeDebts.some((d) => d.balanceCents > 0)) {
    return {
      strategy,
      valid: false,
      nonAmortizing: true,
      error: 'Payoff timeline exceeds 50 years (600 months). Increase monthly payments to pay off all balances.',
      monthsToPayoff: MAX_MONTHS,
      totalPrincipal: fromCents(totalPrincipalCents),
      totalInterestPaid: 0,
      totalPaid: 0,
      payoffOrder: [],
    }
  }

  const totalInterestCents = activeDebts.reduce((s, d) => s + d.interestPaidCents, 0)

  return {
    strategy,
    valid: true,
    nonAmortizing: false,
    monthsToPayoff: month,
    totalPrincipal: fromCents(totalPrincipalCents),
    totalInterestPaid: fromCents(totalInterestCents),
    totalPaid: fromCents(totalPrincipalCents + totalInterestCents),
    payoffOrder: activeDebts.map((d) => ({
      id: d.id,
      name: d.name,
      startingBalance: fromCents(d.startingCents),
      aprPercent: d.apr,
      paidOffMonth: d.paidOffMonth,
      interestPaid: fromCents(d.interestPaidCents),
    })),
  }
}

// 9. 30-Day Savings Challenge Exact-Cent Schedule Generator
export interface ChallengeDayRow {
  day: number
  amount: number
  runningTotal: number
}

export function generate30DayChallengeSchedule(targetDollars: number | string): {
  valid: boolean
  target: number
  total: number
  rows: ChallengeDayRow[]
  error?: string
} {
  const targetCents = toCents(targetDollars)
  if (targetCents <= 0 || targetCents > 100_000_000) {
    return {
      valid: false,
      target: 0,
      total: 0,
      rows: [],
      error: 'Enter a positive savings target between $0.30 and $1,000,000.',
    }
  }

  const weights = Array.from({ length: 30 }, (_, i) => 3 + ((i * 7) % 15))
  const weightSum = weights.reduce((a, b) => a + b, 0)
  const values = weights.map((w) => Math.floor((targetCents * w) / weightSum))
  let remainder = targetCents - values.reduce((a, b) => a + b, 0)
  for (let i = 0; i < remainder; i++) {
    values[i % 30] += 1
  }

  let runningCents = 0
  const rows = values.map((cents, i) => {
    runningCents += cents
    return {
      day: i + 1,
      amount: fromCents(cents),
      runningTotal: fromCents(runningCents),
    }
  })

  return {
    valid: true,
    target: fromCents(targetCents),
    total: fromCents(runningCents),
    rows,
  }
}

// 10. Bill & Subscription Audit Calculator
export interface RecurringBillItem {
  id: string
  name: string
  amount: number | string
  frequency: 'monthly' | 'quarterly' | 'annual' | 'weekly'
  keepStatus: 'essential' | 'review' | 'cancel'
}

export function calculateSubscriptionAudit(items: RecurringBillItem[]) {
  let activeMonthlyCents = 0
  let potentialMonthlySavingsCents = 0

  const normalized = items.map((item) => {
    const rawCents = toCents(item.amount)
    let monthlyCents = rawCents
    if (item.frequency === 'quarterly') monthlyCents = Math.round(rawCents / 3)
    else if (item.frequency === 'annual') monthlyCents = Math.round(rawCents / 12)
    else if (item.frequency === 'weekly') monthlyCents = Math.round((rawCents * 52) / 12)

    if (item.keepStatus === 'cancel') {
      potentialMonthlySavingsCents += monthlyCents
    } else {
      activeMonthlyCents += monthlyCents
    }

    return {
      ...item,
      monthlyEquivalent: fromCents(monthlyCents),
      annualEquivalent: fromCents(monthlyCents * 12),
    }
  })

  return {
    items: normalized,
    activeMonthlyTotal: fromCents(activeMonthlyCents),
    activeAnnualTotal: fromCents(activeMonthlyCents * 12),
    monthlySavingsFromCanceling: fromCents(potentialMonthlySavingsCents),
    annualSavingsFromCanceling: fromCents(potentialMonthlySavingsCents * 12),
  }
}

// 11. Grocery Budget & Meal Cost Calculator
export function calculateGroceryBudget(
  adults: number | string,
  children: number | string,
  planTier: 'thrifty' | 'moderate' | 'flexible',
  diningOutMonthly: number | string = 0
) {
  const numAdults = Math.max(0, Math.min(12, Math.round(Number(adults) || 0)))
  const numChildren = Math.max(0, Math.min(12, Math.round(Number(children) || 0)))
  const diningCents = toCents(diningOutMonthly)

  if (numAdults + numChildren === 0) {
    return {
      valid: false,
      monthlyGroceries: 0,
      weeklyGroceries: 0,
      costPerMealPerPerson: 0,
      totalFoodBudget: 0,
      categorySplit: { produceAndProteins: 0, pantryAndGrains: 0, dairyAndFrozen: 0, householdAndBuffer: 0 },
    }
  }

  // Monthly baseline per person in cents
  const adultBaseCents = planTier === 'thrifty' ? 24000 : planTier === 'moderate' ? 32000 : 41000
  const childBaseCents = planTier === 'thrifty' ? 16000 : planTier === 'moderate' ? 21500 : 27500

  const rawGroceriesCents = numAdults * adultBaseCents + numChildren * childBaseCents
  // Household bulk efficiency adjustment for 3+ people
  const householdSize = numAdults + numChildren
  const scaleFactor = householdSize === 1 ? 1.08 : householdSize >= 4 ? 0.92 : 1.0
  const monthlyGroceriesCents = Math.round(rawGroceriesCents * scaleFactor)
  const weeklyGroceriesCents = Math.round((monthlyGroceriesCents * 12) / 52)
  const totalMeals = householdSize * 90 // ~90 meals/month per person
  const costPerMealCents = Math.round(monthlyGroceriesCents / totalMeals)

  return {
    valid: true,
    monthlyGroceries: fromCents(monthlyGroceriesCents),
    weeklyGroceries: fromCents(weeklyGroceriesCents),
    costPerMealPerPerson: fromCents(costPerMealCents),
    totalFoodBudget: fromCents(monthlyGroceriesCents + diningCents),
    categorySplit: {
      produceAndProteins: fromCents(Math.round(monthlyGroceriesCents * 0.45)),
      pantryAndGrains: fromCents(Math.round(monthlyGroceriesCents * 0.25)),
      dairyAndFrozen: fromCents(Math.round(monthlyGroceriesCents * 0.18)),
      householdAndBuffer: fromCents(
        monthlyGroceriesCents -
          Math.round(monthlyGroceriesCents * 0.45) -
          Math.round(monthlyGroceriesCents * 0.25) -
          Math.round(monthlyGroceriesCents * 0.18)
      ),
    },
  }
}

// 12. Household Expense Splitting Calculator (Proportional Income vs 50/50)
export interface PartnerSplitResult {
  valid: boolean
  totalSharedBills: number
  partnerAIncome: number
  partnerBIncome: number
  proportional: {
    partnerASharePct: number
    partnerBSharePct: number
    partnerAContribution: number
    partnerBContribution: number
    partnerARemaining: number
    partnerBRemaining: number
  }
  equalSplit: {
    partnerAContribution: number
    partnerBContribution: number
    partnerARemaining: number
    partnerBRemaining: number
  }
}

export function calculateHouseholdSplit(
  partnerAIncome: number | string,
  partnerBIncome: number | string,
  sharedBills: number | string
): PartnerSplitResult {
  const aCents = toCents(partnerAIncome)
  const bCents = toCents(partnerBIncome)
  const billsCents = toCents(sharedBills)
  const combinedCents = aCents + bCents

  if (combinedCents <= 0 || billsCents <= 0) {
    return {
      valid: false,
      totalSharedBills: 0,
      partnerAIncome: fromCents(aCents),
      partnerBIncome: fromCents(bCents),
      proportional: {
        partnerASharePct: 0,
        partnerBSharePct: 0,
        partnerAContribution: 0,
        partnerBContribution: 0,
        partnerARemaining: 0,
        partnerBRemaining: 0,
      },
      equalSplit: {
        partnerAContribution: 0,
        partnerBContribution: 0,
        partnerARemaining: 0,
        partnerBRemaining: 0,
      },
    }
  }

  const aPropCents = Math.round((billsCents * aCents) / combinedCents)
  const bPropCents = billsCents - aPropCents
  const aEqCents = Math.round(billsCents / 2)
  const bEqCents = billsCents - aEqCents

  const aSharePct = Math.round((aCents / combinedCents) * 1000) / 10
  const bSharePct = Math.round((100 - aSharePct) * 10) / 10

  return {
    valid: true,
    totalSharedBills: fromCents(billsCents),
    partnerAIncome: fromCents(aCents),
    partnerBIncome: fromCents(bCents),
    proportional: {
      partnerASharePct: aSharePct,
      partnerBSharePct: bSharePct,
      partnerAContribution: fromCents(aPropCents),
      partnerBContribution: fromCents(bPropCents),
      partnerARemaining: fromCents(aCents - aPropCents),
      partnerBRemaining: fromCents(bCents - bPropCents),
    },
    equalSplit: {
      partnerAContribution: fromCents(aEqCents),
      partnerBContribution: fromCents(bEqCents),
      partnerARemaining: fromCents(aCents - aEqCents),
      partnerBRemaining: fromCents(bCents - bEqCents),
    },
  }
}

// Complete 15-Tool Directory Catalog
export interface ToolDefinition {
  slug: string
  href: string
  title: string
  shortTitle: string
  eyebrow: string
  description: string
  category: 'Budgeting' | 'Paycheck' | 'Savings' | 'Debt' | 'Tracking & Household'
  clusterSlug: string
  formulaSummary: string
  workedExample: string
  relatedGuides: string[]
  relatedPrintables: string[]
  relatedTools: string[]
  faqs: { question: string; answer: string }[]
}

export const TOOL_CATALOG: ToolDefinition[] = [
  {
    slug: 'monthly-budget-calculator',
    href: '/budget-calculator',
    title: 'Free Monthly Budget Calculator: Plan Income, Bills & Savings',
    shortTitle: 'Monthly Budget Calculator',
    eyebrow: 'Core Monthly Planner',
    description:
      'Compare monthly take-home income against planned and actual needs, wants, savings, and debt payments with CSV export.',
    category: 'Budgeting',
    clusterSlug: 'budget-systems',
    formulaSummary: 'Remaining Balance = Take-Home Income − (Planned Needs + Planned Wants + Planned Savings & Debt)',
    workedExample:
      'On $4,000 take-home income with $2,000 in Needs, $800 in Wants, and $900 in Savings & Debt ($3,700 total allocated), $300 remains unallocated as a monthly buffer.',
    relatedGuides: ['how-to-make-a-monthly-budget', 'budget-categories-and-percentages', 'monthly-budget-checklist'],
    relatedPrintables: ['budget-starter-bundle', 'monthly-budget-planner'],
    relatedTools: ['zero-based-budget-calculator', '50-30-20-budget-calculator', 'biweekly-budget-calculator'],
    faqs: [
      {
        question: 'Should I enter gross pay or take-home pay?',
        answer:
          'Always enter take-home pay (the net amount deposited into your bank account after taxes, healthcare premiums, and automatic payroll deductions).',
      },
      {
        question: 'Are my budget numbers sent to a server?',
        answer:
          'No. All calculations run inside your browser. Clicking "Save on this device" stores your categories in browser localStorage only.',
      },
    ],
  },
  {
    slug: 'zero-based-budget-calculator',
    href: '/tools/zero-based-budget-calculator',
    title: 'Zero-Based Budget Calculator: Give Every Dollar a Job',
    shortTitle: 'Zero-Based Budget Calculator',
    eyebrow: 'Every-Dollar Allocation Tool',
    description:
      'Assign 100% of your monthly take-home income across essentials, sinking funds, debt payoff, and buffers until Income Minus Outgo Equals $0.00.',
    category: 'Budgeting',
    clusterSlug: 'budget-systems',
    formulaSummary: 'Unassigned Dollars = Take-Home Income − Sum of All Assigned Categories (Target = $0.00)',
    workedExample:
      'If your monthly take-home income is $3,500 and your bills, food, and spending total $2,950, you assign the remaining $550 to emergency savings ($300), car maintenance sinking fund ($150), and a checking buffer ($100) so unassigned cash equals exactly $0.00.',
    relatedGuides: ['how-to-make-a-monthly-budget', 'how-to-create-a-budget-buffer-without-hiding-expenses'],
    relatedPrintables: ['zero-based-budget-worksheet', 'budget-starter-bundle'],
    relatedTools: ['monthly-budget-calculator', 'sinking-fund-calculator', 'paycheck-budget-planner'],
    faqs: [
      {
        question: 'Does zero-based budgeting mean spending my bank account down to $0?',
        answer:
          'No. Giving every dollar a job includes assigning dollars to savings transfers and a permanent checking-account buffer so you never overdraft.',
      },
      {
        question: 'How do I use a zero-based budget if my income changes each month?',
        answer:
          'Start with your lowest reliable monthly income as your baseline plan, then create a priority list for any income earned above that floor.',
      },
    ],
  },
  {
    slug: '50-30-20-budget-calculator',
    href: '/tools/50-30-20-budget-calculator',
    title: '50/30/20 Budget Calculator (Plus Custom 60/20/20 & 70/20/10 Splits)',
    shortTitle: '50/30/20 Budget Calculator',
    eyebrow: 'Percentage Split Analyzer',
    description:
      'Calculate exact dollar targets for Needs, Wants, and Savings from your after-tax income, or test custom 60/20/20 and 70/20/10 splits for high-cost areas.',
    category: 'Budgeting',
    clusterSlug: 'budget-systems',
    formulaSummary: 'Needs = Income × 50% | Wants = Income × 30% | Savings & Extra Debt = Income × 20%',
    workedExample:
      'On $4,200 monthly take-home pay, a standard 50/30/20 split allocates $2,100 to Needs, $1,260 to Wants, and $840/month ($10,080/year) to Savings and extra debt payments.',
    relatedGuides: ['50-30-20-budget-rule-examples', 'budget-categories-and-percentages'],
    relatedPrintables: ['monthly-budget-planner', 'budget-starter-bundle'],
    relatedTools: ['monthly-budget-calculator', 'zero-based-budget-calculator', 'emergency-fund-calculator'],
    faqs: [
      {
        question: 'Where do minimum debt payments go in the 50/30/20 rule?',
        answer:
          'Required minimum debt payments belong in the 50% Needs bucket because missing them causes fees and credit damage. Extra principal payments above the minimum belong in the 20% Savings & Debt bucket.',
      },
      {
        question: 'What if my rent pushes Needs above 50%?',
        answer:
          'Switch to a realistic custom ratio such as 60/20/20 or 70/15/15 while housing takes a larger share of income.',
      },
    ],
  },
  {
    slug: 'paycheck-budget-planner',
    href: '/tools/paycheck-budget-planner',
    title: 'Paycheck Budget Planner: Assign Bills Before Due Dates',
    shortTitle: 'Paycheck Budget Planner',
    eyebrow: 'Payday Cash-Flow Planner',
    description:
      'Match upcoming bill due dates, groceries, and savings transfers to a single paycheck so you never run short before your next deposit.',
    category: 'Paycheck',
    clusterSlug: 'paycheck-and-variable-income',
    formulaSummary: 'Paycheck Leftover = Paycheck Deposit − (Bills Due Before Next Payday + Pay-Period Essentials + Planned Savings)',
    workedExample:
      'From a $1,850 paycheck arriving on the 1st, reserving $950 for rent/utilities due before the 15th, $380 for two weeks of groceries/gas, and $200 for savings leaves $320 for flexible spending and buffer.',
    relatedGuides: ['how-to-budget-when-bills-are-due-before-payday', 'biweekly-budgeting-for-beginners'],
    relatedPrintables: ['paycheck-budget-worksheet', 'bill-payment-tracker'],
    relatedTools: ['biweekly-budget-calculator', 'zero-based-budget-calculator', 'bill-and-subscription-tracker'],
    faqs: [
      {
        question: 'Why budget by paycheck instead of by month?',
        answer:
          'A monthly budget can look positive on paper while still overdrafting on the 5th if rent and three utilities are all due before your second paycheck arrives.',
      },
    ],
  },
  {
    slug: 'biweekly-budget-calculator',
    href: '/tools/biweekly-budget-calculator',
    title: 'Biweekly Budget Calculator: 26-Paycheck & 3-Paycheck Month Planner',
    shortTitle: 'Biweekly Budget Calculator',
    eyebrow: '26-Paycheck Split Tool',
    description:
      'Split monthly bills evenly across two-week paychecks and plan how to allocate your two "third-paycheck" months each year.',
    category: 'Paycheck',
    clusterSlug: 'paycheck-and-variable-income',
    formulaSummary: 'Per-Paycheck Bill Reserve = Monthly Fixed Bills ÷ 2 | Annual Income = Biweekly Paycheck × 26',
    workedExample:
      'With a $2,000 biweekly paycheck ($52,000/yr across 26 checks) and $2,100 in monthly fixed bills, setting aside $1,050 from each regular paycheck covers every monthly bill and frees up two extra paychecks per year.',
    relatedGuides: ['biweekly-budgeting-for-beginners', 'how-to-budget-when-bills-are-due-before-payday'],
    relatedPrintables: ['biweekly-budget-planner', 'paycheck-budget-worksheet'],
    relatedTools: ['paycheck-budget-planner', 'monthly-budget-calculator', 'sinking-fund-calculator'],
    faqs: [
      {
        question: 'Is a third paycheck in a month 100% extra money?',
        answer:
          'Not completely—you still need two weeks of groceries, fuel, and everyday essentials during that pay period. Once those two-week essentials are covered, the monthly bill reserve portion can go toward savings or debt.',
      },
    ],
  },
  {
    slug: 'savings-goal-calculator',
    href: '/tools/savings-goal-calculator',
    title: 'Free Savings Goal Calculator: Monthly & Paycheck Savings Plan',
    shortTitle: 'Savings Goal Calculator',
    eyebrow: 'Target Timeline Planner',
    description:
      'Calculate the exact monthly contribution required to reach any savings target on schedule, with optional high-yield savings APY projections.',
    category: 'Savings',
    clusterSlug: 'savings-and-sinking-funds',
    formulaSummary: 'Simple Monthly Deposit = (Target Goal − Already Saved) ÷ Months Remaining',
    workedExample:
      'To reach a $3,000 goal in 10 months when you already have $600 saved, you need $2,400 ÷ 10 = $240 per month (or ~$110.77 per biweekly paycheck) before interest.',
    relatedGuides: ['how-to-save-1000-emergency-fund', 'how-to-budget-for-bills-that-arrive-every-three-months'],
    relatedPrintables: ['savings-goal-tracker', '30-day-savings-challenge'],
    relatedTools: ['sinking-fund-calculator', 'emergency-fund-calculator', 'savings-challenge-generator'],
    faqs: [
      {
        question: 'Should I rely on interest to hit a short-term savings goal?',
        answer:
          'For timelines under two years, plan around your direct contributions first and treat any high-yield savings interest as an extra safety cushion.',
      },
    ],
  },
  {
    slug: 'sinking-fund-calculator',
    href: '/tools/sinking-fund-calculator',
    title: 'Sinking Fund Calculator: Plan for Quarterly & Annual Expenses',
    shortTitle: 'Sinking Fund Calculator',
    eyebrow: 'Irregular Expense Planner',
    description:
      'Turn car repairs, annual insurance premiums, holidays, and medical deductibles into predictable monthly and per-paycheck savings lines.',
    category: 'Savings',
    clusterSlug: 'savings-and-sinking-funds',
    formulaSummary: 'Monthly Fund Contribution = (Expected Expense − Current Fund Balance) ÷ Months Until Due',
    workedExample:
      'A $720 six-month auto insurance renewal ($120/mo), a $600 holiday budget due in 8 months ($75/mo), and a $480 annual car maintenance fund ($40/mo) require $235/month total across all three funds.',
    relatedGuides: ['how-to-budget-for-bills-that-arrive-every-three-months', 'how-to-create-a-budget-buffer-without-hiding-expenses'],
    relatedPrintables: ['sinking-fund-worksheet', 'budget-starter-bundle'],
    relatedTools: ['savings-goal-calculator', 'emergency-fund-calculator', 'monthly-budget-calculator'],
    faqs: [
      {
        question: 'How is a sinking fund different from an emergency fund?',
        answer:
          'A sinking fund is for known, predictable upcoming expenses (like car registration, holiday gifts, or annual insurance), keeping your true emergency fund untouched for unexpected job loss or medical crises.',
      },
    ],
  },
  {
    slug: 'emergency-fund-calculator',
    href: '/tools/emergency-fund-calculator',
    title: 'Emergency Fund Calculator: 1, 3, or 6 Months of Core Expenses',
    shortTitle: 'Emergency Fund Calculator',
    eyebrow: 'Financial Safety Net',
    description:
      'Calculate your bare-bones monthly survival expenses, starter $1,000 milestone, and full 3-to-6-month emergency fund timeline.',
    category: 'Savings',
    clusterSlug: 'savings-and-sinking-funds',
    formulaSummary: 'Target Emergency Fund = Monthly Bare-Bones Essentials × Target Months Covered',
    workedExample:
      'If your essential housing, utilities, food, transportation, and minimum debt bills cost $2,400/month, a 3-month emergency fund is $7,200 and a 6-month fund is $14,400.',
    relatedGuides: ['how-to-save-1000-emergency-fund', 'how-to-build-a-bare-bones-budget-for-essential-expenses'],
    relatedPrintables: ['emergency-fund-tracker', 'savings-goal-tracker'],
    relatedTools: ['savings-goal-calculator', 'sinking-fund-calculator', 'monthly-budget-calculator'],
    faqs: [
      {
        question: 'Should I calculate my emergency fund from my full income or essential expenses?',
        answer:
          'Calculate it from your bare-bones essential expenses (housing, utilities, groceries, essential transport, healthcare, and debt minimums). In a true emergency, discretionary spending pauses.',
      },
    ],
  },
  {
    slug: 'debt-snowball-calculator',
    href: '/tools/debt-snowball-calculator',
    title: 'Debt Snowball Calculator: Pay Off Smallest Balances First',
    shortTitle: 'Debt Snowball Calculator',
    eyebrow: 'Momentum Debt Payoff',
    description:
      'Order your debts from smallest balance to largest, roll freed-up minimum payments forward as each debt disappears, and see your exact debt-free timeline.',
    category: 'Debt',
    clusterSlug: 'debt-tracking-and-payoff-planning',
    formulaSummary: 'Target Debt Payment = Target Minimum + Extra Monthly Payment + Freed Minimums From Paid-Off Debts',
    workedExample:
      'With a $600 store card ($25 min), $2,200 credit card ($65 min), and $5,500 auto loan ($160 min) plus $150/month extra, the $600 balance disappears in 4 months and its $25 minimum rolls into the next debt.',
    relatedGuides: ['how-to-pay-off-debt-fast', 'how-to-build-a-budget-when-broke'],
    relatedPrintables: ['debt-payoff-planner', 'budget-starter-bundle'],
    relatedTools: ['debt-avalanche-calculator', 'monthly-budget-calculator', 'zero-based-budget-calculator'],
    faqs: [
      {
        question: 'Why choose the debt snowball if debt avalanche saves more interest?',
        answer:
          'Knocking out a small balance in a few months frees up a monthly bill obligation and reduces the number of creditors you have to manage, which helps many households stay consistent.',
      },
    ],
  },
  {
    slug: 'debt-avalanche-calculator',
    href: '/tools/debt-avalanche-calculator',
    title: 'Debt Avalanche Calculator: Pay Off Highest APR Interest First',
    shortTitle: 'Debt Avalanche Calculator',
    eyebrow: 'Interest-Minimizing Payoff',
    description:
      'Target the debt with the highest annual percentage rate (APR) first to minimize total interest paid and shorten your overall payoff timeline.',
    category: 'Debt',
    clusterSlug: 'debt-tracking-and-payoff-planning',
    formulaSummary: 'Monthly Interest Accrual = Current Balance × (APR ÷ 12) | Priority = Highest APR First',
    workedExample:
      'Directing extra payments to a 24.99% APR credit card before a 6.5% APR student loan reduces the amount of interest compounding against you every billing cycle.',
    relatedGuides: ['how-to-pay-off-debt-fast', 'how-to-build-a-bare-bones-budget-for-essential-expenses'],
    relatedPrintables: ['debt-payoff-planner', 'budget-starter-bundle'],
    relatedTools: ['debt-snowball-calculator', 'monthly-budget-calculator', 'emergency-fund-calculator'],
    faqs: [
      {
        question: 'What happens if my total payment is less than the monthly interest?',
        answer:
          'The balance will grow instead of shrink (negative amortization). Our calculator detects non-amortizing payment scenarios and shows the minimum monthly payment needed to reduce principal.',
      },
    ],
  },
  {
    slug: 'bill-and-subscription-tracker',
    href: '/tools/bill-and-subscription-tracker',
    title: 'Bill & Subscription Tracker Calculator: Audit Recurring Charges',
    shortTitle: 'Bill & Subscription Tracker',
    eyebrow: 'Recurring Charge Audit',
    description:
      'Convert weekly, monthly, quarterly, and annual subscriptions into true monthly and annual costs, and see how much you save by canceling unused services.',
    category: 'Tracking & Household',
    clusterSlug: 'bills-and-utilities',
    formulaSummary: 'Monthly Equivalent = Annual Charge ÷ 12 (or Quarterly ÷ 3) | Annual Savings = Sum of Canceled Monthly Equivalents × 12',
    workedExample:
      'Canceling two $16.99 streaming services, a $119/year unused app ($9.92/mo), and a $35 gym membership frees up $78.90/month ($946.80/year).',
    relatedGuides: ['save-money-on-utilities', 'how-to-budget-for-bills-that-arrive-every-three-months'],
    relatedPrintables: ['bill-payment-tracker', 'subscription-tracker'],
    relatedTools: ['monthly-budget-calculator', 'sinking-fund-calculator', 'expense-tracker'],
    faqs: [
      {
        question: 'Why convert annual subscriptions into a monthly amount?',
        answer:
          'Annual renewals often hit checking accounts unexpectedly. Treating a $120/year renewal as a $10/month sinking fund lets you decide whether the service is still worth $10 every month.',
      },
    ],
  },
  {
    slug: 'grocery-budget-calculator',
    href: '/tools/grocery-budget-calculator',
    title: 'Grocery Budget Calculator: Weekly & Monthly Food Plan by Household Size',
    shortTitle: 'Grocery Budget Calculator',
    eyebrow: 'Household Food Planner',
    description:
      'Estimate realistic weekly and monthly grocery spending for adults and children across thrifty, moderate, and flexible meal plans, plus cost-per-meal targets.',
    category: 'Tracking & Household',
    clusterSlug: 'groceries-and-meal-planning',
    formulaSummary: 'Weekly Grocery Target = (Monthly Grocery Allocation × 12) ÷ 52 | Category Split = 45% Produce/Proteins, 25% Pantry, 18% Dairy/Frozen, 12% Household/Buffer',
    workedExample:
      'For two adults on a moderate food plan ($640/month), the weekly grocery target is ~$147.69/week (~$3.56 per home-cooked meal per person).',
    relatedGuides: ['frugal-grocery-shopping-tips', 'budget-meal-plan-for-one'],
    relatedPrintables: ['meal-planner-budget-kit', 'weekly-budget-planner'],
    relatedTools: ['monthly-budget-calculator', 'expense-tracker', 'expense-split-calculator'],
    faqs: [
      {
        question: 'Should household paper goods and cleaning supplies be included in the grocery budget?',
        answer:
          'Because most families buy toilet paper, dish soap, and laundry detergent at the supermarket, reserving ~12% of your grocery line for household consumables prevents surprise overruns.',
      },
    ],
  },
  {
    slug: 'savings-challenge-generator',
    href: '/tools/savings-challenge-generator',
    title: 'Free 30-Day Savings Challenge Generator ($100, $300, $500 or Custom)',
    shortTitle: '30-Day Savings Challenge',
    eyebrow: 'Daily Micro-Savings Builder',
    description:
      'Generate a 30-day savings schedule where varied daily deposits add up to your exact dollar and cent target, with printable and CSV checklists.',
    category: 'Savings',
    clusterSlug: 'no-spend-challenges-and-habits',
    formulaSummary: 'Sum of Day 1..Day 30 Deposits = Exact Target Amount (Cent-Balanced)',
    workedExample:
      'Choosing a $300 target generates 30 manageable daily transfers ranging from $4 to $17 that sum to $300.00 to the exact cent.',
    relatedGuides: ['30-day-money-saving-challenge', 'no-spend-month-guide', 'how-to-stop-impulse-buying'],
    relatedPrintables: ['30-day-savings-challenge', '52-week-savings-challenge', 'no-spend-challenge-calendar'],
    relatedTools: ['savings-goal-calculator', 'emergency-fund-calculator', 'sinking-fund-calculator'],
    faqs: [
      {
        question: 'Do I have to transfer money every single day?',
        answer:
          'No. Many people check off daily amounts on paper and make one combined transfer at the end of each week.',
      },
    ],
  },
  {
    slug: 'expense-tracker',
    href: '/tools/expense-tracker',
    title: 'Daily & Weekly Expense Tracker With Instant CSV Export',
    shortTitle: 'Expense Tracker & CSV Exporter',
    eyebrow: 'Transaction Log & Categorizer',
    description:
      'Log daily purchases by category, compare against your weekly spending cap, and export a clean CSV spreadsheet for Excel or Google Sheets.',
    category: 'Tracking & Household',
    clusterSlug: 'spreadsheets-and-expense-tracking',
    formulaSummary: 'Remaining Weekly Cap = Weekly Spending Limit − Sum of Logged Transactions',
    workedExample:
      'Setting a $250 weekly flexible spending cap and logging $95 in groceries, $38 in fuel, and $22 in dining out shows $155 spent (62%) and $95 remaining for the week.',
    relatedGuides: ['weekly-budget-check-in-a-ten-minute-routine', 'how-to-stop-impulse-buying'],
    relatedPrintables: ['expense-tracker', 'budget-starter-bundle'],
    relatedTools: ['monthly-budget-calculator', 'bill-and-subscription-tracker', 'grocery-budget-calculator'],
    faqs: [
      {
        question: 'Does this tool connect to my bank login?',
        answer:
          'No. BudgetLoom never asks for bank credentials. Manual entry takes two minutes a week, builds stronger spending awareness, and keeps your financial accounts completely private.',
      },
    ],
  },
  {
    slug: 'expense-split-calculator',
    href: '/tools/expense-split-calculator',
    title: 'Household Expense Splitting Calculator: Proportional vs. 50/50 Split',
    shortTitle: 'Household Expense Split Calculator',
    eyebrow: 'Couples & Roommates Fair Split',
    description:
      'Calculate fair shared bill contributions for couples or roommates using either proportional take-home income shares or a 50/50 split.',
    category: 'Tracking & Household',
    clusterSlug: 'household-and-family-budgets',
    formulaSummary: 'Partner A Proportional Contribution = Total Shared Bills × (Partner A Income ÷ Combined Household Income)',
    workedExample:
      'If Partner A brings home $3,600 (60%) and Partner B brings home $2,400 (40%) with $3,000 in shared bills, a proportional split assigns $1,800 to Partner A and $1,200 to Partner B.',
    relatedGuides: ['how-to-make-a-monthly-budget', 'budget-categories-and-percentages'],
    relatedPrintables: ['family-budget-planner', 'monthly-budget-planner'],
    relatedTools: ['monthly-budget-calculator', 'grocery-budget-calculator', 'bill-and-subscription-tracker'],
    faqs: [
      {
        question: 'When is a proportional split better than a 50/50 split?',
        answer:
          'When two partners have noticeably different incomes, splitting shared rent and utilities proportionally prevents the lower-earning partner from being stretched thin while allowing both partners to save at a similar rate.',
      },
    ],
  },
]

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return TOOL_CATALOG.find((t) => t.slug === slug)
}
