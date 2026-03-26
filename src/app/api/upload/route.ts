import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { uploadToCloud } from "@/lib/cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function saveFile(buffer: Buffer, filename: string): Promise<string> {
  if (process.env.CLOUDINARY_URL) {
    return uploadToCloud(buffer, { folder: "field-monitoring/photos", filename });
  }
  // Local dev fallback
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const campaignId = form.get("campaignId") as string;
  const siteId = form.get("siteId") as string;
  const monitorId = form.get("monitorId") as string | null;

  if (!file || !campaignId || !siteId) {
    return Response.json({ error: "file, campaignId, siteId required" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const url = await saveFile(buffer, filename);

  const photo = await db.photo.create({
    data: {
      url,
      siteId,
      campaignId,
      monitorId: monitorId || null,
      uploadedById: session.user?.id ?? null,
      clickedAt: new Date(),
      status: "PENDING",
      quality: "GOOD",
    },
  });

  return Response.json(photo, { status: 201 });
}
