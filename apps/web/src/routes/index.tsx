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
      amount: 15000,
      categoryTag: "Makanan",
      description: "Makan siang ayam geprek",
      date: new Date().toISOString(),
    },
    {
      id: "2",
      amount: 50000,
      categoryTag: "Transportasi",
      description: "Bensin motor",
      date: new Date(Date.now() - 86400000).toISOString(),
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
        <div className="lg:col-span-1">
          <FormPengeluaran onSubmit={handleAddTransaction} />
        </div>
        <div className="lg:col-span-2">
          <RiwayatPengeluaran transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
