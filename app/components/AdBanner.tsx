import { getAdByPlacement } from '@/lib/db'

// Server component — fetches ad code from DB by placement
export default async function AdBanner({ placement }: { placement: string }) {
  const adCode = await getAdByPlacement(placement)
  if (!adCode) return null

  return (
    <div
      className="ad-placement"
      data-placement={placement}
      style={{ width: '100%', margin: '16px 0', textAlign: 'center' }}
      dangerouslySetInnerHTML={{ __html: adCode }}
    />
  )
}