import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

// Never sign or accept sessions using a fallback secret.
export function jwtKey(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be a random value of at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

export async function signToken(username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(jwtKey())
}

export async function verifyToken(request: NextRequest): Promise<boolean> {
  const origin = request.headers.get('origin')
  if (request.method !== 'GET' && request.method !== 'HEAD' && origin && origin !== request.nextUrl.origin) return false
  const token = request.cookies.get('admin_token')?.value
  if (!token) return false
  try {
    await jwtVerify(token, jwtKey(), { algorithms: ['HS256'] })
    return true
  } catch {
    return false
  }
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
