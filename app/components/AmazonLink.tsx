'use client'

import { monetization } from '@/lib/config'
import { Icon } from './Icons'

export default function AmazonLink({ asin, children }: { asin: string, children: React.ReactNode }) {
  const tag = monetization.amazonTrackingId
  const href = `https://www.amazon.com/dp/${asin}/?tag=${tag}`
  return (
    <a href={href} target="_blank" rel="nofollow sponsored noopener" style={{ fontWeight: 500, color: 'var(--green)', borderBottom: '1px solid var(--green-light)' }}>
      {children}
    </a>
  )
}

export function AffiliateDisclaimer() {
  return (
    <p className="affiliate-note" role="note">
      We may earn a commission from links on this page, at no cost to you.
    </p>
  )
}

export function AmazonProductCard({ asin, name, description }: { asin: string, name: string, description: string }) {
  const tag = monetization.amazonTrackingId
  const href = `https://www.amazon.com/dp/${asin}/?tag=${tag}`
  return (
    <div className="product-card">
      <div className="product-card-icon">
        <Icon.package />
      </div>
      <div className="product-card-info">
        <div className="product-card-name">{name}</div>
        <div className="product-card-desc">{description}</div>
      </div>
      <a href={href} target="_blank" rel="nofollow sponsored noopener" className="btn btn-sm">
        Check Price
      </a>
    </div>
  )
}