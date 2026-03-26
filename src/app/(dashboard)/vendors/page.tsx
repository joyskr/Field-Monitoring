import { db } from "@/lib/db";
import Header from "@/components/layout/Header";
import VendorsClient from "./VendorsClient";
import Link from "next/link";
import { Home } from "lucide-react";

export default async function VendorsPage() {
  const vendors = await db.vendor.findMany({
    include: { sites: { select: { id: true } } },
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
