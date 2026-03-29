import {
  cn,
  formatDate,
  formatDateTime,
  formatDateRange,
  getStatusColor,
  capitalize,
} from "@/lib/utils";

describe("cn()", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });

  it("ignores falsy values", () => {
    expect(cn("px-4", false, undefined, null, "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    const active = true;
    expect(cn("base", active && "active")).toBe("base active");
    expect(cn("base", !active && "inactive")).toBe("base");
  });
});

describe("formatDate()", () => {
  it("formats a Date object", () => {
    const result = formatDate(new Date("2024-06-15"));
    expect(result).toMatch(/6\/15\/2024/);
  });

  it("formats an ISO string", () => {
    const result = formatDate("2024-01-01T00:00:00.000Z");
    expect(result).toContain("2024");
  });
});

describe("formatDateTime()", () => {
  it("includes time in output", () => {
    const result = formatDateTime(new Date("2024-06-15T14:30:00"));
    expect(result).toMatch(/2:30/);
    expect(result).toMatch(/2024/);
  });
});

describe("formatDateRange()", () => {
  it("joins two dates with 'to'", () => {
    const result = formatDateRange("2024-01-01", "2024-12-31");
    expect(result).toContain(" to ");
    expect(result).toContain("2024");
  });
});

describe("getStatusColor()", () => {
  it("returns green classes for ACTIVE", () => {
    expect(getStatusColor("ACTIVE")).toContain("green");
  });

  it("returns blue classes for UPCOMING", () => {
    expect(getStatusColor("UPCOMING")).toContain("blue");
  });

  it("returns red classes for TERMINATED", () => {
    expect(getStatusColor("TERMINATED")).toContain("red");
  });

  it("returns yellow classes for PAUSED", () => {
    expect(getStatusColor("PAUSED")).toContain("yellow");
  });

  it("returns red classes for REJECTED", () => {
    expect(getStatusColor("REJECTED")).toContain("red");
  });

  it("returns yellow classes for PENDING", () => {
    expect(getStatusColor("PENDING")).toContain("yellow");
  });

  it("returns gray for unknown status", () => {
    expect(getStatusColor("UNKNOWN")).toContain("gray");
  });
});

describe("capitalize()", () => {
  it("capitalizes first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("lowercases the rest", () => {
    expect(capitalize("HELLO")).toBe("Hello");
  });

  it("handles single character", () => {
    expect(capitalize("a")).toBe("A");
  });
});
