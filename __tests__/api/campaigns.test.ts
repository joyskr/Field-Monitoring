import { GET, POST } from "@/app/api/campaigns/route";
import { NextRequest } from "next/server";

// Mock db
jest.mock("@/lib/db", () => ({
  db: {
    campaign: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const mockAuth = auth as jest.Mock;
const mockFindMany = db.campaign.findMany as jest.Mock;
const mockCreate = db.campaign.create as jest.Mock;

const SESSION = { user: { id: "user_1", name: "Admin", role: "ADMIN" } };

function makeRequest(url: string, options?: RequestInit): NextRequest {
  return new NextRequest(url, options);
}

describe("GET /api/campaigns", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = makeRequest("http://localhost/api/campaigns");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns campaign list when authenticated", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const campaigns = [{ id: "c1", name: "Campaign A" }];
    mockFindMany.mockResolvedValue(campaigns);
    const req = makeRequest("http://localhost/api/campaigns");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(campaigns);
  });

  it("filters by status query param", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindMany.mockResolvedValue([]);
    const req = makeRequest("http://localhost/api/campaigns?status=ACTIVE");
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "ACTIVE" }),
      })
    );
  });

  it("filters by search query param", async () => {
    mockAuth.mockResolvedValue(SESSION);
    mockFindMany.mockResolvedValue([]);
    const req = makeRequest("http://localhost/api/campaigns?q=Billboard");
    await GET(req);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          name: { contains: "Billboard", mode: "insensitive" },
        }),
      })
    );
  });
});

describe("POST /api/campaigns", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const req = makeRequest("http://localhost/api/campaigns", {
      method: "POST",
      body: JSON.stringify({ name: "Test" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("creates a campaign and returns 201", async () => {
    mockAuth.mockResolvedValue(SESSION);
    const newCampaign = { id: "c2", name: "New Campaign" };
    mockCreate.mockResolvedValue(newCampaign);
    const req = makeRequest("http://localhost/api/campaigns", {
      method: "POST",
      body: JSON.stringify({
        name: "New Campaign",
        brandId: "b1",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        state: "Maharashtra",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe("New Campaign");
  });
});
