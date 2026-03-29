import { getDateRange } from "@/lib/dateRange";

describe("getDateRange()", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-06-15T12:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("this-month starts on the 1st of current month", () => {
    const { start } = getDateRange("this-month");
    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(new Date().getMonth());
    expect(start.getFullYear()).toBe(new Date().getFullYear());
  });

  it("last-3-months starts 3 months ago", () => {
    const { start, end } = getDateRange("last-3-months");
    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    // ~90 days ± a couple days for month boundaries
    expect(diffDays).toBeGreaterThan(88);
    expect(diffDays).toBeLessThan(95);
  });

  it("last-year starts 1 year ago", () => {
    const { start, end } = getDateRange("last-year");
    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(363);
    expect(diffDays).toBeLessThan(367);
  });

  it("custom range uses provided from/to", () => {
    const { start, end } = getDateRange("custom", "2024-01-01", "2024-03-31");
    expect(start.getFullYear()).toBe(2024);
    expect(start.getMonth()).toBe(0); // January
    expect(end.getMonth()).toBe(2);   // March
  });

  it("custom without from falls back to last-year range", () => {
    const { start } = getDateRange("custom", undefined, undefined);
    const now = new Date();
    const diffDays = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(363);
  });

  it("end time is set to end of day for custom", () => {
    const { end } = getDateRange("custom", "2024-01-01", "2024-06-30");
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
  });
});
