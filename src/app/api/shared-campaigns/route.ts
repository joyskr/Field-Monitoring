import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const shared = await db.sharedCampaign.findMany({
    where: { sharedToId: session.user.id },
    include: {
      campaign: { include: { brand: true, createdBy: { select: { name: true } } } },
      sharedBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(shared);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { campaignId, email } = await req.json();
  if (!campaignId || !email) return Response.json({ error: "campaignId and email required." }, { status: 400 });

  const target = await db.user.findUnique({ where: { email } });
  if (!target) return Response.json({ error: "User not found with that email." }, { status: 404 });
  if (target.id === session.user.id) return Response.json({ error: "Cannot share with yourself." }, { status: 400 });

  const existing = await db.sharedCampaign.findUnique({
    where: { campaignId_sharedToId: { campaignId, sharedToId: target.id } },
  });
  if (existing) return Response.json({ error: "Already shared with this user." }, { status: 409 });

  const share = await db.sharedCampaign.create({
    data: { campaignId, sharedById: session.user.id, sharedToId: target.id },
  });

  // Create notification for the recipient
  await db.notification.create({
    data: {
      userId: target.id,
      title: "Campaign Shared With You",
      message: `${session.user.name ?? session.user.email} shared a campaign with you.`,
      link: "/shared-campaigns",
    },
  });

  return Response.json(share, { status: 201 });
}
