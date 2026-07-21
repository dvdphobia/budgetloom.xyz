import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/posts'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  const title = post?.title ?? 'BudgetLoom Money Guide'

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, color: '#0c1a1e', background: '#fdfcf7', borderTop: '18px solid #059669' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', color: '#059669', fontSize: 30, fontWeight: 700 }}>
        <span>BudgetLoom</span><span>{post?.category ?? 'Money Guide'}</span>
      </div>
      <div style={{ display: 'flex', maxWidth: 1050, fontSize: title.length > 58 ? 54 : 64, lineHeight: 1.08, fontWeight: 800, letterSpacing: -2 }}>{title}</div>
      <div style={{ display: 'flex', color: '#52605f', fontSize: 26 }}>Practical money guidance for everyday life</div>
    </div>,
    size,
  )
}
