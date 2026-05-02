import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@financial-tracker-sea/db";
import { wishlists } from "@financial-tracker-sea/db/schema";
import { Hono } from "hono";

const app = new Hono();

// Validation schemas
const createWishlistSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).optional().default(0),
  imageUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["Berjalan", "Tercapai"]).optional().default("Berjalan"),
});

const updateWishlistSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().positive().optional(),
  currentAmount: z.number().min(0).optional(),
  imageUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["Berjalan", "Tercapai"]).optional(),
});

// GET /wishlists - List all wishlists
app.get("/", async (c) => {
  const status = c.req.query("status");

  const rows = await db
    .select()
    .from(wishlists)
    .where(status ? eq(wishlists.status, status) : undefined)
    .orderBy(desc(wishlists.createdAt));

  return c.json(rows);
});

// GET /wishlists/stats - Get wishlist overview stats
app.get("/stats", async (c) => {
  const result = await db
    .select({
      totalTarget: sql<number>`coalesce(sum(${wishlists.targetAmount}), 0)`,
      totalCurrent: sql<number>`coalesce(sum(${wishlists.currentAmount}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(wishlists);

  const stats = result[0];
  const totalTarget = stats?.totalTarget ?? 0;
  const totalCurrent = stats?.totalCurrent ?? 0;
  const count = stats?.count ?? 0;

  return c.json({
    totalTarget,
    totalCurrent,
    totalCollected: totalCurrent,
    count,
    overallProgress: totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0,
  });
});

// GET /wishlists/:id - Get a wishlist by id
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const [wishlist] = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.id, id));

  if (!wishlist) {
    return c.json({ error: "Wishlist not found" }, 404);
  }

  return c.json(wishlist);
});

// POST /wishlists - Create a wishlist
app.post("/", zValidator("json", createWishlistSchema), async (c) => {
  const body = c.req.valid("json");
  const id = crypto.randomUUID();

  const [created] = await db
    .insert(wishlists)
    .values({ id, ...body })
    .returning();

  return c.json(created, 201);
});

// PUT /wishlists/:id - Update a wishlist
app.put("/:id", zValidator("json", updateWishlistSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  // Auto-set status to "Tercapai" if currentAmount >= targetAmount
  if (body.currentAmount !== undefined) {
    const [existing] = await db.select().from(wishlists).where(eq(wishlists.id, id));
    if (existing && body.currentAmount >= existing.targetAmount) {
      body.status = "Tercapai";
    }
  }

  const [updated] = await db
    .update(wishlists)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(wishlists.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Wishlist not found" }, 404);
  }

  return c.json(updated);
});

// POST /wishlists/:id/contribute - Contribute to a wishlist
app.post("/:id/contribute", async (c) => {
  const id = c.req.param("id");
  const { amount } = await c.req.json<{ amount: number }>();

  if (!amount || amount <= 0) {
    return c.json({ error: "Amount must be a positive number" }, 400);
  }

  const [existing] = await db.select().from(wishlists).where(eq(wishlists.id, id));

  if (!existing) {
    return c.json({ error: "Wishlist not found" }, 404);
  }

  const newAmount = existing.currentAmount + amount;
  const newStatus = newAmount >= existing.targetAmount ? "Tercapai" : "Berjalan";

  const [updated] = await db
    .update(wishlists)
    .set({
      currentAmount: newAmount,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(wishlists.id, id))
    .returning();

  return c.json(updated);
});

// DELETE /wishlists/:id - Delete a wishlist
app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(wishlists)
    .where(eq(wishlists.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Wishlist not found" }, 404);
  }

  return c.json(deleted);
});

export default app;
