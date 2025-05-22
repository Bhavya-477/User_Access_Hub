import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["Employee", "Manager", "Admin"] }).notNull().default("Employee"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

// Software model
export const software = pgTable("software", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  accessLevels: text("access_levels").array().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull(),
});

export const insertSoftwareSchema = createInsertSchema(software).pick({
  name: true,
  description: true,
  accessLevels: true,
  createdBy: true,
});

// Request model
export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  softwareId: integer("software_id").notNull(),
  accessType: text("access_type").notNull(),
  reason: text("reason").notNull(),
  status: text("status", { enum: ["Pending", "Approved", "Rejected"] }).notNull().default("Pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: integer("updated_by"),
});

export const insertRequestSchema = createInsertSchema(requests).pick({
  userId: true,
  softwareId: true,
  accessType: true,
  reason: true,
});

export const updateRequestSchema = createInsertSchema(requests).pick({
  status: true,
  updatedBy: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Software = typeof software.$inferSelect;
export type InsertSoftware = z.infer<typeof insertSoftwareSchema>;

export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type UpdateRequest = z.infer<typeof updateRequestSchema>;

// Extended schemas for frontend validation
export const loginSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const signupSchema = insertUserSchema.extend({
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const createSoftwareSchema = insertSoftwareSchema.extend({
  accessLevels: z.array(z.enum(["Read", "Write", "Admin"])).min(1, { message: "At least one access level is required" }),
});

export const createRequestSchema = insertRequestSchema.extend({
  accessType: z.enum(["Read", "Write", "Admin"]),
  reason: z.string().min(10, { message: "Please provide a detailed justification (at least 10 characters)" }),
});

export const approveRejectRequestSchema = updateRequestSchema.extend({
  status: z.enum(["Approved", "Rejected"]),
});
