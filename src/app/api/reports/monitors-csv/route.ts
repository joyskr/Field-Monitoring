import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { getDateRange, type Period } from "@/lib/dateRange";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const period = (searchParams.get("period") ?? "last-3-months") as Period;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const { start, end } = getDateRange(period, from, to);

  const monitors = await db.monitor.findMany({
    include: {
      photos: {
        where: { clickedAt: { gte: start, lte: end } },
        select: { status: true },
      },
      sites: { select: { campaignId: true } },
    },
  });

  const rows = monitors
    .map((m) => {
      const total = m.photos.length;
      const completed = m.photos.filter((p: { status: string }) => p.status === "APPROVED").length;
      const campaigns = new Set(m.sites.map((s: { campaignId: string }) => s.campaignId)).size;
      return { name: m.name, campaigns, total, completed, progress: total > 0 ? (completed / total) * 100 : 0 };
    })
    .filter((r) => r.total > 0)
    .sort((a, b) => b.progress - a.progress);

  const header = "Rank,Monitor,Campaigns,Total Tasks,Completed,Progress%";
  const lines = rows.map(
    (r, i) => `${i + 1},${r.name},${r.campaigns},${r.total},${r.completed},${r.progress.toFixed(2)}`
  );
  const csv = [header, ...lines].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="top-monitors-${period}.csv"`,
    },
  });
}
