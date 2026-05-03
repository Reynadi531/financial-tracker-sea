import { useState } from "react";
import { Card, CardContent } from "@financial-tracker-sea/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@financial-tracker-sea/ui/components/dialog";
import { Button } from "@financial-tracker-sea/ui/components/button";
import { Input } from "@financial-tracker-sea/ui/components/input";
import { Label } from "@financial-tracker-sea/ui/components/label";
import { Plus, HandCoins, Wallet } from "lucide-react";

interface SummaryCardsProps {
  totalBudget: number;
  totalExpense: number;
  onSetBudget?: (amount: number) => Promise<void>;
}

export function SummaryCards({ totalBudget, totalExpense, onSetBudget }: SummaryCardsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [saving, setSaving] = useState(false);

  // totalBudget is the remaining saldo (budget minus expenses)
  // Show expense vs budget progress
  const percentage = totalBudget > 0 ? Math.min((totalExpense / totalBudget) * 100, 100) || 0 : 0;

  const handleSaveBudget = async () => {
    const amount = Number(budgetInput);
    if (!amount || amount <= 0) return;
    if (!onSetBudget) return;
    setSaving(true);
    try {
      await onSetBudget(amount);
      setBudgetInput("");
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sisa Budget Card (remaining balance after expenses) */}
      <Card className="bg-[#07334C] text-white border-none shadow-md rounded-[18px]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-white/80" />
            <p className="text-base font-semibold text-white/80 tracking-[0.05em]">
              Sisa Budget
            </p>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-[32px] font-bold tracking-[0.05em] text-white leading-tight">
              Rp {totalBudget.toLocaleString("id-ID")}
            </h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                render={
                  <button
                    type="button"
                    className="w-[34px] h-[34px] rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                }
              />
              <DialogContent className="sm:max-w-[400px] p-6 !rounded-[20px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-[#001d4c]">
                    Atur Budget Bulanan
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="budget-amount" className="text-[#001d4c] font-semibold">
                      Jumlah Budget (Rp)
                    </Label>
                    <Input
                      id="budget-amount"
                      type="number"
                      placeholder="15000000"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="h-12 rounded-[12px] border-gray-200"
                    />
                  </div>
                  <Button
                    onClick={handleSaveBudget}
                    disabled={saving || !budgetInput || Number(budgetInput) <= 0}
                    className="w-full h-12 bg-[#07334C] hover:bg-[#07334C]/90 text-white rounded-[12px] font-semibold"
                  >
                    {saving ? "Menyimpan..." : "Simpan Budget"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Pengeluaran vs Budget Card */}
      <Card className="bg-white border-2 border-[#F1F1F1] rounded-[18px] shadow-none">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-1">
            <HandCoins className="w-5 h-5 text-[rgba(0,0,0,0.5)]" />
            <p className="text-base font-semibold text-[rgba(0,0,0,0.75)] tracking-[0.05em]">
              Pengeluaran vs Budget
            </p>
          </div>
          <h2 className="text-[32px] font-medium text-[rgba(0,0,0,0.75)] tracking-[0.025em] mb-1">
            Rp {totalExpense.toLocaleString("id-ID")}
          </h2>
          <p className="text-[15px] text-[rgba(0,0,0,0.75)] mb-4">
            dari Rp {totalBudget.toLocaleString("id-ID")}
          </p>
          <div className="w-full bg-[#D9D9D9] rounded-full h-[19px] overflow-hidden">
            <div
              className="bg-[#07334C] h-full rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}