import { NextRequest, NextResponse } from 'next/server'
import { query, recordAuditLog } from '@/lib/db'
import { getAuthenticatedUser, unauthorized, sanitizeContentInput } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()
  try {
    const result = await query('SELECT * FROM printables WHERE id = $1', [id])
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ printable: result.rows[0] })
  } catch (error) {
    logger.error('admin.printables.get_one_failed', 'Unable to load printable', { error, meta: { id } })
    return NextResponse.json({ error: 'Printable operation failed' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

    const includesArr = Array.isArray(body.includes)
      ? body.includes.filter((i: unknown): i is string => typeof i === 'string').map((s: string) => sanitizeContentInput(s.trim())).filter(Boolean)
      : typeof body.includes === 'string'
      ? body.includes.split(',').map((s: string) => sanitizeContentInput(s.trim())).filter(Boolean)
      : []

    const result = await query(
      `UPDATE printables SET
        slug = $1, title = $2, description = $3, price = $4,
        pages = $5, includes = $6, file_url = $7, updated_at = NOW()
      WHERE id = $8 RETURNING id`,
      [slug, title, description, price, pages, includesArr, fileUrl, id]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await recordAuditLog(user, 'update_printable', 'printable', id, { slug, pages })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('admin.printables.update_failed', 'Unable to update printable', { error, meta: { id } })
    return NextResponse.json({ error: 'Printable operation failed' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthenticatedUser(request)
  if (!user) return unauthorized()
  try {
    const result = await query<{ id: number; slug: string }>('DELETE FROM printables WHERE id = $1 RETURNING id, slug', [id])
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    await recordAuditLog(user, 'delete_printable', 'printable', id, { slug: result.rows[0].slug })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('admin.printables.delete_failed', 'Unable to delete printable', { error, meta: { id } })
    return NextResponse.json({ error: 'Printable operation failed' }, { status: 500 })
  }
}