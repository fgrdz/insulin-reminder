import Link from 'next/link'
import type { Lembrete, Frequencia, Status } from '@/lib/schemas'
import { Badge, type badgeVariants } from '@/components/ui/badge'
import type { VariantProps } from 'class-variance-authority'
import { BadgeCheck } from 'lucide-react'

type BadgeVariant = VariantProps<typeof badgeVariants>['variant']

const frequenciaLabel: Record<Frequencia, string> = {
  diaria: 'Diária',
  '2x_dia': '2× ao dia',
  '3x_dia': '3× ao dia',
  semanal: 'Semanal',
}

const statusVariant: Record<Status, BadgeVariant> = {
  agendado: 'default',
  pausado: 'secondary',
  cancelado: 'destructive',
}

const statusLabel: Record<Status, string> = {
  agendado: 'Agendado',
  pausado: 'Pausado',
  cancelado: 'Cancelado',
}

interface LembreteCardProps {
  lembrete: Lembrete
}

export default function LembreteCard({ lembrete }: LembreteCardProps) {
  return (
    <Link href={`/lembretes/${lembrete.id}`} className="block rounded-lg border bg-card p-4 hover:bg-accent transition-colors w-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{lembrete.nome} {lembrete.sobrenome}</p>
          <p className="text-sm text-muted-foreground">
            {lembrete.horario} · {lembrete.dose} UI · {frequenciaLabel[lembrete.frequencia]}
          </p>
        </div>
        <Badge variant={statusVariant[lembrete.status]}>
          <BadgeCheck />
          {statusLabel[lembrete.status]}
        </Badge>
      </div>
    </Link>
  )
}
