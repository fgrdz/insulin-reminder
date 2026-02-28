import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import type { RegisterInput, User } from '@/lib/schemas'

const client = DynamoDBDocument.from(new DynamoDB({ region: process.env.AWS_REGION }))
const TABLE_NAME = process.env.AUTH_DYNAMODB_TABLE!

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await client.query({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': `USER#${email}` },
    Limit: 1,
  })

  const item = result.Items?.[0]
  if (!item) return null

  return {
    id: item['id'] as string,
    name: item['name'] as string,
    email: item['email'] as string,
    passwordHash: item['passwordHash'] as string | undefined,
    createdAt: item['createdAt'] as string,
  }
}

export async function createUser(input: RegisterInput): Promise<User> {
  const id = randomUUID()
  const now = new Date().toISOString()
  const passwordHash = await bcrypt.hash(input.password, 12)

  const user: User & { passwordHash: string } = {
    id,
    name: input.name,
    email: input.email,
    passwordHash,
    createdAt: now,
  }

  await client.put({
    TableName: TABLE_NAME,
    Item: {
      pk: `USER#${id}`,
      sk: `USER#${id}`,
      GSI1PK: `USER#${input.email}`,
      GSI1SK: `USER#${id}`,
      ...user,
    },
    ConditionExpression: 'attribute_not_exists(pk)',
  })

  return { id, name: input.name, email: input.email, createdAt: now }
}
