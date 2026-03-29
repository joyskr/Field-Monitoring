import { GET, POST } from "@/app/api/sites/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/db", () => ({
  db: {
    site: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const mockAuth = auth as jest.Mock;
const mockFindMany = db.site.findMany as jest.Mock;
const mockFindUnique = db.site.findUnique as jest.Mock;
const mockCreate = db.site.create as jest.Mock;

const SESSION = { user: { id: "user_1" } };

function makeRequest(url: string, options?: RequestInit): NextRequest {
  return new NextRequest(url, options);
}

describe("GET /api/sites", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET(makeRequest("http://localhost/api/sites"));
    expect(res.status).toBe(401);
  });

  it("returns all sites", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindMany.mockResolvedValue([{ id: "s1", siteCode: "IPC001" }]);
    const res = await GET(makeRequest("http://localhost/api/sites"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data[0].siteCode).toBe("IPC001");
  });

  it("filters by campaignId", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindMany.mockResolvedValue([]);
    await GET(makeRequest("http://localhost/api/sites?campaignId=c1"));
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { campaignId: "c1" } })
    );
  });
});

describe("POST /api/sites", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest("http://localhost/api/sites", { method: "POST", body: "{}" }));
    expect(res.status).toBe(401);
  });

  it("returns 409 when site code already exists", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindUnique.mockResolvedValue({ id: "existing" });
    const res = await POST(
      makeRequest("http://localhost/api/sites", {
        method: "POST",
        body: JSON.stringify({ siteCode: "DUPLICATE" }),
      })
    );
    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain("already exists");
  });

  it("creates a site and returns 201", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindUnique.mockResolvedValue(null);
    const site = { id: "s2", siteCode: "NEW001" };
    mockCreate.mockResolvedValue(site);
    const res = await POST(
      makeRequest("http://localhost/api/sites", {
        method: "POST",
        body: JSON.stringify({
          siteCode: "NEW001",
          mediaType: "BILLBOARD",
          locality: "Andheri",
          vendorId: "v1",
          campaignId: "c1",
          frequency: "DAILY",
        }),
      })
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.siteCode).toBe("NEW001");
  });
});
