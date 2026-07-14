import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken, unauthorized } from '@/lib/auth'

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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await verifyToken(request)) return unauthorized()
  try {
    const { slug, title, description, date, category, read_time, content, published } = await request.json()

    const result = await query(
      `UPDATE posts SET
        slug = $1, title = $2, description = $3, date = $4,
        category = $5, read_time = $6, content = $7, published = $8,
        updated_at = NOW()
      WHERE id = $9 RETURNING id`,
      [slug, title, description, date, category, read_time, content, published, id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await query('DELETE FROM posts WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}