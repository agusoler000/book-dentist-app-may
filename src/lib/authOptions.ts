import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email / Password",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        let { email, password } = credentials as any;
        let user = null;
        if (!email.includes('@')) {
          const patient = await prisma.patient.findUnique({ where: { dni: email }, include: { user: true } });
          if (!patient) {
            console.warn('Login failed: DNI not found:', email);
            throw new Error('DNI not found');
          }
          if (!patient.user) {
            console.warn('Login failed: No user linked to DNI:', email);
            throw new Error('No user linked to DNI');
          }
          user = patient.user;
          email = user.email;
        } else {
          user = await prisma.user.findUnique({ where: { email }, include: { dentist: true } });
          if (!user) {
            console.warn('Login failed: Email not found:', email);
            throw new Error('Email not found');
          }
        }
        if (!user) return null;
        const valid = await compare(password, user.password);
        if (!valid) {
          console.warn('Login failed: Incorrect password for user:', email);
          throw new Error('Incorrect password');
        }
        if ((user as any).role === 'DENTIST' && (user as any).dentist) {
          return { id: user.id, email: user.email, name: user.name, role: user.role, dentist: { id: (user as any).dentist.id } };
        }
        return { id: user.id, email: user.email, name: user.name, role: (user as any).role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = (user as any).id;
        if ((user as any).role === 'DENTIST' && (user as any).dentist && (user as any).dentist.id) {
          token.dentistId = (user as any).dentist.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
        if (token.dentistId) {
          (session.user as any).dentistId = token.dentistId as string;
        }
      }
      return session;
    },
  },
  pages: {
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 