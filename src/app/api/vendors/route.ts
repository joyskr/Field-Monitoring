import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const vendors = await db.vendor.findMany({ orderBy: { name: "asc" } });
  return Response.json(vendors);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.name?.trim()) return Response.json({ error: "Name required." }, { status: 400 });

  const vendor = await db.vendor.create({
    data: { name: body.name, city: body.city ?? null, state: body.state ?? null },
  });
  return Response.json(vendor, { status: 201 });
}
