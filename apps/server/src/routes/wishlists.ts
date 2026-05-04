import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { db } from "@financial-tracker-sea/db";
import {
  wishlists,
  budgets,
  transactions,
  categories,
  contributions,
} from "@financial-tracker-sea/db/schema";
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

// GET /wishlists/stats - Get wishlist overview stats (connected to budget)
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

  // Fetch current month's budget to connect budget → totalCollected
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [budget] = await db.select().from(budgets).where(eq(budgets.month, currentMonth));

  // Fetch contributions this month to avoid double counting in totalCollected
  const startDate = `${currentMonth}-01`;
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]!;

  const budgetRemaining = budget?.totalAmount ?? 0;

  const [currentMonthContribs] = await db
    .select({ total: sql<number>`coalesce(sum(${contributions.amount}), 0)` })
    .from(contributions)
    .where(and(gte(contributions.createdAt, startDate), lte(contributions.createdAt, endDate)));

  const currentMonthContribAmount = currentMonthContribs?.total ?? 0;

  // totalCollected = total wishlist contributions + budget remaining balance
  // Subtract current month contributions from budgetRemaining because they are already in totalCurrent
  const totalCollected = totalCurrent + (budgetRemaining - currentMonthContribAmount);

  // Cap progress at 100% so the pie chart doesn't break
  const overallProgress =
    totalTarget > 0 ? Math.min(Math.round((totalCollected / totalTarget) * 100), 100) : 0;

  return c.json({
    totalTarget,
    totalCurrent,
    totalCollected,
    count,
    overallProgress,
    budgetRemaining,
  });
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

// GET /wishlists/:id/contributions - Get contribution history for a wishlist
app.get("/:id/contributions", async (c) => {
  const id = c.req.param("id");

  const rows = await db
    .select()
    .from(contributions)
    .where(eq(contributions.wishlistId, id))
    .orderBy(desc(contributions.createdAt));

  return c.json(rows);
});

// GET /wishlists/:id/history - Get combined history (contributions + expenses)
// Returns a merged timeline of tabungan contributions and pengeluaran expenses
app.get("/:id/history", async (c) => {
  const id = c.req.param("id");

  const [wishlist] = await db.select().from(wishlists).where(eq(wishlists.id, id));

  if (!wishlist) {
    return c.json({ error: "Wishlist not found" }, 404);
  }

  // Fetch contributions for this wishlist
  const contribRows = await db
    .select()
    .from(contributions)
    .where(eq(contributions.wishlistId, id))
    .orderBy(desc(contributions.createdAt));

  // Fetch current month's expense transactions
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const startDate = `${currentMonth}-01`;
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]!;

  const txRows = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      description: transactions.description,
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryDisplayName: categories.displayName,
      date: transactions.date,
      createdAt: transactions.createdAt,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(gte(transactions.date, startDate), lte(transactions.date, endDate)))
    .orderBy(desc(transactions.createdAt));

  // Merge into a unified timeline
  type HistoryEntry = {
    id: string;
    type: "contribution" | "expense";
    amount: number;
    label: string;
    date: string;
    createdAt: string;
  };

  const history: HistoryEntry[] = [
    ...contribRows.map((c) => ({
      id: c.id,
      type: "contribution" as const,
      amount: c.amount,
      label: wishlist.name,
      date: c.createdAt.split("T")[0] ?? c.createdAt,
      createdAt: c.createdAt,
    })),
    ...txRows.map((t) => ({
      id: t.id,
      type: "expense" as const,
      amount: t.amount,
      label: t.categoryDisplayName ?? t.categoryName ?? "Pengeluaran",
      date: t.date.split("T")[0] ?? t.date,
      createdAt: t.createdAt,
    })),
  ];

  // Sort by createdAt descending (newest first)
  history.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return c.json(history);
});

// POST /wishlists/:id/contribute - Contribute to a wishlist
// This also adds the contribution amount to the current month's budget total,
// so the dashboard "Total Budget" stays in sync with tabungan contributions.
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

  await db.insert(contributions).values({
    id: crypto.randomUUID(),
    wishlistId: id,
    amount,
  });

  const [updated] = await db
    .update(wishlists)
    .set({
      currentAmount: newAmount,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(wishlists.id, id))
    .returning();

  // Also add the contributed amount to the current month's budget
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [existingBudget] = await db.select().from(budgets).where(eq(budgets.month, currentMonth));

  if (existingBudget) {
    // Update existing budget by adding the contribution amount
    await db
      .update(budgets)
      .set({
        totalAmount: existingBudget.totalAmount + amount,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(budgets.month, currentMonth));
  } else {
    // No budget yet for this month — create one with the contribution as initial amount
    await db.insert(budgets).values({
      id: crypto.randomUUID(),
      month: currentMonth,
      totalAmount: amount,
    });
  }

  return c.json(updated);
});

// GET /wishlists/:id - Get a wishlist by id
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const [wishlist] = await db.select().from(wishlists).where(eq(wishlists.id, id));

  if (!wishlist) {
    return c.json({ error: "Wishlist not found" }, 404);
  }

  return c.json(wishlist);
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

// DELETE /wishlists/:id - Delete a wishlist
app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const [deleted] = await db.delete(wishlists).where(eq(wishlists.id, id)).returning();

  if (!deleted) {
    return c.json({ error: "Wishlist not found" }, 404);
  }

  return c.json(deleted);
});

export default app;
