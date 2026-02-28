import { NextRequest, NextResponse } from 'next/server'
import { PutItemCommand } from '@aws-sdk/client-dynamodb'
import { CreateScheduleCommand } from '@aws-sdk/client-scheduler'
import { randomUUID } from 'crypto'
import { CreateLembreteSchema, type Lembrete } from '@/lib/schemas'
import { dynamoDBClient, marshall, TABLE_NAME } from '@/lib/dynamodb'
import { schedulerClient, SCHEDULER_ROLE_ARN, SCHEDULER_TARGET_ARN } from '@/lib/scheduler'
import { auth } from '@/auth'

function buildCronExpression(horario: string): string {
  const [hour, minute] = horario.split(':')
  return `cron(${minute} ${hour} * * ? *)`
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = CreateLembreteSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 422 })
  }

  const lembrete: Lembrete = {
    ...parsed.data,
    id: randomUUID(),
    userId: session.user.id,
    status: 'agendado',
  }

  await dynamoDBClient.send(new PutItemCommand({
    TableName: TABLE_NAME,
    Item: marshall(lembrete as Record<string, unknown>),
  }))

  await schedulerClient.send(new CreateScheduleCommand({
    Name: lembrete.id,
    ScheduleExpression: buildCronExpression(lembrete.horario),
    ScheduleExpressionTimezone: 'America/Sao_Paulo',
    Target: {
      Arn: SCHEDULER_TARGET_ARN,
      RoleArn: SCHEDULER_ROLE_ARN,
      Input: JSON.stringify({ id: lembrete.id }),
    },
    FlexibleTimeWindow: { Mode: 'OFF' },
  }))

  return NextResponse.json(lembrete, { status: 201 })
}
