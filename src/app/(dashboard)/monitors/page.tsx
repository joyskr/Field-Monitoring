import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Header from "@/components/layout/Header";
import MonitorsClient from "./MonitorsClient";
import Link from "next/link";
import { Home } from "lucide-react";

export default async function MonitorsPage() {
  const session = await auth();
  const brandId = (session?.user as { brandId?: string | null } | undefined)?.brandId ?? null;
  const isManager = session?.user?.role === "MANAGER" && brandId;

  const campaignIds = isManager
    ? (await db.campaign.findMany({ where: { brandId }, select: { id: true } })).map((c) => c.id)
    : null;

  const monitors = await db.monitor.findMany({
    where: campaignIds ? { sites: { some: { campaignId: { in: campaignIds } } } } : {},
    include: {
      sites: {
        where: campaignIds ? { campaignId: { in: campaignIds } } : {},
        include: { campaign: { select: { name: true } } },
      },
      photos: {
        where: campaignIds ? { campaignId: { in: campaignIds } } : {},
        select: { id: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const data = monitors.map((m) => {
    const total = m.photos.length;
    const approved = m.photos.filter((p) => p.status === "APPROVED").length;
    const campaigns = [...new Set(m.sites.map((s) => s.campaign.name))];
    return {
      id: m.id,
      name: m.name,
      siteCount: m.sites.length,
      campaigns,
      totalPhotos: total,
      approvedPhotos: approved,
      progress: total > 0 ? Math.round((approved / total) * 100) : 0,
    };
  });

  return (
    <>
      <Header />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <Link href="/dashboard"><Home size={14} /></Link>
          <span>›</span>
          <span className="text-gray-700">Monitors</span>
        </div>
        <MonitorsClient initialMonitors={data} />
      </main>
    </>
  );
}
