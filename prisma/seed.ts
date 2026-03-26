import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@fieldmonitor.com" },
    update: {},
    create: {
      email: "admin@fieldmonitor.com",
      password: adminPassword,
      name: "BJP West Bengal 2026",
      role: "ADMIN",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@fieldmonitor.com" },
    update: {},
    create: {
      email: "manager@fieldmonitor.com",
      password: await bcrypt.hash("manager123", 10),
      name: "Field Manager",
      role: "MANAGER",
    },
  });

  // Brands
  const bjp = await prisma.brand.upsert({
    where: { name: "BJP" },
    update: {},
    create: { name: "BJP" },
  });

  const brand2 = await prisma.brand.upsert({
    where: { name: "Generic Brand" },
    update: {},
    create: { name: "Generic Brand" },
  });

  // Vendors
  const ipc = await prisma.vendor.create({
    data: { name: "IPC Advertising", city: "Kolkata", state: "West Bengal" },
  }).catch(() => prisma.vendor.findFirst({ where: { name: "IPC Advertising" } })) as { id: string; name: string };

  // Monitors
  const monitors = await Promise.all(
    ["ipcdwp164", "ipcdwp122", "ipcdwp23", "ipcdwp117", "ipcdwp71",
     "ipcdwpc", "ipcdwp55", "ipcdwp88"].map((name) =>
      prisma.monitor.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // Active Campaign
  const activeCampaign = await prisma.campaign.create({
    data: {
      name: "IPC OOH Campaign (178)",
      type: "STANDARD",
      brandId: bjp.id,
      startDate: new Date("2026-03-02"),
      endDate: new Date("2026-03-31"),
      state: "West Bengal",
      status: "ACTIVE",
      createdById: admin.id,
      popProgress: 10.7,
    },
  });

  // Expired Campaign
  await prisma.campaign.create({
    data: {
      name: "Summer OOH Campaign",
      type: "STANDARD",
      brandId: brand2.id,
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-08-31"),
      state: "Maharashtra",
      status: "EXPIRED",
      createdById: manager.id,
      popProgress: 85.3,
    },
  });

  // Upcoming Campaign
  await prisma.campaign.create({
    data: {
      name: "Monsoon Drive Campaign",
      type: "STANDARD",
      brandId: bjp.id,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-08-31"),
      state: "Tamil Nadu",
      status: "UPCOMING",
      createdById: admin.id,
      popProgress: 0,
    },
  });

  // Sites for active campaign
  const localities = ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"];
  const sites = await Promise.all(
    monitors.slice(0, 5).map((monitor: { id: string }, i: number) =>
      prisma.site.create({
        data: {
          siteCode: `ipcdwp${String(i + 1).padStart(3, "0")}`,
          mediaType: "BILLBOARD",
          locality: localities[i],
          city: localities[i],
          state: "West Bengal",
          vendorId: ipc!.id,
          campaignId: activeCampaign.id,
          frequency: "DAILY",
          monitorId: monitor.id,
          isAudited: i < 3,
        },
      })
    )
  );

  // Photos for each site (15 per site)
  const statuses = ["PENDING", "APPROVED", "APPROVED", "PENDING", "APPROVED"] as const;
  const baseDate = new Date("2026-03-15T10:00:00");

  for (const [sIdx, site] of sites.entries()) {
    for (let p = 0; p < 15; p++) {
      const clickedAt = new Date(baseDate.getTime() + (sIdx * 15 + p) * 600000);
      await prisma.photo.create({
        data: {
          url: `https://picsum.photos/seed/${sIdx * 15 + p}/800/600`,
          siteId: site.id,
          campaignId: activeCampaign.id,
          monitorId: site.monitorId ?? undefined,
          uploadedById: admin.id,
          clickedAt,
          status: statuses[p % statuses.length],
          quality: "GOOD",
          isAudited: site.isAudited,
          isHidden: false,
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log("Login: admin@fieldmonitor.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
