import { env } from "@financial-tracker-sea/env/web";

const BASE_URL = env.VITE_SERVER_URL;

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `API error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// --- Types ---

export interface ApiCategory {
  id: string;
  name: string;
  displayName: string;
  colorHex: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTransaction {
  id: string;
  amount: number;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    displayName: string;
    colorHex: string;
  } | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransactionSummary {
  byCategory: {
    categoryId: string;
    categoryName: string;
    categoryDisplayName: string;
    categoryColor: string;
    totalAmount: number;
    count: number;
  }[];
  grandTotal: number;
}

export interface ApiWishlist {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl: string | null;
  notes: string | null;
  status: "Berjalan" | "Tercapai";
  createdAt: string;
  updatedAt: string;
}

export interface WishlistStats {
  totalTarget: number;
  totalCurrent: number;
  totalCollected: number;
  count: number;
  overallProgress: number;
  budgetRemaining: number;
}

export interface ApiContribution {
  id: string;
  wishlistId: string;
  amount: number;
  note: string | null;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  type: "contribution" | "expense";
  amount: number;
  label: string;
  date: string;
  createdAt: string;
}

export interface CurrentBudget {
  id: string;
  month: string;
  totalAmount: number;
  totalExpense: number;
  remaining: number;
  grossBudget: number;
  spentPercentage: number;
  createdAt: string;
  updatedAt: string;
}

// --- API functions ---

// Categories
export function fetchCategories() {
  return request<ApiCategory[]>("/categories");
}

// Transactions
export function fetchTransactions(params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.categoryId) searchParams.set("categoryId", params.categoryId);
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);
  const qs = searchParams.toString();
  return request<PaginatedResponse<ApiTransaction>>(`/transactions${qs ? `?${qs}` : ""}`);
}

export function fetchTransactionSummary(month?: string) {
  const qs = month ? `?month=${month}` : "";
  return request<TransactionSummary>(`/transactions/summary${qs}`);
}

export function createTransaction(data: {
  amount: number;
  categoryId: string;
  description?: string;
  date: string;
}) {
  return request<ApiTransaction & { category: ApiCategory }>("/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Budgets
export function fetchCurrentBudget() {
  return request<CurrentBudget>("/budgets/current");
}

export function createBudget(data: { month: string; totalAmount: number }) {
  return request<CurrentBudget>("/budgets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Wishlists
export function fetchWishlists(status?: string) {
  const qs = status ? `?status=${status}` : "";
  return request<ApiWishlist[]>(`/wishlists${qs}`);
}

export function fetchWishlistStats() {
  return request<WishlistStats>("/wishlists/stats");
}

export function createWishlist(data: {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  imageUrl?: string | null;
  notes?: string | null;
  status?: "Berjalan" | "Tercapai";
}) {
  return request<ApiWishlist>("/wishlists", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function contributeWishlist(id: string, amount: number) {
  return request<ApiWishlist>(`/wishlists/${id}/contribute`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export function fetchWishlistContributions(wishlistId: string) {
  return request<ApiContribution[]>(`/wishlists/${wishlistId}/contributions`);
}

export function fetchWishlistHistory(wishlistId: string) {
  return request<HistoryEntry[]>(`/wishlists/${wishlistId}/history`);
}
