import { db } from "@/lib/db";
import Header from "@/components/layout/Header";
import MediaHubClient from "./MediaHubClient";
import Link from "next/link";
import { Home } from "lucide-react";

export default async function MediaHubPage() {
  const [rawAssets, campaigns] = await Promise.all([
    db.mediaAsset.findMany({
      include: {
        campaign: { select: { name: true } },
        uploadedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.campaign.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const assets = rawAssets.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }));

  return (
    <>
      <Header />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <Link href="/dashboard"><Home size={14} /></Link>
          <span>›</span>
          <span className="text-gray-700">Media Hub</span>
        </div>
        <MediaHubClient initialAssets={assets} campaigns={campaigns} />
      </main>
    </>
  );
}
