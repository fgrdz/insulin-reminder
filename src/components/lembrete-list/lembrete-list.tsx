'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import LembreteCard from '../lembrete-card/lembrete-card'
import { Button } from '../ui/button'
import type { Lembrete } from '@/lib/schemas'
import { Trash2 } from 'lucide-react'

interface LembreteListProps {
  lembretes: Lembrete[]
}

export default function LembreteList({ lembretes }: LembreteListProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const allSelected = lembretes.length > 0 && selectedIds.length === lembretes.length

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedIds.length > 0 && selectedIds.length < lembretes.length
    }
  }, [selectedIds, lembretes.length])

  function handleToggleAll() {
    setSelectedIds(allSelected ? [] : lembretes.map((l) => l.id))
  }

  function handleToggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  async function handleDelete() {
    if (selectedIds.length === 0) return
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch('/api/lembretes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (!res.ok) throw new Error('Erro ao excluir lembretes')

      setSelectedIds([])
      router.refresh()
    } catch {
      setDeleteError('Não foi possível excluir. Tente novamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between my-2 h-6">
        <label className="flex items-center gap-1.5 cursor-pointer select-none text-sm font-medium">
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={allSelected}
            onChange={handleToggleAll}
            disabled={isDeleting}
          />
          Selecionar tudo
        </label>

        {selectedIds.length > 0 && (
          <Button
            className="text-sm"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            Excluir ({selectedIds.length})
            <Trash2 />
          </Button>
        )}
      </div>

      {deleteError && (
        <p className="text-sm text-destructive mb-2">{deleteError}</p>
      )}

      <ul className="mt-2 flex flex-col gap-2">
        {lembretes.map((lembrete) => (
          <li key={lembrete.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.includes(lembrete.id)}
              onChange={() => handleToggle(lembrete.id)}
              disabled={isDeleting}
            />
            <LembreteCard lembrete={lembrete} />
          </li>
        ))}
      </ul>
    </div>
  )
}
