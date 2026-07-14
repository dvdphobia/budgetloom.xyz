import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken, unauthorized } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await query('SELECT * FROM printables WHERE id = $1', [id])
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ printable: result.rows[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await verifyToken(request)) return unauthorized()
  try {
    const { slug, title, description, price, pages, includes, file_url } = await request.json()
    const includesArr = Array.isArray(includes) ? includes : (typeof includes === 'string' ? JSON.parse(includes || '[]') : [])

    const result = await query(
      `UPDATE printables SET
        slug = $1, title = $2, description = $3, price = $4,
        pages = $5, includes = $6, file_url = $7, updated_at = NOW()
      WHERE id = $8 RETURNING id`,
      [slug, title, description, price, pages, includesArr, file_url, id]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await query('DELETE FROM printables WHERE id = $1 RETURNING id', [id])
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}