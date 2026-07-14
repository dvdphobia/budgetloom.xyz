import { NextRequest, NextResponse } from 'next/server'
import { query, initDB } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    // Auto-init DB if tables don't exist yet
    try {
      await initDB()
    } catch (e: any) {
      return NextResponse.json({
        error: `Database error: ${e.message}. Make sure Vercel Postgres is connected to this project.`
      }, { status: 503 })
    }

    const result = await query(
      'SELECT id, username, password_hash FROM admin_users WHERE username = $1',
      [username]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = result.rows[0] as any
    const valid = await bcrypt.compare(password, user.password_hash)

    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await signToken(user.username)

    const response = NextResponse.json({ success: true, username: user.username })
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error: any) {
    return NextResponse.json({
      error: `Database not connected: ${error.message}`
    }, { status: 503 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_token')
  return response
}