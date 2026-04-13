import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// NextAuth v5: wrapping auth() as middleware — req.auth is Session | null
export default auth((req) => {
  // All matched routes require a valid NextAuth session.
  // Mobile API routes (/api/mobile/*) are excluded via the matcher below
  // because they use their own Bearer-token auth (getMobileUserId).
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
