import { 
  users, software, requests, 
  type User, type InsertUser, 
  type Software, type InsertSoftware,
  type Request, type InsertRequest, type UpdateRequest
} from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { db } from "./db";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Software operations
  getSoftware(id: number): Promise<Software | undefined>;
  getAllSoftware(): Promise<Software[]>;
  createSoftware(software: InsertSoftware): Promise<Software>;
  
  // Request operations
  getRequest(id: number): Promise<Request | undefined>;
  getRequestsByUser(userId: number): Promise<Request[]>;
  getPendingRequests(): Promise<Request[]>;
  createRequest(request: InsertRequest): Promise<Request>;
  updateRequest(id: number, updates: UpdateRequest): Promise<Request | undefined>;

  // Dashboard statistics
  getDashboardStats(): Promise<{ totalSoftware: number, pendingRequests: number, totalUsers: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Software operations
  async getSoftware(id: number): Promise<Software | undefined> {
    const [sw] = await db.select().from(software).where(eq(software.id, id));
    return sw;
  }

  async getAllSoftware(): Promise<Software[]> {
    return await db.select().from(software).orderBy(asc(software.name));
  }

  async createSoftware(sw: InsertSoftware): Promise<Software> {
    const [newSoftware] = await db.insert(software).values(sw).returning();
    return newSoftware;
  }

  // Request operations
  async getRequest(id: number): Promise<Request | undefined> {
    const [request] = await db.select().from(requests).where(eq(requests.id, id));
    return request;
  }

  async getRequestsByUser(userId: number): Promise<Request[]> {
    return await db
      .select()
      .from(requests)
      .where(eq(requests.userId, userId))
      .orderBy(desc(requests.createdAt));
  }

  async getPendingRequests(): Promise<Request[]> {
    return await db
      .select()
      .from(requests)
      .where(eq(requests.status, "Pending"))
      .orderBy(desc(requests.createdAt));
  }

  async createRequest(request: InsertRequest): Promise<Request> {
    const [newRequest] = await db.insert(requests).values(request).returning();
    return newRequest;
  }

  async updateRequest(id: number, updates: UpdateRequest): Promise<Request | undefined> {
    const [updatedRequest] = await db
      .update(requests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(requests.id, id))
      .returning();
    return updatedRequest;
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<{ totalSoftware: number, pendingRequests: number, totalUsers: number }> {
    const [softwareCount] = await db.select({ count: db.fn.count() }).from(software);
    const [pendingCount] = await db
      .select({ count: db.fn.count() })
      .from(requests)
      .where(eq(requests.status, "Pending"));
    const [userCount] = await db.select({ count: db.fn.count() }).from(users);

    return {
      totalSoftware: Number(softwareCount?.count || 0),
      pendingRequests: Number(pendingCount?.count || 0),
      totalUsers: Number(userCount?.count || 0)
    };
  }
}

export const storage = new DatabaseStorage();
