import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Header from "@/components/layout/Header";
import VendorsClient from "./VendorsClient";
import Link from "next/link";
import { Home } from "lucide-react";

export default async function VendorsPage() {
  const session = await auth();
  const brandId = (session?.user as { brandId?: string | null } | undefined)?.brandId ?? null;
  const isManager = session?.user?.role === "MANAGER" && brandId;

  const campaignIds = isManager
    ? (await db.campaign.findMany({ where: { brandId }, select: { id: true } })).map((c) => c.id)
    : null;

  const vendors = await db.vendor.findMany({
    where: campaignIds ? { sites: { some: { campaignId: { in: campaignIds } } } } : {},
    include: {
      sites: {
        where: campaignIds ? { campaignId: { in: campaignIds } } : {},
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const data = vendors.map((v) => ({
    id: v.id,
    name: v.name,
    city: v.city,
    state: v.state,
    siteCount: v.sites.length,
  }));

  return (
    <>
      <Header />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <Link href="/dashboard"><Home size={14} /></Link>
          <span>›</span>
          <span className="text-gray-700">Vendors</span>
        </div>
        <VendorsClient initialVendors={data} />
      </main>
    </>
  );
}
