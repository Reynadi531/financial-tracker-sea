import { Card, CardContent } from "@financial-tracker-sea/ui/components/card";
import { Progress } from "@financial-tracker-sea/ui/components/progress";
import { Plus } from "lucide-react";
import { Button } from "@financial-tracker-sea/ui/components/button";

interface SummaryCardsProps {
  totalBudget: number;
  totalExpense: number;
}

export function SummaryCards({ totalBudget, totalExpense }: SummaryCardsProps) {
  const percentage = Math.min((totalExpense / totalBudget) * 100, 100) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Total Budget Card */}
      <Card className="bg-[#012B40] text-white border-none shadow-md">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-100/80 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                💼
              </span>{" "}
              Total Budget
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              Rp {totalBudget.toLocaleString("id-ID")}
            </h2>
          </div>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-xl bg-white text-[#012B40] hover:bg-gray-100 h-10 w-10 shadow-sm"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Expense vs Budget Card */}
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Expense vs Budget</p>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Rp {totalExpense.toLocaleString("id-ID")}
            </h2>
            <span className="text-sm font-semibold text-primary">{percentage.toFixed(1)}%</span>
          </div>
          <Progress value={percentage} className="h-2 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
