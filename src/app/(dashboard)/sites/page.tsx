import { db } from "@/lib/db";
import Header from "@/components/layout/Header";
import SitesClient from "./SitesClient";
import Link from "next/link";
import { Home } from "lucide-react";

export default async function SitesPage() {
  const [sites, campaigns, vendors, monitors] = await Promise.all([
    db.site.findMany({
      include: { vendor: true, campaign: true, monitor: true },
      orderBy: { createdAt: "desc" },
    }),
    db.campaign.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.vendor.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.monitor.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <Link href="/dashboard"><Home size={14} /></Link>
          <span>›</span>
          <span className="text-gray-700">Sites</span>
        </div>
        <SitesClient
          initialSites={sites}
          campaigns={campaigns}
          vendors={vendors}
          monitors={monitors}
        />
      </main>
    </>
  );
}
