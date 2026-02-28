import { SchedulerClient } from '@aws-sdk/client-scheduler'

const client = new SchedulerClient({ region: process.env.AWS_REGION })

const SCHEDULER_ROLE_ARN = process.env.SCHEDULER_ROLE_ARN!
const SCHEDULER_TARGET_ARN = process.env.SCHEDULER_TARGET_ARN!

export { client as schedulerClient, SCHEDULER_ROLE_ARN, SCHEDULER_TARGET_ARN }
