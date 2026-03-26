"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, FileText, Users, Image, Tag, Download } from "lucide-react";
import { useRouter } from "next/navigation";

interface ActionDropdownProps {
  campaignId: string;
}

const ACTIONS = [
  { label: "Internal Report", icon: FileText, key: "internal" },
  { label: "Client Report", icon: Users, key: "client" },
  { label: "Update Approval Photos", icon: Image, key: "approval" },
  { label: "Add Creative Names", icon: Tag, key: "creative" },
  { label: "Download Verified Status Report", icon: Download, key: "download" },
] as const;

export default function ActionDropdown({ campaignId }: ActionDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAction = (key: string) => {
    setOpen(false);
    if (key === "internal") router.push(`/campaigns/${campaignId}/internal-report`);
    if (key === "client") router.push(`/campaigns/${campaignId}/client-report`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
      >
        Action <ChevronDown size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          {ACTIONS.map(({ label, icon: Icon, key }) => (
            <button
              key={key}
              onClick={() => handleAction(key)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
            >
              <Icon size={14} className="text-gray-400" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
