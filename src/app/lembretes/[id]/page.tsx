import { notFound } from 'next/navigation'
import { GetItemCommand } from '@aws-sdk/client-dynamodb'
import { dynamoDBClient, marshall, unmarshall, TABLE_NAME } from '@/lib/dynamodb'
import { LembreteSchema, type Frequencia, type Status } from '@/lib/schemas'
import { CancelButton } from './cancel-button'

type Props = { params: Promise<{ id: string }> }

const frequenciaLabel: Record<Frequencia, string> = {
  diaria: 'Diária',
  '2x_dia': '2× ao dia',
  '3x_dia': '3× ao dia',
  semanal: 'Semanal',
}

const statusStyle: Record<Status, string> = {
  agendado: 'bg-green-100 text-green-800',
  pausado: 'bg-yellow-100 text-yellow-800',
  cancelado: 'bg-red-100 text-red-800',
}

const statusLabel: Record<Status, string> = {
  agendado: 'Agendado',
  pausado: 'Pausado',
  cancelado: 'Cancelado',
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
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {lembrete.nome} {lembrete.sobrenome}
            </h1>
            <p className="text-sm text-muted-foreground">{lembrete.telefone}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle[lembrete.status]}`}>
            {statusLabel[lembrete.status]}
          </span>
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
