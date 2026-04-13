"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getMobileToken, mobileFetch } from "@/lib/mobileWebAuth";
import { ArrowLeft, Camera, MapPin } from "lucide-react";

interface Site {
  id: string;
  siteCode: string;
  mediaType: string;
  locality: string;
  city: string | null;
  state: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  frequency: string;
  campaign: { id: string; name: string };
  vendor: { name: string };
}

interface Photo {
  id: string;
  url: string;
  status: string;
  clickedAt: string;
  rejectionType: string | null;
  rejectionReason: string | null;
}

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  APPROVED: { label: "Approved", bg: "#dcfce7", color: "#16a34a" },
  PENDING:  { label: "Pending",  bg: "#fef3c7", color: "#d97706" },
  REJECTED: { label: "Rejected", bg: "#fee2e2", color: "#dc2626" },
};

export default function MobileSiteDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!getMobileToken()) { router.replace("/mobile"); return; }
    try {
      const [siteData, photosData] = await Promise.all([
        mobileFetch<Site>(`/api/mobile/sites/${id}`),
        mobileFetch<Photo[]>(`/api/mobile/photos?siteId=${id}`),
      ]);
      setSite(siteData);
      setPhotos(photosData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load site.");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
        <p className="text-red-500 text-sm mb-4">{error || "Site not found."}</p>
        <button onClick={() => router.back()} className="text-[#e63946] text-sm font-medium">Go back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-4 border-b border-gray-200 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-1.5 rounded-full active:bg-gray-100">
          <ArrowLeft size={20} color="#374151" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-gray-800 text-base">{site.siteCode}</h1>
          <p className="text-xs text-gray-500 truncate">
            {site.locality}{site.city ? `, ${site.city}` : ""}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-8">
        {/* Site info */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Site Details</p>
          <Row label="Campaign" value={site.campaign.name} />
          <Row label="Media Type" value={site.mediaType.replace("_", " ")} />
          <Row label="Vendor" value={site.vendor.name} />
          <Row label="Frequency" value={site.frequency} />
          {site.address && <Row label="Address" value={site.address} />}
          {site.state && <Row label="State" value={site.state} />}
          {site.lat != null && site.lng != null && (
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin size={11} /> GPS
              </span>
              <span className="text-xs text-gray-700 font-medium">
                {site.lat.toFixed(5)}, {site.lng.toFixed(5)}
              </span>
            </div>
          )}
        </div>

        {/* Capture button */}
        <button
          onClick={() =>
            router.push(
              `/mobile/camera?siteId=${site.id}&campaignId=${site.campaign.id}&siteCode=${encodeURIComponent(site.siteCode)}`
            )
          }
          className="w-full bg-[#e63946] rounded-xl py-4 flex items-center justify-center gap-2 active:bg-red-700 transition-colors"
        >
          <Camera size={20} color="#fff" />
          <span className="text-white font-semibold">Capture Photo</span>
        </button>

        {/* Photos */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Photos ({photos.length})
          </p>
          {photos.length === 0 ? (
            <div className="bg-white rounded-xl p-10 flex flex-col items-center border border-gray-100">
              <Camera size={32} color="#d1d5db" />
              <p className="text-gray-400 text-sm mt-2">No photos yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => {
                const cfg = STATUS_STYLES[photo.status] ?? STATUS_STYLES.PENDING;
                return (
                  <div key={photo.id} className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt="site photo"
                      className="w-full h-full object-cover rounded-lg bg-gray-200"
                    />
                    <div
                      className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}
                      title={photo.rejectionReason ?? undefined}
                    >
                      {cfg.label}
                    </div>
                    {photo.status === "REJECTED" && photo.rejectionReason && (
                      <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded max-w-[90%] truncate">
                        {photo.rejectionReason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs text-gray-700 font-medium max-w-[60%] text-right">{value}</span>
    </div>
  );
}
