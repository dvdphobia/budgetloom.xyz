'use client'

import { useState } from 'react'
import { Icon } from './Icons'

export default function EmailForm({ cta = "Get the free printable", tag = "budget tips" }: { cta?: string, tag?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setStatus('error')
      setErrorMessage('Please enter a valid email.')
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tag }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setErrorMessage(data.error || 'Something went wrong. Please try again.')
        return
      }
      setStatus('ok')
      setEmail('')
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <>
      <form onSubmit={submit} className="email-form">
        <label htmlFor="email-input" className="sr-only">Email address</label>
        <input
          id="email-input"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Sending...' : cta}
        </button>
      </form>
      {status === 'ok' && (
        <p style={{ width: '100%', margin: '0.5rem 0 0', color: 'var(--green-dark)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
          <Icon.check className="" /> Check your inbox!
        </p>
      )}
      {status === 'error' && (
        <p style={{ width: '100%', margin: '0.5rem 0 0', color: '#dc2626', fontWeight: 500, fontSize: '0.9rem' }}>
          {errorMessage}
        </p>
      )}
    </>
  )
}