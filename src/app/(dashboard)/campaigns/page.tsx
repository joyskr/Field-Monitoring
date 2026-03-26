import { db } from "@/lib/db";
import { CampaignStatus } from "@/generated/prisma/client";
import Header from "@/components/layout/Header";
import CampaignTabs from "@/components/campaigns/CampaignTabs";
import CampaignRow from "@/components/campaigns/CampaignRow";
import { Search, Filter, Download, ArrowLeftRight, Image } from "lucide-react";
import { Home } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ tab?: string; q?: string }>;
}

export default async function CampaignsPage({ searchParams }: PageProps) {
  const { tab = "Active", q = "" } = await searchParams;

  const statusMap: Record<string, CampaignStatus> = {
    Active: "ACTIVE",
    Upcoming: "UPCOMING",
    Expired: "EXPIRED",
    Paused: "PAUSED",
    Terminated: "TERMINATED",
  };

  const [campaigns, counts] = await Promise.all([
    db.campaign.findMany({
      where: {
        status: statusMap[tab] ?? "ACTIVE",
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      include: { brand: true, createdBy: true },
      orderBy: { createdAt: "desc" },
    }),
    db.campaign.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const countMap = Object.fromEntries(
    counts.map((c: { status: string; _count: { _all: number } }) => [c.status, c._count._all])
  );

  return (
    <>
      <Header />
      <main className="flex-1 p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <Link href="/dashboard" className="hover:text-gray-700">
            <Home size={14} />
          </Link>
          <span>›</span>
          <span className="text-gray-700">Campaigns</span>
        </div>

        <h1 className="text-xl font-semibold text-gray-800 mb-4">CAMPAIGNS</h1>

        <div className="bg-white rounded-lg border border-gray-200">
          {/* Tabs */}
          <CampaignTabs counts={countMap} />

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                defaultValue={q}
                className="pl-7 pr-3 py-1.5 border border-gray-200 rounded text-sm w-48 focus:outline-none focus:ring-1 focus:ring-[#e63946]"
                placeholder="Search"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50">
                <Filter size={13} />
                Expiring Soon
              </button>
              <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50">
                <Download size={13} />
                Download Expired Campaigns
              </button>
              <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50">
                <ArrowLeftRight size={13} />
                Image Transfer
              </button>
              <button className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded px-3 py-1.5 hover:bg-gray-50">
                <Download size={13} />
                Download Reports
              </button>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100 uppercase tracking-wide">
                <th className="px-4 py-2">Campaign Name</th>
                <th className="px-4 py-2">Created By</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Brand</th>
                <th className="px-4 py-2">Duration (MM/DD/YYYY)</th>
                <th className="px-4 py-2">POP</th>
                <th className="px-4 py-2">State</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
                <th className="px-4 py-2">Map</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No campaigns found.
                  </td>
                </tr>
              ) : (
                campaigns.map((c: typeof campaigns[number]) => (
                  <CampaignRow
                    key={c.id}
                    id={c.id}
                    name={c.name}
                    createdBy={c.createdBy.name}
                    type={c.type}
                    brand={c.brand.name}
                    startDate={c.startDate}
                    endDate={c.endDate}
                    state={c.state}
                    status={c.status}
                    popProgress={c.popProgress}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
