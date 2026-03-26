import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name } = await req.json();

  const existing = await db.monitor.findFirst({ where: { name, NOT: { id } } });
  if (existing) return Response.json({ error: "Monitor name already in use." }, { status: 409 });

  const monitor = await db.monitor.update({ where: { id }, data: { name } });
  return Response.json(monitor);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // Unassign from sites & photos before deleting
  await db.site.updateMany({ where: { monitorId: id }, data: { monitorId: null } });
  await db.photo.updateMany({ where: { monitorId: id }, data: { monitorId: null } });
  await db.monitor.delete({ where: { id } });

  return Response.json({ ok: true });
}
