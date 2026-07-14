import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { verifyToken, unauthorized } from '@/lib/auth'

// GET /api/admin/ads — list all ad placements
export async function GET(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await sql`SELECT * FROM ad_placements ORDER BY id;`
    return NextResponse.json({ ads: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/admin/ads — update ad placement
export async function PUT(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const { id, ad_code, enabled } = await request.json()
    const result = await sql`
      UPDATE ad_placements SET
        ad_code = ${ad_code},
        enabled = ${enabled},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id;
    `
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}