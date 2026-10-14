import { NextRequest, NextResponse } from 'next/server'
import { query, hasDatabase, recordAuditLog } from '@/lib/db'
import { getAuthenticatedUser, unauthorized, sanitizeContentInput } from '@/lib/auth'
import { printables as staticPrintables } from '@/lib/printables'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()

  if (!hasDatabase()) {
    return NextResponse.json({
      printables: staticPrintables.map((p, idx) => ({
        id: idx + 1,
        slug: p.slug,
        title: p.title,
        description: p.description,
        price: p.price,
        pages: p.pages,
        includes: p.includes,
        file_url: `/printables/${p.slug}.pdf`,
        source: 'static',
      })),
      databaseConnected: false,
    })
  }

  try {
    const result = await query('SELECT * FROM printables ORDER BY id')
    return NextResponse.json({ printables: result.rows, databaseConnected: true })
  } catch (error) {
    logger.error('admin.printables.get_failed', 'Unable to load printables', { error })
    return NextResponse.json({ error: 'Unable to load printables' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()
  try {
    const body = await request.json()
    const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
    const title = typeof body.title === 'string' ? sanitizeContentInput(body.title.trim()) : ''
    const description = typeof body.description === 'string' ? sanitizeContentInput(body.description.trim()).slice(0, 400) : ''
    const price = typeof body.price === 'string' && body.price.trim() ? body.price.trim().slice(0, 32) : 'Free'
    const pages = Number.isInteger(Number(body.pages)) && Number(body.pages) >= 1 && Number(body.pages) <= 200 ? Number(body.pages) : 1
    const fileUrl = typeof body.file_url === 'string' && body.file_url.trim() ? body.file_url.trim().slice(0, 200) : `/printables/${slug}.pdf`

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !title) {
      return NextResponse.json({ error: 'Valid slug and title are required' }, { status: 400 })
    }

    let includesArr: string[] = []
    if (Array.isArray(body.includes)) {
      includesArr = body.includes.filter((i: unknown): i is string => typeof i === 'string').map((s) => sanitizeContentInput(s.trim())).filter(Boolean)
    } else if (typeof body.includes === 'string' && body.includes.trim()) {
      try {
        const parsed = JSON.parse(body.includes)
        if (Array.isArray(parsed)) {
          includesArr = parsed.filter((i: unknown): i is string => typeof i === 'string')
        }
      } catch {
        includesArr = body.includes.split(',').map((s: string) => sanitizeContentInput(s.trim())).filter(Boolean)
      }
    }

    const result = await query<{ id: number }>(
      `INSERT INTO printables (slug, title, description, price, pages, includes, file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [slug, title, description, price, pages, includesArr, fileUrl]
    )

    await recordAuditLog(user, 'create_printable', 'printable', String(result.rows[0].id), { slug, pages })
    return NextResponse.json({ success: true, id: result.rows[0].id })
  } catch (error) {
    logger.error('admin.printables.create_failed', 'Unable to create printable', { error })
    return NextResponse.json({ error: 'Unable to create printable' }, { status: 500 })
  }
}