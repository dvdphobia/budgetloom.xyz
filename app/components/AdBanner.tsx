'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

// Safe provider integration: never evaluate HTML or arbitrary JavaScript from the CMS.
export default function AdBanner({ client, slot, placement }: {
  client: string
  slot: string
  placement: string
}) {
  const ref = useRef<HTMLModElement>(null)
  useEffect(() => {
    if (!ref.current) return
    let loaded = false
    const loadAd = () => {
      if (loaded || !ref.current) return
      loaded = true
      try {
        window.adsbygoogle = window.adsbygoogle || []
        window.adsbygoogle.push({})
      } catch {
        // Ad blockers and network policy may prevent ad display.
      }
    }
    if (typeof IntersectionObserver === 'undefined') {
      loadAd()
      return
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        loadAd()
        observer.disconnect()
      }
    }, { rootMargin: '180px' })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <aside className="ad-placement" data-placement={placement} aria-label="Advertisement"
      style={{ margin: '2rem 0', textAlign: 'center', minHeight: 250, overflow: 'hidden' }}>
      <div style={{ fontSize: '0.72rem', color: '#667085', marginBottom: 8 }}>ADVERTISEMENT</div>
      <ins ref={ref} className="adsbygoogle" style={{ display: 'block', minHeight: 230 }}
        data-ad-client={client} data-ad-slot={slot}
        data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  )
}
