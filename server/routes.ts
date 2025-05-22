import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { 
  loginSchema, signupSchema, createSoftwareSchema, 
  createRequestSchema, approveRejectRequestSchema 
} from "@shared/schema";
import { authenticateToken, checkRole } from "./middleware/auth";
import { ZodError } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
const SALT_ROUNDS = 10;

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    
    if (err instanceof ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: err.errors 
      });
    }
    
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    res.status(500).json({ message: "Internal server error" });
  });

  // Authentication routes
  app.post("/api/auth/signup", async (req, res, next) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, SALT_ROUNDS);
      
      // Create user
      const user = await storage.createUser({ 
        username: validatedData.username,
        password: hashedPassword,
        role: validatedData.role || "Employee"
      });
      
      // Exclude password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Verify password
      const passwordMatch = await bcrypt.compare(validatedData.password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Generate JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        }, 
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      // Exclude password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json({ 
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      next(error);
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req, res, next) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  });

  // Software routes
  app.post("/api/software", authenticateToken, checkRole(["Admin"]), async (req, res, next) => {
    try {
      const validatedData = createSoftwareSchema.parse({
        ...req.body,
        createdBy: req.user.userId
      });
      
      const newSoftware = await storage.createSoftware(validatedData);
      res.status(201).json(newSoftware);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/software", authenticateToken, async (req, res, next) => {
    try {
      const allSoftware = await storage.getAllSoftware();
      res.json(allSoftware);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/software/:id", authenticateToken, async (req, res, next) => {
    try {
      const softwareId = parseInt(req.params.id);
      const sw = await storage.getSoftware(softwareId);
      
      if (!sw) {
        return res.status(404).json({ message: "Software not found" });
      }
      
      res.json(sw);
    } catch (error) {
      next(error);
    }
  });

  // Request routes
  app.post("/api/requests", authenticateToken, async (req, res, next) => {
    try {
      const validatedData = createRequestSchema.parse({
        ...req.body,
        userId: req.user.userId
      });
      
      // Check if software exists
      const sw = await storage.getSoftware(validatedData.softwareId);
      if (!sw) {
        return res.status(404).json({ message: "Software not found" });
      }
      
      // Check if the requested access type is available for this software
      if (!sw.accessLevels.includes(validatedData.accessType)) {
        return res.status(400).json({ 
          message: `Access type "${validatedData.accessType}" is not available for this software` 
        });
      }
      
      const newRequest = await storage.createRequest(validatedData);
      res.status(201).json(newRequest);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/requests/my", authenticateToken, async (req, res, next) => {
    try {
      const myRequests = await storage.getRequestsByUser(req.user.userId);
      res.json(myRequests);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/requests/pending", authenticateToken, checkRole(["Manager", "Admin"]), async (req, res, next) => {
    try {
      const pendingRequests = await storage.getPendingRequests();
      res.json(pendingRequests);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/requests/:id", authenticateToken, checkRole(["Manager", "Admin"]), async (req, res, next) => {
    try {
      const requestId = parseInt(req.params.id);
      
      // Check if request exists
      const existingRequest = await storage.getRequest(requestId);
      if (!existingRequest) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      const validatedData = approveRejectRequestSchema.parse({
        ...req.body,
        updatedBy: req.user.userId
      });
      
      const updatedRequest = await storage.updateRequest(requestId, validatedData);
      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  });

  // Dashboard statistics
  app.get("/api/dashboard/stats", authenticateToken, async (req, res, next) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
