"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { FormField, Input } from "@/components/ui/FormField";

interface EditCampaign {
  id: string;
  name: string;
  type: string;
  brandId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  state: string;
  status: string;
}

interface Props {
  brands: { id: string; name: string }[];
  editCampaign?: EditCampaign;
  isAdmin?: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function CampaignFormModal({
  brands,
  editCampaign,
  isAdmin = false,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!editCampaign;

  const [name, setName] = useState(editCampaign?.name ?? "");
  const [brandId, setBrandId] = useState(editCampaign?.brandId ?? brands[0]?.id ?? "");
  const [startDate, setStartDate] = useState(editCampaign?.startDate ?? "");
  const [endDate, setEndDate] = useState(editCampaign?.endDate ?? "");
  const [state, setState] = useState(editCampaign?.state ?? "");
  const [type, setType] = useState(editCampaign?.type ?? "STANDARD");
  const [status, setStatus] = useState(editCampaign?.status ?? "UPCOMING");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const url = isEdit ? `/api/campaigns/${editCampaign!.id}` : "/api/campaigns";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, brandId, startDate, endDate, state, type, status }),
    });

    setSaving(false);
    if (res.ok) {
      onSaved();
      onClose();
    } else {
      const d = await res.json();
      setError(d.error ?? `Failed to ${isEdit ? "update" : "create"} campaign.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">
            {isEdit ? "Edit Campaign" : "New Campaign"}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={save} className="p-5 space-y-4">
          <FormField label="Campaign Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Campaign name" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            {/* Brand selector — ADMIN only; MANAGER's brand is fixed */}
            {isAdmin ? (
              <FormField label="Brand" required>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#e63946]"
                >
                  <option value="">— Select brand —</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </FormField>
            ) : (
              <FormField label="Brand">
                <p className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                  {brands.find((b) => b.id === brandId)?.name ?? "—"}
                </p>
              </FormField>
            )}
            <FormField label="Type">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#e63946]"
              >
                <option value="STANDARD">Standard</option>
                <option value="SHARED">Shared</option>
              </select>
            </FormField>
            <FormField label="Start Date" required>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </FormField>
            <FormField label="End Date" required>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </FormField>
            <FormField label="State / UT" required>
              <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Maharashtra" />
            </FormField>
            <FormField label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#e63946]"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="EXPIRED">Expired</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </FormField>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} className="text-sm text-gray-500 px-3 py-1.5 hover:text-gray-700">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (!isEdit && !brandId)}
              className="text-sm bg-[#e63946] text-white px-4 py-1.5 rounded-lg font-medium disabled:opacity-60 hover:bg-red-700"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
