"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMobileToken, clearMobileToken, mobileFetch } from "@/lib/mobileWebAuth";
import { LogOut, MapPin, Search, ChevronRight, Camera } from "lucide-react";

interface Site {
  id: string;
  siteCode: string;
  mediaType: string;
  locality: string;
  city: string | null;
  state: string | null;
  frequency: string;
  campaign: { id: string; name: string; status: string };
  vendor: { name: string };
  _count: { photos: number };
}

export default function MobileSitesPage() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getMobileToken()) { router.replace("/mobile"); return; }
    mobileFetch<Site[]>("/api/mobile/sites")
      .then(setSites)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  function logout() {
    clearMobileToken();
    router.push("/mobile");
  }

  const filtered = sites.filter(
    (s) =>
      s.siteCode.toLowerCase().includes(search.toLowerCase()) ||
      s.locality.toLowerCase().includes(search.toLowerCase()) ||
      s.campaign.name.toLowerCase().includes(search.toLowerCase())
  );

  const STATUS_COLOR: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    UPCOMING: "bg-blue-100 text-blue-700",
    PAUSED: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#e63946] px-4 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">My Sites</h1>
          <p className="text-red-200 text-xs">{sites.length} site{sites.length !== 1 ? "s" : ""} assigned</p>
        </div>
        <button onClick={logout} className="p-2 rounded-full bg-red-700 active:bg-red-800">
          <LogOut size={18} color="#fff" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by site, location or campaign…"
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-2">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <p className="text-red-500 text-sm text-center py-10">{error}</p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <Camera size={36} className="mb-3 opacity-40" />
            <p className="text-sm">{search ? "No sites match your search." : "No sites assigned."}</p>
          </div>
        )}
        {filtered.map((site) => (
          <button
            key={site.id}
            onClick={() => router.push(`/mobile/sites/${site.id}`)}
            className="w-full bg-white rounded-xl p-4 border border-gray-100 text-left flex items-center gap-3 active:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono font-semibold text-gray-800 text-sm">{site.siteCode}</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {site.mediaType.replace("_", " ")}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[site.campaign.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {site.campaign.status}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={11} className="flex-shrink-0" />
                <span className="truncate">{site.locality}{site.city ? `, ${site.city}` : ""}</span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-xs text-gray-400 truncate">{site.campaign.name}</p>
                <p className="text-xs text-gray-400 flex-shrink-0 ml-2">
                  {site._count.photos} photo{site._count.photos !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
