import { Pool, type PoolClient, type QueryResult } from 'pg'
import { logger } from '@/lib/logger'

declare global {
  // eslint-disable-next-line no-var
  var __budgetloomPgPool: Pool | undefined
}

export function getDatabaseConnectionString(): string | undefined {
  return (
    process.env.POSTGRES_URL ||
    process.env.NEON_POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.NEON_POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.NEON_POSTGRES_URL_NON_POOLING
  )
}

export function hasDatabase(): boolean {
  return Boolean(getDatabaseConnectionString())
}

export interface NormalizedDbConfig {
  connectionString: string
  ssl?: {
    rejectUnauthorized: boolean
    minVersion: 'TLSv1.2'
    servername?: string
  }
}

/**
 * Validates and normalizes a PostgreSQL connection URL so that:
 * 1. Production connections strictly enforce TLS certificate & hostname verification (`verify-full`).
 * 2. Weak or disabled SSL parameters (`disable`, `allow`, `no-verify`, `ssl=false`, `ssl=0`) are rejected in production.
 * 3. `pg-connection-string` does not emit deprecation warnings for `prefer`, `require`, or `verify-ca`
 *    and does not clobber the explicit `Pool` TLS configuration.
 * 4. Database credentials are never included in thrown error messages.
 */
export function normalizeDatabaseConfig(
  rawConnectionString: string,
  nodeEnv: string = process.env.NODE_ENV || 'development'
): NormalizedDbConfig {
  let url: URL
  try {
    url = new URL(rawConnectionString)
  } catch {
    throw new Error('Invalid PostgreSQL connection URL format.')
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('Unsupported database protocol. Expected postgres:// or postgresql://.')
  }

  const sslMode = url.searchParams.get('sslmode')?.toLowerCase()
  const sslParam = url.searchParams.get('ssl')?.toLowerCase()
  const isProd = nodeEnv === 'production'
  const isLocalHost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'

  if (
    isProd &&
    (['disable', 'allow', 'no-verify'].includes(sslMode || '') ||
      ['0', 'false'].includes(sslParam || ''))
  ) {
    throw new Error('Insecure PostgreSQL SSL configuration: TLS verification is mandatory in production.')
  }

  // Upgrade legacy libpq modes ('require', 'prefer', 'verify-ca') to explicit 'verify-full'
  // so both pg v8 and v9 enforce full CA + hostname validation without emitting warnings.
  if (sslMode === 'require' || sslMode === 'prefer' || sslMode === 'verify-ca') {
    url.searchParams.set('sslmode', 'verify-full')
  } else if (isProd && !sslMode && !isLocalHost) {
    url.searchParams.set('sslmode', 'verify-full')
  }

  const effectiveSslMode = url.searchParams.get('sslmode')?.toLowerCase()
  const requireTls = isProd || effectiveSslMode === 'verify-full' || sslParam === 'true' || sslParam === '1'

  return {
    connectionString: url.toString(),
    ssl: requireTls
      ? {
          rejectUnauthorized: true,
          minVersion: 'TLSv1.2',
          servername: url.hostname || undefined,
        }
      : undefined,
  }
}

function getPool(): Pool {
  if (globalThis.__budgetloomPgPool) {
    return globalThis.__budgetloomPgPool
  }

  const rawConnectionString = getDatabaseConnectionString()
  if (!rawConnectionString) {
    throw new Error('No database connection string found. Set POSTGRES_URL in environment variables.')
  }

  const normalized = normalizeDatabaseConfig(rawConnectionString, process.env.NODE_ENV)

  const createdPool = new Pool({
    connectionString: normalized.connectionString,
    ssl: normalized.ssl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000,
  })

  // Prevent unhandled idle client errors (e.g. serverless scale-to-zero disconnects) from crashing Node.
  createdPool.on('error', (err) => {
    logger.error('db.pool.idle_client_error', 'Unexpected error on idle PostgreSQL client', { error: err })
  })

  globalThis.__budgetloomPgPool = createdPool
  return createdPool
}

export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const client = getPool()
  try {
    return await client.query<T>(text, params || [])
  } catch (error) {
    logger.error('db.query.failed', 'Database query execution failed', {
      error,
      meta: { queryPrefix: text.trim().slice(0, 80) },
    })
    throw error
  }
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch (rollbackError) {
      logger.error('db.tx.rollback_failed', 'Transaction rollback failed', { error: rollbackError })
    }
    throw error
  } finally {
    client.release()
  }
}

