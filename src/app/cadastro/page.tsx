import { CadastroForm } from '@/components/cadastro-form/cadastro-form'

export default function CadastroPage() {
  return (
    <main className="flex min-h-screen justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6 pt-12">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Criar conta</h1>
          <p className="text-sm text-muted-foreground">Cadastre-se para começar a usar o Insulin Reminder</p>
        </div>

        <CadastroForm />
      </div>
    </main>
  )
}
