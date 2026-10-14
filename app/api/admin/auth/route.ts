import { NextRequest, NextResponse } from 'next/server'
import { query, recordAuditLog } from '@/lib/db'
import bcrypt from 'bcryptjs'
import {
  signToken,
  getAuthenticatedUser,
  checkRateLimit,
  getClientIdentifier,
  isSameOriginMutation,
} from '@/lib/auth'
import { logger } from '@/lib/logger'

// GET /api/admin/auth — Verify active admin session cookie without mutating state.
export async function GET(request: NextRequest) {
  try {
    const username = await getAuthenticatedUser(request)
    if (!username) {
      return NextResponse.json({ authenticated: false, error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { authenticated: true, username },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    logger.error('admin.auth.session_check_error', 'Failed to verify admin session', {
      route: '/api/admin/auth',
      error,
    })
    return NextResponse.json({ authenticated: false, error: 'Unauthorized' }, { status: 401 })
  }
}

// POST /api/admin/auth — Authenticate administrator credentials and issue httpOnly JWT cookie.
export async function POST(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }

  const clientId = getClientIdentifier(request)
  const rate = checkRateLimit(`admin-login:${clientId}`, 8, 15 * 60 * 1000)
  if (!rate.allowed) {
    logger.security('admin.auth.rate_limited', 'Blocked excessive admin login attempts', {
      route: '/api/admin/auth',
      meta: { retryAfterSeconds: rate.retryAfterSeconds },
    })
    return NextResponse.json(
      { error: 'Too many login attempts. Please wait before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rate.retryAfterSeconds) },
      }
    )
  }

  try {
    const body = await request.json().catch(() => null)
    const username = body?.username
    const password = body?.password

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password ||
      username.length > 100 ||
      password.length > 512
    ) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Legacy documented default credentials are permanently rejected.
    if (username.trim() === 'admin' && password === 'admin123') {
      logger.security('admin.auth.default_credential_blocked', 'Rejected legacy default admin credential attempt', {
        route: '/api/admin/auth',
      })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const result = await query<{ id: number; username: string; password_hash: string }>(
      'SELECT id, username, password_hash FROM admin_users WHERE username = $1 LIMIT 1',
      [username.trim()]
    )

    if (result.rows.length !== 1 || !(await bcrypt.compare(password, result.rows[0].password_hash))) {
      logger.security('admin.auth.login_failed', 'Invalid administrator username or password', {
        route: '/api/admin/auth',
        meta: { attemptedUsername: username.trim().slice(0, 32) },
      })
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const validUsername = result.rows[0].username
    const token = await signToken(validUsername)
    await recordAuditLog(validUsername, 'login', 'admin_session', String(result.rows[0].id))

    const response = NextResponse.json({ success: true, authenticated: true, username: validUsername })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    return response
  } catch (error) {
    logger.error('admin.auth.login_exception', 'Authentication service encountered an error', {
      route: '/api/admin/auth',
      error,
    })
    return NextResponse.json({ error: 'Authentication temporarily unavailable' }, { status: 503 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 })
  }
  const user = await getAuthenticatedUser(request)
  if (user) {
    await recordAuditLog(user, 'logout', 'admin_session')
  }
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_token')
  return response
}
