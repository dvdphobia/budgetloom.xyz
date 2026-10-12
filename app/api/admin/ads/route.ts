import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken, unauthorized } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await query('SELECT * FROM ad_placements ORDER BY id')
    return NextResponse.json({ ads: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: 'Ad configuration unavailable' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const { id, enabled } = await request.json()
    if (!Number.isInteger(id) || typeof enabled !== 'boolean') return NextResponse.json({ error: 'Invalid ad configuration' }, { status: 400 })
    const result = await query(
      `UPDATE ad_placements SET enabled = $1, updated_at = NOW() WHERE id = $2 AND placement NOT IN ('header_banner', 'footer_banner') RETURNING id`,
      [enabled, id]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Ad configuration unavailable' }, { status: 500 })
  }
}