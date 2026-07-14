import { NextRequest, NextResponse } from 'next/server'
import { initDB } from '@/lib/db'

// Public route — no auth required (chicken-and-egg: need DB before you can login)
export async function POST(request: NextRequest) {
  try {
    const result = await initDB()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET also inits — so user can just visit /api/admin/init in browser
export async function GET(request: NextRequest) {
  try {
    const result = await initDB()
    return NextResponse.json({ ...result, message: 'Database initialized. You can now login with admin / admin123' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}