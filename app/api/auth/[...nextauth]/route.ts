import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authConfig } from '@/auth.config'
import { z } from 'zod'
import { getStringFromBuffer } from '@/lib/utils'
import { getUser } from '@/app/login/actions'

const handler = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6)
          })
          .safeParse(credentials)

        if (!parsedCredentials.success) {
          return null
        }

        const { email, password } = parsedCredentials.data

        const user = await getUser(email)
        if (!user) {
          return null
        }

        const encoder = new TextEncoder()
        const saltedPassword = encoder.encode(password + user.salt)
        const hashedPasswordBuffer = await crypto.subtle.digest(
          'SHA-256',
          saltedPassword
        )
        const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

        if (hashedPassword === user.password) {
          return user
        } else {
          return null
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token = { ...token, id: user.id }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        const { id } = token as { id: string }
        const { user } = session

        session = { ...session, user: { ...user, id } }
      }

      return session
    }
  }
})

export { handler as GET, handler as POST }
