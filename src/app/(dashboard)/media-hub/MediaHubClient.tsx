"use client";

import { useState, useRef } from "react";
import { Upload, Trash2, Download, Search, FileImage, FileText, Film } from "lucide-react";
import Button from "@/components/ui/Button";
import { Select } from "@/components/ui/FormField";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Asset {
  id: string;
  name: string;
  url: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  campaign: { name: string } | null;
  uploadedBy: { name: string };
}

interface Campaign { id: string; name: string }

function fileIcon(type: string) {
  if (type.startsWith("image/")) return <FileImage size={20} className="text-blue-500" />;
  if (type.startsWith("video/")) return <Film size={20} className="text-purple-500" />;
  return <FileText size={20} className="text-gray-400" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MediaHubClient({ initialAssets, campaigns }: { initialAssets: Asset[]; campaigns: Campaign[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("ALL");
  const [uploading, setUploading] = useState(false);
  const [uploadCampaignId, setUploadCampaignId] = useState("");

  const filtered = initialAssets.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchCampaign = campaignFilter === "ALL" || a.campaign?.name === campaigns.find((c) => c.id === campaignFilter)?.name;
    return matchSearch && matchCampaign;
  });

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", file.name);
      if (uploadCampaignId) fd.append("campaignId", uploadCampaignId);
      await fetch("/api/media-assets", { method: "POST", body: fd });
    }
    setUploading(false);
    router.refresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch(`/api/media-assets/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">MEDIA HUB</h1>
        <div className="flex items-center gap-2">
          <Select
            value={uploadCampaignId}
            onChange={(e) => setUploadCampaignId(e.target.value)}
            className="text-xs w-44"
          >
            <option value="">No campaign</option>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload size={14} />
            {uploading ? "Uploading…" : "Upload Assets"}
          </Button>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets…"
            className="pl-7 pr-3 py-1.5 border border-gray-200 rounded text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#e63946]"
          />
        </div>
        <Select value={campaignFilter} onChange={(e) => setCampaignFilter(e.target.value)} className="text-sm w-44">
          <option value="ALL">All Campaigns</option>
          {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <span className="text-sm text-gray-400">{filtered.length} asset{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
          <FileImage size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No assets uploaded yet. Upload logos, artwork, and creative files.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((asset) => (
            <div key={asset.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden group">
              {/* Preview */}
              <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                {isImage(asset.fileType) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    {fileIcon(asset.fileType)}
                    <span className="text-xs text-gray-400">{asset.fileType.split("/")[1]?.toUpperCase()}</span>
                  </div>
                )}
                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={asset.url}
                    download
                    className="p-1.5 bg-white rounded-full text-gray-700 hover:text-blue-600"
                    title="Download"
                  >
                    <Download size={14} />
                  </a>
                  <button
                    onClick={() => handleDelete(asset.id, asset.name)}
                    className="p-1.5 bg-white rounded-full text-gray-700 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {/* Info */}
              <div className="p-2">
                <p className="text-xs font-medium text-gray-800 truncate" title={asset.name}>{asset.name}</p>
                <p className="text-xs text-gray-400">{formatSize(asset.fileSize)}</p>
                {asset.campaign && <p className="text-xs text-gray-400 truncate">{asset.campaign.name}</p>}
                <p className="text-xs text-gray-300">{formatDate(asset.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
