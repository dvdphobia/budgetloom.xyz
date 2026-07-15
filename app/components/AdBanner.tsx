'use client'

import { useEffect, useRef } from 'react'

// Client component — renders ad code and executes scripts
export default function AdBanner({ adCode, placement }: { adCode: string | null; placement: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!adCode || !ref.current) return

    // Clear previous content
    ref.current.innerHTML = ''

    // Parse the ad code and inject scripts properly
    const container = document.createElement('div')
    container.innerHTML = adCode

    // Move all child nodes (divs, scripts, etc) into our container
    const scripts: HTMLScriptElement[] = []
    Array.from(container.childNodes).forEach(node => {
      if (node.nodeName === 'SCRIPT') {
        const oldScript = node as HTMLScriptElement
        const newScript = document.createElement('script')
        // Copy attributes
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value)
        })
        if (oldScript.src) {
          newScript.src = oldScript.src
        } else {
          newScript.textContent = oldScript.textContent
        }
        newScript.async = true
        scripts.push(newScript)
      } else {
        ref.current!.appendChild(node)
      }
    })

    // Append scripts after DOM elements
    scripts.forEach(s => ref.current!.appendChild(s))
  }, [adCode])

  if (!adCode) return null

  return (
    <div
      ref={ref}
      className="ad-placement"
      data-placement={placement}
      style={{ width: '100%', margin: '16px 0', textAlign: 'center', overflow: 'hidden' }}
    />
  )
}