import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================================================
// CATEGORIES
// ============================================================================

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  colorHex: text("color_hex").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

// ============================================================================
// TRANSACTIONS
// ============================================================================

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  amount: real("amount").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  description: text("description"),
  date: text("date").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

// ============================================================================
// WISHLISTS
// ============================================================================

export const wishlists = sqliteTable("wishlists", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  targetAmount: real("target_amount").notNull(),
  currentAmount: real("current_amount").notNull().default(0),
  imageUrl: text("image_url"),
  notes: text("notes"),
  status: text("status").notNull().default("Berjalan"), // "Berjalan" | "Tercapai"
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;

// ============================================================================
// BUDGETS
// ============================================================================

export const budgets = sqliteTable("budgets", {
  id: text("id").primaryKey(),
  month: text("month").notNull(), // format: "YYYY-MM"
  totalAmount: real("total_amount").notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const categoriesRelations = relations(categories, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({}) => ({}));

export const budgetsRelations = relations(budgets, ({}) => ({}));

// ============================================================================
// SEED DATA - DEFAULT CATEGORIES
// ============================================================================

export const defaultCategories = [
  {
    id: "makanan",
    name: "makanan",
    displayName: "Makanan",
    colorHex: "#0070B2",
  },
  {
    id: "transportasi",
    name: "transportasi",
    displayName: "Transportasi",
    colorHex: "#003B99",
  },
  {
    id: "kebutuhan-harian",
    name: "kebutuhan_harian",
    displayName: "Kebutuhan Harian",
    colorHex: "#66A1FF",
  },
  {
    id: "lainnya",
    name: "lainnya",
    displayName: "Lainnya",
    colorHex: "#001D4C",
  },
];
