import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { DynamoDBAdapter } from '@auth/dynamodb-adapter'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authConfig } from '@/auth.config'
import { getUserByEmail } from '@/lib/users'

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const dynamoDBClient = DynamoDBDocument.from(
  new DynamoDB({ region: process.env.AWS_REGION }),
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DynamoDBAdapter(dynamoDBClient, {
    tableName: process.env.AUTH_DYNAMODB_TABLE!,
  }),
  session: { strategy: 'jwt' },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = CredentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await getUserByEmail(parsed.data.email)
        if (!user?.passwordHash) return null

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, name: user.name, email: user.email }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id && typeof token.id === 'string') {
        session.user.id = token.id
      }
      return session
    },
  },
})
