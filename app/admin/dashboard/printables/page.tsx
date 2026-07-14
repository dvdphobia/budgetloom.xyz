'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'

export default function PrintablesList() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/printables').then(r => r.json()).then(d => { setItems(d.printables || []); setLoading(false) })
  }, [])

  async function del(id: number) {
    if (!confirm('Delete this printable?')) return
    await fetch(`/api/admin/printables/${id}`, { method: 'DELETE' })
    setItems(items.filter(p => p.id !== id))
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Printables ({items.length})</h2>
        <Button asChild variant="secondary">
          <Link href="/admin/dashboard/printables/new"><Plus className="h-4 w-4 mr-2" />New Printable</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(p => (
          <Card key={p.id}>
            <CardContent className="pt-6 space-y-3">
              <div>
                <div className="font-semibold">{p.title}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">{p.description}</div>
              </div>
              <div className="flex gap-2">
                <Badge variant="success">{p.price}</Badge>
                <Badge variant="secondary">{p.pages} pages</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/dashboard/printables/edit?id=${p.id}`}><Pencil className="h-4 w-4 mr-1" />Edit</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => del(p.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-1" />Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}