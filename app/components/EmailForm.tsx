'use client'

import { useState } from 'react'

export default function EmailForm({ cta = "Get the free printable", tag = "budget tips" }: { cta?: string, tag?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) { setStatus('error'); return }
    // TODO: connect to email provider MailerLite/Beehiiv/ConvertKit via API
    setStatus('ok')
    setEmail('')
  }

  return (
    <form onSubmit={submit} className="email-form">
      <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
      <button type="submit" className="btn">{cta}</button>
      {status === 'ok' && <p style={{width:'100%', margin:0, color:'#059669'}}>Check your inbox for the {tag}!</p>}
      {status === 'error' && <p style={{width:'100%', margin:0, color:'#dc2626'}}>Please enter a valid email.</p>}
    </form>
  )
}
