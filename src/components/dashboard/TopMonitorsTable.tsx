"use client";

import { useState } from "react";
import { Download } from "lucide-react";

interface MonitorRow {
  rank: number;
  name: string;
  campaigns: number;
  totalTask: number;
  taskCompleted: number;
  progress: number;
}

interface TopMonitorsTableProps {
  data: MonitorRow[];
}

const PERIODS = ["This Month", "Last 3 Months", "Last Year"] as const;
type Period = (typeof PERIODS)[number];

const PAGE_SIZE = 5;

export default function TopMonitorsTable({ data }: TopMonitorsTableProps) {
  const [period, setPeriod] = useState<Period>("Last 3 Months");
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">Top Performing Monitors</h2>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded overflow-hidden text-sm">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => { setPeriod(p); setPage(1); }}
                className={`px-3 py-1 ${
                  period === p
                    ? "bg-[#e63946] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1">
            <Download size={12} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="px-4 py-2">Rank</th>
            <th className="px-4 py-2">Top Monitor</th>
            <th className="px-4 py-2">Campaigns</th>
            <th className="px-4 py-2">Total Task</th>
            <th className="px-4 py-2">Task Completed</th>
            <th className="px-4 py-2">Progress</th>
          </tr>
        </thead>
        <tbody>
          {paged.map((row) => (
            <tr key={row.rank} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-700">{row.rank}</td>
              <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
              <td className="px-4 py-3 text-gray-600">{row.campaigns}</td>
              <td className="px-4 py-3 text-gray-600">{row.totalTask}</td>
              <td className="px-4 py-3 text-gray-600">{row.taskCompleted}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
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
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-1 py-3">
        <button
          onClick={() => setPage(1)}
          disabled={page === 1}
          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
        >
          «
        </button>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
        >
          ‹
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const n = i + 1;
          return (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`px-2.5 py-1 text-xs rounded ${
                page === n
                  ? "bg-[#e63946] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {n}
            </button>
          );
        })}
        {totalPages > 5 && (
          <>
            <span className="text-gray-400 text-xs">...</span>
            <button
              onClick={() => setPage(totalPages)}
              className="px-2.5 py-1 text-xs rounded text-gray-600 hover:bg-gray-100"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
        >
          ›
        </button>
        <button
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
          className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
        >
          »
        </button>
      </div>
    </div>
  );
}
