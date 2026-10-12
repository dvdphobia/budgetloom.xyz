import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken, unauthorized } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await query(
      'SELECT id, slug, title, description, date, category, read_time, published, created_at, updated_at FROM posts WHERE archived = false ORDER BY date DESC'
    )
    return NextResponse.json({ posts: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: 'Unable to load posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const { slug, title, description, date, category, read_time, content, published } = await request.json()

    if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100 || typeof title !== 'string' || !title.trim() || title.length > 160 || typeof content !== 'string' || !content.trim() || content.length > 150000) {
      return NextResponse.json({ error: 'slug, title, content required' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO posts (slug, title, description, date, category, read_time, content, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [slug, title, description || '', date || new Date().toISOString().split('T')[0], category || 'Budgeting', read_time || '5 min', content, published === true]
    )

    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/blog/' + slug)
    revalidatePath('/sitemap.xml')
    return NextResponse.json({ success: true, id: (result.rows[0] as any).id })
  } catch (error: any) {
    return NextResponse.json({ error: 'Unable to create post' }, { status: 500 })
  }
}