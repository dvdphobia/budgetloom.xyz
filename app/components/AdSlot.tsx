import { getAdByPlacement } from '@/lib/db'
import AdBannerClient from './AdBanner'

// Server component — fetches ad code from DB, passes to client component
export default async function AdBanner({ placement }: { placement: string }) {
  let adCode: string | null = null
  try {
    adCode = await getAdByPlacement(placement)
  } catch {
    adCode = null
  }

  if (!adCode) return null

  return <AdBannerClient adCode={adCode} placement={placement} />
}