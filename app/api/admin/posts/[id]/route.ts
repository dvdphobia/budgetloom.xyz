import { NextRequest, NextResponse } from 'next/server'
import { query, initDB, recordAuditLog, withTransaction } from '@/lib/db'
import { getAuthenticatedUser, unauthorized, sanitizeContentInput } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

const VALID_STATUSES = new Set(['draft', 'in_review', 'approved', 'scheduled', 'published', 'archived', 'updated'])

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()
  try {
    const result = await query('SELECT * FROM posts WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ post: result.rows[0] })
  } catch (error) {
    logger.error('admin.posts.get_one_failed', 'Failed to fetch post by id', { error, meta: { id } })
    return NextResponse.json({ error: 'Post operation failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
    const createRedirect = body.create_redirect === true
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
      return NextResponse.json({ error: 'Invalid post fields' }, { status: 400 })
    }

    await initDB()

    const previous = await query<{ slug: string }>('SELECT slug FROM posts WHERE id = $1 AND archived = false', [id])
    if (previous.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const oldSlug = previous.rows[0].slug
    if (oldSlug !== slug && !createRedirect) {
      return NextResponse.json(
        { error: 'Published URL slugs are immutable unless create_redirect is enabled.' },
        { status: 409 }
      )
    }

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE posts SET
          slug = $1, title = $2, seo_title = $3, description = $4, excerpt = $5,
          date = $6, category = $7, topic_cluster = $8, read_time = $9, content = $10,
          published = $11, archived = $12, status = $13, author = $14, reviewer = $15,
          related_slugs = $16, related_tools = $17, related_printables = $18,
          scheduled_for = $19, updated_at = NOW()
        WHERE id = $20`,
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
          id,
        ]
      )

      if (oldSlug !== slug && createRedirect) {
        await client.query(
          `INSERT INTO slug_redirects (from_slug, to_slug)
           VALUES ($1, $2)
           ON CONFLICT (from_slug) DO UPDATE SET to_slug = EXCLUDED.to_slug`,
          [oldSlug, slug]
        )
      }
    })

    await recordAuditLog(user, 'update_post', 'post', id, { slug, status, redirectedFrom: oldSlug !== slug ? oldSlug : undefined })

    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/blog/' + oldSlug)
    revalidatePath('/blog/' + slug)
    revalidatePath('/topics')
    revalidatePath('/sitemap.xml')
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('admin.posts.update_failed', 'Failed to update post', { error, meta: { id } })
    return NextResponse.json({ error: 'Post operation failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()
  try {
    await initDB()
    const result = await query<{ slug: string }>(
      `UPDATE posts
       SET archived = true, published = false, status = 'archived', updated_at = NOW()
       WHERE id = $1 AND archived = false
       RETURNING slug`,
      [id]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const slug = result.rows[0].slug
    await recordAuditLog(user, 'archive_post', 'post', id, { slug })

    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/blog/' + slug)
    revalidatePath('/topics')
    revalidatePath('/sitemap.xml')
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('admin.posts.delete_failed', 'Failed to archive post', { error, meta: { id } })
    return NextResponse.json({ error: 'Post operation failed' }, { status: 500 })
  }
}