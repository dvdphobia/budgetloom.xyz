'use client'

import { useState, useEffect } from 'react'
import { Save, Megaphone } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Switch } from '@/app/components/ui/switch'
import { Label } from '@/app/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'

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
    const res = await fetch('/api/admin/ads', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, enabled: ad.enabled }) })
    if (res.ok) { setSaved(id); setTimeout(() => setSaved(null), 2000) }
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Ad Management</h2>
        <p className="text-sm text-muted-foreground">Enable supported placements here. Configure your approved AdSense publisher ID and unique slot IDs in hosting environment variables. Scripts pasted into CMS fields are not executed.</p>
      </div>

      <div className="space-y-4">
        {ads.map(ad => (
          <Card key={ad.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Megaphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{ad.label}</CardTitle>
                    <code className="text-xs text-muted-foreground">{ad.placement}</code>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={ad.enabled ? 'success' : 'secondary'}>
                    {ad.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Switch checked={ad.enabled || false} onCheckedChange={v => updateAd(ad.id, 'enabled', v)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Ad unit identifiers are configured in your hosting environment. Enabling this switch does not create an ad account.
              </p>
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={() => save(ad.id)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                {saved === ad.id && <span className="text-sm text-primary">Saved!</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}