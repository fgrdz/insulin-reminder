'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RegisterSchema, type RegisterInput } from '@/lib/schemas'
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

export function CadastroForm() {
  const router = useRouter()

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  async function onSubmit(data: RegisterInput) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.status === 409) {
      form.setError('email', { message: 'E-mail já cadastrado' })
      return
    }

    if (response.status === 403) {
      const body = await response.json() as { error: string }
      form.setError('root', { message: body.error })
      return
    }

    if (!response.ok) {
      form.setError('root', { message: 'Erro ao criar conta. Tente novamente.' })
      return
    }

    await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    router.push('/lembretes/novo')
  }

  return (
    <div className="bg-card rounded-md shadow-2xl p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input className="bg-accent/20" placeholder="Seu nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input className="bg-accent/20" type="email" placeholder="voce@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input className="bg-accent/20" type="password" placeholder="Mínimo 8 caracteres" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
          )}

          <Button
            type="submit"
            className="w-full shadow-md bg-primary/80"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link href="/login" className="font-semibold text-primary hover:opacity-80">
          Entrar
        </Link>
      </p>
    </div>
  )
}
