# AWS Setup — Insulin Reminder

## DynamoDB — 2 tabelas

### `insulin-reminder` (lembretes)
| Campo | Valor |
|---|---|
| Partition key | `id` (String) |

### `insulin-reminder-auth` (Auth.js)
| Campo | Valor |
|---|---|
| Partition key | `pk` (String) |
| Sort key | `sk` (String) |


---

## IAM

### Usuário: `insulin-reminder-app`
Usado pela aplicação Next.js na Vercel (access key + secret).

**Policy inline:** `insulin-reminder-app`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/insulin-reminder",
        "arn:aws:dynamodb:*:*:table/insulin-reminder-auth",
        "arn:aws:dynamodb:*:*:table/insulin-reminder-auth/index/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "scheduler:CreateSchedule",
        "scheduler:DeleteSchedule"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "iam:PassRole",
      "Resource": "arn:aws:iam::<conta>:role/insulin-reminder-scheduler-role"
    }
  ]
}
```

---

### Role: `insulin-reminder-scheduler`
Usado pelo EventBridge Scheduler para invocar a Lambda.

**Trust policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "scheduler.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

**Policy inline:** `insulin-reminder-scheduler`
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "lambda:InvokeFunction",
      "Resource": "arn:aws:lambda:<região>:<conta>:function:insulin-reminder-notify"
    }
  ]
}
```

---

## Lambda

### `insulin-reminder`
| Campo | Valor |
|---|---|
| Runtime | Node.js 22.x |
| Trigger | EventBridge Scheduler |
| Responsabilidade | Recebe `{ id }` do Scheduler e chama `POST /api/notify` |

**Variáveis de ambiente:**
| Variável | Descrição |
|---|---|
| `NOTIFY_URL` | `https://<dominio>/api/notify` |
| `NOTIFY_SECRET` | Mesmo valor do `.env` da aplicação |
---

## Variáveis de ambiente da aplicação

```bash
# Auth.js
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_DYNAMODB_TABLE=insulin-reminder-auth

# AWS
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DYNAMODB_TABLE_NAME=insulin-reminder
SCHEDULER_ROLE_ARN=arn:aws:iam::<conta>:role/insulin-reminder-scheduler-role
SCHEDULER_TARGET_ARN=arn:aws:lambda:<região>:<conta>:function:insulin-reminder-notify

# Notificação
NOTIFY_SECRET=
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_TEMPLATE_NAME=
```

---

## Fluxo de notificação

```
Usuário cria lembrete
        ↓
API POST /api/lembretes
        ↓
DynamoDB.PutItem (tabela insulin-reminder)
        ↓
Scheduler.CreateSchedule (cron diário no horário configurado)
        ↓
[no horário] Scheduler invoca Lambda insulin-reminder-notify
        ↓
Lambda POST /api/notify { id }
        ↓
API busca lembrete no DynamoDB
        ↓
WhatsApp API envia mensagem ao paciente
```
