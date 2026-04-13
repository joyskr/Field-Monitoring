import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const monitors = await db.monitor.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return Response.json(monitors);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return Response.json({ error: "Name required." }, { status: 400 });

  const existing = await db.monitor.findUnique({ where: { name } });
  if (existing) return Response.json({ error: "Monitor name already exists." }, { status: 409 });

  const monitor = await db.monitor.create({ data: { name } });
  return Response.json(monitor, { status: 201 });
}
