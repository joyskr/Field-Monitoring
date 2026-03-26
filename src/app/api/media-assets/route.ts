import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import { uploadToCloud } from "@/lib/cloudinary";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function saveFile(buffer: Buffer, filename: string): Promise<string> {
  if (process.env.CLOUDINARY_URL) {
    return uploadToCloud(buffer, { folder: "field-monitoring/media", filename });
  }
  const dir = path.join(process.cwd(), "public", "media");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/media/${filename}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const assets = await db.mediaAsset.findMany({
    include: {
      campaign: { select: { name: true } },
      uploadedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(assets);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const campaignId = form.get("campaignId") as string | null;
  const name = (form.get("name") as string) || file?.name || "asset";

  if (!file) return Response.json({ error: "file required" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() ?? "bin";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const url = await saveFile(buffer, filename);

  const asset = await db.mediaAsset.create({
    data: {
      name,
      url,
      fileType: file.type,
      fileSize: file.size,
      campaignId: campaignId || null,
      uploadedById: session.user.id,
    },
  });

  return Response.json(asset, { status: 201 });
}
