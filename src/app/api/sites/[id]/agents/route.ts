import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "ADMIN" ? session : null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const site = await db.site.findUnique({
    where: { id },
    select: { assignedAgents: { select: { id: true, name: true, email: true } } },
  });

  return Response.json(site?.assignedAgents ?? []);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { agentIds } = await req.json();

  const site = await db.site.update({
    where: { id },
    data: {
      assignedAgents: {
        set: (agentIds as string[]).map((agentId) => ({ id: agentId })),
      },
    },
    select: { assignedAgents: { select: { id: true, name: true, email: true } } },
  });

  return Response.json(site.assignedAgents);
}
