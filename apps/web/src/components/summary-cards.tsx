import { Card, CardContent } from "@financial-tracker-sea/ui/components/card";
import { Progress } from "@financial-tracker-sea/ui/components/progress";
import { Plus, HandCoins } from "lucide-react";

interface SummaryCardsProps {
  totalBudget: number;
  totalExpense: number;
}

export function SummaryCards({ totalBudget, totalExpense }: SummaryCardsProps) {
  const percentage = Math.min((totalExpense / totalBudget) * 100, 100) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Total Budget Card */}
      <Card className="bg-[#07334C] text-white border-none shadow-md rounded-[18px]">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <HandCoins className="w-5 h-5 text-white/80" />
            <p className="text-base font-semibold text-white/80 tracking-[0.05em]">
              Total Budget
            </p>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-[32px] font-bold tracking-[0.05em] text-white leading-tight">
              Rp {totalBudget.toLocaleString("id-ID")}
            </h2>
            <button className="w-[34px] h-[34px] rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Pengeluaran vs Budget Card */}
      <Card className="bg-white border-2 border-[#F1F1F1] rounded-[18px] shadow-none">
        <CardContent className="p-6">
          <p className="text-base font-semibold text-[rgba(0,0,0,0.75)] tracking-[0.05em] mb-1">
            Pengeluaran vs Budget
          </p>
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