import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const client = new DynamoDBClient({ region: process.env.AWS_REGION })

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!

export { client as dynamoDBClient, marshall, unmarshall, TABLE_NAME }
