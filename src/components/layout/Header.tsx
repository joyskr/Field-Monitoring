"use client";

import { Settings, Video, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import NotificationBell from "./NotificationBell";
import Link from "next/link";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      {title && <h1 className="text-xl font-semibold text-gray-800">{title}</h1>}
      <div className="ml-auto flex items-center gap-1">
        <button
          title="Tutorial"
          className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-gray-700 text-xs"
        >
          <Video size={18} />
          <span>Tutorial</span>
        </button>

        <NotificationBell />

        <Link
          href="/settings"
          className="flex flex-col items-center px-3 py-1 text-gray-500 hover:text-gray-700 text-xs"
          title="Settings"
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="ml-2 bg-[#e63946] text-white text-sm font-medium px-4 py-1.5 rounded flex items-center gap-1 hover:bg-red-700 transition-colors"
        >
          <LogOut size={14} />
          Log Out
        </button>
      </div>
    </header>
  );
}
