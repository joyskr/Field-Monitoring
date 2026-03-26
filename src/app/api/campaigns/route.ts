import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const q = searchParams.get("q");

  const campaigns = await db.campaign.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    include: { brand: true, createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(campaigns);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const campaign = await db.campaign.create({
    data: {
      name: body.name,
      type: body.type ?? "STANDARD",
      brandId: body.brandId,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      state: body.state,
      status: body.status ?? "UPCOMING",
      createdById: session.user?.id ?? "",
    },
  });

  return Response.json(campaign, { status: 201 });
}
