import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken, unauthorized } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await query('SELECT key, value FROM site_settings ORDER BY key')
    const settings: Record<string, string> = {}
    for (const row of result.rows as any[]) {
      settings[row.key] = row.value
    }
    return NextResponse.json({ settings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const { settings } = await request.json() as { settings: Record<string, string> }
    for (const [key, value] of Object.entries(settings)) {
      await query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      )
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}