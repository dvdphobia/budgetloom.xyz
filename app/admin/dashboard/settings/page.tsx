'use client'

import { useState, useEffect } from 'react'
import { Save, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'

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

  if (loading) return <p className="text-muted-foreground">Loading...</p>

  const fields = [
    { key: 'site_name', label: 'Site Name', hint: '' },
    { key: 'site_url', label: 'Site URL', hint: '' },
    { key: 'amazon_tracking_id', label: 'Amazon Affiliate ID', hint: 'Your Amazon Associates tracking ID' },
    { key: 'google_analytics_id', label: 'Google Analytics ID', hint: 'e.g. G-CRZCXM56DQ' },
    { key: 'adsterra_key', label: 'Adsterra Key', hint: 'Adsterra native ad key' },
    { key: 'adskeeper_widget_id', label: 'AdsKeeper Widget ID', hint: '' },
    { key: 'pinterest_verification', label: 'Pinterest Verification Code', hint: 'For p:domain_verify meta tag' },
  ]

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-xl font-bold">Site Settings</h2>
        <p className="text-sm text-muted-foreground">Configure tracking IDs, ad network keys, and site details.</p>
      </div>

      <form onSubmit={save}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><SettingsIcon className="h-5 w-5" />Configuration</CardTitle>
            <CardDescription>These values control affiliate links, analytics, and ad network integration.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map(f => (
              <div key={f.key} className="space-y-2">
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input
                  id={f.key}
                  value={settings[f.key] || ''}
                  onChange={e => update(f.key, e.target.value)}
                  placeholder={f.hint || ''}
                />
                {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
              {saved && <span className="text-sm text-primary">Settings saved!</span>}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}