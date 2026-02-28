import { NextRequest, NextResponse } from 'next/server'
import { RegisterSchema } from '@/lib/schemas'
import { createUser, getUserByEmail } from '@/lib/users'

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

  const user = await createUser(parsed.data)
  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
}
