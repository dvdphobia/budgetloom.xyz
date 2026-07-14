import { sql } from '@vercel/postgres'

export { sql }

// Database initialization — call this on first deploy or manually hit /api/admin/init
export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `

  await sql`
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
  `

  await sql`
    CREATE TABLE IF NOT EXISTS printables (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price TEXT NOT NULL,
      pages INTEGER NOT NULL,
      includes TEXT[] NOT NULL,
      file_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS ad_placements (
      id SERIAL PRIMARY KEY,
      placement TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      ad_code TEXT NOT NULL,
      enabled BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `

  // Insert default ad placements if they don't exist
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
    await sql`
      INSERT INTO ad_placements (placement, label, ad_code, enabled)
      VALUES (${p.placement}, ${p.label}, '', false)
      ON CONFLICT (placement) DO NOTHING;
    `
  }

  // Insert default site settings if they don't exist
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
    await sql`
      INSERT INTO site_settings (key, value)
      VALUES (${s.key}, ${s.value})
      ON CONFLICT (key) DO NOTHING;
    `
  }

  // Create default admin user if none exists (username: admin, password: admin123)
  const existing = await sql`SELECT id FROM admin_users LIMIT 1;`
  if (existing.rows.length === 0) {
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('admin123', 10)
    await sql`
      INSERT INTO admin_users (username, password_hash)
      VALUES ('admin', ${hash})
      ON CONFLICT DO NOTHING;
    `
  }

  return { initialized: true }
}

// Helper: get all settings as key-value object
export async function getSettings(): Promise<Record<string, string>> {
  try {
    const result = await sql`SELECT key, value FROM site_settings;`
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
    const result = await sql`SELECT * FROM ad_placements ORDER BY id;`
    return result.rows as any[]
  } catch {
    return []
  }
}

// Helper: get enabled ad by placement
export async function getAdByPlacement(placement: string) {
  try {
    const result = await sql`
      SELECT ad_code FROM ad_placements WHERE placement = ${placement} AND enabled = true;
    `
    if (result.rows.length > 0) {
      return (result.rows[0] as any).ad_code
    }
    return null
  } catch {
    return null
  }
}

// Helper: get all posts
export async function getAllPosts() {
  try {
    const result = await sql`
      SELECT id, slug, title, description, date, category, read_time, published, created_at, updated_at
      FROM posts ORDER BY date DESC;
    `
    return result.rows as any[]
  } catch {
    return []
  }
}

// Helper: get post by slug
export async function getPostBySlugDB(slug: string) {
  try {
    const result = await sql`SELECT * FROM posts WHERE slug = ${slug};`
    return result.rows[0] || null
  } catch {
    return null
  }
}

// Helper: get all printables
export async function getAllPrintables() {
  try {
    const result = await sql`SELECT * FROM printables ORDER BY id;`
    return result.rows as any[]
  } catch {
    return []
  }
}

// Helper: get printable by slug
export async function getPrintableBySlugDB(slug: string) {
  try {
    const result = await sql`SELECT * FROM printables WHERE slug = ${slug};`
    return result.rows[0] || null
  } catch {
    return null
  }
}