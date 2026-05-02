import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@financial-tracker-sea/db";
import { categories } from "@financial-tracker-sea/db/schema";
import { defaultCategories } from "@financial-tracker-sea/db/schema";
import type { NewCategory } from "@financial-tracker-sea/db/schema";
import { Hono } from "hono";

const app = new Hono();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  displayName: z.string().min(1).optional(),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

// GET /categories - List all categories
app.get("/", async (c) => {
  const all = await db.select().from(categories).orderBy(categories.name);
  return c.json(all);
});

// POST /categories - Create a category
app.post("/", zValidator("json", createCategorySchema), async (c) => {
  const body = c.req.valid("json");
  const id = crypto.randomUUID();

  const [cat] = await db
    .insert(categories)
    .values({ id, ...body })
    .returning();

  return c.json(cat, 201);
});

// POST /categories/seed - Seed default categories
app.post("/seed", async (c) => {
  const existing = await db.select().from(categories).limit(1);
  if (existing.length > 0) {
    return c.json({ message: "Categories already seeded" }, 200);
  }

  const seeds: NewCategory[] = defaultCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    displayName: cat.displayName,
    colorHex: cat.colorHex,
  }));

  await db.insert(categories).values(seeds);
  const all = await db.select().from(categories);

  return c.json(all, 201);
});

// GET /categories/:id - Get a category by id
app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id));

  if (!category) {
    return c.json({ error: "Category not found" }, 404);
  }

  return c.json(category);
});

// PUT /categories/:id - Update a category
app.put("/:id", zValidator("json", updateCategorySchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const [updated] = await db
    .update(categories)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(eq(categories.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Category not found" }, 404);
  }

  return c.json(updated);
});

// DELETE /categories/:id - Delete a category
app.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();

  if (!deleted) {
    return c.json({ error: "Category not found" }, 404);
  }

  return c.json(deleted);
});

export default app;
