'use client'

import { useMemo, useState } from 'react'
import BudgetCalculator from './BudgetCalculator'
import SavingsGoalCalculator from './SavingsGoalCalculator'
import SavingsChallengeBuilder from './SavingsChallengeBuilder'
import {
  calculatePercentageSplit,
  calculateBiweeklyBudget,
  calculateSinkingFunds,
  calculateEmergencyFund,
  calculateDebtPayoff,
  calculateSubscriptionAudit,
  calculateGroceryBudget,
  calculateHouseholdSplit,
  toCents,
  fromCents,
  type SinkingFundInput,
  type DebtInput,
  type RecurringBillItem,
} from '@/lib/calculators'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function Split503020Tool() {
  const [income, setIncome] = useState('4000')
  const [needsPct, setNeedsPct] = useState(50)
  const [wantsPct, setWantsPct] = useState(30)
  const [savingsPct, setSavingsPct] = useState(20)

  const res = useMemo(
    () => calculatePercentageSplit(income, needsPct, wantsPct, savingsPct),
    [income, needsPct, wantsPct, savingsPct]
  )

  const applyPreset = (n: number, w: number, s: number) => {
    setNeedsPct(n)
    setWantsPct(w)
    setSavingsPct(s)
  }

  return (
    <section className="calculator" aria-label="50/30/20 budget split calculator" style={{ display: 'block' }}>
      <div className="calculator-fields" style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="split-income">
          <span>Monthly after-tax (take-home) income ($)</span>
          <div className="money-input">
            <input
              id="split-income"
              type="number"
              min="0"
              step="0.01"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </div>
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => applyPreset(50, 30, 20)}>
            50 / 30 / 20 (Standard)
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => applyPreset(60, 20, 20)}>
            60 / 20 / 20 (High-Cost Housing)
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => applyPreset(70, 15, 15)}>
            70 / 15 / 15 (Essentials-First)
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => applyPreset(50, 20, 30)}>
            50 / 20 / 30 (Aggressive Debt/Savings)
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 8 }}>
          <label htmlFor="pct-needs">
            <span>Needs (%)</span>
            <div className="money-input">
              <input
                id="pct-needs"
                type="number"
                min="0"
                max="100"
                value={needsPct}
                onChange={(e) => setNeedsPct(Number(e.target.value))}
              />
            </div>
          </label>
          <label htmlFor="pct-wants">
            <span>Wants (%)</span>
            <div className="money-input">
              <input
                id="pct-wants"
                type="number"
                min="0"
                max="100"
                value={wantsPct}
                onChange={(e) => setWantsPct(Number(e.target.value))}
              />
            </div>
          </label>
          <label htmlFor="pct-savings">
            <span>Savings & Debt (%)</span>
            <div className="money-input">
              <input
                id="pct-savings"
                type="number"
                min="0"
                max="100"
                value={savingsPct}
                onChange={(e) => setSavingsPct(Number(e.target.value))}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">
          {needsPct}/{wantsPct}/{savingsPct} Monthly Allocation
        </p>
        {res.valid ? (
          <>
            <div className="result-total">
              <span>Monthly Savings & Extra Debt ({savingsPct}%)</span>
              <strong>{usd.format(res.savingsAmount)}</strong>
            </div>
            <dl>
              <div>
                <dt>Needs ({needsPct}% — Housing, utilities, groceries, minimums)</dt>
                <dd>{usd.format(res.needsAmount)}/mo</dd>
              </div>
              <div>
                <dt>Wants ({wantsPct}% — Dining out, hobbies, optional upgrades)</dt>
                <dd>{usd.format(res.wantsAmount)}/mo</dd>
              </div>
              <div>
                <dt>Savings & Extra Debt ({savingsPct}% — Emergency, sinking, principal)</dt>
                <dd>{usd.format(res.savingsAmount)}/mo</dd>
              </div>
              <div>
                <dt>12-Month Savings & Debt Reduction Pace</dt>
                <dd>{usd.format(res.annualSavings)}/yr</dd>
              </div>
            </dl>
          </>
        ) : (
          <p role="alert" style={{ color: '#fca5a5', marginTop: 8 }}>
            {res.error}
          </p>
        )}
      </div>
    </section>
  )
}

