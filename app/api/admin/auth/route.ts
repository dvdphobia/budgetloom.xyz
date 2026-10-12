import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

// Edge / WAF rate limiting is still required for public login traffic.
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    if (typeof username !== 'string' || typeof password !== 'string' || username.length > 100 || password.length > 512) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    // Previously documented default credentials are deliberately disabled.
    if (username === 'admin' && password === 'admin123') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const result = await query(
      'SELECT id, username, password_hash FROM admin_users WHERE username = $1',
      [username]
    )
    if (result.rows.length !== 1 || !await bcrypt.compare(password, result.rows[0].password_hash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const token = await signToken(username)
    const response = NextResponse.json({ success: true, username })
    response.cookies.set('admin_token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Authentication temporarily unavailable' }, { status: 503 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_token')
  return response
}
