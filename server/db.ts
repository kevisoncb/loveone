import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tributePages, InsertTributePage, payments, InsertPayment } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Tribute Pages helpers
export async function createTributePage(data: InsertTributePage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(tributePages).values(data);
  const result = await db.select().from(tributePages).where(eq(tributePages.uniqueSlug, data.uniqueSlug)).limit(1);
  return result[0];
}

export async function getTributePageBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tributePages).where(eq(tributePages.uniqueSlug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllTributePages() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(tributePages);
}

export async function getTributePagesByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(tributePages).where(eq(tributePages.userId, userId));
}

export async function getTributePageById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tributePages).where(eq(tributePages.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateTributePage(id: number, data: Partial<InsertTributePage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tributePages).set(data).where(eq(tributePages.id, id));
  return getTributePageById(id);
}

export async function deleteTributePage(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tributePages).where(and(eq(tributePages.id, id), eq(tributePages.userId, userId)));
}

export async function adminDeleteTributePage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tributePages).where(eq(tributePages.id, id));
}

// Payment helpers
export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(payments).values(data);
}

export async function getAllPayments() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(payments);
}

export async function updatePaymentByStripeId(stripePaymentIntentId: string, data: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(payments).set(data).where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
}

export async function getPaymentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.select().from(payments).where(eq(payments.userId, userId));
}

export async function updatePaymentStatus(stripePaymentIntentId: string, status: "pending" | "completed" | "failed" | "refunded", email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(payments).set({ status }).where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
}
