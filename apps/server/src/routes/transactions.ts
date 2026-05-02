import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { db } from "@financial-tracker-sea/db";
import { transactions, categories } from "@financial-tracker-sea/db/schema";
import { Hono } from "hono";

const app = new Hono();

// Validation schemas
const createTransactionSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string().min(1),
  description: z.string().optional(),
  date: z.string().datetime().or(z.string()),
});

const updateTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  categoryId: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  date: z.string().datetime().or(z.string()).optional(),
});

// GET /transactions - List all transactions with category info
app.get("/", async (c) => {
  const page = Number(c.req.query("page") ?? 1);
  const limit = Number(c.req.query("limit") ?? 10);
  const categoryId = c.req.query("categoryId");
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");

  const offset = (page - 1) * limit;

  let whereClause: any = undefined;
  const conditions = [];

  if (categoryId) {
    conditions.push(eq(transactions.categoryId, categoryId));
  }
  if (startDate) {
    conditions.push(gte(transactions.date, startDate));
  }
  if (endDate) {
    conditions.push(lte(transactions.date, endDate));
  }
  if (conditions.length > 0) {
    whereClause = and(...conditions);
  }

  const rows = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      category: {
        id: categories.id,
        name: categories.name,
        displayName: categories.displayName,
        colorHex: categories.colorHex,
      },
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(whereClause)
    .orderBy(desc(transactions.date))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(whereClause);

  const count = countResult[0]?.count ?? 0;

  return c.json({
    data: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
});

// GET /transactions/summary - Get spending summary
app.get("/summary", async (c) => {
  const month = c.req.query("month"); // format: YYYY-MM

  const whereClause = month
    ? gte(transactions.date, `${month}-01`)
    : undefined;

  const result = await db
    .select({
      categoryId: transactions.categoryId,
      categoryName: categories.name,
      categoryDisplayName: categories.displayName,
      categoryColor: categories.colorHex,
      totalAmount: sql<number>`sum(${transactions.amount})`,
      count: sql<number>`count(*)`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(whereClause)
    .groupBy(transactions.categoryId, categories.name, categories.displayName, categories.colorHex);

  const totalResult = await db
    .select({ total: sql<number>`coalesce(sum(${transactions.amount}), 0)` })
    .from(transactions)
    .where(whereClause);

  const grandTotal = totalResult[0]?.total ?? 0;
  return c.json({
    byCategory: result,
    grandTotal,
  });
});

// GET /transactions/:id - Get a transaction by id
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  const [row] = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      description: transactions.description,
      date: transactions.date,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      category: {
        id: categories.id,
        name: categories.name,
        displayName: categories.displayName,
        colorHex: categories.colorHex,
      },
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(eq(transactions.id, id));

  if (!row) {
    return c.json({ error: "Transaction not found" }, 404);
  }

  return c.json(row);
});

// POST /transactions - Create a transaction
app.post("/", zValidator("json", createTransactionSchema), async (c) => {
  const body = c.req.valid("json");
  const id = crypto.randomUUID();

  // Verify category exists
  const [cat] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, body.categoryId));

  if (!cat) {
    return c.json({ error: "Category not found" }, 400);
  }

  const [created] = await db
    .insert(transactions)
    .values({
      id,
      amount: body.amount,
      categoryId: body.categoryId,
      description: body.description,
      date: body.date,
    })
    .returning();

  return c.json({
    ...created,
    category: cat,
  }, 201);
});

// PUT /transactions/:id - Update a transaction
app.put("/:id", zValidator("json", updateTransactionSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  if (body.categoryId) {
    const [cat] = await db.select().from(categories).where(eq(categories.id, body.categoryId));
    if (!cat) {
      return c.json({ error: "Category not found" }, 400);
    }
  }

  const [updated] = await db
    .update(transactions)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(transactions.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Transaction not found" }, 404);
  }

  const [cat] = await db.select().from(categories).where(eq(categories.id, updated.categoryId));

  return c.json({
    ...updated,
    category: cat,
  });
});

// DELETE /transactions/:id - Delete a transaction
app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(transactions)
    .where(eq(transactions.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Transaction not found" }, 404);
  }

  return c.json(deleted);
});

export default app;
