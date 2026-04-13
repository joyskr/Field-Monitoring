import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Clearing seeded data (keeping users)...");

  await prisma.mediaAsset.deleteMany();
  await prisma.sharedCampaign.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.site.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.monitor.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.brand.deleteMany();

  console.log("All seeded data cleared.");

  // Create a field agent account
  const existing = await prisma.user.findUnique({ where: { email: "agent@fieldmonitor.com" } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: "agent@fieldmonitor.com",
        password: await bcrypt.hash("agent123", 10),
        name: "Field Agent",
        role: "FIELD_MONITOR",
      },
    });
    console.log("Agent account created: agent@fieldmonitor.com / agent123");
  } else {
    console.log("Agent account already exists.");
  }

  console.log("\nExisting accounts:");
  const users = await prisma.user.findMany({ select: { email: true, name: true, role: true } });
  users.forEach((u) => console.log(` - ${u.email} (${u.role}) — ${u.name}`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