function PaycheckPlannerTool() {
  const [paycheck, setPaycheck] = useState('1850')
  const [billsDue, setBillsDue] = useState('920')
  const [groceriesAndGas, setGroceriesAndGas] = useState('380')
  const [savingsTransfer, setSavingsTransfer] = useState('250')
  const [personalWants, setPersonalWants] = useState('180')

  const calc = useMemo(() => {
    const checkC = toCents(paycheck)
    const billsC = toCents(billsDue)
    const essC = toCents(groceriesAndGas)
    const savC = toCents(savingsTransfer)
    const wantsC = toCents(personalWants)
    const totalOutC = billsC + essC + savC + wantsC
    const remC = checkC - totalOutC
    return {
      check: fromCents(checkC),
      bills: fromCents(billsC),
      essentials: fromCents(essC),
      savings: fromCents(savC),
      wants: fromCents(wantsC),
      allocated: fromCents(totalOutC),
      remaining: fromCents(remC),
    }
  }, [paycheck, billsDue, groceriesAndGas, savingsTransfer, personalWants])

  return (
    <section className="calculator" aria-label="Paycheck budget planner" style={{ display: 'block' }}>
      <div
        className="calculator-fields"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}
      >
        {[
          { id: 'pc-net', label: 'This paycheck net deposit ($)', val: paycheck, set: setPaycheck },
          { id: 'pc-bills', label: 'Bills due before next payday ($)', val: billsDue, set: setBillsDue },
          { id: 'pc-ess', label: 'Groceries & fuel until next payday ($)', val: groceriesAndGas, set: setGroceriesAndGas },
          { id: 'pc-sav', label: 'Savings & sinking fund transfer ($)', val: savingsTransfer, set: setSavingsTransfer },
          { id: 'pc-wants', label: 'Personal spending allowance ($)', val: personalWants, set: setPersonalWants },
        ].map((f) => (
          <label key={f.id} htmlFor={f.id}>
            <span>{f.label}</span>
            <div className="money-input">
              <input id={f.id} type="number" min="0" step="0.01" value={f.val} onChange={(e) => f.set(e.target.value)} />
            </div>
          </label>
        ))}
      </div>
      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">Paycheck Cash-Flow Plan</p>
        <div className="result-total">
          <span>Checking Buffer Remaining Until Next Payday</span>
          <strong className={calc.remaining < 0 ? 'negative' : ''}>{usd.format(calc.remaining)}</strong>
        </div>
        <dl>
          <div>
            <dt>Net paycheck deposit</dt>
            <dd>{usd.format(calc.check)}</dd>
          </div>
          <div>
            <dt>Reserved for bills due this pay period</dt>
            <dd>{usd.format(calc.bills)}</dd>
          </div>
          <div>
            <dt>Pay-period groceries & transportation</dt>
            <dd>{usd.format(calc.essentials)}</dd>
          </div>
          <div>
            <dt>Savings & goals transfer</dt>
            <dd>{usd.format(calc.savings)}</dd>
          </div>
          <div>
            <dt>Total assigned from this paycheck</dt>
            <dd>{usd.format(calc.allocated)}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

function BiweeklyTool() {
  const [paycheck, setPaycheck] = useState('2000')
  const [monthlyBills, setMonthlyBills] = useState('2100')
  const [twoWeekEssentials, setTwoWeekEssentials] = useState('420')

  const res = useMemo(
    () => calculateBiweeklyBudget(paycheck, monthlyBills, twoWeekEssentials),
    [paycheck, monthlyBills, twoWeekEssentials]
  )

  return (
    <section className="calculator" aria-label="Biweekly budget calculator" style={{ display: 'block' }}>
      <div
        className="calculator-fields"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}
      >
        <label htmlFor="bw-check">
          <span>Biweekly net paycheck (every 2 weeks, $)</span>
          <div className="money-input">
            <input id="bw-check" type="number" min="0" step="0.01" value={paycheck} onChange={(e) => setPaycheck(e.target.value)} />
          </div>
        </label>
        <label htmlFor="bw-bills">
          <span>Total monthly fixed bills ($)</span>
          <div className="money-input">
            <input id="bw-bills" type="number" min="0" step="0.01" value={monthlyBills} onChange={(e) => setMonthlyBills(e.target.value)} />
          </div>
        </label>
        <label htmlFor="bw-ess">
          <span>2-week groceries & fuel essentials ($)</span>
          <div className="money-input">
            <input id="bw-ess" type="number" min="0" step="0.01" value={twoWeekEssentials} onChange={(e) => setTwoWeekEssentials(e.target.value)} />
          </div>
        </label>
      </div>
      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">26-Paycheck Biweekly Plan</p>
        {res.valid ? (
          <>
            <div className="result-total">
              <span>50% Bill Reserve Per Biweekly Check</span>
              <strong>{usd.format(res.billReservePerPaycheck)}</strong>
            </div>
            <dl>
              <div>
                <dt>Standard 2-paycheck month income (24 checks/yr)</dt>
                <dd>{usd.format(res.standardTwoCheckMonthIncome)}/mo</dd>
              </div>
              <div>
                <dt>True annual take-home across 26 paychecks</dt>
                <dd>{usd.format(res.annualTakeHome)}/yr</dd>
              </div>
              <div>
                <dt>Remaining per check for savings, debt & wants</dt>
                <dd>{usd.format(res.flexibleAndGoalsPerPaycheck)}/check</dd>
              </div>
              <div>
                <dt>3rd-Paycheck Bonus Surplus (after 2-wk essentials)</dt>
                <dd>{usd.format(res.extraPaycheckNetAfterEssentials)} (2× per year)</dd>
              </div>
            </dl>
          </>
        ) : (
          <p role="alert">{res.error}</p>
        )}
      </div>
    </section>
  )
}

