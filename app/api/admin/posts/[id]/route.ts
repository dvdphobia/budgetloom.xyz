import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { verifyToken, unauthorized } from '@/lib/auth'

// GET /api/admin/posts/[id] — get single post
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await sql`SELECT * FROM posts WHERE id = ${id};`
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ post: result.rows[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/admin/posts/[id] — update post
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await verifyToken(request)) return unauthorized()
  try {
    const { slug, title, description, date, category, read_time, content, published } = await request.json()

    const result = await sql`
      UPDATE posts SET
        slug = ${slug},
        title = ${title},
        description = ${description},
        date = ${date},
        category = ${category},
        read_time = ${read_time},
        content = ${content},
        published = ${published},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id;
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/posts/[id] — delete post
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await sql`DELETE FROM posts WHERE id = ${id} RETURNING id;`
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}