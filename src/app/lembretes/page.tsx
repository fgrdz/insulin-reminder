import Link from 'next/link'
import { QueryCommand } from '@aws-sdk/client-dynamodb'
import { dynamoDBClient, unmarshall, TABLE_NAME } from '@/lib/dynamodb'
import { LembreteSchema } from '@/lib/schemas'
import { auth } from '@/auth'
import LembreteList from '@/components/lembrete-list/lembrete-list'

export default async function LembretesPage() {
  const session = await auth()
  const userId = session?.user?.id ?? ''

  const result = await dynamoDBClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :uid',
    ExpressionAttributeValues: {
      ':uid': { S: userId },
    },
  }))

  const lembretes = (result.Items ?? [])
    .map((item) => LembreteSchema.safeParse(unmarshall(item)))
    .filter((r) => r.success)
    .map((r) => r.data)

  return (
    <main className="flex min-h-screen justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Meus lembretes</h1>
          <Link
            href="/lembretes/novo"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          >
            Novo
          </Link>
        </div>
        
        {lembretes.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center space-y-2">
            <p className="text-muted-foreground">Nenhum lembrete criado ainda.</p>
            <Link href="/lembretes/novo" className="text-sm font-medium underline underline-offset-4">
              Criar primeiro lembrete
            </Link>
          </div>
        ) : (
          <LembreteList lembretes={lembretes}/>
        )}
      </div>
    </main>
  )
}
