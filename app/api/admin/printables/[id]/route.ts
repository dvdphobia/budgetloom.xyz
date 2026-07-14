import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { verifyToken, unauthorized } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await sql`SELECT * FROM printables WHERE id = ${id};`
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
    const result = await sql`
      UPDATE printables SET
        slug = ${slug}, title = ${title}, description = ${description},
        price = ${price}, pages = ${pages}, includes = ${includes},
        file_url = ${file_url}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id;
    `
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
    const result = await sql`DELETE FROM printables WHERE id = ${id} RETURNING id;`
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}