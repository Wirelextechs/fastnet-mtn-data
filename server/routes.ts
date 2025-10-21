import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { insertPackageSchema, insertOrderSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      // Create order with server-determined amount and status
      const order = await storage.createOrder({
        packageId: pkg.id,
        phoneNumber,
        email,
        amount: pkg.price, // Use price from database, not client
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

  // Paystack webhook endpoint for payment verification
  app.post("/api/webhooks/paystack", async (req, res) => {
    try {
      const event = req.body;
      
      // Verify webhook signature (implement proper verification in production)
      if (event.event === "charge.success") {
        const reference = event.data.reference;
        
        // Update order status to completed
        const order = await storage.getOrderByReference(reference);
        if (order) {
          await storage.updateOrder(order.id, { status: "completed" });
        }
      }
      
      res.json({ message: "Webhook received" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
