"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Site {
  id: string;
  siteCode: string;
  locality: string;
}

interface Props {
  sites: Site[];
  selectedId: string;
  campaignId: string;
  basePath: string;
}

export default function SiteSwitcher({ sites, selectedId, basePath }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const select = (id: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("siteId", id);
    router.push(`${basePath}?${p.toString()}`);
  };

  return (
    <div className="w-44 border-r border-gray-200 overflow-y-auto flex-shrink-0 bg-white">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2 border-b border-gray-100">
        Sites ({sites.length})
      </p>
      {sites.map((s) => (
        <button
          key={s.id}
          onClick={() => select(s.id)}
          className={`w-full text-left px-3 py-2.5 border-b border-gray-50 text-xs transition-colors hover:bg-gray-50 ${
            selectedId === s.id ? "bg-red-50 border-l-2 border-l-[#e63946]" : ""
          }`}
        >
          <p className={`font-mono font-medium ${selectedId === s.id ? "text-[#e63946]" : "text-gray-800"}`}>
            {s.siteCode}
          </p>
          <p className="text-gray-400 truncate mt-0.5">{s.locality}</p>
        </button>
      ))}
    </div>
  );
}
