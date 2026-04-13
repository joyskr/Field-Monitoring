import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

// Use edge-compatible auth (no Prisma/pg) for middleware.
// The full auth.ts (with DB) is only used in server components and API routes.
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
});

export const config = {
  matcher: [
    // Protect all /api routes except:
    //   /api/auth/*  — NextAuth callbacks (sign-in, CSRF, etc.)
    //   /api/mobile/* — Mobile app uses its own JWT Bearer auth
    "/api/((?!auth|mobile).*)",
  ],
};
