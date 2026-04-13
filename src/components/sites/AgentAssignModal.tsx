"use client";

import { useState, useEffect } from "react";
import { X, Check, Users } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  vendor?: { id: string; name: string } | null;
}

interface Props {
  siteId: string;
  siteCode: string;
  onClose: () => void;
}

export default function AgentAssignModal({ siteId, siteCode, onClose }: Props) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [assigned, setAssigned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch(`/api/sites/${siteId}/agents`).then((r) => r.json()),
    ]).then(([usersData, assignedData]) => {
      const fieldAgents = (usersData.users as Agent[]).filter(
        (u) => u.role === "FIELD_MONITOR"
      );
      setAgents(fieldAgents);
      setAssigned((assignedData as { id: string }[]).map((a) => a.id));
      setLoading(false);
    });
  }, [siteId]);

  const toggle = (id: string) =>
    setAssigned((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const save = async () => {
    setSaving(true);
    await fetch(`/api/sites/${siteId}/agents`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentIds: assigned }),
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#e63946]" />
            <div>
              <h2 className="font-semibold text-gray-800">Assign Field Agents</h2>
              <p className="text-xs text-gray-500 font-mono">{siteCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Agent list */}
        <div className="px-5 py-3 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : agents.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No field agents found. Create agents in Settings first.
            </p>
          ) : (
            <div className="space-y-1">
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => toggle(agent.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                      assigned.includes(agent.id)
                        ? "bg-[#e63946] border-[#e63946]"
                        : "border-gray-300"
                    }`}
                  >
                    {assigned.includes(agent.id) && <Check size={12} color="#fff" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{agent.name}</p>
                    <p className="text-xs text-gray-500">{agent.email}</p>
                    {agent.vendor && (
                      <p className="text-xs text-gray-400">{agent.vendor.name}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {assigned.length} agent{assigned.length !== 1 ? "s" : ""} assigned
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 px-3 py-1.5 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || loading}
              className="text-sm bg-[#e63946] text-white px-4 py-1.5 rounded-lg font-medium disabled:opacity-60 hover:bg-red-700"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
