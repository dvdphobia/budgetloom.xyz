import {
  posts as staticPosts,
  getPostBySlug,
  TOPIC_CLUSTERS,
  getClusterForPost,
  type Post,
  type PublicationStatus,
  type TopicClusterMeta,
} from '@/lib/posts'
import { hasDatabase, query } from '@/lib/db'
import { logger } from '@/lib/logger'

export type { PublicationStatus, TopicClusterMeta }
export { TOPIC_CLUSTERS, getClusterForPost }

export interface PublicPost extends Post {
  id?: number | string
  seoTitle: string
  excerpt: string
  topicCluster: string
  topicSlug: string
  author: string
  reviewer?: string
  updatedAt?: string
  publishedAt?: string
  featuredImage?: string
  featuredImageAlt?: string
  sources: { title: string; url: string }[]
  relatedSlugs: string[]
  relatedTools: string[]
  relatedPrintables: string[]
  canonicalUrl: string
  status: PublicationStatus
  faqs: { question: string; answer: string }[]
}

type DbPostRow = {
  id?: number
  slug: string
  title: string
  seo_title?: string | null
  description: string
  excerpt?: string | null
  date: string
  category: string
  topic_cluster?: string | null
  read_time: string
  content: string
  published: boolean
  archived?: boolean | null
  status?: string | null
  author?: string | null
  reviewer?: string | null
  featured_image?: string | null
  featured_image_alt?: string | null
  sources?: { title: string; url: string }[] | string | null
  related_slugs?: string[] | null
  related_tools?: string[] | null
  related_printables?: string[] | null
  canonical_url?: string | null
  scheduled_for?: string | Date | null
  published_at?: string | Date | null
  updated_at?: string | Date | null
}

function enrichStaticPost(post: Post): PublicPost {
  const cluster = getClusterForPost(post)
  return {
    ...post,
    seoTitle: post.seoTitle || post.title,
    excerpt: post.excerpt || post.description,
    topicCluster: post.topicCluster || cluster.name,
    topicSlug: post.topicSlug || cluster.slug,
    author: post.author || 'BudgetLoom Editorial Team',
    reviewer: post.reviewer,
    updatedAt: post.updatedAt || post.date,
    publishedAt: post.date,
    sources: post.sources || cluster.defaultSources,
    relatedSlugs: post.relatedSlugs || [],
    relatedTools: post.relatedTools || cluster.recommendedTools,
    relatedPrintables: post.relatedPrintables || cluster.recommendedPrintables,
    canonicalUrl: post.canonicalUrl || `https://budgetloom.xyz/blog/${post.slug}`,
    status: post.status || 'published',
    faqs: post.faqs || [],
  }
}

function isRowPubliclyVisible(row: DbPostRow): boolean {
  if (row.archived === true) return false
  if (row.status === 'archived' || row.status === 'draft' || row.status === 'in_review' || row.status === 'approved') {
    return false
  }
  if (row.status === 'scheduled') {
    if (!row.scheduled_for) return false
    const scheduledTime = new Date(row.scheduled_for).getTime()
    return Number.isFinite(scheduledTime) && scheduledTime <= Date.now()
  }
  return Boolean(row.published)
}

function toPublicPost(row: DbPostRow): PublicPost {
  const fallbackStatic = getPostBySlug(row.slug)
  const basePost: Post = {
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: row.date,
    category: row.category,
    readTime: row.read_time,
    content: row.content,
    topicCluster: row.topic_cluster || fallbackStatic?.topicCluster,
  }
  const cluster = getClusterForPost(basePost)

  let parsedSources: { title: string; url: string }[] = fallbackStatic?.sources || cluster.defaultSources
  if (Array.isArray(row.sources) && row.sources.length > 0) {
    parsedSources = row.sources
  } else if (typeof row.sources === 'string' && row.sources.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(row.sources)
      if (Array.isArray(parsed) && parsed.length > 0) parsedSources = parsed
    } catch {
      // Keep default sources
    }
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    seoTitle: row.seo_title || fallbackStatic?.seoTitle || row.title,
    description: row.description,
    excerpt: row.excerpt || fallbackStatic?.excerpt || row.description,
    date: row.date,
    category: row.category,
    topicCluster: row.topic_cluster || fallbackStatic?.topicCluster || cluster.name,
    topicSlug: fallbackStatic?.topicSlug || cluster.slug,
    readTime: row.read_time,
    content: row.content,
    author: row.author || fallbackStatic?.author || 'BudgetLoom Editorial Team',
    reviewer: row.reviewer || fallbackStatic?.reviewer || undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString().split('T')[0] : fallbackStatic?.updatedAt || row.date,
    publishedAt: row.published_at ? new Date(row.published_at).toISOString().split('T')[0] : row.date,
    featuredImage: row.featured_image || fallbackStatic?.featuredImage,
    featuredImageAlt: row.featured_image_alt || fallbackStatic?.featuredImageAlt,
    sources: parsedSources,
    relatedSlugs: row.related_slugs?.length ? row.related_slugs : fallbackStatic?.relatedSlugs || [],
    relatedTools: row.related_tools?.length ? row.related_tools : fallbackStatic?.relatedTools || cluster.recommendedTools,
    relatedPrintables: row.related_printables?.length ? row.related_printables : fallbackStatic?.relatedPrintables || cluster.recommendedPrintables,
    canonicalUrl: row.canonical_url || `https://budgetloom.xyz/blog/${row.slug}`,
    status: (row.status as PublicationStatus) || (row.archived ? 'archived' : row.published ? 'published' : 'draft'),
    faqs: fallbackStatic?.faqs || [],
  }
}

