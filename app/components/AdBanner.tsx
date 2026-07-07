'use client'

import { monetization } from '@/lib/config'

export default function AdBanner({ slot }: { slot: 'adsterra' | 'adskeeper' }) {
  if (slot === 'adsterra') {
    return (
      <div style={{minHeight:90, background:'#f1f5f9', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', margin:'1.5rem 0', color:'#94a3b8', fontSize:'0.85rem'}}>
        Adsterra ad placeholder — key: {monetization.adsterraNativeKey}
      </div>
    )
  }
  return (
    <div style={{minHeight:90, background:'#f1f5f9', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', margin:'1.5rem 0', color:'#94a3b8', fontSize:'0.85rem'}}>
      AdsKeeper widget placeholder — ID: {monetization.adskeeperWidgetId}
    </div>
  )
}
