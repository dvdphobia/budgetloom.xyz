import AdBanner from './AdBanner'
import { getAdPlacements } from '@/lib/db'

// AdSense ad unit IDs are obtained from an approved account and assigned per placement.
// No popunders, social bars, pasted third-party scripts, or fake download controls.
const slots: Record<string, string | undefined> = {
  blog_post_top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INTRO,
  blog_post_middle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MIDDLE,
  blog_post_bottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_END,
}

export default async function AdSlot({ placement }: { placement: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const slot = slots[placement]
  if (!client || !/^ca-pub-\d+$/.test(client) || !slot || !/^\d+$/.test(slot)) return null

  // Existing CMS toggles now gate these supported ad placements.
  const configured = await getAdPlacements()
  if (configured.length && !configured.some(ad => ad.placement === placement && ad.enabled)) return null

  return <AdBanner client={client} slot={slot} placement={placement} />
}
