import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import SharedCampaignsClient from "./SharedCampaignsClient";
import Link from "next/link";
import { Home } from "lucide-react";

export default async function SharedCampaignsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [rawShared, myCampaigns] = await Promise.all([
    db.sharedCampaign.findMany({
      where: { sharedToId: session.user.id },
      include: {
        campaign: { include: { brand: true, createdBy: { select: { name: true } } } },
        sharedBy: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.campaign.findMany({
      where: { createdById: session.user.id },
      select: { id: true, name: true, status: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const sharedWithMe = rawShared.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    campaign: {
      ...s.campaign,
      startDate: s.campaign.startDate.toISOString(),
      endDate: s.campaign.endDate.toISOString(),
      createdAt: s.campaign.createdAt.toISOString(),
    },
  }));

  return (
    <>
      <Header />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <Link href="/dashboard"><Home size={14} /></Link>
          <span>›</span>
          <span className="text-gray-700">Shared Campaigns</span>
        </div>
        <SharedCampaignsClient sharedWithMe={sharedWithMe} myCampaigns={myCampaigns} />
      </main>
    </>
  );
}
