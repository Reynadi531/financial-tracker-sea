import { env } from "@financial-tracker-sea/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { runMigrations } from "@financial-tracker-sea/db";

import categories from "./routes/categories";
import transactions from "./routes/transactions";
import wishlists from "./routes/wishlists";
import budgets from "./routes/budgets";

// Run migrations on startup
await runMigrations();
console.log("Migrations complete.");

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Health check
app.get("/", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount API routes
app.route("/categories", categories);
app.route("/transactions", transactions);
app.route("/wishlists", wishlists);
app.route("/budgets", budgets);

// Error handling
app.notFound((c) => c.json({ error: "Not Found" }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error", message: err.message }, 500);
});

export default app;
