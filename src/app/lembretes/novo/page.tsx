'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { CreateLembreteSchema, type CreateLembreteInput, type Frequencia } from '@/lib/schemas'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircleIcon, InfoIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export default function NovoLembretePage() {
  const [responseError, setResponseError] = useState(false);
  const router = useRouter()

  const form = useForm<CreateLembreteInput>({
    resolver: zodResolver(CreateLembreteSchema),
    defaultValues: {
      nome: '',
      sobrenome: '',
      telefone: '+55',
      horario: '',
    },
  })

  async function onSubmit(data: CreateLembreteInput) {
    const response = await fetch('/api/lembretes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      setResponseError(true);
      return;
    }

    const lembrete = await response.json() as { id: string }
    router.push(`/lembretes/${lembrete.id}`)
  }

  return (
    <main className="flex min-h-screen justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-semibold tracking-tight">Novo lembrete</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="size-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-64">
                <p>
                  O <span className="font-medium">Insulin Reminder</span> é um projeto pessoal e de código aberto
                  que envia lembretes para aplicação de insulina via WhatsApp no horário configurado.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground">Configure seu lembrete de insulina</p>
        </div>
        <div className='self-center bg-card rounded-md shadow-2xl p-6'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input className='bg-accent/20' placeholder="Nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sobrenome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input className='bg-accent/20' placeholder="Sobrenome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (WhatsApp)</FormLabel>
                    <FormControl>
                      <Input className='bg-accent/20' placeholder="+5511999999999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="horario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <FormControl>
                        <Input className='bg-accent/20' type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dose (UI)</FormLabel>
                      <FormControl>
                        <Input
                          className='bg-accent/20'
                          type="number"
                          min={0}
                          step={0.5}
                          placeholder="10"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="frequencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(v as Frequencia)}
                      defaultValue={field.value}
                      
                    >
                      <FormControl>
                        <SelectTrigger className='bg-accent/20'>
                          <SelectValue className='bg-accent/20' placeholder="Selecione a frequência" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="diaria">Diária</SelectItem>
                        {/* <SelectItem value="2x_dia">2× ao dia</SelectItem>
                        <SelectItem value="3x_dia">3× ao dia</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem> */}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full shadow-md bg-primary/80" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando...' : 'Criar lembrete'}
              </Button>
            </form>
            {responseError && (
              <Alert variant="destructive" className="my-2">
                <AlertCircleIcon/>
                <AlertTitle className="font-bold">Erro ao cadastrar lembrete</AlertTitle>
                <AlertDescription>
                  Tente novamente mais tarde
                </AlertDescription>
              </Alert>
            )}
          </Form>
        </div>
      </div>
    </main>
  )
}
