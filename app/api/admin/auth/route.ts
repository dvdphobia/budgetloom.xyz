import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'
import { initDB } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    // Auto-init DB if tables don't exist yet
    try {
      await initDB()
    } catch {
      // If init fails, the database might not be connected yet
      return NextResponse.json({ 
        error: 'Database not connected. Go to Vercel Dashboard > Storage > Create Postgres database, connect it to this project, then visit /api/admin/init to initialize.' 
      }, { status: 503 })
    }

    const result = await sql`
      SELECT id, username, password_hash FROM admin_users WHERE username = ${username};
    `

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
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Database not connected. Make sure Vercel Postgres is enabled. Visit /api/admin/init to initialize tables.' 
    }, { status: 503 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('admin_token')
  return response
}