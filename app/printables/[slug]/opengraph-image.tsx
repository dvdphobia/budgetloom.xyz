import { ImageResponse } from 'next/og'
import { getPrintableBySlug } from '@/lib/printables'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const printable = getPrintableBySlug(slug)
  const title = printable?.title ?? 'Free Budget Printable'

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: 72, color: '#0c1a1e', background: '#fdfcf7' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: '70%' }}>
        <div style={{ display: 'flex', color: '#059669', fontSize: 30, fontWeight: 700, marginBottom: 40 }}>BudgetLoom · Free Printable</div>
        <div style={{ display: 'flex', fontSize: 64, lineHeight: 1.08, fontWeight: 800, letterSpacing: -2 }}>{title}</div>
        <div style={{ display: 'flex', marginTop: 32, color: '#52605f', fontSize: 26 }}>Instant PDF download · Print at home</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 50, width: 230, height: 300, color: '#059669', background: '#ffffff', border: '4px solid #059669', borderRadius: 18, fontSize: 40, fontWeight: 800 }}>FREE</div>
    </div>,
    size,
  )
}
