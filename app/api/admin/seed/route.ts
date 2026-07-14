import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import { posts as staticPosts } from '@/lib/posts'
import { printables as staticPrintables } from '@/lib/printables'

export async function POST(request: NextRequest) {
  if (!await verifyToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    let postsCount = 0
    let printablesCount = 0

    for (const post of staticPosts) {
      const existing = await query('SELECT id FROM posts WHERE slug = $1', [post.slug])
      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO posts (slug, title, description, date, category, read_time, content, published)
           VALUES ($1, $2, $3, $4, $5, $6, $7, true)`,
          [post.slug, post.title, post.description, post.date, post.category, post.readTime, post.content]
        )
        postsCount++
      }
    }

    for (const p of staticPrintables) {
      const existing = await query('SELECT id FROM printables WHERE slug = $1', [p.slug])
      if (existing.rows.length === 0) {
        await query(
          `INSERT INTO printables (slug, title, description, price, pages, includes, file_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [p.slug, p.title, p.description, p.price, p.pages, p.includes, '/printables/' + p.slug + '.pdf']
        )
        printablesCount++
      }
    }

    return NextResponse.json({ success: true, postsSeeded: postsCount, printablesSeeded: printablesCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}