async function queryDbPostsWithSchemaFallback(): Promise<DbPostRow[] | null> {
  if (!hasDatabase()) return null

  // Tier 1: Full CMS schema query
  try {
    const result = await query<DbPostRow>(
      `SELECT id, slug, title, seo_title, description, excerpt, date, category, topic_cluster,
              read_time, content, published, archived, status, author, reviewer,
              featured_image, featured_image_alt, sources, related_slugs, related_tools,
              related_printables, canonical_url, scheduled_for, published_at, updated_at
       FROM posts
       ORDER BY date DESC`
    )
    return result.rows
  } catch (error: any) {
    if (error?.code === '42P01') {
      // Table not created yet
      return null
    }
    if (error?.code !== '42703') {
      logger.error('content.query_posts.failed', 'Database error loading posts; falling back to static catalog', { error })
      return null
    }
  }

  // Tier 2: Intermediate schema (with `archived`, without extended CMS columns)
  try {
    const result = await query<DbPostRow>(
      `SELECT slug, title, description, date, category, read_time, content, published, archived, updated_at
       FROM posts
       ORDER BY date DESC`
    )
    return result.rows
  } catch (error: any) {
    if (error?.code !== '42703') {
      logger.error('content.query_posts_tier2.failed', 'Database error loading tier-2 posts; falling back to static catalog', { error })
      return null
    }
  }

  // Tier 3: Legacy pre-PR#3 schema (without `archived` column)
  try {
    logger.warn('content.schema.legacy_fallback', 'posts.archived column missing (42703); using legacy column projection')
    const result = await query<DbPostRow>(
      `SELECT slug, title, description, date, category, read_time, content, published, updated_at
       FROM posts
       ORDER BY date DESC`
    )
    return result.rows.map((r) => ({ ...r, archived: false }))
  } catch (error) {
    logger.error('content.query_posts_tier3.failed', 'Legacy posts query failed; falling back to static catalog', { error })
    return null
  }
}

export async function getVisiblePosts(): Promise<PublicPost[]> {
  const staticVisible = staticPosts
    .filter((p) => (p.status ?? 'published') === 'published')
    .map(enrichStaticPost)

  const rows = await queryDbPostsWithSchemaFallback()
  if (!rows) {
    return staticVisible.sort((a, b) => b.date.localeCompare(a.date))
  }

  const persistedSlugs = new Set(rows.map((row) => row.slug))
  const inheritedStatic = staticVisible.filter((post) => !persistedSlugs.has(post.slug))
  const publishedFromDb = rows.filter(isRowPubliclyVisible).map(toPublicPost)

  return [...publishedFromDb, ...inheritedStatic].sort((a, b) => b.date.localeCompare(a.date))
}

export async function getVisiblePost(slug: string): Promise<PublicPost | null> {
  const staticCandidate = getPostBySlug(slug)
  const staticEnriched =
    staticCandidate && (staticCandidate.status ?? 'published') === 'published'
      ? enrichStaticPost(staticCandidate)
      : null

  if (!hasDatabase()) {
    return staticEnriched
  }

  const rows = await queryDbPostsWithSchemaFallback()
  if (!rows) {
    return staticEnriched
  }

  const row = rows.find((r) => r.slug === slug)
  if (row) {
    return isRowPubliclyVisible(row) ? toPublicPost(row) : null
  }

  return staticEnriched
}

export async function resolveSlugRedirect(slug: string): Promise<string | null> {
  if (!hasDatabase()) return null
  try {
    const result = await query<{ to_slug: string }>(
      'SELECT to_slug FROM slug_redirects WHERE from_slug = $1 LIMIT 1',
      [slug]
    )
    return result.rows[0]?.to_slug ?? null
  } catch {
    return null
  }
}

export async function getVisiblePostsByCluster(clusterSlug: string): Promise<PublicPost[]> {
  const all = await getVisiblePosts()
  return all.filter((post) => post.topicSlug === clusterSlug)
}

export async function getVisiblePostsByCategory(category: string): Promise<PublicPost[]> {
  const all = await getVisiblePosts()
  return all.filter((post) => post.category.toLowerCase() === category.toLowerCase())
}
