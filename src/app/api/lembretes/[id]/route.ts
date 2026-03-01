import { NextRequest, NextResponse } from 'next/server'
import { GetItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb'
import { DeleteScheduleCommand, ResourceNotFoundException } from '@aws-sdk/client-scheduler'
import { dynamoDBClient, marshall, unmarshall, TABLE_NAME } from '@/lib/dynamodb'
import { schedulerClient } from '@/lib/scheduler'
import { auth } from '@/auth'
import type { Lembrete } from '@/lib/schemas'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params

  const result = await dynamoDBClient.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ id }),
  }))

  if (!result.Item) {
    return NextResponse.json({ error: 'Lembrete não encontrado' }, { status: 404 })
  }

  const lembrete = unmarshall(result.Item) as Lembrete

  if (lembrete.userId !== session.user.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  return NextResponse.json(lembrete)
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { id } = await params

  const result = await dynamoDBClient.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ id }),
  }))

  if (!result.Item) {
    return NextResponse.json({ error: 'Lembrete não encontrado' }, { status: 404 })
  }

  const lembrete = unmarshall(result.Item) as Lembrete

  if (lembrete.userId !== session.user.id) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  await dynamoDBClient.send(new DeleteItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ id }),
  }))

  try {
    await schedulerClient.send(new DeleteScheduleCommand({ Name: id }))
  } catch (err) {
    if (!(err instanceof ResourceNotFoundException)) throw err
  }

  return new Response(null, { status: 204 })
}
