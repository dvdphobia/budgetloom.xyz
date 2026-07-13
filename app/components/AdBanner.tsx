'use client'

import { monetization } from '@/lib/config'

export default function AdBanner({ slot }: { slot: 'adsterra' | 'adskeeper' }) {
  const label = slot === 'adsterra'
    ? `Adsterra — ${monetization.adsterraNativeKey}`
    : `AdsKeeper — ${monetization.adskeeperWidgetId}`

  return (
    <div className="ad-slot">
      Advertisement — {label}
    </div>
  )
}