"use client";

import { useState } from "react";
import { Eye, EyeOff, Download, FileDown, Filter, Share2, Navigation } from "lucide-react";
import Button from "@/components/ui/Button";

interface ReportToolbarProps {
  campaignId: string;
  isInternal?: boolean;
  unblindedCount: number;
  hiddenCount: number;
  auditedCount: number;
}

const QUALITY_OPTIONS = ["All", "Good", "Average", "Poor"];
const STATUS_OPTIONS = ["All", "Approved", "Pending", "Rejected"];

export default function ReportToolbar({
  isInternal = false,
  unblindedCount,
  hiddenCount,
  auditedCount,
}: ReportToolbarProps) {
  const [showHeaders, setShowHeaders] = useState(true);
  const [quality, setQuality] = useState("All");
  const [status, setStatus] = useState("All");

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 space-y-2">
      {/* Stats row */}
      <div className="flex items-center gap-6 text-sm text-gray-600">
        {isInternal ? (
          <>
            <span>Unblinded Images: <strong>{unblindedCount}</strong></span>
            <span>Hidden images: <strong>{hiddenCount}</strong></span>
          </>
        ) : (
          <span>Audited Sites: <strong>{auditedCount}</strong></span>
        )}
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => setShowHeaders((s) => !s)}>
          {showHeaders ? <EyeOff size={13} /> : <Eye size={13} />}
          {showHeaders ? "Hide Headers" : "Show Headers"}
        </Button>
        <Button variant="outline" size="sm">
          <Download size={13} />
          Download Images
        </Button>
        <Button variant="outline" size="sm">
          <FileDown size={13} />
          Download PPT
        </Button>
        {isInternal && (
          <Button variant="outline" size="sm">
            <Share2 size={13} />
            Share Approved Images
          </Button>
        )}
        <Button variant="outline" size="sm">
          <Navigation size={13} />
          Navigate to POP
        </Button>
        <Button variant="outline" size="sm">
          <Filter size={13} />
          Date Filter
        </Button>

        {/* Filters */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">Photo Quality:</span>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="border border-gray-200 rounded px-2 py-0.5 text-sm text-gray-700"
            >
              {QUALITY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-500">Photo Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-200 rounded px-2 py-0.5 text-sm text-gray-700"
            >
              {STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
