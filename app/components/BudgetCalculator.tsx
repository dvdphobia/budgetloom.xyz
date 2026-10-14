'use client'

import { useEffect, useMemo, useState } from 'react'
import { trackEvent } from '@/lib/analytics'
import { calculateMonthlyBudget, toCents, fromCents, type BudgetLineItem } from '@/lib/calculators'

type Category = 'Needs' | 'Wants' | 'Savings & Debt'
type Item = { id: string; name: string; category: Category; planned: string; actual: string }

const initialItems: Item[] = [
  { id: 'rent', name: 'Housing (Rent / Mortgage)', category: 'Needs', planned: '1200', actual: '' },
  { id: 'utilities', name: 'Utilities & Internet', category: 'Needs', planned: '200', actual: '' },
  { id: 'food', name: 'Supermarket Groceries', category: 'Needs', planned: '400', actual: '' },
  { id: 'transport', name: 'Transportation & Fuel', category: 'Needs', planned: '200', actual: '' },
  { id: 'fun', name: 'Dining Out & Entertainment', category: 'Wants', planned: '300', actual: '' },
  { id: 'personal', name: 'Personal & Household Wants', category: 'Wants', planned: '300', actual: '' },
  { id: 'emergency', name: 'Emergency & Sinking Funds', category: 'Savings & Debt', planned: '500', actual: '' },
  { id: 'debt', name: 'Extra Debt Payments', category: 'Savings & Debt', planned: '300', actual: '' },
]

const groups: Category[] = ['Needs', 'Wants', 'Savings & Debt']
const STORAGE_KEY = 'budgetloom-monthly-plan-v2'

const csvCell = (v: string) => {
  const safe = /^[=+@\-\t\r]/.test(v) ? "'" + v : v
  return '"' + safe.replaceAll('"', '""') + '"'
}

