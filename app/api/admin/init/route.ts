import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { initDB, query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

function matchesBootstrapToken(request: NextRequest): boolean {
  const expected = process.env.ADMIN_SETUP_TOKEN
  const actual = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? ''
  if (!expected || expected.length < 32 || !actual) return false
  const a = Buffer.from(actual)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: NextRequest) {
  const authenticated = await verifyToken(request)
  const bootstrap = matchesBootstrapToken(request)
  if (!authenticated && !bootstrap) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (bootstrap) {
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD
    if (!password || password.length < 16) {
      return NextResponse.json({ error: 'Configure a strong ADMIN_BOOTSTRAP_PASSWORD first' }, { status: 503 })
    }
  }

  try {
    await initDB()
    if (bootstrap) {
      const existing = await query('SELECT id FROM admin_users LIMIT 1')
      if (existing.rows.length) {
        return NextResponse.json({ error: 'Administrator already provisioned; use authenticated maintenance' }, { status: 409 })
      }
      const username = process.env.ADMIN_BOOTSTRAP_USERNAME || 'admin'
      if (!/^[a-zA-Z0-9_.-]{3,64}$/.test(username)) {
        return NextResponse.json({ error: 'Invalid bootstrap username' }, { status: 400 })
      }
      const hash = await bcrypt.hash(process.env.ADMIN_BOOTSTRAP_PASSWORD!, 12)
      await query('INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)', [username, hash])
      return NextResponse.json({ initialized: true, adminProvisioned: true })
    }
    return NextResponse.json({ initialized: true })
  } catch {
    return NextResponse.json({ error: 'Database initialization failed' }, { status: 500 })
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405, headers: { Allow: 'POST' } })
}
