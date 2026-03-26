"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Download, Calendar } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Period } from "@/lib/dateRange";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MonitorRow {
  rank: number;
  name: string;
  campaigns: number;
  totalTask: number;
  taskCompleted: number;
  progress: number;
}

interface CampaignBar {
  name: string;
  progress: number;
  status: string;
}

interface StatusSlice {
  name: string;
  value: number;
}

interface ActivityRow {
  id: string;
  site: string;
  locality: string;
  campaign: string;
  uploadedBy: string;
  status: string;
  clickedAt: Date;
}

interface Props {
  monitorData: MonitorRow[];
  campaignProgress: CampaignBar[];
  statusBreakdown: StatusSlice[];
  activity: ActivityRow[];
  currentPeriod: Period;
  currentFrom?: string;
  currentTo?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PERIODS: { label: string; value: Period }[] = [
  { label: "This Month",    value: "this-month" },
  { label: "Last 3 Months", value: "last-3-months" },
  { label: "Last Year",     value: "last-year" },
];

const PIE_COLORS: Record<string, string> = {
  Approved: "#22c55e",
  Pending:  "#eab308",
  Rejected: "#ef4444",
  Sending:  "#3b82f6",
};

const STATUS_BADGE: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING:  "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
  SENDING:  "bg-blue-100 text-blue-700",
};

const PAGE_SIZE = 5;

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardClient({
  monitorData,
  campaignProgress,
  statusBreakdown,
  activity,
  currentPeriod,
  currentFrom,
  currentTo,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [page, setPage] = useState(1);
  const [fromDate, setFromDate] = useState(currentFrom ?? "");
  const [toDate, setToDate] = useState(currentTo ?? "");

  const totalPages = Math.max(1, Math.ceil(monitorData.length / PAGE_SIZE));
  const paged = monitorData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Period navigation ──────────────────────────────────────────────────────
  const navigate = (params: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    startTransition(() => router.push(`/dashboard?${p.toString()}`));
    setPage(1);
  };

  const setPeriod = (period: Period) => {
    navigate({ period, from: "", to: "" });
    setFromDate("");
    setToDate("");
  };

  const applyCustomRange = () => {
    if (!fromDate || !toDate) return;
    navigate({ period: "custom", from: fromDate, to: toDate });
  };

  // ── CSV export ─────────────────────────────────────────────────────────────
  const downloadCSV = () => {
    const header = "Rank,Monitor,Campaigns,Total Tasks,Completed,Progress%";
    const rows = monitorData.map(
      (m) => `${m.rank},${m.name},${m.campaigns},${m.totalTask},${m.taskCompleted},${m.progress.toFixed(2)}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `top-monitors-${currentPeriod}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Campaign POP Progress bar chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Campaign POP Progress</h2>
          {campaignProgress.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No active campaigns.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={campaignProgress} layout="vertical" margin={{ left: 8, right: 32 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => (typeof v === "number" ? `${v}%` : v)} />
                <Bar dataKey="progress" fill="#e63946" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Photo Status pie chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Photo Status Breakdown</h2>
          {statusBreakdown.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No photos in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={75}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {statusBreakdown.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[entry.name] ?? "#94a3b8"}
                    />
                  ))}
                </Pie>
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Top Monitors table ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Top Performing Monitors</h2>

          <div className="flex flex-wrap items-center gap-2">
            {/* Period buttons */}
            <div className="flex border border-gray-200 rounded overflow-hidden text-xs">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1.5 transition-colors ${
                    currentPeriod === p.value && !currentFrom
                      ? "bg-[#e63946] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom date range */}
            <div className="flex items-center gap-1 text-xs">
              <Calendar size={13} className="text-gray-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-gray-200 rounded px-2 py-1 text-xs"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-gray-200 rounded px-2 py-1 text-xs"
              />
              <button
                onClick={applyCustomRange}
                disabled={!fromDate || !toDate}
                className="bg-[#e63946] text-white px-2 py-1 rounded text-xs disabled:opacity-40 hover:bg-red-700"
              >
                Apply
              </button>
            </div>

            {/* CSV */}
            <button
              onClick={downloadCSV}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1.5"
            >
              <Download size={12} />
              Download CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-100 uppercase tracking-wide">
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Top Monitor</th>
              <th className="px-4 py-2">Campaigns</th>
              <th className="px-4 py-2">Total Task</th>
              <th className="px-4 py-2">Task Completed</th>
              <th className="px-4 py-2">Progress</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                  No monitor activity in this period.
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr key={row.rank} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{row.rank}</td>
                  <td className="px-4 py-3 font-medium text-gray-800 font-mono text-xs">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600">{row.campaigns}</td>
                  <td className="px-4 py-3 text-gray-600">{row.totalTask}</td>
                  <td className="px-4 py-3 text-gray-600">{row.taskCompleted}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 min-w-[60px]">
                        <div
                          className="bg-[#e63946] h-1.5 rounded-full"
                          style={{ width: `${row.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#e63946] font-medium w-14 text-right">
                        {row.progress.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-1 py-3 border-t border-gray-100">
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 text-xs text-gray-500 disabled:opacity-40">«</button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 text-xs text-gray-500 disabled:opacity-40">‹</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`px-2.5 py-1 text-xs rounded ${page === n ? "bg-[#e63946] text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {n}
            </button>
          ))}
          {totalPages > 5 && (
            <>
              <span className="text-gray-400 text-xs">…</span>
              <button onClick={() => setPage(totalPages)} className="px-2.5 py-1 text-xs rounded text-gray-600 hover:bg-gray-100">{totalPages}</button>
            </>
          )}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 text-xs text-gray-500 disabled:opacity-40">›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 text-xs text-gray-500 disabled:opacity-40">»</button>
        </div>
      </div>

      {/* ── Bottom row: Recent Activity ────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Recent Photo Activity</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-100 uppercase tracking-wide">
              <th className="px-4 py-2">Site</th>
              <th className="px-4 py-2">Locality</th>
              <th className="px-4 py-2">Campaign</th>
              <th className="px-4 py-2">Uploaded By</th>
              <th className="px-4 py-2">Clicked At</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {activity.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No recent activity.</td></tr>
            ) : activity.map((a) => (
              <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-2.5 font-mono text-xs font-medium text-gray-800">{a.site}</td>
                <td className="px-4 py-2.5 text-gray-600">{a.locality}</td>
                <td className="px-4 py-2.5 text-gray-600 max-w-[160px] truncate">{a.campaign}</td>
                <td className="px-4 py-2.5 text-gray-600">{a.uploadedBy}</td>
                <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(a.clickedAt)}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_BADGE[a.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
