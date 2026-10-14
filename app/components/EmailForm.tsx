'use client'

import { useId, useState } from 'react'
import { Icon } from './Icons'
import { trackEvent } from '@/lib/analytics'

export default function EmailForm({
  cta = 'Get the free printable',
  tag = 'budget tips',
}: {
  cta?: string
  tag?: string
}) {
  const inputId = useId()
  const honeypotId = useId()
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = email.trim()
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
      setStatus('error')
      setMessage('Please enter a valid email address.')
      return
    }

    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, tag, company_website: honeypot }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
        return
      }
      trackEvent('newsletter_signup', { signup_tag: tag })
      setStatus('ok')
      setMessage(data.message || 'You are on the list! All printables are ready for instant download.')
      setEmail('')
    } catch {
      setStatus('error')
      setMessage('Network error. You can still download all printables directly without signing up.')
    }
  }

  return (
    <div>
      <form onSubmit={submit} className="email-form" noValidate>
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
          <label htmlFor={honeypotId}>Website</label>
          <input
            id={honeypotId}
            type="text"
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Saving...' : cta}
        </button>
      </form>
      {status === 'ok' && (
        <p
          role="status"
          style={{
            width: '100%',
            margin: '0.65rem 0 0',
            color: 'var(--green-dark)',
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            justifyContent: 'center',
          }}
        >
          <Icon.check className="" /> {message}
        </p>
      )}
      {status === 'error' && (
        <p
          role="alert"
          style={{
            width: '100%',
            margin: '0.65rem 0 0',
            color: '#b91c1c',
            fontWeight: 500,
            fontSize: '0.9rem',
          }}
        >
          {message}
        </p>
      )}
    </div>
  )
}