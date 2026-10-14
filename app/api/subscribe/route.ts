import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { checkRateLimit, getClientIdentifier } from '@/lib/auth'
import { hasDatabase, query } from '@/lib/db'
import { logger } from '@/lib/logger'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request)
  const rate = checkRateLimit(`subscribe:${clientId}`, 5, 10 * 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many signup requests. Please wait a few minutes and try again.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    )
  }

  let body: { email?: string; tag?: string; company_website?: string; consent?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Honeypot spam trap: silently succeed if automated bot fills hidden field
  if (typeof body.company_website === 'string' && body.company_website.trim().length > 0) {
    return NextResponse.json({ ok: true, mode: 'filtered' })
  }

  const email = body.email?.trim().toLowerCase()
  if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const tag = typeof body.tag === 'string' && body.tag.trim() ? body.tag.trim().slice(0, 80) : 'budget tips'
  const emailHash = createHash('sha256').update(email).digest('hex')

  // Record anonymized subscription intent in database when available
  if (hasDatabase()) {
    try {
      await query(
        `INSERT INTO newsletter_subscribers (email_hash, tag, synced_to_provider)
         VALUES ($1, $2, false)
         ON CONFLICT (email_hash) DO NOTHING`,
        [emailHash, tag]
      )
    } catch {
      // Non-fatal if table not yet migrated
    }
  }

  const apiKey = process.env.MAILERLITE_API_KEY
  if (!apiKey) {
    // Gracefully acknowledge without falsely claiming an email was sent when MailerLite is unconfigured
    logger.info('subscribe.unconfigured_provider', 'Newsletter signup received while MAILERLITE_API_KEY is not set', {
      route: '/api/subscribe',
      meta: { tag },
    })
    return NextResponse.json({
      ok: true,
      mode: 'direct_access',
      message: 'You have instant access to all free printables in our library.',
    })
  }

  const groupId = process.env.MAILERLITE_GROUP_ID
  const groups = groupId
    ? groupId
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    : undefined

  try {
    const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        ...(groups && groups.length ? { groups } : {}),
      }),
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => null)
      const message = errBody?.message || 'Subscription failed. Please try again.'
      logger.warn('subscribe.provider_rejected', 'MailerLite API returned non-OK response', {
        route: '/api/subscribe',
        meta: { status: res.status },
      })
      return NextResponse.json({ error: message }, { status: res.status })
    }

    if (hasDatabase()) {
      try {
        await query('UPDATE newsletter_subscribers SET synced_to_provider = true WHERE email_hash = $1', [emailHash])
      } catch {
        // Ignore non-fatal update failure
      }
    }

    return NextResponse.json({
      ok: true,
      mode: 'subscribed',
      message: 'You are subscribed! Check your inbox for updates.',
    })
  } catch (error) {
    logger.error('subscribe.network_error', 'MailerLite request failed', {
      route: '/api/subscribe',
      error,
    })
    return NextResponse.json({ error: 'Network error. Please try again.' }, { status: 502 })
  }
}
