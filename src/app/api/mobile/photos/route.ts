import { db } from "@/lib/db";
import { getMobileUserId } from "@/lib/mobileAuth";
import { NextRequest } from "next/server";
import { uploadToCloud } from "@/lib/cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function saveFile(buffer: Buffer, filename: string): Promise<string> {
  if (process.env.CLOUDINARY_URL) {
    return uploadToCloud(buffer, { folder: "field-monitoring/mobile", filename });
  }
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function GET(req: NextRequest) {
  const userId = getMobileUserId(req);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");

  const photos = await db.photo.findMany({
    where: {
      uploadedById: userId,
      ...(siteId ? { siteId } : {}),
    },
    include: {
      site: { select: { siteCode: true, locality: true } },
      campaign: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return Response.json(photos);
}

export async function POST(req: NextRequest) {
  const userId = getMobileUserId(req);
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const siteId = formData.get("siteId") as string | null;
  const campaignId = formData.get("campaignId") as string | null;
  const latStr = formData.get("lat") as string | null;
  const lngStr = formData.get("lng") as string | null;

  if (!file || !siteId || !campaignId) {
    return Response.json({ error: "file, siteId, and campaignId are required." }, { status: 400 });
  }

  const site = await db.site.findUnique({ where: { id: siteId } });
  if (!site) return Response.json({ error: "Site not found." }, { status: 404 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `photo_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const url = await saveFile(buffer, filename);

  const lat = latStr ? parseFloat(latStr) : null;
  const lng = lngStr ? parseFloat(lngStr) : null;
  if (lat && lng && !site.lat && !site.lng) {
    await db.site.update({ where: { id: siteId }, data: { lat, lng } });
  }

  const photo = await db.photo.create({
    data: {
      url,
      siteId,
      campaignId,
      uploadedById: userId,
      monitorId: site.monitorId ?? undefined,
      clickedAt: new Date(),
      status: "PENDING",
    },
  });

  return Response.json({ id: photo.id, url: photo.url }, { status: 201 });
}
