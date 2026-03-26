import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, email, currentPassword, newPassword } = body;

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return Response.json({ error: "User not found." }, { status: 404 });

  // If changing password, verify current password
  if (newPassword) {
    if (!currentPassword) return Response.json({ error: "Current password required." }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return Response.json({ error: "Current password is incorrect." }, { status: 400 });
    if (newPassword.length < 8) return Response.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  // Check email uniqueness if changed
  if (email && email !== user.email) {
    const exists = await db.user.findFirst({ where: { email, NOT: { id: user.id } } });
    if (exists) return Response.json({ error: "Email already in use." }, { status: 409 });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
      ...(newPassword ? { password: await bcrypt.hash(newPassword, 10) } : {}),
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return Response.json(updated);
}
