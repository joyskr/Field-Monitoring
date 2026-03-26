"use client";

import { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { FormField, Input, Select } from "@/components/ui/FormField";
import Button from "@/components/ui/Button";

const MEDIA_TYPES = ["BILLBOARD", "TRANSIT", "STREET_FURNITURE", "AIRPORT", "MALL", "DIGITAL"];
const FREQUENCIES = ["DAILY", "WEEKLY", "MONTHLY"];

interface Campaign { id: string; name: string }
interface Vendor   { id: string; name: string }
interface Monitor  { id: string; name: string }

interface SiteFormData {
  siteCode: string;
  mediaType: string;
  locality: string;
  address: string;
  city: string;
  state: string;
  vendorId: string;
  campaignId: string;
  frequency: string;
  monitorId: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editSite?: (SiteFormData & { id: string }) | null;
  campaigns: Campaign[];
  vendors: Vendor[];
  monitors: Monitor[];
}

const empty: SiteFormData = {
  siteCode: "", mediaType: "BILLBOARD", locality: "", address: "",
  city: "", state: "", vendorId: "", campaignId: "", frequency: "DAILY", monitorId: "",
};

export default function SiteFormModal({ open, onClose, onSaved, editSite, campaigns, vendors, monitors }: Props) {
  const [form, setForm] = useState<SiteFormData>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(editSite ? { ...editSite } : empty);
    setError("");
  }, [editSite, open]);

  const set = (k: keyof SiteFormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.siteCode || !form.campaignId || !form.vendorId || !form.locality) {
      setError("Site code, campaign, vendor and locality are required.");
      return;
    }
    setSaving(true);
    const method = editSite ? "PUT" : "POST";
    const url = editSite ? `/api/sites/${editSite.id}` : "/api/sites";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, monitorId: form.monitorId || null }),
    });
    setSaving(false);
    if (res.ok) { onSaved(); onClose(); }
    else { const d = await res.json(); setError(d.error ?? "Failed to save."); }
  };

  return (
    <Modal open={open} onClose={onClose} title={editSite ? "Edit Site" : "Add Site"} size="lg">
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <FormField label="Site Code" required>
          <Input value={form.siteCode} onChange={(e) => set("siteCode", e.target.value)} placeholder="ipcdwp001" />
        </FormField>
        <FormField label="Media Type" required>
          <Select value={form.mediaType} onChange={(e) => set("mediaType", e.target.value)}>
            {MEDIA_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </FormField>
        <FormField label="Campaign" required>
          <Select value={form.campaignId} onChange={(e) => set("campaignId", e.target.value)}>
            <option value="">Select campaign…</option>
            {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Vendor" required>
          <Select value={form.vendorId} onChange={(e) => set("vendorId", e.target.value)}>
            <option value="">Select vendor…</option>
            {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Locality" required>
          <Input value={form.locality} onChange={(e) => set("locality", e.target.value)} placeholder="Kolkata" />
        </FormField>
        <FormField label="City">
          <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Kolkata" />
        </FormField>
        <FormField label="State">
          <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="West Bengal" />
        </FormField>
        <FormField label="Frequency">
          <Select value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
            {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
          </Select>
        </FormField>
        <FormField label="Assign Monitor">
          <Select value={form.monitorId} onChange={(e) => set("monitorId", e.target.value)}>
            <option value="">Unassigned</option>
            {monitors.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Address">
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Full address" />
        </FormField>

        {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
        <div className="col-span-2 flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save Site"}</Button>
        </div>
      </form>
    </Modal>
  );
}
