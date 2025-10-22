import { db } from "./db";
import { packages, users } from "@shared/schema";
import { eq } from "drizzle-orm";

const seedPackages = [
  { dataAmount: "1GB", price: "5.00", supplierCost: "3.50", isActive: true },
  { dataAmount: "2GB", price: "10.00", supplierCost: "7.00", isActive: true },
  { dataAmount: "3GB", price: "14.00", supplierCost: "9.80", isActive: true },
  { dataAmount: "4GB", price: "21.00", supplierCost: "14.70", isActive: true },
  { dataAmount: "5GB", price: "23.00", supplierCost: "16.10", isActive: true },
  { dataAmount: "10GB", price: "46.00", supplierCost: "32.20", isActive: true },
  { dataAmount: "15GB", price: "69.00", supplierCost: "48.30", isActive: true },
  { dataAmount: "20GB", price: "92.00", supplierCost: "64.40", isActive: true },
  { dataAmount: "25GB", price: "115.00", supplierCost: "80.50", isActive: true },
  { dataAmount: "30GB", price: "138.00", supplierCost: "96.60", isActive: true },
  { dataAmount: "35GB", price: "161.00", supplierCost: "112.70", isActive: true },
  { dataAmount: "40GB", price: "184.00", supplierCost: "128.80", isActive: true },
  { dataAmount: "45GB", price: "207.00", supplierCost: "144.90", isActive: true },
  { dataAmount: "50GB", price: "230.00", supplierCost: "161.00", isActive: true },
  { dataAmount: "75GB", price: "345.00", supplierCost: "241.50", isActive: true },
  { dataAmount: "80GB", price: "368.00", supplierCost: "257.60", isActive: true },
  { dataAmount: "100GB", price: "460.00", supplierCost: "322.00", isActive: true },
];

export async function initializeDatabase() {
  try {
    console.log("🔍 Checking database initialization...");
    
    // Check if packages exist
    const existingPackages = await db.select().from(packages).limit(1);
    
    if (existingPackages.length === 0) {
      console.log("🌱 Seeding MTN data packages...");
      await db.insert(packages).values(seedPackages);
      console.log(`✅ Successfully seeded ${seedPackages.length} packages`);
    } else {
      console.log("✓ Packages already initialized");
    }
    
    // Check if any admin user exists
    const existingAdmins = await db
      .select()
      .from(users)
      .where(eq(users.isAdmin, true))
      .limit(1);
    
    if (existingAdmins.length === 0) {
      console.log("⚠️  No admin user found. First user to log in will be granted admin access.");
    } else {
      console.log("✓ Admin user(s) exist");
    }
    
    console.log("✅ Database initialization complete");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    // Don't throw - allow server to start even if init fails
  }
}

export async function promoteFirstUserToAdmin(userId: string) {
  try {
    // Check if any admin exists
    const existingAdmins = await db
      .select()
      .from(users)
      .where(eq(users.isAdmin, true))
      .limit(1);
    
    if (existingAdmins.length === 0) {
      // No admins exist, promote this user
      await db
        .update(users)
        .set({ isAdmin: true })
        .where(eq(users.id, userId));
      
      console.log(`🔑 First user ${userId} promoted to admin`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error promoting first user to admin:", error);
    return false;
  }
}
