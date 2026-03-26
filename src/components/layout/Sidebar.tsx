"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Megaphone, Share2, Image, MapPin, MonitorCheck, Truck, Map, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",        icon: LayoutDashboard, label: "Dashboard" },
  { href: "/campaigns",        icon: Megaphone,       label: "Campaigns" },
  { href: "/sites",            icon: MapPin,          label: "Sites" },
  { href: "/monitors",         icon: MonitorCheck,    label: "Monitors" },
  { href: "/vendors",          icon: Truck,           label: "Vendors" },
  { href: "/map",              icon: Map,             label: "Map View" },
  { href: "/shared-campaigns", icon: Share2,          label: "Shared Campaigns" },
  { href: "/media-hub",        icon: Image,           label: "Media Hub" },
  { href: "/settings",         icon: Settings,        label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-[#1a1a2e] flex flex-col items-center py-4 z-50 overflow-y-auto">
      {/* Logo */}
      <Link href="/dashboard" className="mb-4 shrink-0">
        <div className="w-10 h-10 bg-[#e63946] rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">FM</span>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col items-center gap-1.5 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                active
                  ? "bg-[#e63946] text-white"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
