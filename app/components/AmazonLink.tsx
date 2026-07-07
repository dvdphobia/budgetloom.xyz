'use client'

import { monetization } from '@/lib/config'

export default function AmazonLink({ asin, children }: { asin: string, children: React.ReactNode }) {
  const tag = monetization.amazonTrackingId
  const href = `https://www.amazon.com/dp/${asin}/?tag=${tag}`
  return (
    <a href={href} target="_blank" rel="nofollow sponsored noopener" style={{fontWeight:700, color:'#10b981'}}>
      {children}
    </a>
  )
}

export function AffiliateDisclaimer() {
  return (
    <p style={{fontSize:'0.85rem', color:'var(--gray)', borderLeft:'3px solid var(--green)', paddingLeft:'0.8rem', margin:'1.5rem 0'}}>
      This post contains affiliate links. If you buy something through these links, we may earn a small commission at no extra cost to you.
    </p>
  )
}
