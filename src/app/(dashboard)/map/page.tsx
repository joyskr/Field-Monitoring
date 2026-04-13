import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Header from "@/components/layout/Header";
import MapClient from "./MapClient";
import Link from "next/link";
import { Home } from "lucide-react";

export default async function MapPage() {
  const session = await auth();
  const brandId = (session?.user as { brandId?: string | null } | undefined)?.brandId ?? null;
  const isManager = session?.user?.role === "MANAGER" && brandId;

  const campaignIds = isManager
    ? (await db.campaign.findMany({ where: { brandId }, select: { id: true } })).map((c) => c.id)
    : null;

  const siteFilter = {
    lat: { not: null },
    lng: { not: null },
    ...(campaignIds ? { campaignId: { in: campaignIds } } : {}),
  };

  const sites = await db.site.findMany({
    where: siteFilter,
    include: {
      campaign: { select: { name: true, status: true } },
      vendor: { select: { name: true } },
      monitor: { select: { name: true } },
    },
  });

  const markers = sites.map((s) => ({
    id: s.id,
    siteCode: s.siteCode,
    mediaType: s.mediaType as string,
    locality: s.locality,
    lat: s.lat!,
    lng: s.lng!,
    campaignName: s.campaign.name,
    campaignStatus: s.campaign.status as string,
    vendorName: s.vendor.name,
    monitorName: s.monitor?.name ?? null,
  }));

  // Stats scoped to visible campaigns
  const allSites = await db.site.count(campaignIds ? { where: { campaignId: { in: campaignIds } } } : undefined);
  const mappedSites = sites.length;
  const campaigns = await db.campaign.groupBy({
    by: ["status"],
    where: campaignIds ? { id: { in: campaignIds } } : {},
    _count: { _all: true },
  });
  const activeCampaigns = campaigns.find((c: { status: string }) => c.status === "ACTIVE")?._count._all ?? 0;

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col p-6 gap-4">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Link href="/dashboard"><Home size={14} /></Link>
          <span>›</span>
          <span className="text-gray-700">Map View</span>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">SITE MAP</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Total Sites: <strong>{allSites}</strong></span>
            <span>Mapped: <strong>{mappedSites}</strong></span>
            <span>Active Campaigns: <strong>{activeCampaigns}</strong></span>
          </div>
        </div>

        <MapClient markers={markers} totalSites={allSites} mappedSites={mappedSites} />
      </main>
    </>
  );
}
