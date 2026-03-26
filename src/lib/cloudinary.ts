import { v2 as cloudinary } from "cloudinary";

// Auto-configured from CLOUDINARY_URL env var:
// cloudinary://API_KEY:API_SECRET@CLOUD_NAME
cloudinary.config({ secure: true });

/**
 * Upload a Buffer to Cloudinary.
 * Returns the permanent CDN URL.
 */
export async function uploadToCloud(
  buffer: Buffer,
  options: { folder: string; filename: string; resourceType?: "image" | "video" | "raw" | "auto" }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.filename,
        resource_type: options.resourceType ?? "auto",
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload failed"));
        resolve(result.secure_url);
      }
    );
    upload.end(buffer);
  });
}

export { cloudinary };
