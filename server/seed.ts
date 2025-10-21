import { db } from "./db";
import { packages } from "@shared/schema";

const seedPackages = [
  { dataAmount: "1GB", price: "5.00", isActive: true },
  { dataAmount: "2GB", price: "10.00", isActive: true },
  { dataAmount: "3GB", price: "14.00", isActive: true },
  { dataAmount: "4GB", price: "21.00", isActive: true },
  { dataAmount: "5GB", price: "23.00", isActive: true },
  { dataAmount: "10GB", price: "46.00", isActive: true },
  { dataAmount: "15GB", price: "69.00", isActive: true },
  { dataAmount: "20GB", price: "92.00", isActive: true },
  { dataAmount: "25GB", price: "115.00", isActive: true },
  { dataAmount: "30GB", price: "138.00", isActive: true },
  { dataAmount: "35GB", price: "161.00", isActive: true },
  { dataAmount: "40GB", price: "184.00", isActive: true },
  { dataAmount: "45GB", price: "207.00", isActive: true },
  { dataAmount: "50GB", price: "230.00", isActive: true },
  { dataAmount: "75GB", price: "345.00", isActive: true },
  { dataAmount: "80GB", price: "368.00", isActive: true },
  { dataAmount: "100GB", price: "460.00", isActive: true },
];

async function seed() {
  try {
    console.log("🌱 Seeding packages...");
    
    // Check if packages already exist
    const existing = await db.select().from(packages).limit(1);
    if (existing.length > 0) {
      console.log("⚠️  Packages already exist. Skipping seed.");
      return;
    }

    // Insert all packages
    await db.insert(packages).values(seedPackages);
    
    console.log(`✅ Successfully seeded ${seedPackages.length} MTN data packages!`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log("🎉 Seed complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seed error:", error);
    process.exit(1);
  });
