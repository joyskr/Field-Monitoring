import { db } from "@/lib/db";
import Header from "@/components/layout/Header";
import KpiCard from "@/components/dashboard/KpiCard";
import DashboardClient from "./DashboardClient";
import { Megaphone, MapPin, Building2, Users, Tag, Monitor } from "lucide-react";
import { getDateRange, type Period } from "@/lib/dateRange";
import { formatDateTime } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { period = "last-3-months", from, to } = await searchParams;
  const { start, end } = getDateRange(period as Period, from, to);

  const [
    campaignCount,
    stateGroups,
    cityGroups,
    vendorCount,
    brandCount,
    mediaGroups,
    monitors,
    campaigns,
    recentPhotos,
    photoStatusCounts,
  ] = await Promise.all([
    db.campaign.count(),
    db.campaign.groupBy({ by: ["state"] }),
    db.site.groupBy({ by: ["city"] }),
    db.vendor.count(),
    db.brand.count(),
    db.site.groupBy({ by: ["mediaType"] }),

    // Top monitors filtered by date range
    db.monitor.findMany({
      include: {
        photos: {
          where: { clickedAt: { gte: start, lte: end } },
          select: { id: true, status: true },
        },
        sites: { select: { campaignId: true } },
      },
    }),

    // Campaign progress for chart
    db.campaign.findMany({
      select: { id: true, name: true, popProgress: true, status: true, startDate: true, endDate: true },
      where: { status: { in: ["ACTIVE", "UPCOMING", "PAUSED"] } },
      orderBy: { popProgress: "desc" },
      take: 8,
    }),

    // Recent activity — last 10 photos
    db.photo.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        site: { select: { siteCode: true, locality: true } },
        campaign: { select: { name: true } },
        uploadedBy: { select: { name: true } },
      },
    }),

    // Photo status breakdown
    db.photo.groupBy({
      by: ["status"],
      where: { clickedAt: { gte: start, lte: end } },
      _count: { _all: true },
    }),
  ]);

  // Build top monitors data
  const monitorData = monitors
    .map((m) => {
      const total = m.photos.length;
      const completed = m.photos.filter((p: { status: string }) => p.status === "APPROVED").length;
      const campaignSet = new Set(m.sites.map((s: { campaignId: string }) => s.campaignId)).size;
      return {
        rank: 0,
        name: m.name,
        campaigns: campaignSet,
        totalTask: total,
        taskCompleted: completed,
        progress: total > 0 ? (completed / total) * 100 : 0,
      };
    })
    .filter((m) => m.totalTask > 0)
    .sort((a, b) => b.progress - a.progress)
    .map((m, idx) => ({ ...m, rank: idx + 1 }));

  // Photo status breakdown for pie chart
  const statusBreakdown = (photoStatusCounts as Array<{ status: string; _count: { _all: number } }>).map((s) => ({
    name: s.status.charAt(0) + s.status.slice(1).toLowerCase(),
    value: s._count._all,
  }));

  // Campaign progress for bar chart
  const campaignProgress = campaigns.map((c) => ({
    name: c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name,
    progress: Math.round(c.popProgress),
    status: c.status,
  }));

  // Recent activity
  const activity = recentPhotos.map((p) => ({
    id: p.id,
    site: p.site.siteCode,
    locality: p.site.locality,
    campaign: p.campaign.name,
    uploadedBy: p.uploadedBy?.name ?? "Unknown",
    status: p.status,
    clickedAt: formatDateTime(p.clickedAt),
  }));

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          <KpiCard label="Campaigns"   value={campaignCount}          icon={Megaphone} iconColor="text-red-400" />
          <KpiCard label="States & UTs" value={stateGroups.length}    icon={MapPin}    iconColor="text-green-400" />
          <KpiCard label="Cities"      value={cityGroups.length}      icon={Building2} iconColor="text-orange-400" />
          <KpiCard label="Vendors"     value={vendorCount}            icon={Users}     iconColor="text-blue-400" />
          <KpiCard label="Brands"      value={brandCount}             icon={Tag}       iconColor="text-purple-400" />
          <KpiCard label="Media Types" value={mediaGroups.length}     icon={Monitor}   iconColor="text-gray-400" />
        </div>

        <DashboardClient
          monitorData={monitorData}
          campaignProgress={campaignProgress}
          statusBreakdown={statusBreakdown}
          activity={activity}
          currentPeriod={period as Period}
          currentFrom={from}
          currentTo={to}
        />
      </main>
    </>
  );
}
