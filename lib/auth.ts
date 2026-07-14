import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'budgetloom-cms-secret-change-me'

export async function signToken(username: string): Promise<string> {
  return await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(JWT_SECRET))
}

export async function verifyToken(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_token')?.value
  if (!token) return false
  try {
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    return true
  } catch {
    return false
  }
}

export async function unauthorized(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}