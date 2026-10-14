import { NextRequest, NextResponse } from 'next/server'
import { hasDatabase, getAuditLogs, query } from '@/lib/db'
import { getAuthenticatedUser, unauthorized } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { posts as staticPosts } from '@/lib/posts'
import { printables as staticPrintables } from '@/lib/printables'
import seoBacklog from '@/content/seo-backlog.json'

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()

  const backlogCounts = {
    total: seoBacklog.length,
    published: seoBacklog.filter((item) => item.status === 'published').length,
    draft: seoBacklog.filter((item) => item.status === 'draft' || item.status === 'in_review').length,
    idea: seoBacklog.filter((item) => item.status === 'idea').length,
  }

  if (!hasDatabase()) {
    return NextResponse.json({
      databaseConnected: false,
      auditLogs: [],
      recentSystemLogs: logger.getRecentLogs().slice(0, 25),
      counts: {
        staticPosts: staticPosts.length,
        dbPosts: 0,
        staticPrintables: staticPrintables.length,
        dbPrintables: 0,
        subscribers: 0,
        downloads: 0,
      },
      backlogCounts,
    })
  }

  try {
    const [auditLogs, subscriberRes, downloadRes, postStatsRes] = await Promise.all([
      getAuditLogs(50),
      query<{ count: string }>('SELECT COUNT(*)::text AS count FROM newsletter_subscribers').catch(() => ({ rows: [{ count: '0' }] })),
      query<{ count: string }>('SELECT COUNT(*)::text AS count FROM download_events').catch(() => ({ rows: [{ count: '0' }] })),
      query<{ count: string }>('SELECT COUNT(*)::text AS count FROM posts WHERE archived = false').catch(() => ({ rows: [{ count: '0' }] })),
    ])

    return NextResponse.json({
      databaseConnected: true,
      auditLogs,
      recentSystemLogs: logger.getRecentLogs().slice(0, 25),
      counts: {
        staticPosts: staticPosts.length,
        dbPosts: Number(postStatsRes.rows[0]?.count || 0),
        staticPrintables: staticPrintables.length,
        subscribers: Number(subscriberRes.rows[0]?.count || 0),
        downloads: Number(downloadRes.rows[0]?.count || 0),
      },
      backlogCounts,
    })
  } catch (error) {
    logger.error('admin.audit.get_failed', 'Failed to load admin audit overview', { error })
    return NextResponse.json({ error: 'Unable to load audit logs' }, { status: 500 })
  }
}
