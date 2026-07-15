'use client'

import { useEffect, useRef } from 'react'

// Hardcoded ad codes — works without database
// Managed via CMS once DB is connected, but these ensure ads show immediately

const NATIVE_BANNER = `<script async="async" data-cfasync="false" src="https://pl30367165.effectivecpmnetwork.com/3e2687892d1d43c8539f6524b4567ffc/invoke.js"></script><div id="container-3e2687892d1d43c8539f6524b4567ffc"></div>`

const POPUNDER = `<script src="https://pl30367166.effectivecpmnetwork.com/16/8f/3e/168f3e03e4f71a06d7a81835149eafed.js"></script>`

const SOCIAL_BAR = `<script src="https://pl30367167.effectivecpmnetwork.com/e7/21/7f/e7217f6a3487bff983f5a28ab3a4a38c.js"></script>`

function injectCode(code: string, target: HTMLElement) {
  const container = document.createElement('div')
  container.innerHTML = code
  Array.from(container.childNodes).forEach(node => {
    if (node.nodeName === 'SCRIPT') {
      const oldScript = node as HTMLScriptElement
      const newScript = document.createElement('script')
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value)
      })
      if (oldScript.src) {
        newScript.src = oldScript.src
      } else {
        newScript.textContent = oldScript.textContent
      }
      newScript.async = true
      target.appendChild(newScript)
    } else {
      target.appendChild(node.cloneNode(true))
    }
  })
}

// In-page ad slot (native banner)
export function AdSlotInline({ placement }: { placement: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    // Only inject once
    if (ref.current.dataset.loaded) return
    ref.current.dataset.loaded = 'true'
    injectCode(NATIVE_BANNER, ref.current)
  }, [])

  return (
    <div
      ref={ref}
      data-placement={placement}
      style={{ width: '100%', margin: '20px 0', textAlign: 'center', overflow: 'hidden', minHeight: '50px' }}
    />
  )
}

// Site-wide ads (popunder + social bar) — load once per page
export default function SiteWideAds() {
  useEffect(() => {
    // Check if already loaded
    if (document.getElementById('adsterra-popunder')) return

    // Popunder
    const popDiv = document.createElement('div')
    popDiv.id = 'adsterra-popunder'
    popDiv.style.display = 'none'
    document.body.appendChild(popDiv)
    injectCode(POPUNDER, popDiv)

    // Social Bar
    const socialDiv = document.createElement('div')
    socialDiv.id = 'adsterra-socialbar'
    socialDiv.style.display = 'none'
    document.body.appendChild(socialDiv)
    injectCode(SOCIAL_BAR, socialDiv)
  }, [])

  return null
}