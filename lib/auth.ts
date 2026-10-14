import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'
import { logger } from '@/lib/logger'

// Never sign or accept sessions using a fallback secret.
export function jwtKey(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be a random value of at least 32 characters')
  }
  return new TextEncoder().encode(secret)
}

export async function signToken(username: string): Promise<string> {
  return new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(jwtKey())
}

export function isSameOriginMutation(request: NextRequest): boolean {
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') {
    return true
  }
  const origin = request.headers.get('origin')
  if (origin && origin !== request.nextUrl.origin) {
    logger.security('auth.csrf.origin_mismatch', 'Blocked cross-origin state-changing request', {
      route: request.nextUrl.pathname,
      meta: { origin, expectedOrigin: request.nextUrl.origin },
    })
    return false
  }
  return true
}

export async function getAuthenticatedUser(request: NextRequest): Promise<string | null> {
  if (!isSameOriginMutation(request)) return null
  const token = request.cookies.get('admin_token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, jwtKey(), { algorithms: ['HS256'] })
    return typeof payload.username === 'string' && payload.username.length > 0 ? payload.username : 'admin'
  } catch {
    return null
  }
}

export async function verifyToken(request: NextRequest): Promise<boolean> {
  const user = await getAuthenticatedUser(request)
  return user !== null
}

export function unauthorized(message = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 })
}

// Sliding-window rate limiter for brute-force & abuse protection
interface RateBucket {
  timestamps: number[]
}

const rateBuckets = new Map<string, RateBucket>()

export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim().slice(0, 64)
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim().slice(0, 64)
  }
  return 'local-client'
}

export function checkRateLimit(
  bucketKey: string,
  maxAttempts: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now()
  const cutoff = now - windowMs
  const existing = rateBuckets.get(bucketKey) ?? { timestamps: [] }
  existing.timestamps = existing.timestamps.filter((t) => t > cutoff)

  if (existing.timestamps.length >= maxAttempts) {
    const oldest = existing.timestamps[0] ?? now
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000))
    rateBuckets.set(bucketKey, existing)
    return { allowed: false, remaining: 0, retryAfterSeconds }
  }

  existing.timestamps.push(now)
  rateBuckets.set(bucketKey, existing)
  if (rateBuckets.size > 5000) {
    // Prune stale buckets
    for (const [k, v] of rateBuckets.entries()) {
      if (v.timestamps.every((t) => t <= cutoff)) rateBuckets.delete(k)
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxAttempts - existing.timestamps.length),
    retryAfterSeconds: 0,
  }
}

export function resetRateLimitsForTesting(): void {
  rateBuckets.clear()
}

// Sanitize CMS Markdown/HTML content to strip active script execution vectors
export function sanitizeContentInput(raw: string): string {
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '')
}
