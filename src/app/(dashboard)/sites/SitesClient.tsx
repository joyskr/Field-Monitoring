"use client";

import { useState, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import SitesTable from "@/components/sites/SitesTable";
import SiteFormModal from "@/components/sites/SiteFormModal";
import { useRouter } from "next/navigation";

interface Site {
  id: string;
  siteCode: string;
  mediaType: string;
  locality: string;
  city: string | null;
  state: string | null;
  address: string | null;
  frequency: string;
  isAudited: boolean;
  vendorId: string;
  campaignId: string;
  monitorId: string | null;
  vendor: { name: string };
  campaign: { name: string };
  monitor: { name: string } | null;
}

interface Campaign { id: string; name: string }
interface Vendor   { id: string; name: string }
interface Monitor  { id: string; name: string }

interface Props {
  initialSites: Site[];
  campaigns: Campaign[];
  vendors: Vendor[];
  monitors: Monitor[];
  isAdmin?: boolean;
}

export default function SitesClient({ initialSites, campaigns, vendors, monitors, isAdmin = false }: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editSite, setEditSite] = useState<(Site & { address: string }) | null>(null);
  const [search, setSearch] = useState("");

  const filtered = initialSites.filter((s) =>
    s.siteCode.toLowerCase().includes(search.toLowerCase()) ||
    s.locality.toLowerCase().includes(search.toLowerCase()) ||
    s.campaign.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (site: Site) => {
    setEditSite({ ...site, address: site.address ?? "" });
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditSite(null);
    setModalOpen(true);
  };

  const handleSaved = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleDeleted = useCallback(() => {
    router.refresh();
  }, [router]);

  // Build the editSite shape for the modal
  const modalEditSite = editSite
    ? {
        id: editSite.id,
        siteCode: editSite.siteCode,
        mediaType: editSite.mediaType,
        locality: editSite.locality,
        address: editSite.address ?? "",
        city: editSite.city ?? "",
        state: editSite.state ?? "",
        vendorId: editSite.vendorId,
        campaignId: editSite.campaignId,
        frequency: editSite.frequency,
        monitorId: editSite.monitorId ?? "",
      }
    : null;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">SITES</h1>
        <Button onClick={handleAdd}>
          <Plus size={14} />
          Add Site
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search site code, locality, campaign…"
              className="pl-7 pr-3 py-1.5 border border-gray-200 rounded text-sm w-72 focus:outline-none focus:ring-1 focus:ring-[#e63946]"
            />
          </div>
          <span className="text-sm text-gray-400">{filtered.length} site{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <SitesTable
          sites={filtered}
          onEdit={handleEdit}
          onDeleted={handleDeleted}
          isAdmin={isAdmin}
        />
      </div>

      <SiteFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        editSite={modalEditSite}
        campaigns={campaigns}
        vendors={vendors}
        monitors={monitors}
      />
    </>
  );
}
