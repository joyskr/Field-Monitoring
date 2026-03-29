import { POST } from "@/app/api/mobile/auth/login/route";
import { GET } from "@/app/api/mobile/me/route";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

jest.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import { db } from "@/lib/db";
const mockFindUnique = db.user.findUnique as jest.Mock;

const SECRET = "test-secret";
beforeAll(() => { process.env.NEXTAUTH_SECRET = SECRET; });

describe("POST /api/mobile/auth/login", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 when email/password missing", async () => {
    const req = new NextRequest("http://localhost/api/mobile/auth/login", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when user not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/mobile/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "nobody@test.com", password: "pass" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 for wrong password", async () => {
    const hashedPassword = await bcrypt.hash("correctpass", 10);
    mockFindUnique.mockResolvedValue({
      id: "u1",
      email: "user@test.com",
      password: hashedPassword,
      name: "Test",
      role: "FIELD_MONITOR",
    });
    const req = new NextRequest("http://localhost/api/mobile/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "user@test.com", password: "wrongpass" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns JWT token on successful login", async () => {
    const hashedPassword = await bcrypt.hash("correctpass", 10);
    mockFindUnique.mockResolvedValue({
      id: "u1",
      email: "user@test.com",
      password: hashedPassword,
      name: "Test User",
      role: "FIELD_MONITOR",
    });
    const req = new NextRequest("http://localhost/api/mobile/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "user@test.com", password: "correctpass" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.token).toBeDefined();
    expect(data.name).toBe("Test User");
    expect(data.role).toBe("FIELD_MONITOR");
    // Verify the JWT is valid
    const payload = jwt.verify(data.token, SECRET) as { id: string };
    expect(payload.id).toBe("u1");
  });
});

describe("GET /api/mobile/me", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 with no token", async () => {
    const req = new NextRequest("http://localhost/api/mobile/me");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns user info with valid token", async () => {
    const token = jwt.sign({ id: "u1" }, SECRET);
    mockFindUnique.mockResolvedValue({
      id: "u1",
      name: "Test User",
      email: "user@test.com",
      role: "FIELD_MONITOR",
    });
    const req = new NextRequest("http://localhost/api/mobile/me", {
      headers: { authorization: `Bearer ${token}` },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("Test User");
  });

  it("returns 404 when user is deleted", async () => {
    const token = jwt.sign({ id: "deleted_user" }, SECRET);
    mockFindUnique.mockResolvedValue(null);
    const req = new NextRequest("http://localhost/api/mobile/me", {
      headers: { authorization: `Bearer ${token}` },
    });
    const res = await GET(req);
    expect(res.status).toBe(404);
  });
});
