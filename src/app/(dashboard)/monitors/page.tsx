import { db } from "@/lib/db";
import Header from "@/components/layout/Header";
import MonitorsClient from "./MonitorsClient";
import Link from "next/link";
import { Home } from "lucide-react";

export default async function MonitorsPage() {
  const monitors = await db.monitor.findMany({
    include: {
      sites: {
        include: { campaign: { select: { name: true } } },
      },
      photos: { select: { id: true, status: true } },
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
