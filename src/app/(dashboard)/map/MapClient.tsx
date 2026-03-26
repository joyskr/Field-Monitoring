"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { MapPin } from "lucide-react";

// Leaflet must be loaded client-side only (no SSR)
const SiteMap = dynamic(() => import("@/components/map/SiteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading map…</p>
    </div>
  ),
});

interface Marker {
  id: string;
  siteCode: string;
  mediaType: string;
  locality: string;
  lat: number;
  lng: number;
  campaignName: string;
  campaignStatus: string;
  vendorName: string;
  monitorName: string | null;
}

interface Props {
  markers: Marker[];
  totalSites: number;
  mappedSites: number;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-500",
  UPCOMING: "bg-blue-500",
  PAUSED: "bg-yellow-500",
  EXPIRED: "bg-gray-400",
  TERMINATED: "bg-red-500",
};

export default function MapClient({ markers }: Props) {
  const [filter, setFilter] = useState("ALL");

  const statuses = ["ALL", ...Array.from(new Set(markers.map((m) => m.campaignStatus)))];
  const filtered = filter === "ALL" ? markers : markers.filter((m) => m.campaignStatus === filter);

  return (
    <div className="flex gap-4 flex-1 min-h-0" style={{ height: "calc(100vh - 220px)" }}>
      {/* Sidebar */}
      <div className="w-64 shrink-0 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
        <div className="px-3 py-3 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filter by Status</p>
          <div className="flex flex-col gap-1">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors ${
                  filter === s ? "bg-[#e63946] text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s !== "ALL" && (
                  <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLORS[s] ?? "bg-gray-400"}`} />
                )}
                {s === "ALL" ? "All Sites" : s.charAt(0) + s.slice(1).toLowerCase()}
                <span className="ml-auto text-xs opacity-70">
                  {s === "ALL" ? markers.length : markers.filter((m) => m.campaignStatus === s).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Site list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-gray-400 text-xs text-center py-8">No sites with coordinates.</p>
          ) : (
            filtered.map((m) => (
              <div key={m.id} className="px-3 py-2.5 border-b border-gray-50 hover:bg-gray-50">
                <div className="flex items-start gap-2">
                  <MapPin size={12} className="text-[#e63946] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 font-mono">{m.siteCode}</p>
                    <p className="text-xs text-gray-500 truncate">{m.locality}</p>
                    <p className="text-xs text-gray-400 truncate">{m.campaignName}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {filtered.length === 0 && markers.length === 0 && (
          <div className="px-3 py-4 text-center">
            <p className="text-xs text-gray-400">Add lat/lng to sites to see them on the map.</p>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 rounded-lg overflow-hidden border border-gray-200">
        {filtered.length === 0 ? (
          <div className="h-full bg-gray-50 flex flex-col items-center justify-center gap-3">
            <MapPin size={40} className="text-gray-300" />
            <p className="text-gray-400 text-sm">No sites with coordinates to display.</p>
            <p className="text-gray-400 text-xs">Edit sites and add Latitude / Longitude values.</p>
          </div>
        ) : (
          <SiteMap markers={filtered} />
        )}
      </div>
    </div>
  );
}
