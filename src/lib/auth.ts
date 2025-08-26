import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV !== "production",
  providers: [
    Credentials({
      name: "Email/Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = creds?.email?.toLowerCase();
        const password = creds?.password ?? "";
        if (!email || !password) return null;
        const user = (await prisma.user.findUnique({
          where: { email },
        })) as any;
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash as string);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      if (session.user)
        (session.user as any).role =
          (user as any)?.role ?? (token as any)?.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user) (token as any).role = (user as any).role;
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl + "/dashboard";
    },
  },
  pages: { signIn: "/signin" },
};
