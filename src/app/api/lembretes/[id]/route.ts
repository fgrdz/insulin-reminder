import { NextRequest, NextResponse } from 'next/server'
import { GetItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb'
import { DeleteScheduleCommand } from '@aws-sdk/client-scheduler'
import { dynamoDBClient, marshall, unmarshall, TABLE_NAME } from '@/lib/dynamodb'
import { schedulerClient } from '@/lib/scheduler'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params

  const result = await dynamoDBClient.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ id }),
  }))

  if (!result.Item) {
    return NextResponse.json({ error: 'Lembrete não encontrado' }, { status: 404 })
  }

  return NextResponse.json(unmarshall(result.Item))
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params

  await dynamoDBClient.send(new DeleteItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ id }),
  }))

  await schedulerClient.send(new DeleteScheduleCommand({ Name: id }))

  return new Response(null, { status: 204 })
}
