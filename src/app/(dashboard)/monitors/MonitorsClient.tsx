"use client";

import { useState, useCallback } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { FormField, Input } from "@/components/ui/FormField";
import { useRouter } from "next/navigation";

interface MonitorRow {
  id: string;
  name: string;
  siteCount: number;
  campaigns: string[];
  totalPhotos: number;
  approvedPhotos: number;
  progress: number;
}

export default function MonitorsClient({ initialMonitors }: { initialMonitors: MonitorRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editMonitor, setEditMonitor] = useState<MonitorRow | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = initialMonitors.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditMonitor(null); setName(""); setError(""); setModalOpen(true); };
  const openEdit = (m: MonitorRow) => { setEditMonitor(m); setName(m.name); setError(""); setModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    const res = await fetch(editMonitor ? `/api/monitors/${editMonitor.id}` : "/api/monitors", {
      method: editMonitor ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    if (res.ok) { setModalOpen(false); router.refresh(); }
    else { const d = await res.json(); setError(d.error ?? "Failed."); }
  };

  const handleDelete = useCallback(async (id: string, monName: string) => {
    if (!confirm(`Delete monitor "${monName}"? Sites will be unassigned.`)) return;
    await fetch(`/api/monitors/${id}`, { method: "DELETE" });
    router.refresh();
  }, [router]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">MONITORS</h1>
        <Button onClick={openAdd}><Plus size={14} />Add Monitor</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search monitors…"
              className="pl-7 pr-3 py-1.5 border border-gray-200 rounded text-sm w-56 focus:outline-none focus:ring-1 focus:ring-[#e63946]"
            />
          </div>
          <span className="text-sm text-gray-400">{filtered.length} monitor{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-100 uppercase tracking-wide">
              <th className="px-4 py-2">Monitor ID</th>
              <th className="px-4 py-2">Sites Assigned</th>
              <th className="px-4 py-2">Campaigns</th>
              <th className="px-4 py-2">Total Photos</th>
              <th className="px-4 py-2">Approved</th>
              <th className="px-4 py-2">Progress</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No monitors found.</td></tr>
            ) : filtered.map((m) => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800 font-mono text-xs">{m.name}</td>
                <td className="px-4 py-3 text-gray-600">{m.siteCount}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                  <span className="truncate block" title={m.campaigns.join(", ")}>
                    {m.campaigns.length > 0 ? m.campaigns.slice(0, 2).join(", ") + (m.campaigns.length > 2 ? ` +${m.campaigns.length - 2}` : "") : "—"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{m.totalPhotos}</td>
                <td className="px-4 py-3 text-gray-600">{m.approvedPhotos}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-1.5">
                      <div className="bg-[#e63946] h-1.5 rounded-full" style={{ width: `${m.progress}%` }} />
                    </div>
                    <span className="text-xs text-[#e63946] font-medium">{m.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(m)} className="p-1 text-gray-400 hover:text-blue-600 rounded" title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(m.id, m.name)} className="p-1 text-gray-400 hover:text-red-600 rounded" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editMonitor ? "Edit Monitor" : "Add Monitor"} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Monitor ID / Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ipcdwp164" autoFocus />
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
