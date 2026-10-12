'use client'

import { useEffect, useMemo, useState } from 'react'

type Category = 'Needs' | 'Wants' | 'Savings & Debt'
type Item = { id: string; name: string; category: Category; planned: string; actual: string }
const initialItems: Item[] = [
  { id: 'rent', name: 'Housing', category: 'Needs', planned: '1200', actual: '' },
  { id: 'utilities', name: 'Utilities', category: 'Needs', planned: '200', actual: '' },
  { id: 'food', name: 'Groceries', category: 'Needs', planned: '400', actual: '' },
  { id: 'transport', name: 'Transportation', category: 'Needs', planned: '200', actual: '' },
  { id: 'fun', name: 'Entertainment', category: 'Wants', planned: '300', actual: '' },
  { id: 'personal', name: 'Personal spending', category: 'Wants', planned: '300', actual: '' },
  { id: 'emergency', name: 'Emergency savings', category: 'Savings & Debt', planned: '500', actual: '' },
  { id: 'debt', name: 'Extra debt payments', category: 'Savings & Debt', planned: '300', actual: '' },
]
const groups: Category[] = ['Needs', 'Wants', 'Savings & Debt']
const STORAGE_KEY = 'budgetloom-monthly-plan-v2'
const parseMoney = (n: string) => Number.isFinite(Number(n)) ? Math.max(0, Number(n)) : 0
const csvCell = (v: string) => {
  const safe = /^[=+@\-\t\r]/.test(v) ? "'" + v : v
  return '"' + safe.replaceAll('"', '""') + '"'
}

