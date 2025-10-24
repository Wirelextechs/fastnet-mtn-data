/**
 * Hubnet API Integration
 * https://console.hubnet.app/live/api/
 */

const HUBNET_BASE_URL = "https://console.hubnet.app/live/api/context/business/transaction";
const API_KEY = process.env.HUBNET_API_KEY;

if (!API_KEY) {
  console.warn("⚠️  HUBNET_API_KEY not set - Hubnet fulfillment will be disabled");
}

/**
 * Extract package size number from data amount string
 * Note: Hubnet API expects volume in megabytes
 * Example: "5GB" → 5000 (5 * 1000 MB)
 * 
 * @param dataAmount - Package size like "1GB", "5GB", "10GB"
 * @returns Volume in megabytes (e.g., 5000 for "5GB")
 */
function extractVolumeInMB(dataAmount: string): number {
  const match = dataAmount.match(/^(\d+)GB$/);
  if (!match) {
    throw new Error(`Invalid data amount format: ${dataAmount}`);
  }
  return parseInt(match[1]) * 1000; // Convert GB to MB (using 1000 not 1024)
}

interface HubnetTransactionRequest {
  phone: string;
  volume: string; // Volume in megabytes as string
  reference: string;
  referrer?: string;
  webhook?: string;
}

interface HubnetResponse {
  status: boolean;
  reason: string;
  code: string;
  message: string;
  transaction_id?: string;
  payment_id?: string;
  ip_address?: string;
  reference?: string;
  data?: any;
}

interface HubnetBalanceResponse {
  balance: number;
  currency: string;
}

/**
 * Purchase a data bundle via Hubnet
 * @param phoneNumber - Customer's phone number (10 digits, national format)
 * @param dataAmount - Package size like "5GB"
 * @param price - Supplier cost (wholesale price, NOT customer price)
 * @param orderReference - Unique order reference
 * @param network - Network type: "mtn", "at", "big-time"
 */
export async function purchaseDataBundle(
  phoneNumber: string,
  dataAmount: string,
  price: number,
  orderReference: string,
  network: "mtn" | "at" | "big-time" = "mtn"
): Promise<{ success: boolean; message: string; data?: any }> {
  if (!API_KEY) {
    return {
      success: false,
      message: "Hubnet API key not configured",
    };
  }

  try {
    // Convert dataAmount to volume in MB
    const volumeInMB = extractVolumeInMB(dataAmount);

    const requestBody: HubnetTransactionRequest = {
      phone: phoneNumber,
      volume: volumeInMB.toString(),
      reference: orderReference,
    };

    console.log(`📡 Sending data order to Hubnet:`, {
      phone: phoneNumber,
      dataAmount: dataAmount,
      volumeInMB: volumeInMB,
      supplierCost: price,
      ref: orderReference,
      network: network,
    });

    const response = await fetch(`${HUBNET_BASE_URL}/${network}-new-transaction`, {
      method: "POST",
      headers: {
        "token": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result: HubnetResponse = await response.json();

    if (!response.ok) {
      console.error(`❌ Hubnet API error:`, result);
      return {
        success: false,
        message: result.reason || result.message || `API request failed with status ${response.status}`,
      };
    }

    // Check if transaction was successful
    // Hubnet returns code "0000" for success
    if (result.status && result.code === "0000") {
      console.log(`✅ Hubnet order successful:`, result);
      return {
        success: true,
        message: result.message || result.reason,
        data: {
          transaction_id: result.transaction_id,
          payment_id: result.payment_id,
          reference: result.reference,
        },
      };
    } else {
      console.error(`❌ Hubnet order failed:`, result.message || result.reason);
      return {
        success: false,
        message: result.message || result.reason || "Transaction failed",
      };
    }
  } catch (error) {
    console.error(`❌ Hubnet API error:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get Hubnet wallet balance
 */
export async function getWalletBalance(): Promise<{
  success: boolean;
  balance?: string;
  currency?: string;
  message?: string;
}> {
  if (!API_KEY) {
    return {
      success: false,
      message: "Hubnet API key not configured",
    };
  }

  try {
    const response = await fetch(`${HUBNET_BASE_URL}/check_balance`, {
      method: "GET",
      headers: {
        "token": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to fetch balance: ${response.status}`,
      };
    }

    const result: HubnetBalanceResponse = await response.json();

    return {
      success: true,
      balance: result.balance.toString(),
      currency: result.currency || "GHS",
    };
  } catch (error) {
    console.error(`❌ Failed to fetch Hubnet wallet balance:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get cost price for a data package from Hubnet
 * Note: Hubnet doesn't provide a dedicated cost price endpoint
 * We'll use a fixed margin-based pricing or manual configuration
 * 
 * @param dataAmount - Package size like "5GB"
 * @returns Cost price estimate
 */
export async function getCostPrice(
  dataAmount: string
): Promise<{ success: boolean; costPrice?: number; message?: string }> {
  // Hubnet doesn't have a get-cost-price endpoint
  // Return a message indicating manual pricing is needed
  return {
    success: false,
    message: "Hubnet does not provide cost price API. Please configure pricing manually.",
  };
}
