'use client'
import { useMemo, useState } from 'react'
import { trackEvent } from '@/lib/analytics'

function schedule(target: number) {
  const cents = Math.round(target * 100)
  const weights = Array.from({length:30},(_,i) => 3 + (i*7)%15)
  const total = weights.reduce((a,b)=>a+b,0)
  const values = weights.map(weight=>Math.floor(cents*weight/total))
  let extra = cents - values.reduce((a,b)=>a+b,0)
  for (let i=0; i<extra; i++) values[i%30]++
  let running = 0
  return values.map((value,i)=>{ running+=value; return { day:i+1,amount:value/100,progress:running/100 } })
}
export default function SavingsChallengeBuilder() {
  const [goal,setGoal]=useState('500')
  const parsed=Number(goal)
  const valid=Number.isFinite(parsed) && parsed>0 && parsed<=1000000
  const rows=useMemo(()=>valid?schedule(parsed):[],[parsed,valid])
  const total=rows.reduce((sum,row)=>sum+row.amount,0)
  function download() {
    if (!valid) return
    const lines=['Day,Contribution,Total saved',...rows.map(row=>[row.day,row.amount.toFixed(2),row.progress.toFixed(2)].join(','))]
    const url=URL.createObjectURL(new Blob([lines.join('\r\n')],{type:'text/csv;charset=utf-8'}))
    const a=document.createElement('a');a.href=url;a.download='budgetloom-30-day-savings-challenge.csv';a.click()
    trackEvent('challenge_schedule_exported')
    window.setTimeout(()=>URL.revokeObjectURL(url),1000)
  }
  return <section aria-label="30-day savings challenge generator">
    <div className="calculator-fields"><label htmlFor="challenge-goal"><span>Savings goal for 30 days ($)</span>
      <div className="money-input"><input id="challenge-goal" type="number" min="0.01" max="1000000"
        step="0.01" inputMode="decimal" value={goal} onChange={e=>setGoal(e.target.value)} /></div></label></div>
    {valid ? <>
      <p style={{margin:'1.25rem 0'}}><strong>Goal: {'$'+parsed.toFixed(2)}</strong> — 30 deposits totaling {'$'+total.toFixed(2)}.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>
        {rows.map(row => <div key={row.day} style={{padding:12,border:'1px solid #d7e5df',borderRadius:8,display:'flex',justifyContent:'space-between',gap:8}}>
          <span>Day {row.day}</span><strong>{'$'+row.amount.toFixed(2)}</strong>
        </div>)}
      </div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:16}}>
        <button type="button" className="btn btn-primary" onClick={download}>Download schedule (CSV)</button>
        <button type="button" className="btn btn-ghost" onClick={()=>window.print()}>Print</button>
      </div>
    </> : <p role="alert">Enter a positive target of up to $1,000,000.</p>}
    <p style={{fontSize:14,marginTop:16}}>This is a voluntary, adjustable challenge. Make sure essential bills are covered first. Deposits are rounded to cents and sum to your target exactly.</p>
  </section>
}
