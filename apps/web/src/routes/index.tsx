import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { SummaryCards } from "../components/summary-cards";
import { FormPengeluaran } from "../components/form-pengeluaran";
import { RiwayatPengeluaran } from "../components/riwayat-pengeluaran";
import {
  fetchTransactions,
  fetchCurrentBudget,
  createBudget,
  createTransaction,
  type ApiTransaction,
} from "../lib/api";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  });
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loadingTx, setLoadingTx] = useState(true);
  const [loadingBudget, setLoadingBudget] = useState(true);

  const loadTransactions = useCallback(async (page: number, limit: number) => {
    setLoadingTx(true);
    try {
      const res = await fetchTransactions({ page, limit });
      setTransactions(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to load transactions", err);
      toast.error("Gagal memuat data transaksi");
    } finally {
      setLoadingTx(false);
    }
  }, []);

  const loadBudget = useCallback(async () => {
    setLoadingBudget(true);
    try {
      const budget = await fetchCurrentBudget();
      setTotalBudget(budget.totalAmount);
      setTotalExpense(budget.totalExpense);
    } catch {
      // No budget set yet for this month — show zeros until user sets one
      setTotalBudget(0);
      setTotalExpense(0);
    } finally {
      setLoadingBudget(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions(pagination.page, pagination.limit);
    loadBudget();
  }, []);

  const handleAddTransaction = useCallback(
    async (data: {
      jumlahRp: number;
      tanggal: string;
      kategoriId: string;
      catatan: string;
    }) => {
      try {
        await createTransaction({
          amount: data.jumlahRp,
          categoryId: data.kategoriId,
          description: data.catatan || undefined,
          date: data.tanggal,
        });
        toast.success("Transaksi berhasil disimpan");

        // Await both reloads so state is updated before the form clears
        await Promise.all([
          loadTransactions(1, pagination.limit),
          loadBudget(),
        ]);
      } catch (err: any) {
        console.error("Failed to save transaction", err);
        toast.error(err.message || "Gagal menyimpan transaksi");
        throw err; // Re-throw so the form knows submission failed
      }
    },
    [pagination.limit, loadTransactions, loadBudget],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      loadTransactions(page, pagination.limit);
    },
    [pagination.limit, loadTransactions],
  );

  const handlePageSizeChange = useCallback(
    (limit: number) => {
      loadTransactions(1, limit);
    },
    [loadTransactions],
  );

  const handleSetBudget = useCallback(
    async (amount: number) => {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      await createBudget({ month: currentMonth, totalAmount: amount });
      await loadBudget();
    },
    [loadBudget],
  );

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <SummaryCards
        totalBudget={totalBudget}
        totalExpense={totalExpense}
        onSetBudget={handleSetBudget}
      />

      <FormPengeluaran onSubmit={handleAddTransaction} />

      <RiwayatPengeluaran
        transactions={transactions}
        loading={loadingTx}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}