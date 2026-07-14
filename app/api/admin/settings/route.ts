import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { verifyToken, unauthorized } from '@/lib/auth'

// GET /api/admin/settings — list all settings
export async function GET(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const result = await sql`SELECT key, value FROM site_settings ORDER BY key;`
    const settings: Record<string, string> = {}
    for (const row of result.rows as any[]) {
      settings[row.key] = row.value
    }
    return NextResponse.json({ settings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/admin/settings — update settings (batch)
export async function PUT(request: NextRequest) {
  if (!await verifyToken(request)) return unauthorized()
  try {
    const { settings } = await request.json() as { settings: Record<string, string> }
    for (const [key, value] of Object.entries(settings)) {
      await sql`
        INSERT INTO site_settings (key, value)
        VALUES (${key}, ${value})
        ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW();
      `
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}