export interface MigrationDefinition {
  version: number
  name: string
  statements: string[]
}

export const MIGRATIONS: MigrationDefinition[] = [
  {
    version: 1,
    name: '001_core_tables',
    statements: [
      `CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        read_time TEXT NOT NULL,
        content TEXT NOT NULL,
        published BOOLEAN NOT NULL DEFAULT false,
        archived BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS printables (
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
      );`,
      `CREATE TABLE IF NOT EXISTS ad_placements (
        id SERIAL PRIMARY KEY,
        placement TEXT UNIQUE NOT NULL,
        label TEXT NOT NULL,
        ad_code TEXT NOT NULL,
        enabled BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );`,
    ],
  },
  {
    version: 2,
    name: '002_cms_lifecycle_and_seo_columns',
    statements: [
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS archived BOOLEAN NOT NULL DEFAULT false;`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS seo_title TEXT NOT NULL DEFAULT '';`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt TEXT NOT NULL DEFAULT '';`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS topic_cluster TEXT NOT NULL DEFAULT 'Budget Systems';`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT 'BudgetLoom Editorial Team';`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS reviewer TEXT NOT NULL DEFAULT '';`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image TEXT NOT NULL DEFAULT '';`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS featured_image_alt TEXT NOT NULL DEFAULT '';`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS sources JSONB NOT NULL DEFAULT '[]'::jsonb;`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS related_slugs TEXT[] NOT NULL DEFAULT '{}';`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS related_tools TEXT[] NOT NULL DEFAULT '{}';`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS related_printables TEXT[] NOT NULL DEFAULT '{}';`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS canonical_url TEXT NOT NULL DEFAULT '';`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP NULL;`,
      `ALTER TABLE posts ADD COLUMN IF NOT EXISTS published_at TIMESTAMP NULL;`,
      `UPDATE posts SET status = CASE WHEN archived = true THEN 'archived' WHEN published = true THEN 'published' ELSE 'draft' END WHERE status = 'draft' AND (published = true OR archived = true);`,
    ],
  },
  {
    version: 3,
    name: '003_audit_logs_redirects_and_subscribers',
    statements: [
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        details JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS slug_redirects (
        id SERIAL PRIMARY KEY,
        from_slug TEXT UNIQUE NOT NULL,
        to_slug TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email_hash TEXT UNIQUE NOT NULL,
        tag TEXT NOT NULL DEFAULT 'budget tips',
        synced_to_provider BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );`,
      `CREATE TABLE IF NOT EXISTS download_events (
        id SERIAL PRIMARY KEY,
        resource_slug TEXT NOT NULL,
        resource_type TEXT NOT NULL DEFAULT 'printable',
        created_at TIMESTAMP DEFAULT NOW()
      );`,
    ],
  },
]

// Versioned, transactional migrations. A transaction-scoped advisory lock prevents
// concurrent first-boot deployments from applying the same migration at once.
// Never rerun recorded migrations on ordinary CMS writes.
export async function initDB() {
  const appliedVersions = await withTransaction(async (client) => {
    // A project-specific advisory key, held only until COMMIT/ROLLBACK.
    await client.query('SELECT pg_advisory_xact_lock($1)', [46092371])
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
    const prior = await client.query<{ version: number }>(
      'SELECT version FROM schema_migrations ORDER BY version ASC'
    )
    const recorded = new Set(prior.rows.map((row) => row.version))

    for (const migration of MIGRATIONS) {
      if (recorded.has(migration.version)) continue
      for (const statement of migration.statements) {
        await client.query(statement)
      }
      await client.query(
        'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
        [migration.version, migration.name]
      )
      recorded.add(migration.version)
    }

    // Seed non-intrusive defaults on both fresh and legacy databases.
    const placements = [
      { placement: 'header_banner', label: 'Disabled legacy site-wide placement' },
      { placement: 'blog_list_top', label: 'Blog List Top (above post grid)' },
      { placement: 'blog_post_top', label: 'Blog Post Top (above article)' },
      { placement: 'blog_post_middle', label: 'Blog Post Middle (mid-article)' },
      { placement: 'blog_post_bottom', label: 'Blog Post Bottom (below article)' },
      { placement: 'sidebar', label: 'Sidebar (blog pages)' },
      { placement: 'printables_top', label: 'Printables Page Top' },
      { placement: 'printables_bottom', label: 'Printables Page Bottom' },
      { placement: 'calculator_bottom', label: 'Calculator Page Bottom (below results)' },
      { placement: 'footer_banner', label: 'Disabled legacy site-wide placement' },
    ]
    for (const placement of placements) {
      await client.query(
        `INSERT INTO ad_placements (placement, label, ad_code, enabled)
         VALUES ($1, $2, '', false)
         ON CONFLICT (placement) DO NOTHING`,
        [placement.placement, placement.label]
      )
    }
    await client.query(
      "UPDATE ad_placements SET enabled = false WHERE placement IN ('header_banner', 'footer_banner')"
    )

    const defaults = [
      { key: 'amazon_tracking_id', value: 'budgetloom20-20' },
      { key: 'adsterra_key', value: '' },
      { key: 'adskeeper_widget_id', value: '' },
      { key: 'google_analytics_id', value: 'G-CRZCXM56DQ' },
      { key: 'pinterest_verification', value: '' },
      { key: 'site_name', value: 'BudgetLoom' },
      { key: 'site_url', value: 'https://budgetloom.xyz' },
    ]
    for (const setting of defaults) {
      await client.query(
        'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
        [setting.key, setting.value]
      )
    }
    return [...recorded]
  })

  logger.info('db.init.completed', 'Database migrations verified', {
    meta: { appliedVersions: appliedVersions.join(',') },
  })
  return { initialized: true, schemaVersion: MIGRATIONS[MIGRATIONS.length - 1].version }
}

export async function recordAuditLog(
  actor: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  if (!hasDatabase()) return
  try {
    await query(
      `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details)
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [actor, action, entityType, entityId ?? null, JSON.stringify(details ?? {})]
    )
  } catch (error) {
    logger.warn('db.audit_log.skipped', 'Could not write to audit_logs table', { error })
  }
}

