"use client";

import { useState } from "react";
import { Share2, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { FormField, Input, Select } from "@/components/ui/FormField";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SharedEntry {
  id: string;
  campaign: {
    id: string;
    name: string;
    status: string;
    brand: { name: string };
    createdBy: { name: string };
    startDate: string;
    endDate: string;
  };
  sharedBy: { name: string; email: string };
  createdAt: string;
}

interface MyCampaign { id: string; name: string; status: string }

export default function SharedCampaignsClient({
  sharedWithMe,
  myCampaigns,
}: {
  sharedWithMe: SharedEntry[];
  myCampaigns: MyCampaign[];
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [campaignId, setCampaignId] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignId || !email) { setError("Select a campaign and enter an email."); return; }
    setSaving(true);
    setError(""); setSuccess("");
    const res = await fetch("/api/shared-campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, email }),
    });
    setSaving(false);
    if (res.ok) {
      setSuccess("Campaign shared successfully!");
      setCampaignId(""); setEmail("");
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to share.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">SHARED CAMPAIGNS</h1>
        <Button onClick={() => { setModalOpen(true); setError(""); setSuccess(""); }}>
          <Plus size={14} />
          Share a Campaign
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <Share2 size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Campaigns shared with you</span>
          <span className="ml-auto text-xs text-gray-400">{sharedWithMe.length} campaign{sharedWithMe.length !== 1 ? "s" : ""}</span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-100 uppercase tracking-wide">
              <th className="px-4 py-2">Campaign</th>
              <th className="px-4 py-2">Brand</th>
              <th className="px-4 py-2">Duration</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Shared By</th>
              <th className="px-4 py-2">Shared On</th>
            </tr>
          </thead>
          <tbody>
            {sharedWithMe.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No campaigns have been shared with you yet.</td></tr>
            ) : sharedWithMe.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{s.campaign.name}</td>
                <td className="px-4 py-3 text-gray-600">{s.campaign.brand.name}</td>
                <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                  {formatDate(s.campaign.startDate)} → {formatDate(s.campaign.endDate)}
                </td>
                <td className="px-4 py-3">
                  <Badge label={s.campaign.status} variant={s.campaign.status.toLowerCase() as Parameters<typeof Badge>[0]["variant"]} />
                </td>
                <td className="px-4 py-3 text-gray-600">{s.sharedBy.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(s.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Share a Campaign" size="sm">
        <form onSubmit={handleShare} className="space-y-4">
          <FormField label="Campaign" required>
            <Select value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
              <option value="">Select campaign…</option>
              {myCampaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.status.toLowerCase()})</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Share with (email)" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@example.com" />
          </FormField>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Sharing…" : "Share"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
