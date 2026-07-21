import { ImageResponse } from 'next/og'

export const alt = 'BudgetLoom — free budget printables and practical money guides'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, color: '#0c1a1e', background: '#fdfcf7' }}>
      <div style={{ display: 'flex', color: '#059669', fontSize: 36, fontWeight: 700, marginBottom: 48 }}>BudgetLoom</div>
      <div style={{ display: 'flex', maxWidth: 980, fontSize: 72, lineHeight: 1.05, fontWeight: 800, letterSpacing: -3 }}>Save more. Stress less. Start today.</div>
      <div style={{ display: 'flex', marginTop: 36, color: '#52605f', fontSize: 30 }}>Free budget printables and practical money guides</div>
    </div>,
    size,
  )
}