export async function getAuditLogs(limit = 50) {
  if (!hasDatabase()) return []
  try {
    const result = await query(
      'SELECT id, actor, action, entity_type, entity_id, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT $1',
      [Math.min(200, Math.max(1, limit))]
    )
    return result.rows
  } catch {
    return []
  }
}

// Helper: get all settings as key-value object
export async function getSettings(): Promise<Record<string, string>> {
  if (!hasDatabase()) return {}
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
  if (!hasDatabase()) return []
  try {
    const result = await query('SELECT * FROM ad_placements ORDER BY id')
    return result.rows as any[]
  } catch {
    return []
  }
}

// Helper: get enabled ad by placement
export async function getAdByPlacement(placement: string) {
  if (!hasDatabase()) return null
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

// Helper: get all posts (list) with fallback if legacy schema lacks newer columns
export async function getAllPosts() {
  if (!hasDatabase()) return []
  try {
    const result = await query(
      `SELECT id, slug, title, description, date, category, read_time, published, archived,
              COALESCE(status, CASE WHEN archived THEN 'archived' WHEN published THEN 'published' ELSE 'draft' END) AS status,
              COALESCE(topic_cluster, category) AS topic_cluster,
              created_at, updated_at
       FROM posts
       WHERE archived = false
       ORDER BY date DESC`
    )
    return result.rows as any[]
  } catch (error: any) {
    if (error?.code === '42703') {
      try {
        const fallback = await query(
          'SELECT id, slug, title, description, date, category, read_time, published, created_at, updated_at FROM posts ORDER BY date DESC'
        )
        return fallback.rows.map((r: any) => ({
          ...r,
          archived: false,
          status: r.published ? 'published' : 'draft',
          topic_cluster: r.category,
        }))
      } catch {
        return []
      }
    }
    return []
  }
}

// Helper: get post by slug
export async function getPostBySlugDB(slug: string) {
  if (!hasDatabase()) return null
  try {
    const result = await query('SELECT * FROM posts WHERE slug = $1', [slug])
    return result.rows[0] || null
  } catch {
    return null
  }
}

// Helper: get all printables
export async function getAllPrintables() {
  if (!hasDatabase()) return []
  try {
    const result = await query('SELECT * FROM printables ORDER BY id')
    return result.rows as any[]
  } catch {
    return []
  }
}

// Helper: get printable by slug
export async function getPrintableBySlugDB(slug: string) {
  if (!hasDatabase()) return null
  try {
    const result = await query('SELECT * FROM printables WHERE slug = $1', [slug])
    return result.rows[0] || null
  } catch {
    return null
  }
}
