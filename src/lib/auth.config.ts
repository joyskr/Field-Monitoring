import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — no Node.js / Prisma imports.
// Used by middleware (Edge runtime) to validate JWT sessions.
// The full auth.ts adds the Credentials provider with DB access for sign-in.
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [],
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
        (session.user as { vendorId?: string | null }).vendorId =
          token.vendorId as string | null;
        (session.user as { brandId?: string | null }).brandId =
          token.brandId as string | null;
      }
      return session;
    },
  },
};
