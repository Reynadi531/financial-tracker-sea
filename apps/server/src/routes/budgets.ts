import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";
import { db } from "@financial-tracker-sea/db";
import { budgets, transactions, categories } from "@financial-tracker-sea/db/schema";
import { Hono } from "hono";

const app = new Hono();

// Validation schemas
const createBudgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM"),
  totalAmount: z.number().positive(),
});

const updateBudgetSchema = z.object({
  totalAmount: z.number().positive().optional(),
});

// GET /budgets - List all budgets
app.get("/", async (c) => {
  const rows = await db.select().from(budgets).orderBy(desc(budgets.month));
  return c.json(rows);
});

// GET /budgets/current - Get current month's budget with spending
app.get("/current", async (c) => {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [budget] = await db
    .select()
    .from(budgets)
    .where(eq(budgets.month, currentMonth));

  if (!budget) {
    return c.json({ error: "No budget set for current month" }, 404);
  }

  // Calculate spending for the month
  const startDate = `${currentMonth}-01`;
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]!;

  const result = await db
    .select({ total: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(and(gte(transactions.date, startDate), lte(transactions.date, endDate)));

  const totalExpense = result[0]?.total ?? 0;

  return c.json({
    ...budget,
    totalExpense,
    remaining: budget.totalAmount - totalExpense,
    spentPercentage: Math.round((totalExpense / budget.totalAmount) * 100),
  });
});

// GET /budgets/:month - Get budget for specific month
app.get("/:month", async (c) => {
  const month = c.req.param("month");

  if (!/^\d{4}-\d{2}$/.test(month)) {
    return c.json({ error: "Invalid month format. Use YYYY-MM" }, 400);
  }

  const [budget] = await db
    .select()
    .from(budgets)
    .where(eq(budgets.month, month));

  if (!budget) {
    return c.json({ error: "Budget not found for this month" }, 404);
  }

  return c.json(budget);
});

// GET /budgets/:month/spending - Get spending breakdown for a month
app.get("/:month/spending", async (c) => {
  const month = c.req.param("month");

  if (!/^\d{4}-\d{2}$/.test(month)) {
    return c.json({ error: "Invalid month format. Use YYYY-MM" }, 400);
  }

  const startDate = `${month}-01`;
  const endDate = new Date(
    parseInt(month.split("-")[0]!),
    parseInt(month.split("-")[1]!),
    0
  ).toISOString().split("T")[0]!;

  const spending = await db
    .select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryDisplayName: categories.displayName,
      totalAmount: sql<number>`sum(${transactions.amount})`,
      count: sql<number>`count(*)`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(gte(transactions.date, startDate), lte(transactions.date, endDate)))
    .groupBy(transactions.categoryId, categories.name, categories.displayName);

  const result = await db
    .select({ total: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(and(gte(transactions.date, startDate), lte(transactions.date, endDate)));

  const grandTotal = result[0]?.total ?? 0;

  return c.json({ spending, grandTotal });
});

// POST /budgets - Create or update budget for a month
app.post("/", zValidator("json", createBudgetSchema), async (c) => {
  const body = c.req.valid("json");

  // Check if budget already exists for this month
  const [existing] = await db
    .select()
    .from(budgets)
    .where(eq(budgets.month, body.month));

  if (existing) {
    const [updated] = await db
      .update(budgets)
      .set({ totalAmount: body.totalAmount, updatedAt: new Date().toISOString() })
      .where(eq(budgets.month, body.month))
      .returning();

    return c.json(updated);
  }

  const id = crypto.randomUUID();
  const [created] = await db
    .insert(budgets)
    .values({ id, ...body })
    .returning();

  return c.json(created, 201);
});

// PUT /budgets/:month - Update budget for a month
app.put("/:month", zValidator("json", updateBudgetSchema), async (c) => {
  const month = c.req.param("month");
  const body = c.req.valid("json");

  if (!/^\d{4}-\d{2}$/.test(month)) {
    return c.json({ error: "Invalid month format. Use YYYY-MM" }, 400);
  }

  const [updated] = await db
    .update(budgets)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(budgets.month, month))
    .returning();

  if (!updated) {
    return c.json({ error: "Budget not found" }, 404);
  }

  return c.json(updated);
});

// DELETE /budgets/:month - Delete budget
app.delete("/:month", async (c) => {
  const month = c.req.param("month");

  if (!/^\d{4}-\d{2}$/.test(month)) {
    return c.json({ error: "Invalid month format. Use YYYY-MM" }, 400);
  }

  const [deleted] = await db
    .delete(budgets)
    .where(eq(budgets.month, month))
    .returning();

  if (!deleted) {
    return c.json({ error: "Budget not found" }, 404);
  }

  return c.json(deleted);
});

export default app;
