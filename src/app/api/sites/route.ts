import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const campaignId = searchParams.get("campaignId");

  const sites = await db.site.findMany({
    where: campaignId ? { campaignId } : {},
    include: { vendor: true, campaign: true, monitor: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(sites);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Check unique siteCode
  const existing = await db.site.findUnique({ where: { siteCode: body.siteCode } });
  if (existing) return Response.json({ error: "Site code already exists." }, { status: 409 });

  const site = await db.site.create({
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

  return Response.json(site, { status: 201 });
}
