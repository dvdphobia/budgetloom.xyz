import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken, unauthorized } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await query('SELECT * FROM printables ORDER BY id')
    return NextResponse.json({ printables: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const { slug, title, description, price, pages, includes, file_url } = await request.json()

    if (!slug || !title) {
      return NextResponse.json({ error: 'slug, title required' }, { status: 400 })
    }

    const includesArr = Array.isArray(includes) ? includes : (typeof includes === 'string' ? JSON.parse(includes || '[]') : [])

    const result = await query(
      `INSERT INTO printables (slug, title, description, price, pages, includes, file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [slug, title, description || '', price || 'Free', pages || 1, includesArr, file_url || '']
    )

    return NextResponse.json({ success: true, id: (result.rows[0] as any).id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}