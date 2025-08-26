import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/server/db';
import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers: [
    Credentials({
      name: 'Email/Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        const email = creds?.email?.toLowerCase();
        const password = creds?.password ?? '';
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role as Role } as any;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Include role in session
      if (session.user) (session.user as any).role = (user as any).role;
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
});
