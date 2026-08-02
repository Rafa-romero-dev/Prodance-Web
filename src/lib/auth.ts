import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export type UserRole = 'ADMINISTRATOR' | 'STUDENT'

export const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email.toLowerCase()

        const administrator = await prisma.administrator.findUnique({
          where: { email },
        })

        if (administrator) {
          if (!administrator.isActive) return null
          const valid = await bcrypt.compare(credentials.password, administrator.passwordHash)
          if (!valid) return null

          return {
            id: administrator.id,
            email: administrator.email,
            name: `${administrator.firstName} ${administrator.lastName}`,
            role: 'ADMINISTRATOR' satisfies UserRole,
          }
        }

        const student = await prisma.student.findUnique({
          where: { email },
        })

        if (student?.passwordHash) {
          if (student.status !== 'ACTIVE') return null
          const valid = await bcrypt.compare(credentials.password, student.passwordHash)
          if (!valid) return null

          return {
            id: student.id,
            email: student.email,
            name: `${student.firstName} ${student.lastName}`,
            role: 'STUDENT' satisfies UserRole,
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: UserRole }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
}
