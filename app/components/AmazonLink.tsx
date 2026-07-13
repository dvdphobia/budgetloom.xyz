'use client'

import { monetization } from '@/lib/config'

export default function AmazonLink({ asin, children }: { asin: string, children: React.ReactNode }) {
  const tag = monetization.amazonTrackingId
  const href = `https://www.amazon.com/dp/${asin}/?tag=${tag}`
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored noopener"
      style={{
        fontWeight: 700,
        color: 'var(--green)',
        borderBottom: '1px dashed var(--green)',
        paddingBottom: '1px',
      }}
    >
      {children}
    </a>
  )
}

export function AffiliateDisclaimer() {
  return (
    <p className="affiliate-disclaimer" role="note">
      This post contains affiliate links. If you buy something through these links, we may earn a small commission at no extra cost to you.
    </p>
  )
}

export function AmazonProductCard({ asin, name, description }: { asin: string, name: string, description: string }) {
  const tag = monetization.amazonTrackingId
  const href = `https://www.amazon.com/dp/${asin}/?tag=${tag}`
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      padding: '1rem 1.2rem', margin: '1.5rem 0', background: 'var(--white)',
      transition: 'all var(--transition)',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '8px',
        background: 'var(--amber-light)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
      }}>📦</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--dark)' }}>{name}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{description}</div>
      </div>
      <a
        href={href}
        target="_blank"
        rel="nofollow sponsored noopener"
        className="btn btn-sm"
        style={{ flexShrink: 0 }}
      >
        Check Price
      </a>
    </div>
  )
}