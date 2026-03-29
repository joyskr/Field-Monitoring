import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "ADMIN" ? session : null;
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // Prevent self-deletion
  if (id === session.user?.id) {
    return Response.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  await db.user.delete({ where: { id } });
  return Response.json({ success: true });
}
