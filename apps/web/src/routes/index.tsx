import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SummaryCards } from "../components/summary-cards";
import { FormPengeluaran } from "../components/form-pengeluaran";
import { RiwayatPengeluaran, Transaction } from "../components/riwayat-pengeluaran";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      amount: 16000,
      categoryTag: "Daily",
      description: "makan pagi di warteg bahari",
      date: new Date().toISOString(),
    },
    {
      id: "2",
      amount: 15000,
      categoryTag: "daily",
      description: "makan siang di warteg bahari",
      date: new Date().toISOString(),
    },
    {
      id: "3",
      amount: 175000,
      categoryTag: "fixed",
      description: "belanja bulanan di supermarket",
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "4",
      amount: 10000,
      categoryTag: "lainnya",
      description: "fotokopi tugas besar elektronika",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "5",
      amount: 10000,
      categoryTag: "lainnya",
      description: "fotokopi tugas besar elektronika",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ]);
  const [totalBudget] = useState(15000000);

  const totalExpense = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddTransaction = (data: any) => {
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount: data.jumlahRp,
      categoryTag: data.kategori,
      description: data.catatan,
      date: data.tanggal,
    };
    setTransactions([newTx, ...transactions]);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <SummaryCards totalBudget={totalBudget} totalExpense={totalExpense} />

      <FormPengeluaran onSubmit={handleAddTransaction} />

      <RiwayatPengeluaran transactions={transactions} />
    </div>
  );
}