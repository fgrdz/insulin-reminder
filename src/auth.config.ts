import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { z } from 'zod'

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const authConfig = {
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      // authorize real fica em auth.ts — aqui só validamos o schema (Edge-safe)
      authorize: async (credentials) => {
        const parsed = CredentialsSchema.safeParse(credentials)
        if (!parsed.success) return null
        // Retorna null aqui; auth.ts sobrescreve com authorize completo
        return null
      },
    }),
  ],

  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const publicPaths = ['/login', '/cadastro', '/api/notify', '/api/auth']
      const isPublic = publicPaths.some((p) => pathname.startsWith(p))
      if (isPublic) return true
      return !!auth?.user
    },
  },

  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig
