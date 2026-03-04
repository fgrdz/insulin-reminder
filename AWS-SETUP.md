# AWS Setup — Insulin Reminder

## Serviços utilizados

- **DynamoDB** — 2 tabelas (lembretes + Auth.js)
- **EventBridge Scheduler** — agendamento das notificações diárias
- **Lambda** — invocado pelo Scheduler para chamar `/api/notify`
- **IAM** — usuário da aplicação + role para o Scheduler

## DynamoDB

### Tabela de lembretes
| Campo | Valor |
|---|---|
| Partition key | `id` (String) |

### Tabela de autenticação (Auth.js)
| Campo | Valor |
|---|---|
| Partition key | `pk` (String) |
| Sort key | `sk` (String) |
| GSI | `GSI1` com `GSI1PK` / `GSI1SK` |
| TTL | campo `expires` |

## IAM

### Usuário da aplicação
Crie um usuário IAM com acesso programático. A policy precisa permitir:
- `dynamodb:GetItem`, `PutItem`, `DeleteItem`, `UpdateItem`, `Query`, `Scan` nas duas tabelas (incluindo índices da tabela auth)
- `scheduler:CreateSchedule`, `scheduler:DeleteSchedule`
- `iam:PassRole` na role do Scheduler

### Role do Scheduler
Trust policy para `scheduler.amazonaws.com` assumir a role. A policy precisa permitir `lambda:InvokeFunction` na função de notificação.

## Lambda

- **Runtime**: Node.js 22.x
- **Trigger**: EventBridge Scheduler
- **Responsabilidade**: recebe `{ id }` e chama `POST /api/notify`
- **Variáveis de ambiente necessárias**: `NOTIFY_URL` e `NOTIFY_SECRET`

## Variáveis de ambiente da aplicação

```bash
# Auth.js
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_DYNAMODB_TABLE=

# AWS
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
DYNAMODB_TABLE_NAME=
SCHEDULER_ROLE_ARN=
SCHEDULER_TARGET_ARN=

# Notificação
NOTIFY_SECRET=
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_TEMPLATE_NAME=
```

## Fluxo de notificação

```
Usuário cria lembrete
        ↓
POST /api/lembretes → DynamoDB.PutItem + Scheduler.CreateSchedule
        ↓
[no horário] Scheduler invoca Lambda
        ↓
Lambda → POST /api/notify { id }
        ↓
API busca lembrete no DynamoDB → WhatsApp API envia mensagem
```
