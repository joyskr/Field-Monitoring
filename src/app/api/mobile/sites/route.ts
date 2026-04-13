import { db } from "@/lib/db";
import { getMobileUserId } from "@/lib/mobileAuth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const userId = getMobileUserId(req);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sites = await db.site.findMany({
    where: {
      campaign: { status: { in: ["ACTIVE", "UPCOMING"] } },
      assignedAgents: { some: { id: userId } },
    },
    include: {
      campaign: { select: { id: true, name: true, status: true } },
      vendor: { select: { name: true } },
      monitor: { select: { name: true } },
      _count: { select: { photos: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(sites);
}
