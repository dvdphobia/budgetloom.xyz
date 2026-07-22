'use client'

import { useMemo, useState } from 'react'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export default function BudgetCalculator() {
  const [income, setIncome] = useState('4000')
  const [needs, setNeeds] = useState('2000')
  const [wants, setWants] = useState('1000')
  const [savings, setSavings] = useState('1000')

  const result = useMemo(() => {
    const values = [income, needs, wants, savings].map(value => Math.max(0, Number(value) || 0))
    const [monthlyIncome, needsTotal, wantsTotal, savingsTotal] = values
    const planned = needsTotal + wantsTotal + savingsTotal
    return { monthlyIncome, needsTotal, wantsTotal, savingsTotal, planned, remaining: monthlyIncome - planned }
  }, [income, needs, wants, savings])

  const percent = (value: number) => result.monthlyIncome ? Math.round((value / result.monthlyIncome) * 100) : 0

  return (
    <div className="calculator" aria-label="Monthly budget calculator">
      <div className="calculator-fields">
        <MoneyField id="income" label="Monthly take-home income" value={income} onChange={setIncome} />
        <MoneyField id="needs" label="Needs (housing, food, bills)" value={needs} onChange={setNeeds} />
        <MoneyField id="wants" label="Wants (fun and extras)" value={wants} onChange={setWants} />
        <MoneyField id="savings" label="Savings and debt payments" value={savings} onChange={setSavings} />
      </div>
      <div className="calculator-results" aria-live="polite">
        <p className="eyebrow">Your monthly plan</p>
        <div className="result-total"><span>Money left</span><strong className={result.remaining < 0 ? 'negative' : ''}>{money.format(result.remaining)}</strong></div>
        <dl>
          <div><dt>Needs</dt><dd>{money.format(result.needsTotal)} <small>{percent(result.needsTotal)}%</small></dd></div>
          <div><dt>Wants</dt><dd>{money.format(result.wantsTotal)} <small>{percent(result.wantsTotal)}%</small></dd></div>
          <div><dt>Savings/debt</dt><dd>{money.format(result.savingsTotal)} <small>{percent(result.savingsTotal)}%</small></dd></div>
          <div><dt>Total planned</dt><dd>{money.format(result.planned)}</dd></div>
        </dl>
        <p className="calculator-note">The 50/30/20 percentages are a starting point, not a pass-or-fail rule. Adjust them for your real costs and priorities.</p>
      </div>
    </div>
  )
}

function MoneyField({ id, label, value, onChange }: { id: string, label: string, value: string, onChange: (value: string) => void }) {
  return <label htmlFor={id}><span>{label}</span><div className="money-input"><span aria-hidden="true">$</span><input id={id} type="number" min="0" step="50" inputMode="decimal" value={value} onChange={event => onChange(event.target.value)} /></div></label>
}
