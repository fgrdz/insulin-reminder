import { z } from 'zod'

export const FrequenciaEnum = z.enum(['diaria', '2x_dia', '3x_dia', 'semanal'])
export const StatusEnum = z.enum(['agendado', 'pausado', 'cancelado'])

export const LembreteSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1, 'Nome obrigatório').max(100),
  sobrenome: z.string().min(1, 'Sobrenome obrigatório').max(100),
  telefone: z.string().regex(/^\+55\d{10,11}$/, 'Formato: +55DDD9XXXXXXXX'),
  horario: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato: HH:MM'),
  dose: z.number({ error: 'Dose obrigatória' }).positive('Dose deve ser positiva'),
  frequencia: FrequenciaEnum,
  status: StatusEnum,
})

export const CreateLembreteSchema = LembreteSchema.omit({ id: true, status: true })

export type Lembrete = z.infer<typeof LembreteSchema>
export type CreateLembreteInput = z.infer<typeof CreateLembreteSchema>
export type Frequencia = z.infer<typeof FrequenciaEnum>
export type Status = z.infer<typeof StatusEnum>
