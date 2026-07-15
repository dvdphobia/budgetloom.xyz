'use client'

import { useEffect } from 'react'

// Loads site-wide ad scripts (popunder, social bar) from the admin API
export default function SiteWideAds() {
  useEffect(() => {
    // These are special ad types that load globally, not tied to a visual placement.
    // We store them under 'footer_banner' (popunder) and 'header_banner' (social bar)
    // in the CMS ad manager. When enabled, they inject scripts site-wide.
    
    // Direct Adsterra codes — controlled by CMS ad manager (footer_banner + header_banner)
    // Popunder: stored in footer_banner placement
    // Social Bar: stored in header_banner placement
    
    // Fetch both from API
    fetch('/api/public-ads')
      .then(r => r.json())
      .then(data => {
        if (data.popunder) injectScript(data.popunder)
        if (data.socialbar) injectScript(data.socialbar)
      })
      .catch(() => {})
  }, [])

  return null
}

function injectScript(code: string) {
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
      document.body.appendChild(newScript)
    } else {
      document.body.appendChild(node)
    }
  })
}