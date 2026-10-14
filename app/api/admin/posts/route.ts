import { NextRequest, NextResponse } from 'next/server'
import { query, initDB, recordAuditLog, hasDatabase } from '@/lib/db'
import { getAuthenticatedUser, unauthorized, sanitizeContentInput } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'
import { posts as staticPosts } from '@/lib/posts'

const VALID_STATUSES = new Set(['draft', 'in_review', 'approved', 'scheduled', 'published', 'archived', 'updated'])

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()

  if (!hasDatabase()) {
    return NextResponse.json({
      posts: staticPosts.map((p, idx) => ({
        id: idx + 1,
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        category: p.category,
        topic_cluster: p.topicCluster || p.category,
        read_time: p.readTime,
        published: true,
        archived: false,
        status: p.status || 'published',
        source: 'static',
      })),
      databaseConnected: false,
    })
  }

  try {
    const result = await query(
      `SELECT id, slug, title, seo_title, description, excerpt, date, category,
              COALESCE(topic_cluster, category) AS topic_cluster,
              read_time, published, archived,
              COALESCE(status, CASE WHEN archived THEN 'archived' WHEN published THEN 'published' ELSE 'draft' END) AS status,
              author, reviewer, scheduled_for, created_at, updated_at
       FROM posts
       WHERE archived = false
       ORDER BY date DESC`
    )
    return NextResponse.json({ posts: result.rows, databaseConnected: true })
  } catch (error: any) {
    if (error?.code === '42703' || error?.code === '42P01') {
      try {
        await initDB()
        const retry = await query(
          `SELECT id, slug, title, description, date, category, read_time, published, archived, status, topic_cluster, created_at, updated_at
           FROM posts WHERE archived = false ORDER BY date DESC`
        )
        return NextResponse.json({ posts: retry.rows, databaseConnected: true })
      } catch (retryError) {
        logger.error('admin.posts.get_retry_failed', 'Failed to load posts after schema init', { error: retryError })
      }
    }
    logger.error('admin.posts.get_failed', 'Unable to load posts in admin API', { error })
    return NextResponse.json({ error: 'Unable to load posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()

  try {
    const body = await request.json()
    const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
    const title = typeof body.title === 'string' ? sanitizeContentInput(body.title.trim()) : ''
    const seoTitle = typeof body.seo_title === 'string' ? sanitizeContentInput(body.seo_title.trim()).slice(0, 160) : title
    const description = typeof body.description === 'string' ? sanitizeContentInput(body.description.trim()).slice(0, 320) : ''
    const excerpt = typeof body.excerpt === 'string' ? sanitizeContentInput(body.excerpt.trim()).slice(0, 400) : description
    const date = typeof body.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : new Date().toISOString().split('T')[0]
    const category = typeof body.category === 'string' && body.category.trim() ? body.category.trim().slice(0, 60) : 'Budgeting'
    const topicCluster = typeof body.topic_cluster === 'string' && body.topic_cluster.trim() ? body.topic_cluster.trim().slice(0, 80) : 'Budget Systems'
    const readTime = typeof body.read_time === 'string' && body.read_time.trim() ? body.read_time.trim().slice(0, 20) : '7 min'
    const content = typeof body.content === 'string' ? sanitizeContentInput(body.content.trim()) : ''
    const author = typeof body.author === 'string' && body.author.trim() ? sanitizeContentInput(body.author.trim()).slice(0, 100) : 'BudgetLoom Editorial Team'
    const reviewer = typeof body.reviewer === 'string' ? sanitizeContentInput(body.reviewer.trim()).slice(0, 100) : ''
    const status = typeof body.status === 'string' && VALID_STATUSES.has(body.status) ? body.status : body.published === true ? 'published' : 'draft'
    const published = status === 'published' || status === 'updated'
    const archived = status === 'archived'
    const scheduledFor = status === 'scheduled' && typeof body.scheduled_for === 'string' && body.scheduled_for ? new Date(body.scheduled_for).toISOString() : null
    const relatedSlugs = Array.isArray(body.related_slugs) ? body.related_slugs.filter((s: unknown): s is string => typeof s === 'string').slice(0, 10) : []
    const relatedTools = Array.isArray(body.related_tools) ? body.related_tools.filter((s: unknown): s is string => typeof s === 'string').slice(0, 10) : []
    const relatedPrintables = Array.isArray(body.related_printables) ? body.related_printables.filter((s: unknown): s is string => typeof s === 'string').slice(0, 10) : []

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      slug.length > 100 ||
      !title ||
      title.length > 160 ||
      !content ||
      content.length > 150000
    ) {
      return NextResponse.json({ error: 'Valid slug, title, and content are required' }, { status: 400 })
    }

    await initDB()

    const result = await query<{ id: number }>(
      `INSERT INTO posts (
        slug, title, seo_title, description, excerpt, date, category, topic_cluster,
        read_time, content, published, archived, status, author, reviewer,
        related_slugs, related_tools, related_printables, scheduled_for, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING id`,
      [
        slug,
        title,
        seoTitle,
        description,
        excerpt,
        date,
        category,
        topicCluster,
        readTime,
        content,
        published,
        archived,
        status,
        author,
        reviewer,
        relatedSlugs,
        relatedTools,
        relatedPrintables,
        scheduledFor,
        published ? new Date().toISOString() : null,
      ]
    )

    const createdId = result.rows[0].id
    await recordAuditLog(user, 'create_post', 'post', String(createdId), { slug, status })

    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/blog/' + slug)
    revalidatePath('/topics')
    revalidatePath('/sitemap.xml')

    return NextResponse.json({ success: true, id: createdId })
  } catch (error: any) {
    logger.error('admin.posts.create_failed', 'Failed to create post', { error })
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Unable to create post' }, { status: 500 })
  }
}