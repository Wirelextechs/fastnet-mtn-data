/**
 * Supplier Manager - Central routing for multi-supplier fulfillment
 * Routes orders to the active supplier (DataXpress or Hubnet)
 */

import * as dataxpress from "./dataxpress";
import * as hubnet from "./hubnet";
import { storage } from "./storage";

export type SupplierName = "dataxpress" | "hubnet";

/**
 * Get the currently active supplier from settings
 */
async function getActiveSupplier(): Promise<SupplierName> {
  try {
    const setting = await storage.getSetting("activeSupplier");
    if (setting && (setting.value === "dataxpress" || setting.value === "hubnet")) {
      return setting.value as SupplierName;
    }
    // Default to dataxpress if setting not found
    return "dataxpress";
  } catch (error) {
    console.error("Failed to get active supplier, defaulting to dataxpress:", error);
    return "dataxpress";
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
): Promise<{ success: boolean; message: string; data?: any; supplier: SupplierName }> {
  const activeSupplier = await getActiveSupplier();
  
  console.log(`📡 Using ${activeSupplier.toUpperCase()} for order ${orderReference}`);

  let result;
  if (activeSupplier === "hubnet") {
    result = await hubnet.purchaseDataBundle(phoneNumber, dataAmount, price, orderReference);
  } else {
    result = await dataxpress.purchaseDataBundle(phoneNumber, dataAmount, price, orderReference);
  }

  return {
    ...result,
    supplier: activeSupplier,
  };
}

/**
 * Get wallet balance from a specific supplier
 */
export async function getWalletBalance(
  supplier: SupplierName
): Promise<{
  success: boolean;
  balance?: string;
  currency?: string;
  message?: string;
}> {
  if (supplier === "hubnet") {
    return await hubnet.getWalletBalance();
  } else {
    return await dataxpress.getWalletBalance();
  }
}

/**
 * Get cost price from a specific supplier
 */
export async function getCostPrice(
  supplier: SupplierName,
  dataAmount: string
): Promise<{ success: boolean; costPrice?: number; message?: string }> {
  if (supplier === "hubnet") {
    return await hubnet.getCostPrice(dataAmount);
  } else {
    return await dataxpress.getCostPrice(dataAmount);
  }
}

/**
 * Get the currently active supplier name
 */
export async function getActiveSupplierName(): Promise<SupplierName> {
  return await getActiveSupplier();
}

/**
 * Set the active supplier
 */
export async function setActiveSupplier(supplier: SupplierName): Promise<void> {
  await storage.upsertSetting("activeSupplier", supplier);
  console.log(`✅ Active supplier changed to: ${supplier.toUpperCase()}`);
}
