export type Period = "this-month" | "last-3-months" | "last-year" | "custom";

export function getDateRange(
  period: Period,
  from?: string,
  to?: string
): { start: Date; end: Date } {
  const now = new Date();
  const end = to ? new Date(to) : new Date(now);
  end.setHours(23, 59, 59, 999);

  if (period === "custom" && from) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (period === "this-month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: new Date(now) };
  }

  if (period === "last-3-months") {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 3);
    start.setHours(0, 0, 0, 0);
    return { start, end: new Date(now) };
  }

  // last-year (default)
  const start = new Date(now);
  start.setFullYear(start.getFullYear() - 1);
  start.setHours(0, 0, 0, 0);
  return { start, end: new Date(now) };
}
