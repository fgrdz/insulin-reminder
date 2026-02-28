'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function CancelButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    if (!confirm('Tem certeza que deseja cancelar este lembrete?')) return

    setLoading(true)
    await fetch(`/api/lembretes/${id}`, { method: 'DELETE' })
    router.push('/lembretes/novo')
  }

  return (
    <Button variant="destructive" disabled={loading} onClick={handleCancel}>
      {loading ? 'Cancelando...' : 'Cancelar lembrete'}
    </Button>
  )
}