function SinkingFundTool() {
  const [funds, setFunds] = useState<SinkingFundInput[]>([
    { id: '1', name: '6-Month Auto Insurance Renewal', targetAmount: '720', alreadySaved: '120', monthsUntilDue: '5' },
    { id: '2', name: 'Car Tires & Maintenance Reserve', targetAmount: '600', alreadySaved: '100', monthsUntilDue: '10' },
    { id: '3', name: 'Holiday & Family Gifts', targetAmount: '600', alreadySaved: '0', monthsUntilDue: '8' },
    { id: '4', name: 'Medical / Dental Copay Cushion', targetAmount: '400', alreadySaved: '100', monthsUntilDue: '6' },
  ])

  const summary = useMemo(() => calculateSinkingFunds(funds), [funds])

  const update = (id: string, key: keyof SinkingFundInput, val: string) => {
    setFunds((curr) => curr.map((f) => (f.id === id ? { ...f, [key]: val } : f)))
  }

  return (
    <section className="calculator" aria-label="Sinking fund calculator" style={{ display: 'block' }}>
      <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: 8 }}>Sinking Fund</th>
              <th style={{ padding: 8 }}>Target ($)</th>
              <th style={{ padding: 8 }}>Saved ($)</th>
              <th style={{ padding: 8 }}>Months Left</th>
              <th style={{ padding: 8 }}>Monthly Need</th>
            </tr>
          </thead>
          <tbody>
            {funds.map((f, idx) => {
              const calcItem = summary.items[idx]
              return (
                <tr key={f.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: 8 }}>
                    <input
                      aria-label={`Fund ${idx + 1} name`}
                      value={f.name}
                      onChange={(e) => update(f.id, 'name', e.target.value)}
                      style={{ width: '100%', padding: 8, border: '1px solid #cfdad7', borderRadius: 6 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      aria-label={`${f.name} target`}
                      type="number"
                      min="0"
                      value={f.targetAmount}
                      onChange={(e) => update(f.id, 'targetAmount', e.target.value)}
                      style={{ width: 100, padding: 8, border: '1px solid #cfdad7', borderRadius: 6 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      aria-label={`${f.name} saved`}
                      type="number"
                      min="0"
                      value={f.alreadySaved}
                      onChange={(e) => update(f.id, 'alreadySaved', e.target.value)}
                      style={{ width: 100, padding: 8, border: '1px solid #cfdad7', borderRadius: 6 }}
                    />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input
                      aria-label={`${f.name} months`}
                      type="number"
                      min="1"
                      max="120"
                      value={f.monthsUntilDue}
                      onChange={(e) => update(f.id, 'monthsUntilDue', e.target.value)}
                      style={{ width: 80, padding: 8, border: '1px solid #cfdad7', borderRadius: 6 }}
                    />
                  </td>
                  <td style={{ padding: 8, fontWeight: 700, color: 'var(--green-dark)' }}>
                    {usd.format(calcItem?.monthlyContribution ?? 0)}/mo
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        style={{ marginBottom: '1.25rem' }}
        onClick={() =>
          setFunds((curr) => [
            ...curr,
            { id: String(Date.now()), name: 'New Irregular Expense', targetAmount: '300', alreadySaved: '0', monthsUntilDue: '6' },
          ])
        }
      >
        + Add Sinking Fund
      </button>

      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">Combined Sinking Fund Plan</p>
        <div className="result-total">
          <span>Total Monthly Sinking Fund Transfer</span>
          <strong>{usd.format(summary.totalMonthlyRequired)}/mo</strong>
        </div>
        <dl>
          <div>
            <dt>Per biweekly paycheck (26 checks/yr)</dt>
            <dd>{usd.format(summary.totalPerBiweeklyPaycheck)}/check</dd>
          </div>
          <div>
            <dt>Total upcoming irregular expenses</dt>
            <dd>{usd.format(summary.totalTarget)}</dd>
          </div>
          <div>
            <dt>Already reserved across funds</dt>
            <dd>{usd.format(summary.totalSaved)}</dd>
          </div>
          <div>
            <dt>Remaining funding gap</dt>
            <dd>{usd.format(summary.totalRemaining)}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

function EmergencyFundTool() {
  const [essentials, setEssentials] = useState('2500')
  const [months, setMonths] = useState('3')
  const [saved, setSaved] = useState('1000')
  const [monthlyContrib, setMonthlyContrib] = useState('300')

  const res = useMemo(
    () => calculateEmergencyFund(essentials, months, saved, monthlyContrib),
    [essentials, months, saved, monthlyContrib]
  )

  return (
    <section className="calculator" aria-label="Emergency fund calculator" style={{ display: 'block' }}>
      <div
        className="calculator-fields"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}
      >
        <label htmlFor="ef-ess">
          <span>Bare-bones monthly essential expenses ($)</span>
          <div className="money-input">
            <input id="ef-ess" type="number" min="0" value={essentials} onChange={(e) => setEssentials(e.target.value)} />
          </div>
        </label>
        <label htmlFor="ef-mos">
          <span>Target months of coverage (1–12)</span>
          <div className="money-input">
            <input id="ef-mos" type="number" min="1" max="12" value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>
        </label>
        <label htmlFor="ef-saved">
          <span>Current emergency savings ($)</span>
          <div className="money-input">
            <input id="ef-saved" type="number" min="0" value={saved} onChange={(e) => setSaved(e.target.value)} />
          </div>
        </label>
        <label htmlFor="ef-contrib">
          <span>Planned monthly deposit ($)</span>
          <div className="money-input">
            <input id="ef-contrib" type="number" min="0" value={monthlyContrib} onChange={(e) => setMonthlyContrib(e.target.value)} />
          </div>
        </label>
      </div>
      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">{res.targetMonths}-Month Core Safety Net</p>
        <div className="result-total">
          <span>Full Emergency Fund Target</span>
          <strong>{usd.format(res.fullTargetAmount)}</strong>
        </div>
        <dl>
          <div>
            <dt>Stage 1 Starter Milestone ($1,000)</dt>
            <dd>{res.remainingToStarter === 0 ? 'Completed!' : `${usd.format(res.remainingToStarter)} to go`}</dd>
          </div>
          <div>
            <dt>Current runway covered</dt>
            <dd>{res.monthsCoveredCurrently} months of essentials</dd>
          </div>
          <div>
            <dt>Remaining to full {res.targetMonths}-month target</dt>
            <dd>{usd.format(res.remainingToFull)}</dd>
          </div>
          <div>
            <dt>Estimated timeline at {usd.format(Number(monthlyContrib) || 0)}/mo</dt>
            <dd>{res.monthsToFullGoal !== null ? `${res.monthsToFullGoal} months` : 'Enter monthly deposit'}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

function DebtPayoffTool({ defaultStrategy }: { defaultStrategy: 'snowball' | 'avalanche' }) {
  const [strategy, setStrategy] = useState<'snowball' | 'avalanche'>(defaultStrategy)
  const [extra, setExtra] = useState('200')
  const [debts, setDebts] = useState<DebtInput[]>([
    { id: '1', name: 'Retail Store Card', balance: '650', aprPercent: '26.99', minPayment: '30' },
    { id: '2', name: 'Medical Payment Plan', balance: '900', aprPercent: '0', minPayment: '50' },
    { id: '3', name: 'Bank Rewards Visa', balance: '3400', aprPercent: '21.99', minPayment: '95' },
    { id: '4', name: 'Auto Loan', balance: '6800', aprPercent: '6.9', minPayment: '175' },
  ])

  const activeRes = useMemo(() => calculateDebtPayoff(debts, extra, strategy), [debts, extra, strategy])
  const altRes = useMemo(
    () => calculateDebtPayoff(debts, extra, strategy === 'snowball' ? 'avalanche' : 'snowball'),
    [debts, extra, strategy]
  )

  const update = (id: string, key: keyof DebtInput, val: string) => {
    setDebts((curr) => curr.map((d) => (d.id === id ? { ...d, [key]: val } : d)))
  }

  return (
    <section className="calculator" aria-label={`Debt ${strategy} calculator`} style={{ display: 'block' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            className={`btn btn-sm ${strategy === 'snowball' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setStrategy('snowball')}
          >
            Debt Snowball (Smallest Balance First)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${strategy === 'avalanche' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setStrategy('avalanche')}
          >
            Debt Avalanche (Highest APR First)
          </button>
        </div>
        <label htmlFor="debt-extra" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', fontWeight: 600 }}>
          <span>Extra monthly payment ($):</span>
          <input
            id="debt-extra"
            type="number"
            min="0"
            step="1"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            style={{ width: 110, padding: 8, border: '1px solid #cfdad7', borderRadius: 8 }}
          />
        </label>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: 8 }}>Creditor</th>
              <th style={{ padding: 8 }}>Balance ($)</th>
              <th style={{ padding: 8 }}>APR (%)</th>
              <th style={{ padding: 8 }}>Min Payment ($)</th>
            </tr>
          </thead>
          <tbody>
            {debts.map((d, idx) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 8 }}>
                  <input
                    aria-label={`Debt ${idx + 1} name`}
                    value={d.name}
                    onChange={(e) => update(d.id, 'name', e.target.value)}
                    style={{ width: '100%', padding: 8, border: '1px solid #cfdad7', borderRadius: 6 }}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <input
                    aria-label={`${d.name} balance`}
                    type="number"
                    min="0"
                    value={d.balance}
                    onChange={(e) => update(d.id, 'balance', e.target.value)}
                    style={{ width: 110, padding: 8, border: '1px solid #cfdad7', borderRadius: 6 }}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <input
                    aria-label={`${d.name} APR`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={d.aprPercent}
                    onChange={(e) => update(d.id, 'aprPercent', e.target.value)}
                    style={{ width: 90, padding: 8, border: '1px solid #cfdad7', borderRadius: 6 }}
                  />
                </td>
                <td style={{ padding: 8 }}>
                  <input
                    aria-label={`${d.name} minimum payment`}
                    type="number"
                    min="0"
                    value={d.minPayment}
                    onChange={(e) => update(d.id, 'minPayment', e.target.value)}
                    style={{ width: 100, padding: 8, border: '1px solid #cfdad7', borderRadius: 6 }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">
          {strategy === 'snowball' ? 'Debt Snowball Payoff Plan' : 'Debt Avalanche Payoff Plan'}
        </p>
        {activeRes.valid ? (
          <>
            <div className="result-total">
              <span>Debt-Free Timeline</span>
              <strong>
                {activeRes.monthsToPayoff} months ({Math.floor(activeRes.monthsToPayoff / 12)}y {activeRes.monthsToPayoff % 12}m)
              </strong>
            </div>
            <dl>
              <div>
                <dt>Total starting principal</dt>
                <dd>{usd.format(activeRes.totalPrincipal)}</dd>
              </div>
              <div>
                <dt>Total interest paid ({strategy})</dt>
                <dd>{usd.format(activeRes.totalInterestPaid)}</dd>
              </div>
              {altRes.valid && (
                <div>
                  <dt>Comparison vs. {strategy === 'snowball' ? 'Avalanche' : 'Snowball'}</dt>
                  <dd>{usd.format(altRes.totalInterestPaid)} total interest ({altRes.monthsToPayoff} mos)</dd>
                </div>
              )}
            </dl>
            <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 12 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6ee7b7', marginBottom: 6 }}>
                PAYOFF PRIORITY ORDER & MILESTONES
              </div>
              {activeRes.payoffOrder.map((item, i) => (
                <div
                  key={item.id}
                  style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', padding: '4px 0' }}
                >
                  <span>
                    #{i + 1} {item.name} ({usd.format(item.startingBalance)} @ {item.aprPercent}%)
                  </span>
                  <strong>Paid off in Month {item.paidOffMonth}</strong>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p role="alert" style={{ color: '#fca5a5' }}>
            {activeRes.error}
          </p>
        )}
      </div>
    </section>
  )
}

function SubscriptionAuditTool() {
  const [items, setItems] = useState<RecurringBillItem[]>([
    { id: '1', name: 'Primary Streaming Service', amount: '16.99', frequency: 'monthly', keepStatus: 'essential' },
    { id: '2', name: 'Secondary Video App', amount: '18.99', frequency: 'monthly', keepStatus: 'cancel' },
    { id: '3', name: 'Unused Gym / Fitness App', amount: '34.00', frequency: 'monthly', keepStatus: 'cancel' },
    { id: '4', name: 'Annual Cloud / Software Renewal', amount: '119.88', frequency: 'annual', keepStatus: 'cancel' },
    { id: '5', name: 'Music / Audio Plan', amount: '11.99', frequency: 'monthly', keepStatus: 'essential' },
  ])

  const res = useMemo(() => calculateSubscriptionAudit(items), [items])

  const toggleStatus = (id: string, status: RecurringBillItem['keepStatus']) => {
    setItems((curr) => curr.map((i) => (i.id === id ? { ...i, keepStatus: status } : i)))
  }

  return (
    <section className="calculator" aria-label="Bill and subscription tracker" style={{ display: 'block' }}>
      <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: 8 }}>Recurring Service</th>
              <th style={{ padding: 8 }}>Amount ($)</th>
              <th style={{ padding: 8 }}>Cycle</th>
              <th style={{ padding: 8 }}>Annual Cost</th>
              <th style={{ padding: 8 }}>Decision</th>
            </tr>
          </thead>
          <tbody>
            {res.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: 8, fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: 8 }}>${Number(item.amount).toFixed(2)}</td>
                <td style={{ padding: 8 }}>{item.frequency}</td>
                <td style={{ padding: 8, fontWeight: 600 }}>{usd.format(item.annualEquivalent)}/yr</td>
                <td style={{ padding: 8 }}>
                  <select
                    aria-label={`Decision for ${item.name}`}
                    value={item.keepStatus}
                    onChange={(e) => toggleStatus(item.id, e.target.value as RecurringBillItem['keepStatus'])}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cfdad7', background: 'white' }}
                  >
                    <option value="essential">Keep</option>
                    <option value="cancel">Cancel (Save)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">Subscription Audit Results</p>
        <div className="result-total">
          <span>Annual Savings From Canceled Services</span>
          <strong>{usd.format(res.annualSavingsFromCanceling)}/yr</strong>
        </div>
        <dl>
          <div>
            <dt>Monthly cash flow freed immediately</dt>
            <dd>{usd.format(res.monthlySavingsFromCanceling)}/mo</dd>
          </div>
          <div>
            <dt>Remaining active subscriptions (monthly)</dt>
            <dd>{usd.format(res.activeMonthlyTotal)}/mo</dd>
          </div>
          <div>
            <dt>Remaining active subscriptions (annual)</dt>
            <dd>{usd.format(res.activeAnnualTotal)}/yr</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

function GroceryTool() {
  const [adults, setAdults] = useState('2')
  const [children, setChildren] = useState('0')
  const [tier, setTier] = useState<'thrifty' | 'moderate' | 'flexible'>('moderate')
  const [diningOut, setDiningOut] = useState('120')

  const res = useMemo(
    () => calculateGroceryBudget(adults, children, tier, diningOut),
    [adults, children, tier, diningOut]
  )

  return (
    <section className="calculator" aria-label="Grocery budget calculator" style={{ display: 'block' }}>
      <div
        className="calculator-fields"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}
      >
        <label htmlFor="gr-adults">
          <span>Adults in household</span>
          <div className="money-input">
            <input id="gr-adults" type="number" min="0" max="12" value={adults} onChange={(e) => setAdults(e.target.value)} />
          </div>
        </label>
        <label htmlFor="gr-kids">
          <span>Children in household</span>
          <div className="money-input">
            <input id="gr-kids" type="number" min="0" max="12" value={children} onChange={(e) => setChildren(e.target.value)} />
          </div>
        </label>
        <label htmlFor="gr-tier">
          <span>Food spending plan</span>
          <select
            id="gr-tier"
            value={tier}
            onChange={(e) => setTier(e.target.value as 'thrifty' | 'moderate' | 'flexible')}
            style={{ width: '100%', minHeight: 44, border: '1px solid #cfdad7', borderRadius: 10, padding: '0 12px', background: 'white' }}
          >
            <option value="thrifty">Thrifty (Staples & Batch Cooking)</option>
            <option value="moderate">Moderate (Balanced Home Cooking)</option>
            <option value="flexible">Flexible (Organic / Specialty Items)</option>
          </select>
        </label>
        <label htmlFor="gr-dining">
          <span>Separate monthly dining-out limit ($)</span>
          <div className="money-input">
            <input id="gr-dining" type="number" min="0" value={diningOut} onChange={(e) => setDiningOut(e.target.value)} />
          </div>
        </label>
      </div>
      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">Recommended Grocery & Food Plan</p>
        <div className="result-total">
          <span>Weekly Supermarket Shopping Cap</span>
          <strong>{usd.format(res.weeklyGroceries)}/wk</strong>
        </div>
        <dl>
          <div>
            <dt>Monthly supermarket & household groceries</dt>
            <dd>{usd.format(res.monthlyGroceries)}/mo</dd>
          </div>
          <div>
            <dt>Average cost per home-cooked meal per person</dt>
            <dd>{usd.format(res.costPerMealPerPerson)}/meal</dd>
          </div>
          <div>
            <dt>Produce & proteins (45%)</dt>
            <dd>{usd.format(res.categorySplit.produceAndProteins)}/mo</dd>
          </div>
          <div>
            <dt>Pantry staples, grains & bread (25%)</dt>
            <dd>{usd.format(res.categorySplit.pantryAndGrains)}/mo</dd>
          </div>
          <div>
            <dt>Dairy, eggs & frozen (18%) + Household supplies (12%)</dt>
            <dd>{usd.format(res.categorySplit.dairyAndFrozen + res.categorySplit.householdAndBuffer)}/mo</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

function ExpenseTrackerTool() {
  const [weeklyCap, setWeeklyCap] = useState('250')
  const [entries, setEntries] = useState([
    { id: '1', date: '2026-10-12', item: 'Supermarket weekly trip', category: 'Groceries', amount: '94.50' },
    { id: '2', date: '2026-10-13', item: 'Gas station fill-up', category: 'Transport', amount: '38.00' },
    { id: '3', date: '2026-10-14', item: 'Pharmacy essentials', category: 'Healthcare', amount: '16.25' },
  ])
  const [newItem, setNewItem] = useState('')
  const [newAmount, setNewAmount] = useState('')

  const spentCents = entries.reduce((s, e) => s + toCents(e.amount), 0)
  const capCents = toCents(weeklyCap)
  const remCents = capCents - spentCents

  return (
    <section className="calculator" aria-label="Expense tracker and CSV exporter" style={{ display: 'block' }}>
      <div className="calculator-fields" style={{ marginBottom: '1rem' }}>
        <label htmlFor="et-cap">
          <span>Weekly flexible spending cap ($)</span>
          <div className="money-input">
            <input id="et-cap" type="number" min="0" value={weeklyCap} onChange={(e) => setWeeklyCap(e.target.value)} />
          </div>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input
          aria-label="Purchase description"
          placeholder="Merchant or item..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          style={{ flex: '2 1 180px', padding: 9, border: '1px solid #cfdad7', borderRadius: 8 }}
        />
        <input
          aria-label="Purchase amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount ($)"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          style={{ flex: '1 1 110px', padding: 9, border: '1px solid #cfdad7', borderRadius: 8 }}
        />
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            if (!newItem.trim() || !Number(newAmount)) return
            setEntries((curr) => [
              ...curr,
              { id: String(Date.now()), date: new Date().toISOString().split('T')[0], item: newItem.trim(), category: 'Flexible', amount: newAmount },
            ])
            setNewItem('')
            setNewAmount('')
          }}
        >
          Log Expense
        </button>
      </div>
      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">Weekly Safe-to-Spend Status</p>
        <div className="result-total">
          <span>Remaining Weekly Spending Cap</span>
          <strong className={remCents < 0 ? 'negative' : ''}>{usd.format(fromCents(remCents))}</strong>
        </div>
        <dl>
          <div>
            <dt>Weekly spending cap</dt>
            <dd>{usd.format(fromCents(capCents))}</dd>
          </div>
          <div>
            <dt>Logged transactions ({entries.length})</dt>
            <dd>{usd.format(fromCents(spentCents))}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

function HouseholdSplitTool() {
  const [incomeA, setIncomeA] = useState('3900')
  const [incomeB, setIncomeB] = useState('2100')
  const [sharedBills, setSharedBills] = useState('3200')

  const res = useMemo(
    () => calculateHouseholdSplit(incomeA, incomeB, sharedBills),
    [incomeA, incomeB, sharedBills]
  )

  return (
    <section className="calculator" aria-label="Household expense splitting calculator" style={{ display: 'block' }}>
      <div
        className="calculator-fields"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}
      >
        <label htmlFor="hs-a">
          <span>Partner A monthly take-home pay ($)</span>
          <div className="money-input">
            <input id="hs-a" type="number" min="0" value={incomeA} onChange={(e) => setIncomeA(e.target.value)} />
          </div>
        </label>
        <label htmlFor="hs-b">
          <span>Partner B monthly take-home pay ($)</span>
          <div className="money-input">
            <input id="hs-b" type="number" min="0" value={incomeB} onChange={(e) => setIncomeB(e.target.value)} />
          </div>
        </label>
        <label htmlFor="hs-bills">
          <span>Total shared household bills ($)</span>
          <div className="money-input">
            <input id="hs-bills" type="number" min="0" value={sharedBills} onChange={(e) => setSharedBills(e.target.value)} />
          </div>
        </label>
      </div>
      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">Proportional Income Split vs. 50/50 Equal Split</p>
        {res.valid ? (
          <>
            <div className="result-total">
              <span>Proportional Split ({res.proportional.partnerASharePct}% / {res.proportional.partnerBSharePct}%)</span>
              <strong>
                {usd.format(res.proportional.partnerAContribution)} / {usd.format(res.proportional.partnerBContribution)}
              </strong>
            </div>
            <dl>
              <div>
                <dt>Partner A Proportional Contribution ({res.proportional.partnerASharePct}%)</dt>
                <dd>{usd.format(res.proportional.partnerAContribution)} ({usd.format(res.proportional.partnerARemaining)} left)</dd>
              </div>
              <div>
                <dt>Partner B Proportional Contribution ({res.proportional.partnerBSharePct}%)</dt>
                <dd>{usd.format(res.proportional.partnerBContribution)} ({usd.format(res.proportional.partnerBRemaining)} left)</dd>
              </div>
              <div>
                <dt>50/50 Equal Split Comparison</dt>
                <dd>
                  {usd.format(res.equalSplit.partnerAContribution)} each (Leaves {usd.format(res.equalSplit.partnerBRemaining)} for Partner B)
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <p role="alert">Enter positive household incomes and shared bill total.</p>
        )}
      </div>
    </section>
  )
}

export default function InteractiveToolSuite({ slug }: { slug: string }) {
  switch (slug) {
    case 'monthly-budget-calculator':
      return <BudgetCalculator />
    case 'zero-based-budget-calculator':
      return <BudgetCalculator zeroBasedMode />
    case '50-30-20-budget-calculator':
      return <Split503020Tool />
    case 'paycheck-budget-planner':
      return <PaycheckPlannerTool />
    case 'biweekly-budget-calculator':
      return <BiweeklyTool />
    case 'savings-goal-calculator':
      return <SavingsGoalCalculator />
    case 'sinking-fund-calculator':
      return <SinkingFundTool />
    case 'emergency-fund-calculator':
      return <EmergencyFundTool />
    case 'debt-snowball-calculator':
      return <DebtPayoffTool defaultStrategy="snowball" />
    case 'debt-avalanche-calculator':
      return <DebtPayoffTool defaultStrategy="avalanche" />
    case 'bill-and-subscription-tracker':
      return <SubscriptionAuditTool />
    case 'grocery-budget-calculator':
      return <GroceryTool />
    case 'savings-challenge-generator':
      return <SavingsChallengeBuilder />
    case 'expense-tracker':
      return <ExpenseTrackerTool />
    case 'expense-split-calculator':
      return <HouseholdSplitTool />
    default:
      return <BudgetCalculator />
  }
}
