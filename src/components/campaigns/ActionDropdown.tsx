"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, FileText, Users, Image, Tag, Download, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import CampaignFormModal from "./CampaignFormModal";

interface CampaignData {
  id: string;
  name: string;
  type: string;
  brandId: string;
  startDate: Date;
  endDate: Date;
  state: string;
  status: string;
}

interface ActionDropdownProps {
  campaignId: string;
  campaignData?: CampaignData;
  brands?: { id: string; name: string }[];
  isAdmin?: boolean;
}

const ACTIONS = [
  { label: "Internal Report", icon: FileText, key: "internal" },
  { label: "Client Report",   icon: Users,    key: "client"   },
  { label: "Update Approval Photos", icon: Image,  key: "approval"  },
  { label: "Add Creative Names",     icon: Tag,    key: "creative"  },
  { label: "Download Verified Status Report", icon: Download, key: "download" },
] as const;

function toDateInput(d: Date) {
  return new Date(d).toISOString().slice(0, 10);
}

export default function ActionDropdown({
  campaignId,
  campaignData,
  brands = [],
  isAdmin = false,
}: ActionDropdownProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAction = (key: string) => {
    setOpen(false);
    if (key === "internal") router.push(`/campaigns/${campaignId}/internal-report`);
    if (key === "client")   router.push(`/campaigns/${campaignId}/client-report`);
    if (key === "edit")     setEditOpen(true);
  };

  const editCampaign = campaignData
    ? {
        id: campaignData.id,
        name: campaignData.name,
        type: campaignData.type,
        brandId: campaignData.brandId,
        startDate: toDateInput(campaignData.startDate),
        endDate: toDateInput(campaignData.endDate),
        state: campaignData.state,
        status: campaignData.status,
      }
    : undefined;

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
        >
          Action <ChevronDown size={14} />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {campaignData && (
              <button
                onClick={() => handleAction("edit")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left border-b border-gray-100"
              >
                <Pencil size={14} className="text-gray-400" />
                Edit Campaign
              </button>
            )}
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

      {editOpen && editCampaign && (
        <CampaignFormModal
          brands={brands}
          editCampaign={editCampaign}
          isAdmin={isAdmin}
          onClose={() => setEditOpen(false)}
          onSaved={() => router.refresh()}
        />
      )}
    </>
  );
}
