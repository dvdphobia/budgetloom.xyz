'use client'

import { useState, useEffect } from 'react'

export default function AdsManager() {
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/ads').then(r => r.json()).then(d => { setAds(d.ads || []); setLoading(false) })
  }, [])

  function updateAd(id: number, field: string, value: any) {
    setAds(ads.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  async function save(id: number) {
    const ad = ads.find(a => a.id === id)
    if (!ad) return
    const res = await fetch('/api/admin/ads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ad_code: ad.ad_code, enabled: ad.enabled }) })
    if (res.ok) { setSaved(id); setTimeout(() => setSaved(null), 2000) }
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Loading...</p>

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0c1a1e', marginBottom: 4 }}>Ad Management</h2>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Paste ad codes from Adsterra, AdsKeeper, Google AdSense, or any ad network. Toggle ads on/off per placement.</p>

      <div style={{ display: 'grid', gap: 16 }}>
        {ads.map(ad => (
          <div key={ad.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#0c1a1e' }}>{ad.label}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>{ad.placement}</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={ad.enabled || false} onChange={e => updateAd(ad.id, 'enabled', e.target.checked)} style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: ad.enabled ? '#059669' : '#9ca3af' }}>{ad.enabled ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>
            <textarea
              value={ad.ad_code || ''}
              onChange={e => updateAd(ad.id, 'ad_code', e.target.value)}
              placeholder="Paste ad code here..."
              style={{ width: '100%', minHeight: 80, padding: 12, fontSize: 13, fontFamily: 'monospace', border: '1px solid #d1d5db', borderRadius: 8, outline: 'none', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
              <button onClick={() => save(ad.id)} style={{ padding: '8px 20px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#059669', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Save</button>
              {saved === ad.id && <span style={{ fontSize: 13, color: '#059669' }}>Saved!</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}