import { db } from "./db";
import { sendEmail } from "./email";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

interface NotifyOptions {
  userId: string;
  email?: string | null;
  title: string;
  message: string;
  link?: string;
}

/** Create a DB notification and optionally send an email. Never throws. */
async function notifyOne({ userId, email, title, message, link }: NotifyOptions) {
  try {
    await db.notification.create({
      data: { userId, title, message, link: link ?? null },
    });
  } catch {
    // Notification creation should not break the main request
  }

  if (email) {
    const fullLink = link ? `${APP_URL}${link}` : null;
    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <div style="background:#e63946;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="color:#fff;margin:0;font-size:18px">Field Monitor</h2>
        </div>
        <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;border:1px solid #eee">
          <h3 style="margin:0 0 8px;color:#1f2937">${title}</h3>
          <p style="margin:0 0 16px;color:#4b5563;font-size:14px">${message}</p>
          ${fullLink ? `<a href="${fullLink}" style="display:inline-block;background:#e63946;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600">View Details</a>` : ""}
        </div>
      </div>`;
    sendEmail({ to: email, subject: title, html }).catch(() => {});
  }
}

/** Notify all ADMIN users (and optionally MANAGER with matching brandId). */
export async function notifyAdmins({
  title,
  message,
  link,
  brandId,
}: {
  title: string;
  message: string;
  link?: string;
  brandId?: string | null;
}) {
  const where = brandId
    ? { OR: [{ role: "ADMIN" as const }, { role: "MANAGER" as const, brandId }] }
    : { role: "ADMIN" as const };

  const admins = await db.user.findMany({
    where,
    select: { id: true, email: true },
  });

  await Promise.all(
    admins.map((a) => notifyOne({ userId: a.id, email: a.email, title, message, link }))
  );
}

/** Notify a specific user by their DB id. */
export async function notifyUser({
  userId,
  title,
  message,
  link,
}: {
  userId: string;
  title: string;
  message: string;
  link?: string;
}) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  await notifyOne({ userId, email: user?.email, title, message, link });
}
