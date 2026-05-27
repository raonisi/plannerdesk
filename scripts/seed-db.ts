import { PrismaClient } from "@prisma/client";
import { insurerDirectoryEntries } from "../lib/content/insurers";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding from insurers.ts...");
  
  for (const entry of insurerDirectoryEntries) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { supportedBrowsers, ...dbFields } = entry;
    
    const mapped = {
      ...dbFields,
      lastVerifiedAt: entry.lastVerifiedAt ? new Date(entry.lastVerifiedAt) : null,
    };

    console.log(`Upserting: ${mapped.name} (${mapped.id})`);
    
    await prisma.insurer.upsert({
      where: { id: mapped.id },
      update: mapped,
      create: mapped,
    });
  }
  
  console.log("Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
