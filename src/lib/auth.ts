import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

console.log("[auth] trustHost=true, AUTH_TRUST_HOST=", process.env.AUTH_TRUST_HOST);

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.error("[auth] User not found:", credentials.email);
            return null;
          }

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!valid) {
            console.error("[auth] Invalid password for:", credentials.email);
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            vendorId: user.vendorId,
            brandId: user.brandId,
          };
        } catch (e) {
          console.error("[auth] authorize error:", e);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.vendorId = (user as { vendorId?: string | null }).vendorId ?? null;
        token.brandId = (user as { brandId?: string | null }).brandId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { vendorId?: string | null }).vendorId = token.vendorId as string | null;
        (session.user as { brandId?: string | null }).brandId = token.brandId as string | null;
      }
      return session;
    },
  },
});
