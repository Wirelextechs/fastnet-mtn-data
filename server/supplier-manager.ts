/**
 * Supplier Manager - Central router for multi-supplier data fulfillment
 * Reads active supplier from settings and delegates to the appropriate supplier
 */

import * as DataXpress from "./dataxpress";
import * as Hubnet from "./hubnet";
import { db } from "./db";
import { settings } from "@shared/schema";
import { eq } from "drizzle-orm";

export type SupplierType = "dataxpress" | "hubnet";

const ACTIVE_SUPPLIER_KEY = "active_supplier";
const DEFAULT_SUPPLIER: SupplierType = "dataxpress";

/**
 * Get the currently active supplier from database settings
 */
export async function getActiveSupplier(): Promise<SupplierType> {
  try {
    const result = await db
      .select()
      .from(settings)
      .where(eq(settings.key, ACTIVE_SUPPLIER_KEY))
      .limit(1);

    if (result.length > 0) {
      const supplier = result[0].value as SupplierType;
      console.log(`📋 Active supplier: ${supplier}`);
      return supplier;
    }

    // If no setting found, return default
    console.log(`📋 No active supplier setting found, using default: ${DEFAULT_SUPPLIER}`);
    return DEFAULT_SUPPLIER;
  } catch (error) {
    console.error(`❌ Error fetching active supplier:`, error);
    return DEFAULT_SUPPLIER;
  }
}

/**
 * Set the active supplier
 */
export async function setActiveSupplier(supplier: SupplierType): Promise<void> {
  try {
    // Upsert the setting
    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, ACTIVE_SUPPLIER_KEY))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(settings)
        .set({ 
          value: supplier,
          updatedAt: new Date(),
        })
        .where(eq(settings.key, ACTIVE_SUPPLIER_KEY));
    } else {
      await db.insert(settings).values({
        key: ACTIVE_SUPPLIER_KEY,
        value: supplier,
      });
    }

    console.log(`✅ Active supplier set to: ${supplier}`);
  } catch (error) {
    console.error(`❌ Error setting active supplier:`, error);
    throw error;
  }
}

/**
 * Purchase a data bundle using the active supplier
 */
export async function purchaseDataBundle(
  phoneNumber: string,
  dataAmount: string,
  price: number,
  orderReference: string
): Promise<{ success: boolean; message: string; data?: any; supplier: SupplierType }> {
  const activeSupplier = await getActiveSupplier();

  console.log(`🔀 Routing order to ${activeSupplier.toUpperCase()}...`);

  let result;
  if (activeSupplier === "hubnet") {
    result = await Hubnet.purchaseDataBundle(
      phoneNumber,
      dataAmount,
      price,
      orderReference,
      "mtn" // Default to MTN for now
    );
  } else {
    result = await DataXpress.purchaseDataBundle(
      phoneNumber,
      dataAmount,
      price,
      orderReference
    );
  }

  return {
    ...result,
    supplier: activeSupplier,
  };
}

/**
 * Get wallet balance for a specific supplier
 */
export async function getWalletBalance(
  supplier?: SupplierType
): Promise<{
  success: boolean;
  balance?: string;
  currency?: string;
  message?: string;
}> {
  const targetSupplier = supplier || (await getActiveSupplier());

  if (targetSupplier === "hubnet") {
    return await Hubnet.getWalletBalance();
  } else {
    return await DataXpress.getWalletBalance();
  }
}

/**
 * Get cost price from a specific supplier
 */
export async function getCostPrice(
  dataAmount: string,
  supplier?: SupplierType
): Promise<{ success: boolean; costPrice?: number; message?: string }> {
  const targetSupplier = supplier || (await getActiveSupplier());

  if (targetSupplier === "hubnet") {
    return await Hubnet.getCostPrice(dataAmount);
  } else {
    return await DataXpress.getCostPrice(dataAmount);
  }
}

/**
 * Get wallet balances for all suppliers
 */
export async function getAllWalletBalances(): Promise<{
  dataxpress: { success: boolean; balance?: string; currency?: string; message?: string };
  hubnet: { success: boolean; balance?: string; currency?: string; message?: string };
}> {
  const [dataxpressBalance, hubnetBalance] = await Promise.all([
    DataXpress.getWalletBalance(),
    Hubnet.getWalletBalance(),
  ]);

  return {
    dataxpress: dataxpressBalance,
    hubnet: hubnetBalance,
  };
}
