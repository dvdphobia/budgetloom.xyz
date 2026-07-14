import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { verifyToken, unauthorized } from '@/lib/auth'

// GET /api/admin/printables — list all
export async function GET(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await sql`SELECT * FROM printables ORDER BY id;`
    return NextResponse.json({ printables: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/admin/printables — create
export async function POST(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const { slug, title, description, price, pages, includes, file_url } = await request.json()

    if (!slug || !title) {
      return NextResponse.json({ error: 'slug, title required' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO printables (slug, title, description, price, pages, includes, file_url)
      VALUES (${slug}, ${title}, ${description || ''}, ${price || 'Free'}, ${pages || 1}, ${includes || []}, ${file_url || ''})
      RETURNING id;
    `

    return NextResponse.json({ success: true, id: (result.rows[0] as any).id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}