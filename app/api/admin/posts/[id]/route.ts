import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken, unauthorized } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await query('SELECT * FROM posts WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ post: result.rows[0] })
  } catch (error: any) {
    return NextResponse.json({ error: 'Post operation failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await verifyToken(request)) return unauthorized()
  try {
    const { slug, title, description, date, category, read_time, content, published } = await request.json()
    if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100 || typeof title !== 'string' || !title.trim() || title.length > 160 || typeof content !== 'string' || !content.trim() || content.length > 150000) {
      return NextResponse.json({ error: 'Invalid post fields' }, { status: 400 })
    }

    // Preserve indexed permalinks; any slug change requires a dedicated redirect migration.
    const previous = await query('SELECT slug FROM posts WHERE id = $1 AND archived = false', [id])
    if (previous.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (previous.rows[0].slug !== slug) {
      return NextResponse.json({ error: 'Published URL slugs are immutable. Create a new post with a redirect plan.' }, { status: 409 })
    }
    const result = await query(
      `UPDATE posts SET
        slug = $1, title = $2, description = $3, date = $4,
        category = $5, read_time = $6, content = $7, published = $8,
        updated_at = NOW()
      WHERE id = $9 AND archived = false RETURNING id, slug`,
      [slug, title, description, date, category, read_time, content, published, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/blog/' + slug)
    revalidatePath('/sitemap.xml')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Post operation failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await query('UPDATE posts SET archived = true, published = false, updated_at = NOW() WHERE id = $1 AND archived = false RETURNING slug', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/blog/' + result.rows[0].slug)
    revalidatePath('/sitemap.xml')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Post operation failed' }, { status: 500 })
  }
}