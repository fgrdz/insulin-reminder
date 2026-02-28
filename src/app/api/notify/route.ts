import { NextRequest, NextResponse } from 'next/server'
import { GetItemCommand } from '@aws-sdk/client-dynamodb'
import { z } from 'zod'
import { dynamoDBClient, marshall, unmarshall, TABLE_NAME } from '@/lib/dynamodb'
import { LembreteSchema } from '@/lib/schemas'

const NotifyBodySchema = z.object({
  id: z.string().uuid(),
})

const NOTIFY_SECRET = process.env.NOTIFY_SECRET!
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN!
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!
const WHATSAPP_TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME!
const WHATSAPP_API_VERSION = 'v21.0'

function buildTemplateBody(nome: string, dose: number) {
  return {
    messaging_product: 'whatsapp',
    type: 'template',
    template: {
      name: WHATSAPP_TEMPLATE_NAME,
      language: { code: 'pt_BR' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: nome },
            { type: 'text', text: String(dose) },
          ],
        },
      ],
    },
  }
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${NOTIFY_SECRET}`) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body: unknown = await request.json()
  const parsed = NotifyBodySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 422 })
  }

  const result = await dynamoDBClient.send(new GetItemCommand({
    TableName: TABLE_NAME,
    Key: marshall({ id: parsed.data.id }),
  }))

  if (!result.Item) {
    return NextResponse.json({ error: 'Lembrete não encontrado' }, { status: 404 })
  }

  const lembrete = LembreteSchema.parse(unmarshall(result.Item))

  const whatsappRes = await fetch(
    `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...buildTemplateBody(lembrete.nome, lembrete.dose),
        to: lembrete.telefone.replace('+', ''),
      }),
    }
  )

  if (!whatsappRes.ok) {
    return NextResponse.json({ error: 'Falha ao enviar mensagem WhatsApp' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
