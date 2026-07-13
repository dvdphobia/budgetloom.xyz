'use client'

import { useState } from 'react'
import { Icon } from './Icons'

export default function ShareButtons({ title, url }: { title: string, url: string }) {
  const [copied, setCopied] = useState(false)

  const share = (platform: string) => {
    const encodedTitle = encodeURIComponent(title)
    const encodedUrl = encodeURIComponent(url)
    const links: Record<string, string> = {
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    }
    window.open(links[platform], '_blank', 'noopener,noreferrer,width=600,height=400')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="share-row">
      <span className="label">Share</span>
      <button className={`share-btn ${copied ? 'copied' : ''}`} onClick={() => share('pinterest')} aria-label="Share on Pinterest">
        <Icon.pin />
      </button>
      <button className="share-btn" onClick={() => share('facebook')} aria-label="Share on Facebook">
        <Icon.facebook />
      </button>
      <button className="share-btn" onClick={() => share('twitter')} aria-label="Share on Twitter">
        <Icon.twitter />
      </button>
      <button className={`share-btn ${copied ? 'copied' : ''}`} onClick={copyLink} aria-label="Copy link">
        {copied ? <Icon.check /> : <Icon.link />}
      </button>
    </div>
  )
}