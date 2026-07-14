'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (res.ok) {
        router.push('/admin/dashboard')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('Network error')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c1a1e' }}>
      <div style={{ width: '100%', maxWidth: 380, padding: 40, background: '#fdfcf7', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0c1a1e', marginBottom: 4 }}>BudgetLoom Admin</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Sign in to manage your site</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 8, outline: 'none' }}
              placeholder="admin"
              required
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 8, outline: 'none' }}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#059669', border: 'none', borderRadius: 8, cursor: loading ? 'wait' : 'pointer' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 20, textAlign: 'center' }}>Default: admin / admin123 — change after first login</p>
      </div>
    </div>
  )
}