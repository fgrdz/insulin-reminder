import { notFound } from 'next/navigation'
import { GetItemCommand } from '@aws-sdk/client-dynamodb'
import { dynamoDBClient, marshall, unmarshall, TABLE_NAME } from '@/lib/dynamodb'
import { LembreteSchema, type Frequencia, type Status } from '@/lib/schemas'
import { CancelButton } from './cancel-button'
import { BadgeCheck } from 'lucide-react'
import { VariantProps } from 'class-variance-authority'
import { Badge, badgeVariants } from '@/components/ui/badge'

type Props = { params: Promise<{ id: string }> }
type BadgeVariant = VariantProps<typeof badgeVariants>['variant']

const frequenciaLabel: Record<Frequencia, string> = {
  diaria: 'Diária',
  '2x_dia': '2× ao dia',
  '3x_dia': '3× ao dia',
  semanal: 'Semanal',
}

const statusLabel: Record<Status, string> = {
  agendado: 'Agendado',
  pausado: 'Pausado',
  cancelado: 'Cancelado',
}
const statusVariant: Record<Status, BadgeVariant> = {
  agendado: 'default',
  pausado: 'outline',
  cancelado: 'destructive',
}

export default async function LembretePage({ params }: Props) {
  const { id } = await params

  const result = await dynamoDBClient.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ id }),
  }))

  if (!result.Item) notFound()

  const lembrete = LembreteSchema.parse(unmarshall(result.Item))

  return (
    <main className="flex min-h-screen justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {lembrete.nome} {lembrete.sobrenome}
            </h1>
            <p className="text-sm text-muted-foreground">{lembrete.telefone}</p>
          </div>
          <Badge variant={statusVariant[lembrete.status]}>
            <BadgeCheck />
            {statusLabel[lembrete.status]}
          </Badge>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-3">
          <Row label="Horário" value={lembrete.horario} />
          <Row label="Dose" value={`${lembrete.dose} UI`} />
          <Row label="Frequência" value={frequenciaLabel[lembrete.frequencia]} />
        </div>

        {lembrete.status !== 'cancelado' && (
          <CancelButton id={lembrete.id} />
        )}
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
