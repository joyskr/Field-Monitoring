import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const photo = await db.photo.update({
    where: { id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.isHidden !== undefined ? { isHidden: body.isHidden } : {}),
      ...(body.isAudited !== undefined ? { isAudited: body.isAudited } : {}),
      ...(body.comment !== undefined ? { comment: body.comment } : {}),
      ...(body.quality ? { quality: body.quality } : {}),
    },
  });

  return Response.json(photo);
}
