import { getMobileUserId } from "@/lib/mobileAuth";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = "test-secret";

// Override env for tests
beforeAll(() => {
  process.env.NEXTAUTH_SECRET = SECRET;
});

function makeRequest(token?: string): NextRequest {
  const headers: Record<string, string> = {};
  if (token) headers["authorization"] = `Bearer ${token}`;
  return new NextRequest("http://localhost/api/mobile/me", { headers });
}

describe("getMobileUserId()", () => {
  it("returns userId from a valid token", () => {
    const token = jwt.sign({ id: "user_123" }, SECRET);
    const req = makeRequest(token);
    expect(getMobileUserId(req)).toBe("user_123");
  });

  it("returns null when no Authorization header", () => {
    const req = makeRequest();
    expect(getMobileUserId(req)).toBeNull();
  });

  it("returns null for a malformed token", () => {
    const req = makeRequest("not-a-valid-jwt");
    expect(getMobileUserId(req)).toBeNull();
  });

  it("returns null for token signed with wrong secret", () => {
    const token = jwt.sign({ id: "user_123" }, "wrong-secret");
    const req = makeRequest(token);
    expect(getMobileUserId(req)).toBeNull();
  });

  it("returns null for expired token", () => {
    const token = jwt.sign({ id: "user_123" }, SECRET, { expiresIn: -1 });
    const req = makeRequest(token);
    expect(getMobileUserId(req)).toBeNull();
  });

  it("returns null when header is not Bearer prefix", () => {
    const req = new NextRequest("http://localhost/api/mobile/me", {
      headers: { authorization: "Basic dXNlcjpwYXNz" },
    });
    expect(getMobileUserId(req)).toBeNull();
  });
});
