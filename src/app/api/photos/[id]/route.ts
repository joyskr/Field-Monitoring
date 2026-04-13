import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { notifyUser } from "@/lib/notify";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "MANAGER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const isRejecting = body.status === "REJECTED";
  const isApproving = body.status === "APPROVED";

  const photo = await db.photo.update({
    where: { id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.isHidden !== undefined ? { isHidden: body.isHidden } : {}),
      ...(body.isAudited !== undefined ? { isAudited: body.isAudited } : {}),
      ...(body.comment !== undefined ? { comment: body.comment } : {}),
      ...(body.quality ? { quality: body.quality } : {}),
      ...(isRejecting && body.rejectionType ? { rejectionType: body.rejectionType } : {}),
      ...(isRejecting ? { rejectionReason: body.rejectionReason ?? null } : {}),
      ...(isApproving ? { rejectionType: null, rejectionReason: null } : {}),
    },
    include: {
      site: { select: { siteCode: true, id: true } },
    },
  });

  // Notify the uploader when their photo is rejected — fire and forget
  if (isRejecting && photo.uploadedById) {
    const REJECTION_LABELS: Record<string, string> = {
      WRONG_LOCATION: "Wrong Location",
      BAD_QUALITY: "Bad Quality",
      WRONG_CREATIVE: "Wrong Creative",
      CUSTOM: "Other",
    };
    const typeLabel = body.rejectionType ? REJECTION_LABELS[body.rejectionType] ?? body.rejectionType : "";
    const reasonPart = body.rejectionReason ? `: "${body.rejectionReason}"` : "";
    notifyUser({
      userId: photo.uploadedById,
      title: "Photo Rejected",
      message: `Your photo for site ${photo.site.siteCode} was rejected — ${typeLabel}${reasonPart}.`,
      link: `/mobile/sites/${photo.site.id}`,
    }).catch(() => {});
  }

  return Response.json(photo);
}
