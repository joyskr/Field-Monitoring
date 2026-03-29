"use client";

import { useState } from "react";
import { User, Lock, Shield, Users, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/FormField";
import { formatDate } from "@/lib/utils";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Props {
  user: UserData;
  teamMembers: UserData[];
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  FIELD_MONITOR: "Field Agent",
  CLIENT: "Client",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  MANAGER: "bg-blue-100 text-blue-700",
  FIELD_MONITOR: "bg-green-100 text-green-700",
  CLIENT: "bg-gray-100 text-gray-600",
};

export default function SettingsClient({ user, teamMembers: initialMembers }: Props) {
  // Profile form
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Team management
  const [teamMembers, setTeamMembers] = useState(initialMembers);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("FIELD_MONITOR");
  const [addSaving, setAddSaving] = useState(false);
  const [addMsg, setAddMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    setProfileSaving(false);
    if (res.ok) setProfileMsg({ type: "success", text: "Profile updated successfully." });
    else { const d = await res.json(); setProfileMsg({ type: "error", text: d.error ?? "Failed." }); }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (newPw !== confirmPw) { setPwMsg({ type: "error", text: "Passwords do not match." }); return; }
    if (newPw.length < 8) { setPwMsg({ type: "error", text: "Password must be at least 8 characters." }); return; }
    setPwSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    setPwSaving(false);
    if (res.ok) { setPwMsg({ type: "success", text: "Password changed successfully." }); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
    else { const d = await res.json(); setPwMsg({ type: "error", text: d.error ?? "Failed." }); }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSaving(true);
    setAddMsg(null);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, email: newEmail, password: newPassword, role: newRole }),
    });
    setAddSaving(false);
    if (res.ok) {
      const created = await res.json();
      setTeamMembers((prev) => [...prev, created]);
      setNewName(""); setNewEmail(""); setNewPassword(""); setNewRole("FIELD_MONITOR");
      setShowAddForm(false);
      setAddMsg({ type: "success", text: `${ROLE_LABELS[newRole] ?? newRole} account created.` });
    } else {
      const d = await res.json();
      setAddMsg({ type: "error", text: d.error ?? "Failed to create user." });
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setDeletingId(id);
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) setTeamMembers((prev) => prev.filter((m) => m.id !== id));
    else { const d = await res.json(); alert(d.error ?? "Failed to delete user."); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">SETTINGS</h1>

      {/* Account info card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#e63946] rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            <Shield size={11} />
            {ROLE_LABELS[user.role] ?? user.role}
          </div>
        </div>
        <p className="text-xs text-gray-400">Member since {formatDate(user.createdAt)}</p>
      </div>

      {/* Profile settings */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <User size={15} className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">Profile Information</h2>
        </div>
        <form onSubmit={saveProfile} className="p-5 space-y-4">
          <FormField label="Full Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </FormField>
          <FormField label="Email Address" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </FormField>
          {profileMsg && (
            <p className={`text-sm ${profileMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {profileMsg.text}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={profileSaving}>{profileSaving ? "Saving…" : "Save Profile"}</Button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
          <Lock size={15} className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">Change Password</h2>
        </div>
        <form onSubmit={savePassword} className="p-5 space-y-4">
          <FormField label="Current Password" required>
            <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
          </FormField>
          <FormField label="New Password" required>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min 8 characters" />
          </FormField>
          <FormField label="Confirm New Password" required>
            <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••••" />
          </FormField>
          {pwMsg && (
            <p className={`text-sm ${pwMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {pwMsg.text}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={pwSaving}>{pwSaving ? "Changing…" : "Change Password"}</Button>
          </div>
        </form>
      </div>

      {/* Team Management — admin only */}
      {user.role === "ADMIN" && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700">Team Members</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{teamMembers.length}</span>
            </div>
            <button
              onClick={() => { setShowAddForm((v) => !v); setAddMsg(null); }}
              className="flex items-center gap-1 text-xs text-[#e63946] font-medium hover:text-red-700"
            >
              <Plus size={14} />
              Add Member
            </button>
          </div>

          {/* Add user form */}
          {showAddForm && (
            <form onSubmit={addUser} className="px-5 py-4 border-b border-gray-100 bg-gray-50 space-y-3">
              <p className="text-xs font-semibold text-gray-600 mb-2">New Team Member</p>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Full Name" required>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Jane Smith" />
                </FormField>
                <FormField label="Email" required>
                  <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="jane@example.com" />
                </FormField>
                <FormField label="Password" required>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" />
                </FormField>
                <FormField label="Role" required>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#e63946]"
                  >
                    <option value="FIELD_MONITOR">Field Agent</option>
                    <option value="MANAGER">Manager</option>
                    <option value="CLIENT">Client</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </FormField>
              </div>
              {addMsg && (
                <p className={`text-sm ${addMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {addMsg.text}
                </p>
              )}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowAddForm(false)} className="text-sm text-gray-500 px-3 py-1.5 hover:text-gray-700">
                  Cancel
                </button>
                <Button type="submit" disabled={addSaving}>
                  {addSaving ? "Creating…" : "Create Account"}
                </Button>
              </div>
            </form>
          )}

          {addMsg && !showAddForm && (
            <p className={`text-sm px-5 py-3 border-b border-gray-100 ${addMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {addMsg.text}
            </p>
          )}

          {/* Members list */}
          <div className="divide-y divide-gray-50">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm flex-shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{member.name}</p>
                  <p className="text-xs text-gray-500 truncate">{member.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${ROLE_COLORS[member.role] ?? "bg-gray-100 text-gray-600"}`}>
                  {ROLE_LABELS[member.role] ?? member.role}
                </span>
                {member.id !== user.id && (
                  <button
                    onClick={() => deleteUser(member.id)}
                    disabled={deletingId === member.id}
                    className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-40 flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
