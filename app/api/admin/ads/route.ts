import { NextRequest, NextResponse } from 'next/server'
import { query, hasDatabase, recordAuditLog } from '@/lib/db'
import { getAuthenticatedUser, unauthorized } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()

  if (!hasDatabase()) {
    return NextResponse.json({
      ads: [
        { id: 1, placement: 'blog_post_top', label: 'Blog Post Top (above article)', enabled: false },
        { id: 2, placement: 'blog_post_middle', label: 'Blog Post Middle (mid-article)', enabled: false },
        { id: 3, placement: 'blog_post_bottom', label: 'Blog Post Bottom (below article)', enabled: false },
        { id: 4, placement: 'calculator_bottom', label: 'Calculator Page Bottom (below results)', enabled: false },
      ],
      databaseConnected: false,
    })
  }

  try {
    const result = await query('SELECT * FROM ad_placements ORDER BY id')
    return NextResponse.json({ ads: result.rows, databaseConnected: true })
  } catch (error) {
    logger.error('admin.ads.get_failed', 'Unable to load ad placements', { error })
    return NextResponse.json({ error: 'Ad configuration unavailable' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()
  try {
    const { id, enabled } = await request.json()
    if (!Number.isInteger(id) || typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid ad configuration' }, { status: 400 })
    }
    const result = await query<{ id: number; placement: string }>(
      `UPDATE ad_placements
       SET enabled = $1, updated_at = NOW()
       WHERE id = $2 AND placement NOT IN ('header_banner', 'footer_banner')
       RETURNING id, placement`,
      [enabled, id]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await recordAuditLog(user, 'update_ad_placement', 'ad_placement', String(id), {
      placement: result.rows[0].placement,
      enabled,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('admin.ads.update_failed', 'Unable to update ad placement', { error })
    return NextResponse.json({ error: 'Ad configuration unavailable' }, { status: 500 })
  }
}