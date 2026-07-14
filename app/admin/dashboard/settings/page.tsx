'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => { setSettings(d.settings || {}); setLoading(false) })
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setSaved(false)
    try {
      await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ settings }) })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch {}
    setSaving(false)
  }

  function update(key: string, value: string) {
    setSettings({ ...settings, [key]: value })
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Loading...</p>

  const fields = [
    { key: 'site_name', label: 'Site Name', type: 'text' },
    { key: 'site_url', label: 'Site URL', type: 'text' },
    { key: 'amazon_tracking_id', label: 'Amazon Affiliate ID', type: 'text', hint: 'Your Amazon Associates tracking ID' },
    { key: 'google_analytics_id', label: 'Google Analytics ID', type: 'text', hint: 'e.g. G-CRZCXM56DQ' },
    { key: 'adsterra_key', label: 'Adsterra Key', type: 'text', hint: 'Adsterra native ad key' },
    { key: 'adskeeper_widget_id', label: 'AdsKeeper Widget ID', type: 'text' },
    { key: 'pinterest_verification', label: 'Pinterest Verification Code', type: 'text', hint: 'For p:domain_verify meta tag' },
  ]

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0c1a1e', marginBottom: 4 }}>Site Settings</h2>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Configure tracking IDs, ad network keys, and site details.</p>

      <form onSubmit={save} style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {fields.map(f => (
          <div key={f.key} style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{f.label}</label>
            <input
              type={f.type}
              value={settings[f.key] || ''}
              onChange={e => update(f.key, e.target.value)}
              style={{ width: '100%', padding: '10px 14px', fontSize: 14, border: '1px solid #d1d5db', borderRadius: 8, outline: 'none' }}
              placeholder={f.hint || ''}
            />
            {f.hint && <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{f.hint}</p>}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="submit" disabled={saving} style={{ padding: '12px 24px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#059669', border: 'none', borderRadius: 8, cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Saving...' : 'Save Settings'}</button>
          {saved && <span style={{ fontSize: 14, color: '#059669' }}>Settings saved!</span>}
        </div>
      </form>
    </div>
  )
}