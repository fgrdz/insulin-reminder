import { LoginForm } from '@/components/login-form/login-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6 pt-12">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Entrar</h1>
          <p className="text-sm text-muted-foreground">Acesse sua conta para gerenciar lembretes</p>
        </div>

        <LoginForm />
      </div>
    </main>
  )
}
