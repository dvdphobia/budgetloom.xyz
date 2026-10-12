import { posts as staticPosts, getPostBySlug, type Post } from '@/lib/posts'
import { query } from '@/lib/db'

// Keep the original URLs available throughout gradual CMS migration.
// Explicitly unpublished/archived database rows suppress the static version.
export interface PublicPost extends Post {
  updatedAt?: string
}

function hasDatabase(): boolean {
  return Boolean(
    process.env.POSTGRES_URL || process.env.NEON_POSTGRES_URL ||
    process.env.DATABASE_URL || process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL || process.env.NEON_POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING || process.env.NEON_POSTGRES_URL_NON_POOLING
  )
}

type DbPost = {
  slug: string
  title: string
  description: string
  date: string
  category: string
  read_time: string
  content: string
  published: boolean
  updated_at: string | Date | null
}

function toPost(row: DbPost): PublicPost {
  return {
    slug: row.slug, title: row.title, description: row.description,
    date: row.date, category: row.category, readTime: row.read_time,
    content: row.content, updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  }
}

function tableNotYetCreated(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '42P01'
}

export async function getVisiblePosts(): Promise<PublicPost[]> {
  if (!hasDatabase()) return staticPosts
  let rows: DbPost[]
  try {
    const result = await query(
      'SELECT slug, title, description, date, category, read_time, content, published, updated_at FROM posts ORDER BY date DESC'
    )
    rows = result.rows as DbPost[]
  } catch (error) {
    // A freshly attached but not initialized database continues to show the historical public posts.
    // Other failures must not expose an explicitly unpublished static article.
    if (tableNotYetCreated(error)) return staticPosts
    throw error
  }
  const persisted = new Map(rows.map(row => [row.slug, row]))
  const inherited = staticPosts.filter(post => !persisted.has(post.slug))
  const published = rows.filter(row => row.published).map(toPost)
  return [...published, ...inherited].sort((a, b) => b.date.localeCompare(a.date))
}

export async function getVisiblePost(slug: string): Promise<PublicPost | null> {
  if (!hasDatabase()) return getPostBySlug(slug) ?? null
  try {
    const result = await query(
      'SELECT slug, title, description, date, category, read_time, content, published, updated_at FROM posts WHERE slug = $1 LIMIT 1',
      [slug]
    )
    const row = result.rows[0] as DbPost | undefined
    if (row) return row.published ? toPost(row) : null
    return getPostBySlug(slug) ?? null
  } catch (error) {
    if (tableNotYetCreated(error)) return getPostBySlug(slug) ?? null
    throw error
  }
}
