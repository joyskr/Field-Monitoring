"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Play, Calendar, Clock, Pause, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "Active", icon: Play, color: "text-green-600" },
  { key: "Upcoming", icon: Calendar, color: "text-blue-600" },
  { key: "Expired", icon: Clock, color: "text-gray-500" },
  { key: "Paused", icon: Pause, color: "text-yellow-600" },
  { key: "Terminated", icon: XCircle, color: "text-red-600" },
] as const;

interface CampaignTabsProps {
  counts: Record<string, number>;
}

export default function CampaignTabs({ counts }: CampaignTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("tab") ?? "Active";

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`/campaigns?${params.toString()}`);
  };

  return (
    <div className="flex border-b border-gray-200">
      {TABS.map(({ key, icon: Icon, color }) => (
        <button
          key={key}
          onClick={() => setTab(key)}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            current === key
              ? "border-[#e63946] text-[#e63946]"
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          <Icon size={14} className={current === key ? "text-[#e63946]" : color} />
          {key} Campaigns ({counts[key.toUpperCase()] ?? 0})
        </button>
      ))}
    </div>
  );
}
