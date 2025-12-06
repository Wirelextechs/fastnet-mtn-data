/**
 * DataKazina API Integration
 * https://reseller.dakazinabusinessconsult.com/api/v1
 * Authentication: x-api-key header
 */

const DAKAZINA_BASE_URL = "https://reseller.dakazinabusinessconsult.com/api/v1";
const API_KEY = process.env.DAKAZINA_API_KEY;

if (!API_KEY) {
  console.warn("⚠️  DAKAZINA_API_KEY not set - DataKazina fulfillment will be disabled");
}

/**
 * Map package sizes to DataKazina shared_bundle IDs
 * network_id: 3 = MTN
 * These mappings need to be verified with DataKazina's actual bundle catalog
 */
const SHARED_BUNDLE_MAP: Record<string, number> = {
  "1GB": 1,
  "2GB": 2,
  "3GB": 3,
  "4GB": 4,
  "5GB": 5,
  "6GB": 6,
  "7GB": 7,
  "8GB": 8,
  "10GB": 10,
  "15GB": 15,
  "20GB": 20,
  "25GB": 25,
  "30GB": 30,
  "40GB": 40,
  "50GB": 50,
  "75GB": 75,
  "100GB": 100,
};

/**
 * Get shared_bundle ID for a given data amount
 */
function getSharedBundleId(dataAmount: string): number {
  const bundleId = SHARED_BUNDLE_MAP[dataAmount];
  if (!bundleId) {
    throw new Error(`Unknown data package size: ${dataAmount}. Available: ${Object.keys(SHARED_BUNDLE_MAP).join(", ")}`);
  }
  return bundleId;
}

interface DataKazinaPurchaseRequest {
  recipient_msisdn: string;
  network_id: number;
  shared_bundle: number;
  incoming_api_ref: string;
}

interface DataKazinaPurchaseResponse {
  status: boolean;
  message: string;
  transaction_id?: string;
  data?: any;
}

interface DataKazinaBalanceResponse {
  status: boolean;
  balance?: number;
  message?: string;
  data?: {
    balance?: number;
    wallet_balance?: number;
  };
}

/**
 * Purchase a data bundle via DataKazina API
 * @param phoneNumber - Customer's phone number (10 digits, e.g., 0551234567)
 * @param dataAmount - Package size like "5GB"
 * @param price - Supplier cost (wholesale price)
 * @param orderReference - Unique order reference
 */
export async function purchaseDataBundle(
  phoneNumber: string,
  dataAmount: string,
  price: number,
  orderReference: string
): Promise<{ success: boolean; message: string; data?: any }> {
  if (!API_KEY) {
    return {
      success: false,
      message: "DataKazina API key not configured",
    };
  }

  try {
    const sharedBundleId = getSharedBundleId(dataAmount);

    const requestBody: DataKazinaPurchaseRequest = {
      recipient_msisdn: phoneNumber,
      network_id: 3, // MTN Ghana
      shared_bundle: sharedBundleId,
      incoming_api_ref: orderReference,
    };

    console.log(`📡 Sending data order to DataKazina:`, {
      phone: phoneNumber,
      dataAmount: dataAmount,
      sharedBundle: sharedBundleId,
      supplierCost: price,
      ref: orderReference,
    });

    const response = await fetch(`${DAKAZINA_BASE_URL}/buy-data-package`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result: DataKazinaPurchaseResponse = await response.json();

    if (!response.ok) {
      console.error(`❌ DataKazina API error:`, result);
      return {
        success: false,
        message: result.message || `API request failed with status ${response.status}`,
      };
    }

    if (result.status) {
      console.log(`✅ DataKazina order successful:`, result);
      return {
        success: true,
        message: result.message || "Data purchase successful",
        data: {
          transaction_id: result.transaction_id,
          ...result.data,
        },
      };
    } else {
      console.error(`❌ DataKazina order failed:`, result.message);
      return {
        success: false,
        message: result.message || "Purchase failed",
      };
    }
  } catch (error) {
    console.error(`❌ DataKazina API error:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get wallet balance from DataKazina
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
      message: "DataKazina API key not configured",
    };
  }

  try {
    const response = await fetch(`${DAKAZINA_BASE_URL}/check-console-balance`, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to fetch wallet balance: ${response.status}`,
      };
    }

    const result = await response.json();
    console.log("DataKazina balance response:", result);

    // Handle the actual API response format: { status: 'Success', 'Wallet Balance': '26.45' }
    const balance = result['Wallet Balance'] ?? result.balance ?? result.data?.balance ?? result.data?.wallet_balance;

    if (balance !== undefined) {
      return {
        success: true,
        balance: String(balance),
        currency: "GHS",
      };
    } else if (result.status === 'Failed' || result.status === false) {
      return {
        success: false,
        message: result.message || "Failed to retrieve balance",
      };
    } else {
      return {
        success: false,
        message: "Unexpected response format from DataKazina",
      };
    }
  } catch (error) {
    console.error(`❌ Failed to fetch DataKazina balance:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Check transaction status
 * @param transactionId - The transaction ID to check
 */
export async function checkTransactionStatus(
  transactionId: string
): Promise<{ success: boolean; status?: string; message?: string; data?: any }> {
  if (!API_KEY) {
    return {
      success: false,
      message: "DataKazina API key not configured",
    };
  }

  try {
    const response = await fetch(`${DAKAZINA_BASE_URL}/fetch-single-transaction`, {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transaction_id: transactionId }),
    });

    if (!response.ok) {
      return {
        success: false,
        message: `Failed to check transaction: ${response.status}`,
      };
    }

    const result = await response.json();
    return {
      success: true,
      status: result.status,
      data: result,
    };
  } catch (error) {
    console.error(`❌ Failed to check DataKazina transaction:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get cost price for a data package from DataKazina
 * Note: DataKazina doesn't provide a dedicated pricing API
 */
export async function getCostPrice(
  dataAmount: string
): Promise<{ success: boolean; costPrice?: number; message?: string }> {
  return {
    success: false,
    message: "DataKazina does not provide automated cost price API. Please configure pricing manually.",
  };
}