export default function BudgetCalculator({ zeroBasedMode = false }: { zeroBasedMode?: boolean }) {
  const [income, setIncome] = useState('4000')
  const [currency, setCurrency] = useState('USD')
  const [items, setItems] = useState<Item[]>(initialItems)
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState<Category>('Needs')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const saved: unknown = JSON.parse(stored)
        if (saved && typeof saved === 'object') {
          const data = saved as { income?: unknown; currency?: unknown; items?: unknown }
          if (typeof data.income === 'string') setIncome(data.income)
          if (typeof data.currency === 'string' && ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(data.currency)) {
            setCurrency(data.currency)
          }
          if (Array.isArray(data.items)) {
            const valid = data.items.filter(
              (v): v is Item =>
                Boolean(
                  v &&
                    typeof v.id === 'string' &&
                    typeof v.name === 'string' &&
                    typeof v.planned === 'string' &&
                    typeof v.actual === 'string' &&
                    groups.includes(v.category)
                )
            )
            if (valid.length && valid.length <= 100) setItems(valid)
          }
        }
      }
    } catch {
      /* Storage may be restricted or unavailable */
    }
  }, [])

  const totals = useMemo(() => {
    const calc = calculateMonthlyBudget(income, items as BudgetLineItem[])
    return {
      planned: calc.planned,
      actual: calc.actual,
      takeHome: calc.takeHome,
      remaining: calc.remainingPlanned,
      actualRemaining: calc.remainingActual,
      isZeroBasedBalanced: calc.isZeroBasedBalanced,
      groupShares: calc.groupShares,
    }
  }, [items, income])

  const money = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }),
    [currency]
  )

  const groupTotal = (category: Category, field: 'planned' | 'actual') =>
    fromCents(
      items
        .filter((item) => item.category === category)
        .reduce((sumCents, item) => sumCents + toCents(item[field]), 0)
    )

  const modify = (id: string, field: 'planned' | 'actual', value: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
    setNotice('')
  }

  const addCategory = () => {
    const name = newName.trim().slice(0, 60)
    if (!name || items.length >= 100) return
    setItems((current) => [
      ...current,
      {
        id: 'item-' + Date.now() + '-' + current.length,
        name,
        category: newCategory,
        planned: '0',
        actual: '',
      },
    ])
    setNewName('')
  }

  const balanceToZero = () => {
    if (totals.remaining <= 0) return
    const remStr = totals.remaining.toFixed(2)
    setItems((current) => [
      ...current,
      {
        id: 'buffer-' + Date.now(),
        name: 'Unassigned -> Checking Buffer / Goal',
        category: 'Savings & Debt',
        planned: remStr,
        actual: '',
      },
    ])
    setNotice(`Assigned remaining ${money.format(totals.remaining)} so Income Minus Outgo = $0.00.`)
  }

  const saveLocal = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ income, currency, items }))
      trackEvent('budget_saved_locally')
      setNotice('Saved on this device only. BudgetLoom never transmits your budget to a server.')
    } catch {
      setNotice('Browser storage is unavailable; export a CSV instead.')
    }
  }

  const exportCsv = () => {
    const rows = [
      ['BudgetLoom Monthly Budget', '', '', ''],
      ['Income', income, '', currency],
      ['Category', 'Group', 'Planned', 'Actual'],
      ...items.map((item) => [item.name, item.category, item.planned, item.actual]),
      ['TOTAL', '', totals.planned.toFixed(2), totals.actual.toFixed(2)],
      ['REMAINING', '', totals.remaining.toFixed(2), totals.actualRemaining.toFixed(2)],
    ]
    const data = rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([data], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = zeroBasedMode ? 'budgetloom-zero-based-budget.csv' : 'budgetloom-monthly-budget.csv'
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    trackEvent('budget_exported')
    setNotice('CSV downloaded.')
  }

  return (
    <section
      aria-label={zeroBasedMode ? 'Zero-based budget builder' : 'Monthly budget builder'}
      className="calculator"
      style={{ display: 'block' }}
    >
      <div className="calculator-fields" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <label htmlFor="budget-income">
            <span>Monthly take-home income (after tax)</span>
            <div className="money-input">
              <span aria-hidden="true">{currency}</span>
              <input
                id="budget-income"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={income}
                onChange={(event) => setIncome(event.target.value)}
              />
            </div>
          </label>
          <label htmlFor="budget-currency">
            <span>Currency</span>
            <select
              id="budget-currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              style={{
                width: '100%',
                minHeight: 44,
                border: '1px solid #cfdad7',
                borderRadius: 10,
                padding: '0 12px',
                background: 'white',
              }}
            >
              {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {zeroBasedMode && (
        <div
          role="status"
          style={{
            padding: '0.9rem 1.1rem',
            borderRadius: 12,
            marginBottom: '1rem',
            background: totals.isZeroBasedBalanced ? '#ecfdf5' : totals.remaining > 0 ? '#fef3c7' : '#fee2e2',
            border: `1px solid ${totals.isZeroBasedBalanced ? '#059669' : totals.remaining > 0 ? '#d97706' : '#dc2626'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <strong style={{ color: '#0c1a1e' }}>
              {totals.isZeroBasedBalanced
                ? 'Zero-Based Target Reached: Every dollar has a job ($0.00 unassigned).'
                : totals.remaining > 0
                ? `${money.format(totals.remaining)} still needs a job to reach $0.00.`
                : `Over-allocated by ${money.format(Math.abs(totals.remaining))}. Reduce planned categories.`}
            </strong>
          </div>
          {totals.remaining > 0 && (
            <button type="button" className="btn btn-primary btn-sm" onClick={balanceToZero}>
              Assign {money.format(totals.remaining)} to Buffer/Savings
            </button>
          )}
        </div>
      )}

      <div style={{ padding: '0.5rem 0 1rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>Your budget categories</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray)', marginBottom: '1rem' }}>
          Enter planned amounts before the month begins. Add actual spending during weekly check-ins to compare.
        </p>
        {groups.map((group) => (
          <div key={group} style={{ margin: '1.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.6rem' }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>{group}</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--gray)' }}>
                {group === 'Needs'
                  ? `${totals.groupShares.needsPct}% of income`
                  : group === 'Wants'
                  ? `${totals.groupShares.wantsPct}% of income`
                  : `${totals.groupShares.savingsPct}% of income`}
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th scope="col" style={{ padding: 8 }}>
                      Expense
                    </th>
                    <th scope="col" style={{ padding: 8 }}>
                      Planned
                    </th>
                    <th scope="col" style={{ padding: 8 }}>
                      Actual
                    </th>
                    <th scope="col" style={{ padding: 8 }}>
                      {' '}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter((item) => item.category === group)
                    .map((item) => (
                      <tr key={item.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <th scope="row" style={{ textAlign: 'left', padding: 8, fontWeight: 500 }}>
                          {item.name}
                        </th>
                        {(['planned', 'actual'] as const).map((field) => (
                          <td key={field} style={{ padding: 8 }}>
                            <input
                              aria-label={item.name + ' ' + field}
                              type="number"
                              inputMode="decimal"
                              min="0"
                              step="0.01"
                              value={item[field]}
                              onChange={(event) => modify(item.id, field, event.target.value)}
                              style={{
                                width: '100%',
                                maxWidth: 130,
                                padding: 9,
                                borderRadius: 7,
                                border: '1px solid #cfdad7',
                              }}
                            />
                          </td>
                        ))}
                        <td style={{ padding: 8 }}>
                          <button
                            type="button"
                            aria-label={'Remove ' + item.name}
                            onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}
                            style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '0.82rem' }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '1px solid #d1d5db', fontWeight: 700 }}>
                    <th scope="row" style={{ padding: 8, textAlign: 'left' }}>
                      Subtotal
                    </th>
                    <td style={{ padding: 8 }}>{money.format(groupTotal(group, 'planned'))}</td>
                    <td style={{ padding: 8 }}>{money.format(groupTotal(group, 'actual'))}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'end', margin: '1rem 0' }}>
          <label style={{ flex: '2 1 200px', fontSize: '0.85rem', fontWeight: 600 }}>
            New category
            <input
              value={newName}
              maxLength={60}
              placeholder="e.g. Pet care or Car sinking fund"
              onChange={(event) => setNewName(event.target.value)}
              style={{ width: '100%', padding: 10, border: '1px solid #cfdad7', borderRadius: 8, marginTop: 4 }}
            />
          </label>
          <label style={{ flex: '1 1 160px', fontSize: '0.85rem', fontWeight: 600 }}>
            Group
            <select
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value as Category)}
              style={{ width: '100%', padding: 10, border: '1px solid #cfdad7', borderRadius: 8, marginTop: 4, background: 'white' }}
            >
              {groups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={addCategory} className="btn btn-ghost">
            Add category
          </button>
        </div>
      </div>

      <div className="calculator-results" aria-live="polite" aria-atomic="true">
        <p className="eyebrow">{zeroBasedMode ? 'Zero-based balance check' : 'Your monthly plan'}</p>
        <div className="result-total">
          <span>{zeroBasedMode ? 'Unassigned money (Target $0.00)' : 'Planned money left'}</span>
          <strong className={totals.remaining < 0 ? 'negative' : ''}>{money.format(totals.remaining)}</strong>
        </div>
        <dl>
          <div>
            <dt>Monthly take-home income</dt>
            <dd>{money.format(totals.takeHome)}</dd>
          </div>
          <div>
            <dt>Total planned allocations</dt>
            <dd>{money.format(totals.planned)}</dd>
          </div>
          <div>
            <dt>Needs / Wants / Savings split</dt>
            <dd>
              {totals.groupShares.needsPct}% / {totals.groupShares.wantsPct}% / {totals.groupShares.savingsPct}%
            </dd>
          </div>
          <div>
            <dt>Actual recorded spending</dt>
            <dd>{money.format(totals.actual)}</dd>
          </div>
          <div>
            <dt>Actual unallocated balance</dt>
            <dd>{money.format(totals.actualRemaining)}</dd>
          </div>
        </dl>
        {totals.remaining < 0 && (
          <p role="status" className="calculator-note" style={{ color: '#fca5a5' }}>
            Your planned allocations exceed take-home income by {money.format(Math.abs(totals.remaining))}. Adjust flexible categories so you do not rely on credit.
          </p>
        )}
        <p className="calculator-note">
          All calculations use exact cent arithmetic. Percent rules are optional starting points—always cover real obligations first.
        </p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
        <button type="button" className="btn btn-primary" onClick={saveLocal}>
          Save on this device
        </button>
        <button type="button" className="btn btn-ghost" onClick={exportCsv}>
          Download CSV
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
          Print
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setIncome('4000')
            setItems(initialItems)
            setCurrency('USD')
            try {
              window.localStorage.removeItem(STORAGE_KEY)
            } catch {}
            setNotice('Plan reset and local saved copy removed.')
          }}
        >
          Reset
        </button>
      </div>
      {notice && (
        <p role="status" style={{ marginTop: 10, fontSize: '0.9rem', fontWeight: 500, color: 'var(--green-dark)' }}>
          {notice}
        </p>
      )}
      <p style={{ fontSize: '0.82rem', color: 'var(--gray)', marginTop: 14 }}>
        Privacy note: This calculator runs 100% in your browser. Saving is optional and local to your device.
      </p>
    </section>
  )
}
