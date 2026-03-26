import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import SitePanel from "@/components/reports/SitePanel";
import PhotoCard from "@/components/reports/PhotoCard";
import ReportToolbar from "@/components/reports/ReportToolbar";
import PhotoUpload from "@/components/reports/PhotoUpload";
import { formatDateRange } from "@/lib/utils";
import Link from "next/link";
import { Home } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InternalReportPage({ params }: PageProps) {
  const { id } = await params;

  const campaign = await db.campaign.findUnique({
    where: { id },
    include: {
      brand: true,
      sites: {
        include: {
          vendor: true,
          monitor: true,
          photos: { orderBy: { clickedAt: "asc" } },
        },
      },
    },
  });

  if (!campaign) return notFound();

  const allPhotos = campaign.sites.flatMap((s) => s.photos);
  const unblindedCount = allPhotos.filter((p) => !p.isHidden).length;
  const hiddenCount = allPhotos.filter((p) => p.isHidden).length;
  const auditedCount = campaign.sites.filter((s) => s.isAudited).length;

  // Use first site for the detail panel (in real use this is per-site navigation)
  const firstSite = campaign.sites[0];

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
          <span className="text-gray-700">Internal Report</span>
        </div>

        <div className="px-6 py-3 bg-white border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-800">Internal Report</h1>
          <div className="flex items-center gap-6 mt-1 text-sm text-gray-600">
            <span>Name: <strong>{campaign.name}</strong></span>
            <span>
              Duration:{" "}
              <strong>{formatDateRange(campaign.startDate, campaign.endDate)}</strong>
            </span>
            <span>Images: <strong>{allPhotos.length}</strong></span>
          </div>
        </div>

        <ReportToolbar
          campaignId={id}
          isInternal
          unblindedCount={unblindedCount}
          hiddenCount={hiddenCount}
          auditedCount={auditedCount}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Site Panel */}
          {firstSite && (
            <SitePanel
              siteCode={firstSite.siteCode}
              mediaType={firstSite.mediaType.replace("_", " ")}
              monitor={firstSite.monitor?.name ?? "—"}
              locality={firstSite.locality}
              vendor={firstSite.vendor.name}
              frequency={firstSite.frequency}
            />
          )}

          {/* Photo Grid */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Upload widget */}
            {firstSite && (
              <PhotoUpload
                campaignId={id}
                siteId={firstSite.id}
                monitorId={firstSite.monitorId ?? undefined}
                onUploaded={() => {}}
              />
            )}
            {allPhotos.length === 0 ? (
              <p className="text-gray-400 text-sm text-center mt-8">
                No photos uploaded yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {allPhotos.map((photo: typeof allPhotos[number]) => (
                  <PhotoCard
                    key={photo.id}
                    id={photo.id}
                    url={photo.url}
                    clickedAt={photo.clickedAt}
                    comment={photo.comment}
                    status={photo.status}
                    isInternal
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
