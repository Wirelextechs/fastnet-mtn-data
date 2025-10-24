import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { insertPackageSchema, insertOrderSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import { z } from "zod";
import { initializeDatabase } from "./init";
import { purchaseDataBundle, getWalletBalance, getCostPrice } from "./dataxpress";

/**
 * Fulfill an order by sending data to customer via DataXpress
 */
async function fulfillOrder(orderId: string): Promise<void> {
  try {
    const order = await storage.getOrderById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // Skip if already fulfilled or processing
    if (order.fulfillmentStatus === "fulfilled" || order.fulfillmentStatus === "processing") {
      console.log(`⏭️  Order ${orderId} already ${order.fulfillmentStatus}, skipping`);
      return;
    }

    // Get package details
    const pkg = await storage.getPackageById(order.packageId);
    if (!pkg) {
      throw new Error(`Package ${order.packageId} not found`);
    }

    // Update to processing
    await storage.updateOrder(orderId, {
      fulfillmentStatus: "processing",
    });

    console.log(`🚀 Fulfilling order ${orderId}: ${pkg.dataAmount} to ${order.phoneNumber}`);

    // Send to DataXpress using supplier cost (wholesale price)
    const result = await purchaseDataBundle(
      order.phoneNumber,
      pkg.dataAmount,
      parseFloat(pkg.supplierCost),
      order.paystackReference || order.id
    );

    if (result.success) {
      // Update order as fulfilled
      await storage.updateOrder(orderId, {
        fulfillmentStatus: "fulfilled",
        fulfillmentError: null,
        dataxpressReference: result.data?.reference || order.paystackReference,
      });
      console.log(`✅ Order ${orderId} fulfilled successfully`);
    } else {
      // Mark as failed with error message
      await storage.updateOrder(orderId, {
        fulfillmentStatus: "failed",
        fulfillmentError: result.message,
      });
      console.error(`❌ Order ${orderId} fulfillment failed: ${result.message}`);
    }
  } catch (error: any) {
    console.error(`❌ Error fulfilling order ${orderId}:`, error);
    await storage.updateOrder(orderId, {
      fulfillmentStatus: "failed",
      fulfillmentError: error.message || "Unknown error",
    });
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database (seed packages if empty)
  await initializeDatabase();
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Package routes - Public can read, admin can modify
  app.get("/api/packages", async (req, res) => {
    try {
      const packages = await storage.getAllPackages();
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.get("/api/packages/:id", async (req, res) => {
    try {
      const pkg = await storage.getPackageById(req.params.id);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(pkg);
    } catch (error) {
      console.error("Error fetching package:", error);
      res.status(500).json({ message: "Failed to fetch package" });
    }
  });

  app.post("/api/packages", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const data = insertPackageSchema.parse(req.body);
      const pkg = await storage.createPackage(data);
      res.json(pkg);
    } catch (error: any) {
      console.error("Error creating package:", error);
      res.status(400).json({ message: error.message || "Failed to create package" });
    }
  });

  app.patch("/api/packages/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Create partial schema for updates
      const updateSchema = insertPackageSchema.partial();
      
      // Validate and parse the update data
      const updateData = updateSchema.parse(req.body);
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      const pkg = await storage.updatePackage(req.params.id, updateData);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      res.json(pkg);
    } catch (error: any) {
      console.error("Error updating package:", error);
      res.status(400).json({ message: error.message || "Failed to update package" });
    }
  });

  app.delete("/api/packages/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deletePackage(req.params.id);
      res.json({ message: "Package deleted successfully" });
    } catch (error) {
      console.error("Error deleting package:", error);
      res.status(500).json({ message: "Failed to delete package" });
    }
  });

  // Sync supplier costs from DataXpress real-time pricing
  app.post("/api/packages/sync-pricing", isAuthenticated, isAdmin, async (req, res) => {
    try {
      console.log("🔄 Starting DataXpress pricing sync...");
      const packages = await storage.getAllPackages();
      
      const results = {
        total: packages.length,
        updated: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const pkg of packages) {
        try {
          console.log(`📊 Fetching cost for ${pkg.dataAmount}...`);
          const priceResult = await getCostPrice(pkg.dataAmount);
          
          if (priceResult.success && priceResult.costPrice !== undefined) {
            // Update package with real-time cost from DataXpress
            await storage.updatePackage(pkg.id, {
              supplierCost: priceResult.costPrice.toFixed(2),
            });
            console.log(`✅ Updated ${pkg.dataAmount}: GH₵${priceResult.costPrice.toFixed(2)}`);
            results.updated++;
          } else {
            console.warn(`⚠️  Failed to get cost for ${pkg.dataAmount}: ${priceResult.message}`);
            results.failed++;
            results.errors.push(`${pkg.dataAmount}: ${priceResult.message}`);
          }
        } catch (error: any) {
          console.error(`❌ Error syncing ${pkg.dataAmount}:`, error);
          results.failed++;
          results.errors.push(`${pkg.dataAmount}: ${error.message}`);
        }
      }

      console.log(`✅ Pricing sync complete: ${results.updated} updated, ${results.failed} failed`);
      
      res.json({
        message: `Synced ${results.updated} packages successfully`,
        results,
      });
    } catch (error: any) {
      console.error("Error syncing pricing:", error);
      res.status(500).json({ message: error.message || "Failed to sync pricing" });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/reference/:reference", async (req, res) => {
    try {
      const order = await storage.getOrderByReference(req.params.reference);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      // Only parse and validate packageId, phoneNumber, email from client
      const { packageId, phoneNumber, email } = req.body;
      
      if (!packageId || !phoneNumber || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Fetch package from database to get authoritative price
      const pkg = await storage.getPackageById(packageId);
      if (!pkg) {
        return res.status(404).json({ message: "Package not found" });
      }
      
      if (!pkg.isActive) {
        return res.status(400).json({ message: "Package is not available" });
      }
      
      // Generate Paystack reference
      const reference = `FS-${Date.now()}-${randomUUID().substring(0, 8)}`;
      
      // Calculate 1.18% convenience fee
      const packagePrice = parseFloat(pkg.price);
      const fee = packagePrice * 0.0118; // 1.18% fee
      const totalAmount = packagePrice + fee;
      
      // Create order with server-determined amount and status
      const order = await storage.createOrder({
        packageId: pkg.id,
        phoneNumber,
        email,
        amount: pkg.price, // Package price (base amount)
        fee: fee.toFixed(2), // 1.18% convenience fee
        totalAmount: totalAmount.toFixed(2), // Total amount customer pays
        paystackReference: reference,
        status: "pending", // Always start as pending
      });

      // Return order for frontend to use with Paystack SDK
      res.json({
        order,
        authorizationUrl: "",
      });
    } catch (error: any) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: error.message || "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Define schema for status updates
      const orderStatusSchema = z.object({
        status: z.enum(['pending', 'processing', 'completed', 'failed']),
      });
      
      // Validate the request body
      const { status } = orderStatusSchema.parse(req.body);
      
      const order = await storage.updateOrder(req.params.id, { status });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      console.error("Error updating order:", error);
      res.status(400).json({ message: error.message || "Failed to update order" });
    }
  });

  app.delete("/api/orders/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteOrder(req.params.id);
      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Manual fulfillment endpoint for admin
  app.post("/api/orders/:id/fulfill", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await fulfillOrder(req.params.id);
      const updatedOrder = await storage.getOrderById(req.params.id);
      res.json(updatedOrder);
    } catch (error: any) {
      console.error("Error fulfilling order:", error);
      res.status(500).json({ message: error.message || "Failed to fulfill order" });
    }
  });

  // Get DataXpress wallet balance
  app.get("/api/wallet/balance", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const result = await getWalletBalance();
      if (result.success) {
        res.json({
          balance: result.balance,
          currency: result.currency,
        });
      } else {
        res.status(500).json({ message: result.message || "Failed to fetch wallet balance" });
      }
    } catch (error: any) {
      console.error("Error fetching wallet balance:", error);
      res.status(500).json({ message: error.message || "Failed to fetch wallet balance" });
    }
  });

  // Paystack webhook endpoint for payment verification
  app.post("/api/webhooks/paystack", async (req, res) => {
    try {
      const event = req.body;
      
      console.log("🔔 Paystack webhook received:", {
        event: event.event,
        reference: event.data?.reference,
        timestamp: new Date().toISOString()
      });
      
      // Verify webhook signature (implement proper verification in production)
      if (event.event === "charge.success") {
        const reference = event.data.reference;
        
        console.log(`✅ Payment successful for reference: ${reference}`);
        
        // Update order status to completed and fulfill automatically
        const order = await storage.getOrderByReference(reference);
        if (order) {
          console.log(`📦 Order found: ${order.id}, updating to completed and fulfilling...`);
          
          await storage.updateOrder(order.id, { status: "completed" });
          
          // Trigger automatic fulfillment (don't wait for it to complete)
          fulfillOrder(order.id).catch((error) => {
            console.error(`❌ Failed to fulfill order ${order.id}:`, error);
          });
          
          console.log(`✅ Order ${order.id} marked completed and sent for fulfillment`);
        } else {
          console.warn(`⚠️ No order found for reference: ${reference}`);
        }
      } else {
        console.log(`ℹ️ Ignoring webhook event: ${event.event}`);
      }
      
      res.json({ message: "Webhook received" });
    } catch (error) {
      console.error("❌ Error processing webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
