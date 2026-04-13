import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Header from "@/components/layout/Header";
import SettingsClient from "./SettingsClient";
import Link from "next/link";
import { Home } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) redirect("/login");

  const [teamMembers, vendors, brands] = user.role === "ADMIN"
    ? await Promise.all([
        db.user.findMany({
          select: {
            id: true, name: true, email: true, role: true, createdAt: true,
            vendor: { select: { id: true, name: true } },
            brand: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        }),
        db.vendor.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
        db.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      ])
    : [[], [], []];

  return (
    <>
      <Header />
      <main className="flex-1 p-6">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <Link href="/dashboard"><Home size={14} /></Link>
          <span>›</span>
          <span className="text-gray-700">Settings</span>
        </div>
        <SettingsClient
          user={{ ...user, createdAt: user.createdAt.toISOString() }}
          teamMembers={teamMembers.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))}
          vendors={vendors}
          brands={brands}
        />
      </main>
    </>
  );
}
