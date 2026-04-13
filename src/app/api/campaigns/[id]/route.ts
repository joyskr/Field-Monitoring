import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  const brandId = (session.user as { brandId?: string | null }).brandId ?? null;
  const isManager = role === "MANAGER" && brandId;

  const { id } = await params;

  // MANAGER can only edit their own brand's campaigns
  if (isManager) {
    const campaign = await db.campaign.findUnique({ where: { id }, select: { brandId: true } });
    if (!campaign || campaign.brandId !== brandId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const body = await req.json();

  const updated = await db.campaign.update({
    where: { id },
    data: {
      name: body.name,
      status: body.status,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      state: body.state,
      type: body.type,
      // Only ADMIN can reassign brand
      ...(role === "ADMIN" && body.brandId ? { brandId: body.brandId } : {}),
    },
    include: { brand: true, createdBy: { select: { name: true } } },
  });

  return Response.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.campaign.delete({ where: { id } });
  return Response.json({ success: true });
}
