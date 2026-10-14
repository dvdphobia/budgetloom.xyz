import { NextRequest, NextResponse } from 'next/server'
import { query, initDB, recordAuditLog } from '@/lib/db'
import { getAuthenticatedUser, unauthorized } from '@/lib/auth'
import { posts as staticPosts, getClusterForPost } from '@/lib/posts'
import { printables as staticPrintables } from '@/lib/printables'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()

  try {
    await initDB()
    let postsCount = 0
    let printablesCount = 0

    for (const post of staticPosts) {
      const existing = await query('SELECT id FROM posts WHERE slug = $1', [post.slug])
      const cluster = getClusterForPost(post)
      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO posts (
            slug, title, seo_title, description, excerpt, date, category, topic_cluster,
            read_time, content, published, archived, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, false, 'published')`,
          [
            post.slug,
            post.title,
            post.seoTitle || post.title,
            post.description,
            post.excerpt || post.description,
            post.date,
            post.category,
            post.topicCluster || cluster.name,
            post.readTime,
            post.content,
          ]
        )
        postsCount++
      }
    }

    for (const p of staticPrintables) {
      const existing = await query('SELECT id FROM printables WHERE slug = $1', [p.slug])
      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO printables (slug, title, description, price, pages, includes, file_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [p.slug, p.title, p.description, p.price, p.pages, p.includes, '/printables/' + p.slug + '.pdf']
        )
        printablesCount++
      }
    }

    await recordAuditLog(user, 'seed_content', 'system', undefined, { postsCount, printablesCount })
    return NextResponse.json({ success: true, postsSeeded: postsCount, printablesSeeded: printablesCount })
  } catch (error) {
    logger.error('admin.seed.failed', 'Database seed operation failed', { error })
    return NextResponse.json({ error: 'Database seed operation failed' }, { status: 500 })
  }
}