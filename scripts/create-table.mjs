import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const env = Object.fromEntries(
  readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
    .split('\n')
    .filter(line => line && !line.startsWith('#') && line.includes('='))
    .map(line => line.split('=').map(s => s.trim()))
)

const client = new DynamoDBClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

const TABLE_NAME = env.DYNAMODB_TABLE_NAME

try {
  await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }))
  console.log(`Tabela "${TABLE_NAME}" já existe.`)
} catch {
  await client.send(new CreateTableCommand({
    TableName: TABLE_NAME,
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    BillingMode: 'PAY_PER_REQUEST',
  }))
  console.log(`Tabela "${TABLE_NAME}" criada com sucesso.`)
}
