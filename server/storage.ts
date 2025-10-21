import {
  users,
  packages,
  orders,
  type User,
  type UpsertUser,
  type Package,
  type InsertPackage,
  type Order,
  type InsertOrder,
  type OrderWithPackage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Package operations
  getAllPackages(): Promise<Package[]>;
  getPackageById(id: string): Promise<Package | undefined>;
  createPackage(pkg: InsertPackage): Promise<Package>;
  updatePackage(id: string, data: Partial<InsertPackage>): Promise<Package | undefined>;
  deletePackage(id: string): Promise<void>;
  
  // Order operations
  getAllOrders(): Promise<OrderWithPackage[]>;
  getOrderById(id: string): Promise<OrderWithPackage | undefined>;
  getOrderByReference(reference: string): Promise<OrderWithPackage | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Package operations
  async getAllPackages(): Promise<Package[]> {
    return await db.select().from(packages).orderBy(packages.dataAmount);
  }

  async getPackageById(id: string): Promise<Package | undefined> {
    const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
    return pkg;
  }

  async createPackage(pkgData: InsertPackage): Promise<Package> {
    const [pkg] = await db.insert(packages).values(pkgData).returning();
    return pkg;
  }

  async updatePackage(id: string, data: Partial<InsertPackage>): Promise<Package | undefined> {
    const [pkg] = await db
      .update(packages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(packages.id, id))
      .returning();
    return pkg;
  }

  async deletePackage(id: string): Promise<void> {
    await db.delete(packages).where(eq(packages.id, id));
  }

  // Order operations
  async getAllOrders(): Promise<OrderWithPackage[]> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(packages, eq(orders.packageId, packages.id))
      .orderBy(desc(orders.createdAt));

    return result.map((row) => ({
      ...row.orders,
      package: row.packages!,
    }));
  }

  async getOrderById(id: string): Promise<OrderWithPackage | undefined> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(packages, eq(orders.packageId, packages.id))
      .where(eq(orders.id, id));

    if (result.length === 0) return undefined;

    return {
      ...result[0].orders,
      package: result[0].packages!,
    };
  }

  async getOrderByReference(reference: string): Promise<OrderWithPackage | undefined> {
    const result = await db
      .select()
      .from(orders)
      .leftJoin(packages, eq(orders.packageId, packages.id))
      .where(eq(orders.paystackReference, reference));

    if (result.length === 0) return undefined;

    return {
      ...result[0].orders,
      package: result[0].packages!,
    };
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }

  async updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async deleteOrder(id: string): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }
}

export const storage = new DatabaseStorage();
