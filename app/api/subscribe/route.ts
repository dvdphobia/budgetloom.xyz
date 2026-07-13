import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let body: { email?: string; tag?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = body.email?.trim()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const apiKey = process.env.MAILERLITE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  const groupId = process.env.MAILERLITE_GROUP_ID
  const groups = groupId
    ? groupId.split(',').map(id => id.trim()).filter(Boolean)
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
      return NextResponse.json({ error: message }, { status: res.status })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Network error. Please try again.' }, { status: 502 })
  }
}
