"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import CampaignFormModal from "./CampaignFormModal";

interface Props {
  brands: { id: string; name: string }[];
}

export default function AddCampaignButton({ brands }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm bg-[#e63946] text-white rounded px-3 py-1.5 hover:bg-red-700 font-medium"
      >
        <Plus size={14} />
        Add Campaign
      </button>
      {open && (
        <CampaignFormModal
          brands={brands}
          onClose={() => setOpen(false)}
          onSaved={() => router.refresh()}
        />
      )}
    </>
  );
}
