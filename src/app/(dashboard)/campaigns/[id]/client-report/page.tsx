import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import SitePanel from "@/components/reports/SitePanel";
import SiteSwitcher from "@/components/reports/SiteSwitcher";
import PhotoCard from "@/components/reports/PhotoCard";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { formatDateRange } from "@/lib/utils";
import Link from "next/link";
import { Home } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ siteId?: string }>;
}

export default async function ClientReportPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { siteId } = await searchParams;

  const session = await auth();
  const brandId = (session?.user as { brandId?: string | null } | undefined)?.brandId ?? null;
  const isManager = session?.user?.role === "MANAGER" && brandId;

  const campaign = await db.campaign.findUnique({
    where: { id, ...(isManager ? { brandId } : {}) },
    include: {
      brand: true,
      sites: {
        include: {
          vendor: true,
          monitor: true,
          photos: { orderBy: { clickedAt: "asc" } },
        },
        orderBy: { siteCode: "asc" },
      },
    },
  });

  if (!campaign) return notFound();

  // Client report only shows audited sites
  const auditedSites = campaign.sites.filter((s) => s.isAudited);

  // Selected site — default to first audited (or first overall)
  const selectedSite = auditedSites.find((s) => s.id === siteId) ?? auditedSites[0] ?? campaign.sites[0];
  const sitePhotos = selectedSite ? selectedSite.photos : [];

  const siteSwitcherItems = auditedSites.map((s) => ({
    id: s.id,
    siteCode: s.siteCode,
    locality: s.locality,
  }));

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-gray-500 px-6 py-3 border-b border-gray-100 bg-white">
          <Link href="/dashboard"><Home size={14} /></Link>
          <span>›</span>
          <Link href="/campaigns" className="hover:text-gray-700">Campaigns</Link>
          <span>›</span>
          <span className="text-gray-700">Client Report</span>
        </div>

        <div className="px-6 py-3 bg-white border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-800">Client Report</h1>
          <div className="flex items-center gap-6 mt-1 text-sm text-gray-600">
            <span>Name: <strong>{campaign.name}</strong></span>
            <span>
              Duration:{" "}
              <strong>{formatDateRange(campaign.startDate, campaign.endDate)}</strong>
            </span>
            <span>Audited Sites: <strong>{auditedSites.length}</strong></span>
            {selectedSite && <span>Site Images: <strong>{sitePhotos.length}</strong></span>}
          </div>
        </div>

        <ReportToolbar
          campaignId={id}
          isInternal={false}
          unblindedCount={0}
          hiddenCount={0}
          auditedCount={auditedSites.length}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Site switcher — only audited sites */}
          {auditedSites.length > 0 && (
            <SiteSwitcher
              sites={siteSwitcherItems}
              selectedId={selectedSite?.id ?? ""}
              campaignId={id}
              basePath={`/campaigns/${id}/client-report`}
            />
          )}

          {/* Site detail panel */}
          {selectedSite && (
            <SitePanel
              siteCode={selectedSite.siteCode}
              mediaType={selectedSite.mediaType.replace("_", " ")}
              monitor={selectedSite.monitor?.name ?? "—"}
              locality={selectedSite.locality}
              vendor={selectedSite.vendor.name}
              frequency={selectedSite.frequency}
            />
          )}

          <div className="flex-1 overflow-y-auto p-4">
            {sitePhotos.length === 0 ? (
              <p className="text-gray-400 text-sm text-center mt-12">
                {auditedSites.length === 0
                  ? "No audited sites in this campaign yet."
                  : "No photos for this site yet."}
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {sitePhotos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    id={photo.id}
                    url={photo.url}
                    clickedAt={photo.clickedAt}
                    comment={photo.comment}
                    status={photo.status}
                    isInternal={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
