"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
  SENDING: "bg-blue-100 text-blue-700",
};

const REJECTION_TYPES = [
  { value: "WRONG_LOCATION", label: "Wrong Location" },
  { value: "BAD_QUALITY", label: "Bad Quality" },
  { value: "WRONG_CREATIVE", label: "Wrong Creative" },
  { value: "CUSTOM", label: "Other" },
];

interface PhotoCardProps {
  id: string;
  url: string;
  clickedAt: Date;
  comment: string | null;
  status: string;
  rejectionType?: string | null;
  rejectionReason?: string | null;
  isInternal?: boolean;
  onStatusChange?: (id: string, status: string) => void;
}

export default function PhotoCard({
  id,
  url,
  clickedAt,
  comment,
  status,
  rejectionType: initialRejectionType = null,
  rejectionReason: initialRejectionReason = null,
  isInternal = false,
  onStatusChange,
}: PhotoCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionType, setRejectionType] = useState(initialRejectionType ?? "WRONG_LOCATION");
  const [rejectionReason, setRejectionReason] = useState(initialRejectionReason ?? "");
  const [saving, setSaving] = useState(false);

  const handleStatus = async (newStatus: string) => {
    setCurrentStatus(newStatus);
    onStatusChange?.(id, newStatus);
    await fetch(`/api/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const handleReject = async () => {
    setSaving(true);
    await fetch(`/api/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "REJECTED",
        rejectionType,
        rejectionReason: rejectionReason.trim() || null,
      }),
    });
    setCurrentStatus("REJECTED");
    onStatusChange?.(id, "REJECTED");
    setShowRejectForm(false);
    setSaving(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="relative aspect-[4/3] bg-gray-100">
        <Image
          src={url}
          alt="Field photo"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="p-2 space-y-1.5">
        <p className="text-xs text-gray-500">
          Clicked At: {formatDateTime(clickedAt)}
        </p>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Comments:</span>
          <span className="text-xs text-gray-600">{comment ?? "No Comments !!"}</span>
        </div>
        {isInternal ? (
          <div className="mt-1 space-y-1.5">
            <div className="flex gap-1">
              <button
                onClick={() => { handleStatus("APPROVED"); setShowRejectForm(false); }}
                className={cn(
                  "flex-1 py-0.5 text-xs rounded font-medium border transition-colors",
                  currentStatus === "APPROVED"
                    ? "bg-green-500 text-white border-green-500"
                    : "border-green-400 text-green-600 hover:bg-green-50"
                )}
              >
                Approve
              </button>
              <button
                onClick={() => { handleStatus("PENDING"); setShowRejectForm(false); }}
                className={cn(
                  "flex-1 py-0.5 text-xs rounded font-medium border transition-colors",
                  currentStatus === "PENDING"
                    ? "bg-yellow-400 text-white border-yellow-400"
                    : "border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                )}
              >
                Pending
              </button>
              <button
                onClick={() => setShowRejectForm((v) => !v)}
                className={cn(
                  "flex-1 py-0.5 text-xs rounded font-medium border transition-colors",
                  currentStatus === "REJECTED"
                    ? "bg-red-500 text-white border-red-500"
                    : "border-red-400 text-red-600 hover:bg-red-50"
                )}
              >
                Reject
              </button>
            </div>
            {showRejectForm && (
              <div className="space-y-1.5 pt-1 border-t border-gray-100">
                <select
                  value={rejectionType}
                  onChange={(e) => setRejectionType(e.target.value)}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-400"
                >
                  {REJECTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Optional note…"
                  rows={2}
                  className="w-full border border-gray-200 rounded px-2 py-1 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-red-400"
                />
                <div className="flex gap-1 justify-end">
                  <button onClick={() => setShowRejectForm(false)} className="text-xs text-gray-500 px-2 py-0.5 hover:text-gray-700">
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={saving}
                    className="text-xs bg-red-500 text-white px-2.5 py-0.5 rounded font-medium disabled:opacity-60 hover:bg-red-600"
                  >
                    {saving ? "Saving…" : "Confirm Reject"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-end">
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded font-medium",
                STATUS_STYLES[currentStatus] ?? "bg-gray-100 text-gray-600"
              )}
            >
              {currentStatus.charAt(0) + currentStatus.slice(1).toLowerCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
