"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";

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

interface Props {
  sites: Site[];
  onEdit: (site: Site) => void;
  onDeleted: () => void;
}

export default function SitesTable({ sites, onEdit, onDeleted }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this site? All associated photos will also be removed.")) return;
    setDeleting(id);
    await fetch(`/api/sites/${id}`, { method: "DELETE" });
    setDeleting(null);
    onDeleted();
  };

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-gray-500 border-b border-gray-100 uppercase tracking-wide">
          <th className="px-4 py-2">Site Code</th>
          <th className="px-4 py-2">Media Type</th>
          <th className="px-4 py-2">Locality</th>
          <th className="px-4 py-2">Campaign</th>
          <th className="px-4 py-2">Vendor</th>
          <th className="px-4 py-2">Monitor</th>
          <th className="px-4 py-2">Frequency</th>
          <th className="px-4 py-2">Audited</th>
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {sites.length === 0 ? (
          <tr>
            <td colSpan={9} className="px-4 py-12 text-center text-gray-400">No sites found.</td>
          </tr>
        ) : (
          sites.map((site) => (
            <tr key={site.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs font-medium text-gray-800">{site.siteCode}</td>
              <td className="px-4 py-3 text-gray-600 capitalize">{site.mediaType.replace("_", " ").toLowerCase()}</td>
              <td className="px-4 py-3 text-gray-600">{site.locality}</td>
              <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{site.campaign.name}</td>
              <td className="px-4 py-3 text-gray-600">{site.vendor.name}</td>
              <td className="px-4 py-3 text-gray-600">{site.monitor?.name ?? <span className="text-gray-300">—</span>}</td>
              <td className="px-4 py-3 text-gray-600 capitalize">{site.frequency.toLowerCase()}</td>
              <td className="px-4 py-3">
                <Badge label={site.isAudited ? "Yes" : "No"} variant={site.isAudited ? "approved" : "pending"} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(site)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(site.id)}
                    disabled={deleting === site.id}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
