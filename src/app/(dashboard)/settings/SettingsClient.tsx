"use client";

import { useState } from "react";
import { User, Lock, Shield } from "lucide-react";
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

export default function SettingsClient({ user }: { user: UserData }) {
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
            {user.role.replace("_", " ").toLowerCase()}
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
    </div>
  );
}
