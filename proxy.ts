import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const token = request.cookies.get('admin_token')?.value
    const secret = process.env.JWT_SECRET
    if (!token || !secret || secret.length < 32) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    try {
      await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] })
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/dashboard/:path*'] }
