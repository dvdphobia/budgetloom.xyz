import { Pool } from 'pg'

let pool: Pool | null = null

function getPool(): Pool {
  if (pool) return pool

  // Use pooled connection string (POSTGRES_URL) — not the direct one
  const connectionString = process.env.POSTGRES_URL || 
                          process.env.NEON_POSTGRES_URL ||
                          process.env.DATABASE_URL ||
                          process.env.NEON_DATABASE_URL ||
                          process.env.POSTGRES_PRISMA_URL ||
                          process.env.NEON_POSTGRES_PRISMA_URL ||
                          process.env.POSTGRES_URL_NON_POOLING ||
                          process.env.NEON_POSTGRES_URL_NON_POOLING

  if (!connectionString) {
    throw new Error('No database connection string found. Set POSTGRES_URL in Vercel environment variables.')
  }

  // Fix sslmode parameter for pooled connections
  let url = connectionString
  if (url.includes('sslmode=') && url.includes('?')) {
    // Some Vercel Postgres URLs have sslmode=require which doesn't work with pg
    // when using the pooled connection
  }

  pool = new Pool({
    connectionString: url,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  return pool
}

export async function query(text: string, params?: any[]) {
  const client = getPool()
  const result = await client.query(text, params || [])
  return result
}

// Database initialization
export async function initDB() {
  const db = getPool()

  await db.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      read_time TEXT NOT NULL,
      content TEXT NOT NULL,
      published BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS printables (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price TEXT NOT NULL,
      pages INTEGER NOT NULL,
      includes TEXT[],
      file_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS ad_placements (
      id SERIAL PRIMARY KEY,
      placement TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      ad_code TEXT NOT NULL,
      enabled BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `)

  await db.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `)

  // Insert default ad placements
  const placements = [
    { placement: 'header_banner', label: 'Header Banner (below nav, all pages)' },
    { placement: 'blog_list_top', label: 'Blog List Top (above post grid)' },
    { placement: 'blog_post_top', label: 'Blog Post Top (above article)' },
    { placement: 'blog_post_middle', label: 'Blog Post Middle (mid-article)' },
    { placement: 'blog_post_bottom', label: 'Blog Post Bottom (below article)' },
    { placement: 'sidebar', label: 'Sidebar (blog pages)' },
    { placement: 'printables_top', label: 'Printables Page Top' },
    { placement: 'printables_bottom', label: 'Printables Page Bottom' },
    { placement: 'footer_banner', label: 'Footer Banner (all pages)' },
  ]

  for (const p of placements) {
    await db.query(
      `INSERT INTO ad_placements (placement, label, ad_code, enabled)
       VALUES ($1, $2, '', false)
       ON CONFLICT (placement) DO NOTHING`,
      [p.placement, p.label]
    )
  }

  // Insert default site settings
  const defaults = [
    { key: 'amazon_tracking_id', value: 'budgetloom20-20' },
    { key: 'adsterra_key', value: '' },
    { key: 'adskeeper_widget_id', value: '' },
    { key: 'google_analytics_id', value: 'G-CRZCXM56DQ' },
    { key: 'pinterest_verification', value: '' },
    { key: 'site_name', value: 'BudgetLoom' },
    { key: 'site_url', value: 'https://budgetloom.xyz' },
  ]

  for (const s of defaults) {
    await db.query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [s.key, s.value]
    )
  }

  // Create default admin user if none exists
  const existing = await db.query('SELECT id FROM admin_users LIMIT 1')
  if (existing.rows.length === 0) {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('admin123', 10)
    await db.query(
      `INSERT INTO admin_users (username, password_hash) VALUES ('admin', $1) ON CONFLICT DO NOTHING`,
      [hash]
    )
  }

  return { initialized: true }
}

// Helper: get all settings as key-value object
export async function getSettings(): Promise<Record<string, string>> {
  try {
    const result = await query('SELECT key, value FROM site_settings')
    const settings: Record<string, string> = {}
    for (const row of result.rows as any[]) {
      settings[row.key] = row.value
    }
    return settings
  } catch {
    return {}
  }
}

// Helper: get all ad placements
export async function getAdPlacements() {
  try {
    const result = await query('SELECT * FROM ad_placements ORDER BY id')
    return result.rows as any[]
  } catch {
    return []
  }
}

// Helper: get enabled ad by placement
export async function getAdByPlacement(placement: string) {
  try {
    const result = await query(
      'SELECT ad_code FROM ad_placements WHERE placement = $1 AND enabled = true',
      [placement]
    )
    if (result.rows.length > 0) {
      return (result.rows[0] as any).ad_code
    }
    return null
  } catch {
    return null
  }
}

// Helper: get all posts (list)
export async function getAllPosts() {
  try {
    const result = await query(
      'SELECT id, slug, title, description, date, category, read_time, published, created_at, updated_at FROM posts ORDER BY date DESC'
    )
    return result.rows as any[]
  } catch {
    return []
  }
}

// Helper: get post by slug
export async function getPostBySlugDB(slug: string) {
  try {
    const result = await query('SELECT * FROM posts WHERE slug = $1', [slug])
    return result.rows[0] || null
  } catch {
    return null
  }
}

// Helper: get all printables
export async function getAllPrintables() {
  try {
    const result = await query('SELECT * FROM printables ORDER BY id')
    return result.rows as any[]
  } catch {
    return []
  }
}

// Helper: get printable by slug
export async function getPrintableBySlugDB(slug: string) {
  try {
    const result = await query('SELECT * FROM printables WHERE slug = $1', [slug])
    return result.rows[0] || null
  } catch {
    return null
  }
}
