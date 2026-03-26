"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { FormField, Input } from "@/components/ui/FormField";
import { useRouter } from "next/navigation";

interface Vendor { id: string; name: string; city: string | null; state: string | null; siteCount: number }

const emptyForm = { name: "", city: "", state: "" };

export default function VendorsClient({ initialVendors }: { initialVendors: Vendor[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = initialVendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    (v.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditVendor(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (v: Vendor) => { setEditVendor(v); setForm({ name: v.name, city: v.city ?? "", state: v.state ?? "" }); setError(""); setModalOpen(true); };
  const set = (k: keyof typeof emptyForm, val: string) => setForm((f) => ({ ...f, [k]: val }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Vendor name is required."); return; }
    setSaving(true);
    const res = await fetch(editVendor ? `/api/vendors/${editVendor.id}` : "/api/vendors", {
      method: editVendor ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, city: form.city || null, state: form.state || null }),
    });
    setSaving(false);
    if (res.ok) { setModalOpen(false); router.refresh(); }
    else { const d = await res.json(); setError(d.error ?? "Failed."); }
  };

  const handleDelete = async (id: string, vName: string, siteCount: number) => {
    if (siteCount > 0) { alert(`Cannot delete — this vendor has ${siteCount} site(s) assigned.`); return; }
    if (!confirm(`Delete vendor "${vName}"?`)) return;
    await fetch(`/api/vendors/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">VENDORS</h1>
        <Button onClick={openAdd}><Plus size={14} />Add Vendor</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendors…"
              className="pl-7 pr-3 py-1.5 border border-gray-200 rounded text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#e63946]"
            />
          </div>
          <span className="text-sm text-gray-400">{filtered.length} vendor{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-100 uppercase tracking-wide">
              <th className="px-4 py-2">Vendor Name</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2">State</th>
              <th className="px-4 py-2">Sites</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No vendors found.</td></tr>
            ) : filtered.map((v) => (
              <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{v.name}</td>
                <td className="px-4 py-3 text-gray-600">{v.city ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{v.state ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{v.siteCount}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(v)} className="p-1 text-gray-400 hover:text-blue-600 rounded" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(v.id, v.name, v.siteCount)} className="p-1 text-gray-400 hover:text-red-600 rounded" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editVendor ? "Edit Vendor" : "Add Vendor"} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Vendor Name" required>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="IPC Advertising" autoFocus />
          </FormField>
          <FormField label="City">
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Kolkata" />
          </FormField>
          <FormField label="State">
            <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="West Bengal" />
          </FormField>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
