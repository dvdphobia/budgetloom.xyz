import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken, unauthorized } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await query('SELECT * FROM ad_placements ORDER BY id')
    return NextResponse.json({ ads: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const { id, ad_code, enabled } = await request.json()
    const result = await query(
      `UPDATE ad_placements SET ad_code = $1, enabled = $2, updated_at = NOW() WHERE id = $3 RETURNING id`,
      [ad_code, enabled, id]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}