export default function BudgetCalculator() {
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
          if (typeof data.currency === 'string' && ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(data.currency)) setCurrency(data.currency)
          if (Array.isArray(data.items)) {
            const valid = data.items.filter((v): v is Item =>
              v && typeof v.id === 'string' && typeof v.name === 'string' &&
              typeof v.planned === 'string' && typeof v.actual === 'string' && groups.includes(v.category))
            if (valid.length && valid.length <= 100) setItems(valid)
          }
        }
      }
    } catch { /* Storage may be restricted or unavailable */ }
  }, [])

  const totals = useMemo(() => {
    const planned = items.reduce((sum, item) => sum + parseMoney(item.planned), 0)
    const actual = items.reduce((sum, item) => sum + parseMoney(item.actual), 0)
    const takeHome = parseMoney(income)
    return {
      planned, actual, takeHome,
      remaining: takeHome - planned, actualRemaining: takeHome - actual,
    }
  }, [items, income])

  const money = useMemo(() => new Intl.NumberFormat('en-US', {
    style: 'currency', currency, maximumFractionDigits: 2,
  }), [currency])

  const groupTotal = (category: Category, field: 'planned' | 'actual') =>
    items.filter(item => item.category === category)
      .reduce((sum, item) => sum + parseMoney(item[field]), 0)

  const modify = (id: string, field: 'planned' | 'actual', value: string) => {
    setItems(current => current.map(item => item.id === id ? { ...item, [field]: value } : item))
    setNotice('')
  }

  const addCategory = () => {
    const name = newName.trim().slice(0, 60)
    if (!name || items.length >= 100) return
    setItems(current => [...current, {
      id: 'item-' + Date.now() + '-' + current.length,
      name, category: newCategory, planned: '0', actual: '',
    }])
    setNewName('')
  }

  const saveLocal = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ income, currency, items }))
      setNotice('Saved on this device only. BudgetLoom does not receive your budget.')
    } catch { setNotice('Browser storage is unavailable; export a CSV instead.') }
  }

  const exportCsv = () => {
    const rows = [
      ['BudgetLoom Monthly Budget', '', '', ''],
      ['Income', income, '', currency],
      ['Category', 'Group', 'Planned', 'Actual'],
      ...items.map(item => [item.name, item.category, item.planned, item.actual]),
      ['TOTAL', '', String(totals.planned), String(totals.actual)],
      ['REMAINING', '', String(totals.remaining), String(totals.actualRemaining)],
    ]
    const data = rows.map(row => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([data], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'budgetloom-monthly-budget.csv'
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('CSV downloaded.')
  }

  return (
    <section aria-label="Monthly budget builder" className="calculator" style={{ display: 'block' }}>
      <div className="calculator-fields" style={{ marginBottom: '1rem' }}>
        <label htmlFor="budget-income">
          <span>Monthly take-home income</span>
          <div className="money-input">
            <span aria-hidden="true">{currency}</span>
            <input id="budget-income" type="number" inputMode="decimal" min="0" step="0.01"
              value={income} onChange={event => setIncome(event.target.value)} />
          </div>
        </label>
        <label htmlFor="budget-currency">
          <span>Currency</span>
          <select id="budget-currency" value={currency} onChange={event => setCurrency(event.target.value)}
            style={{ width: '100%', minHeight: 44, border: '1px solid #cfdad7', borderRadius: 8, padding: '0 12px' }}>
            {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>

      <div style={{ padding: '1rem 0' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>Your budget categories</h2>
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          Enter what you plan to spend. Add actual spending later to compare. Savings and debt payments count as allocations.
        </p>
        {groups.map(group => (
          <div key={group} style={{ margin: '1.5rem 0' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.7rem' }}>{group}</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                <thead><tr style={{ textAlign: 'left' }}>
                  <th scope="col" style={{ padding: 8 }}>Expense</th>
                  <th scope="col" style={{ padding: 8 }}>Planned</th>
                  <th scope="col" style={{ padding: 8 }}>Actual</th>
                  <th scope="col" style={{ padding: 8 }}> </th>
                </tr></thead>
                <tbody>
                  {items.filter(item => item.category === group).map(item => (
                    <tr key={item.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <th scope="row" style={{ textAlign: 'left', padding: 8, fontWeight: 500 }}>{item.name}</th>
                      {(['planned', 'actual'] as const).map(field => (
                        <td key={field} style={{ padding: 8 }}>
                          <input aria-label={item.name + ' ' + field} type="number" inputMode="decimal"
                            min="0" step="0.01" value={item[field]}
                            onChange={event => modify(item.id, field, event.target.value)}
                            style={{ width: '100%', maxWidth: 130, padding: 9, borderRadius: 7, border: '1px solid #cfdad7' }} />
                        </td>
                      ))}
                      <td style={{ padding: 8 }}>
                        <button type="button" aria-label={'Remove ' + item.name}
                          onClick={() => setItems(current => current.filter(entry => entry.id !== item.id))}
                          style={{ padding: '6px 10px', cursor: 'pointer' }}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr style={{ borderTop: '1px solid #d1d5db', fontWeight: 700 }}>
                  <th scope="row" style={{ padding: 8, textAlign: 'left' }}>Subtotal</th>
                  <td style={{ padding: 8 }}>{money.format(groupTotal(group, 'planned'))}</td>
                  <td style={{ padding: 8 }}>{money.format(groupTotal(group, 'actual'))}</td><td />
                </tr></tfoot>
              </table>
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'end', margin: '1rem 0' }}>
          <label style={{ flex: '2 1 200px' }}>New category
            <input value={newName} maxLength={60} placeholder="e.g. Pet care"
              onChange={event => setNewName(event.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #cfdad7', borderRadius: 8 }} />
          </label>
          <label style={{ flex: '1 1 160px' }}>Group
            <select value={newCategory} onChange={event => setNewCategory(event.target.value as Category)}
              style={{ width: '100%', padding: 10, border: '1px solid #cfdad7', borderRadius: 8 }}>
              {groups.map(group => <option key={group}>{group}</option>)}
            </select>
          </label>
          <button type="button" onClick={addCategory} className="btn btn-ghost">Add category</button>
        </div>
      </div>

      <div className="calculator-results" aria-live="polite" aria-atomic="true">
        <p className="eyebrow">Your monthly plan</p>
        <div className="result-total"><span>Planned money left</span>
          <strong className={totals.remaining < 0 ? 'negative' : ''}>{money.format(totals.remaining)}</strong>
        </div>
        <dl>
          <div><dt>Monthly income</dt><dd>{money.format(totals.takeHome)}</dd></div>
          <div><dt>Total planned allocations</dt><dd>{money.format(totals.planned)}</dd></div>
          <div><dt>Actual recorded spending</dt><dd>{money.format(totals.actual)}</dd></div>
          <div><dt>Actual unallocated balance</dt><dd>{money.format(totals.actualRemaining)}</dd></div>
        </dl>
        {totals.remaining < 0 && <p role="status" className="calculator-note">
          Your planned allocations exceed take-home income. Adjust categories to avoid relying on money you do not have.
        </p>}
        <p className="calculator-note">Percent-based rules are optional starting points. Prioritize your actual obligations and financial circumstances.</p>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
        <button type="button" className="btn btn-primary" onClick={saveLocal}>Save on this device</button>
        <button type="button" className="btn btn-ghost" onClick={exportCsv}>Download CSV</button>
        <button type="button" className="btn btn-ghost" onClick={() => window.print()}>Print</button>
        <button type="button" className="btn btn-ghost" onClick={() => {
          setIncome('4000'); setItems(initialItems); setCurrency('USD')
          try { window.localStorage.removeItem(STORAGE_KEY) } catch {}
          setNotice('Plan reset and local saved copy removed.')
        }}>Reset</button>
      </div>
      {notice && <p role="status" style={{ marginTop: 10, fontSize: '0.9rem' }}>{notice}</p>}
      <p style={{ fontSize: '0.85rem', marginTop: 16 }}>
        This calculator runs in your browser. Saving is optional and local to this device. Avoid sharing exported budgets if they contain sensitive information.
      </p>
    </section>
  )
}
