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

interface PhotoCardProps {
  id: string;
  url: string;
  clickedAt: Date;
  comment: string | null;
  status: string;
  isInternal?: boolean;
  onStatusChange?: (id: string, status: string) => void;
}

export default function PhotoCard({
  id,
  url,
  clickedAt,
  comment,
  status,
  isInternal = false,
  onStatusChange,
}: PhotoCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleStatus = async (newStatus: string) => {
    setCurrentStatus(newStatus);
    onStatusChange?.(id, newStatus);
    await fetch(`/api/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
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
          <div className="flex gap-1 mt-1">
            <button
              onClick={() => handleStatus("APPROVED")}
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
              onClick={() => handleStatus("PENDING")}
              className={cn(
                "flex-1 py-0.5 text-xs rounded font-medium border transition-colors",
                currentStatus === "PENDING"
                  ? "bg-yellow-400 text-white border-yellow-400"
                  : "border-yellow-400 text-yellow-600 hover:bg-yellow-50"
              )}
            >
              Pending
            </button>
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
