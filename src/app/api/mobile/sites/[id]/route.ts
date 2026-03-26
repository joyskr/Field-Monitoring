import { db } from "@/lib/db";
import { getMobileUserId } from "@/lib/mobileAuth";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getMobileUserId(req);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const site = await db.site.findUnique({
    where: { id },
    include: {
      campaign: { select: { id: true, name: true, status: true } },
      vendor: { select: { name: true } },
      monitor: { select: { name: true } },
      _count: { select: { photos: true } },
    },
  });

  if (!site) return Response.json({ error: "Site not found." }, { status: 404 });
  return Response.json(site);
}
