import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tribute pages created by couples
 */
export const tributePages = mysqlTable("tribute_pages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  uniqueSlug: varchar("uniqueSlug", { length: 64 }).notNull().unique(),
  
  // Couple data
  partner1Name: varchar("partner1Name", { length: 255 }).notNull(),
  partner2Name: varchar("partner2Name", { length: 255 }).notNull(),
  relationshipStartDate: timestamp("relationshipStartDate").notNull(),
  
  // Media
  photoUrls: text("photoUrls").notNull(), // JSON array of S3 URLs
  musicYoutubeUrl: varchar("musicYoutubeUrl", { length: 500 }),
  
  // Plan control
  planType: mysqlEnum("planType", ["essential", "premium"]).notNull(),
  planExpiresAt: timestamp("planExpiresAt"), // null for premium (lifetime), date for essential
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TributePage = typeof tributePages.$inferSelect;
export type InsertTributePage = typeof tributePages.$inferInsert;

/**
 * Payment records for plans
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tributePageId: int("tributePageId"),
  
  planType: mysqlEnum("planType", ["essential", "premium"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
  
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
