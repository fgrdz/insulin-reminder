import { NextRequest, NextResponse } from 'next/server'
import { RegisterSchema } from '@/lib/schemas'
import { countUsers, createUser, getUserByEmail } from '@/lib/users'

export async function POST(request: NextRequest) {
  const body: unknown = await request.json()
  const parsed = RegisterSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 422 })
  }

  const existing = await getUserByEmail(parsed.data.email)
  if (existing) {
    return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 })
  }

  const limit = Number(process.env.USER_LIMIT ?? 10)
  const currentCount = await countUsers()
  if (currentCount >= limit) {
    return NextResponse.json(
      { error: 'Limite de usuários atingido. Entre em contato com o administrador.' },
      { status: 403 },
    )
  }

  const user = await createUser(parsed.data)
  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
}
