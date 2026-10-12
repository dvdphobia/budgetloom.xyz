import { NextResponse } from 'next/server'

// Deprecated legacy API. Never serve raw third-party advertising scripts.
export function GET() {
  return NextResponse.json({ popunder: null, socialbar: null }, { headers: { 'Cache-Control': 'no-store' } })
}
