'use client'

import { useMemo, useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import { calculateSavingsGoal } from '@/lib/calculators'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function SavingsGoalCalculator() {
  const [target, setTarget] = useState('1200')
  const [saved, setSaved] = useState('300')
  const [months, setMonths] = useState('12')
  const [apy, setApy] = useState('0')

  const result = useMemo(
    () => calculateSavingsGoal(target, saved, months, apy),
    [target, saved, months, apy]
  )

  const exportCSV = () => {
    if (!result.valid || result.goal <= 0) return
    const lines = ['Month,Simple Monthly Deposit,Running Balance (No Interest)']
    for (let i = 1; i <= result.months; i++) {
      const running = Math.min(result.goal, result.existing + result.monthlySimple * i)
      lines.push([i, result.monthlySimple.toFixed(2), running.toFixed(2)].join(','))
    }
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'budgetloom-savings-goal.csv'
    link.click()
    trackEvent('savings_schedule_exported')
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <section className="calculator" aria-label="Savings goal calculator" style={{ display: 'block' }}>
      <div
        className="calculator-fields"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}
      >
        {[
          { id: 'target', label: 'Target savings goal ($)', value: target, set: setTarget, min: '0.01', step: '0.01' },
          { id: 'saved', label: 'Already saved ($)', value: saved, set: setSaved, min: '0', step: '0.01' },
          { id: 'months', label: 'Timeline (months, 1–600)', value: months, set: setMonths, min: '1', max: '600', step: '1' },
          { id: 'apy', label: 'Optional account APY (%)', value: apy, set: setApy, min: '0', max: '25', step: '0.1' },
        ].map((field) => (
          <label key={field.id} htmlFor={field.id}>
            <span>{field.label}</span>
            <div className="money-input">
              <input
                id={field.id}
                type="number"
                min={field.min}
                max={field.max}
                step={field.step}
                inputMode="decimal"
                value={field.value}
                onChange={(e) => field.set(e.target.value)}
              />
            </div>
          </label>
        ))}
      </div>

      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">Your savings plan</p>
        <div className="result-total">
          <span>Required monthly deposit (direct contributions)</span>
          <strong>{result.valid ? money.format(result.monthlySimple) : result.error || 'Enter valid inputs'}</strong>
        </div>
        <dl>
          <div>
            <dt>Target savings goal</dt>
            <dd>{money.format(result.goal)}</dd>
          </div>
          <div>
            <dt>Already saved</dt>
            <dd>{money.format(result.existing)}</dd>
          </div>
          <div>
            <dt>Remaining amount needed</dt>
            <dd>{money.format(result.remaining)}</dd>
          </div>
          <div>
            <dt>Per biweekly paycheck (26 checks/yr)</dt>
            <dd>{result.valid ? money.format((result.monthlySimple * 12) / 26) : '$0.00'}</dd>
          </div>
          {Number(apy) > 0 && result.valid && (
            <div>
              <dt>Estimated deposit with {apy}% APY</dt>
              <dd>
                {money.format(result.monthlyWithInterest)}/mo (~{money.format(result.projectedInterestEarned)} est. interest)
              </dd>
            </div>
          )}
        </dl>
        <div
          role="progressbar"
          aria-label="Goal progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={result.progressPercent}
          style={{ height: 12, borderRadius: 10, background: '#d1fae5', overflow: 'hidden', marginTop: 12 }}
        >
          <div style={{ height: '100%', background: '#059669', width: result.progressPercent + '%' }} />
        </div>
        <p className="calculator-note">
          Direct contribution figures exclude interest so your plan does not depend on variable bank yields. Optional APY projections are illustrative before taxes or account fees.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={exportCSV}
          disabled={!result.valid || result.goal <= 0}
        >
          Download savings schedule (CSV)
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
          Print
        </button>
      </div>
    </section>
  )
}
