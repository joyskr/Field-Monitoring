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

  // Check unique siteCode (excluding self)
  const existing = await db.site.findFirst({
    where: { siteCode: body.siteCode, NOT: { id } },
  });
  if (existing) return Response.json({ error: "Site code already in use." }, { status: 409 });

  const site = await db.site.update({
    where: { id },
    data: {
      siteCode: body.siteCode,
      mediaType: body.mediaType,
      locality: body.locality,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      vendorId: body.vendorId,
      campaignId: body.campaignId,
      frequency: body.frequency,
      monitorId: body.monitorId || null,
    },
  });

  return Response.json(site);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Delete photos first (FK constraint)
  await db.photo.deleteMany({ where: { siteId: id } });
  await db.site.delete({ where: { id } });

  return Response.json({ ok: true });
}
