import { NextRequest, NextResponse } from 'next/server'
import { query, hasDatabase, recordAuditLog } from '@/lib/db'
import { getAuthenticatedUser, unauthorized, sanitizeContentInput } from '@/lib/auth'
import { logger } from '@/lib/logger'

const ALLOWED_KEYS = new Set([
  'site_name',
  'site_url',
  'amazon_tracking_id',
  'google_analytics_id',
  'adsterra_key',
  'adskeeper_widget_id',
  'pinterest_verification',
])

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()

  if (!hasDatabase()) {
    return NextResponse.json({
      settings: {
        site_name: 'BudgetLoom',
        site_url: 'https://budgetloom.xyz',
        amazon_tracking_id: 'budgetloom20-20',
        google_analytics_id: 'G-CRZCXM56DQ',
        pinterest_verification: '',
      },
      databaseConnected: false,
    })
  }

  try {
    const result = await query('SELECT key, value FROM site_settings ORDER BY key')
    const settings: Record<string, string> = {}
    for (const row of result.rows as any[]) {
      settings[row.key] = row.value
    }
    return NextResponse.json({ settings, databaseConnected: true })
  } catch (error) {
    logger.error('admin.settings.get_failed', 'Unable to load site settings', { error })
    return NextResponse.json({ error: 'Unable to load settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()
  try {
    const { settings } = (await request.json()) as { settings?: Record<string, unknown> }
    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 })
    }
    const updatedKeys: string[] = []
    for (const [key, rawValue] of Object.entries(settings)) {
      if (!ALLOWED_KEYS.has(key) || typeof rawValue !== 'string') continue
      const cleanValue = sanitizeContentInput(rawValue.trim()).slice(0, 256)
      await query(
        `INSERT INTO site_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, cleanValue]
      )
      updatedKeys.push(key)
    }
    await recordAuditLog(user, 'update_settings', 'site_settings', undefined, { updatedKeys })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('admin.settings.update_failed', 'Unable to update site settings', { error })
    return NextResponse.json({ error: 'Unable to update settings' }, { status: 500 })
  }
}