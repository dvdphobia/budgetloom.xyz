'use client'
import { useMemo, useState } from 'react'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
function dollars(value: string) { return Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0 }

export default function SavingsGoalCalculator() {
  const [target, setTarget] = useState('1200')
  const [saved, setSaved] = useState('300')
  const [months, setMonths] = useState('12')
  const result = useMemo(() => {
    const goal = dollars(target), existing = dollars(saved), duration = Number(months)
    const remaining = Math.max(0, goal - existing)
    const valid = Number.isInteger(duration) && duration >= 1 && duration <= 600
    return { goal, existing, remaining, duration, valid, monthly: valid ? remaining / duration : 0,
      percent: goal > 0 ? Math.min(100, Math.round(existing / goal * 100)) : 0 }
  }, [target,saved,months])
  const exportCSV = () => {
    if (!result.valid || result.goal <= 0) return
    const lines = ['Month,Monthly deposit,Running balance']
    for (let i = 1; i <= result.duration; i++) {
      const running = Math.min(result.goal, result.existing + result.monthly * i)
      lines.push([i,result.monthly.toFixed(2),running.toFixed(2)].join(','))
    }
    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob), link = document.createElement('a')
    link.href = url; link.download = 'budgetloom-savings-goal.csv'; link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <section className="calculator" aria-label="Savings goal calculator" style={{display:'block'}}>
    <div className="calculator-fields">
      {[
        {id:'target',label:'Target savings ($)',value:target,set:setTarget},
        {id:'saved',label:'Already saved ($)',value:saved,set:setSaved},
        {id:'months',label:'Time remaining (months)',value:months,set:setMonths}
      ].map(field => <label key={field.id} htmlFor={field.id}>
        <span>{field.label}</span><div className="money-input">
          <input id={field.id} type="number" min={field.id==='months'?'1':'0'} max={field.id==='months'?'600':undefined}
            step={field.id==='months'?'1':'0.01'} inputMode="decimal" value={field.value}
            onChange={e=>field.set(e.target.value)} />
        </div></label>)}
    </div>
    <div className="calculator-results" aria-live="polite">
      <p className="eyebrow">Your savings plan</p>
      <div className="result-total"><span>Monthly contribution</span>
        <strong>{result.valid ? money.format(result.monthly) : 'Enter 1–600 months'}</strong>
      </div>
      <dl>
        <div><dt>Goal</dt><dd>{money.format(result.goal)}</dd></div>
        <div><dt>Already saved</dt><dd>{money.format(result.existing)}</dd></div>
        <div><dt>Still needed</dt><dd>{money.format(result.remaining)}</dd></div>
      </dl>
      <div role="progressbar" aria-label="Goal progress" aria-valuemin={0} aria-valuemax={100}
        aria-valuenow={result.percent} style={{height:12,borderRadius:10,background:'#d1fae5',overflow:'hidden',marginTop:12}}>
        <div style={{height:'100%',background:'#059669',width:result.percent+'%'}} />
      </div>
      <p className="calculator-note">Illustrative contributions only. This calculation excludes interest, inflation, account fees, and investment returns.</p>
    </div>
    <button type="button" className="btn btn-primary" style={{marginTop:16}} onClick={exportCSV}
      disabled={!result.valid || result.goal<=0}>Download savings schedule (CSV)</button>
  </section>
}
