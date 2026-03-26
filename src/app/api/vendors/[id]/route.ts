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
  const body = await req.json();

  const vendor = await db.vendor.update({
    where: { id },
    data: { name: body.name, city: body.city ?? null, state: body.state ?? null },
  });
  return Response.json(vendor);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const siteCount = await db.site.count({ where: { vendorId: id } });
  if (siteCount > 0) return Response.json({ error: "Vendor has assigned sites." }, { status: 409 });

  await db.vendor.delete({ where: { id } });
  return Response.json({ ok: true });
}
