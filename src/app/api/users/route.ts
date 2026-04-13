import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  return user?.role === "ADMIN" ? session : null;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const [users, vendors, brands] = await Promise.all([
    db.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        vendor: { select: { id: true, name: true } },
        brand: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.vendor.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return Response.json({ users, vendors, brands });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { name, email, password, role, vendorId, brandId } = await req.json();

  if (!name || !email || !password) {
    return Response.json({ error: "Name, email, and password are required." }, { status: 400 });
  }

  const allowedRoles = ["ADMIN", "MANAGER", "FIELD_MONITOR", "CLIENT"];
  if (role && !allowedRoles.includes(role)) {
    return Response.json({ error: "Invalid role." }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return Response.json({ error: "Email already in use." }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      name, email, password: hashed,
      role: role ?? "FIELD_MONITOR",
      ...(vendorId ? { vendorId } : {}),
      ...(brandId ? { brandId } : {}),
    },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      vendor: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
    },
  });

  return Response.json(user, { status: 201 });
}
