import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@financial-tracker-sea/ui/components/card";
import { Progress } from "@financial-tracker-sea/ui/components/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@financial-tracker-sea/ui/components/select";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CalendarDays, ArrowDown, HandCoins, CircleDollarSign } from "lucide-react";
import { toast } from "sonner";
import {
  fetchTransactionSummary,
  fetchCurrentBudget,
  type TransactionSummary,
} from "../lib/api";

export const Route = createFileRoute("/visualisasiData")({
  component: VisualisasiData,
});

const PIE_COLORS = ["#10B981", "#07334C", "#0070B2", "#E2E8F0", "#F59E0B", "#8B5CF6"];

const getMonthString = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const getPreviousMonthString = (): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return getMonthString(d);
};

function VisualisasiData() {
  const [period, setPeriod] = useState("Bulan Ini");
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [budgetAmount, setBudgetAmount] = useState(0);
  const [budgetRemaining, setBudgetRemaining] = useState(0);
  const [prevMonthGrandTotal, setPrevMonthGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      const queryMonth =
        period === "Bulan Ini"
          ? getMonthString(now)
          : period === "Bulan Lalu"
            ? getPreviousMonthString()
            : undefined;

      // Load current period summary
      const summaryData = await fetchTransactionSummary(queryMonth);
      setSummary(summaryData);

      // Load budget (current month always)
      try {
        const budget = await fetchCurrentBudget();
        setBudgetAmount(budget.totalAmount);
        setBudgetRemaining(budget.remaining);
      } catch {
        // No budget set yet for this month — show 0
        setBudgetAmount(0);
        setBudgetRemaining(0);
      }

      // Load previous month for comparison
      try {
        const prevMonth = getPreviousMonthString();
        const prevSummary = await fetchTransactionSummary(prevMonth);
        setPrevMonthGrandTotal(prevSummary.grandTotal);
      } catch {
        setPrevMonthGrandTotal(0);
      }
    } catch (err: any) {
      console.error("Failed to load visualization data", err);
      setError(err?.message ?? "Gagal memuat data visualisasi");
      toast.error("Gagal memuat data visualisasi");
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Re-fetch whenever the period changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived data
  const grandTotal = summary?.grandTotal ?? 0;
  const percentageChange =
    prevMonthGrandTotal > 0
      ? Math.round(((grandTotal - prevMonthGrandTotal) / prevMonthGrandTotal) * 100)
      : 0;

  // Bar chart data
  const barData = (summary?.byCategory ?? []).map((cat) => ({
    name: cat.categoryDisplayName || cat.categoryName,
    aktual: cat.totalAmount,
    anggaran: budgetAmount / Math.max(summary?.byCategory?.length ?? 1, 1),
  }));

  // Pie chart data
  const totalForPie =
    summary?.byCategory?.reduce((acc, c) => acc + c.totalAmount, 0) ?? 0;
  const pieData = (summary?.byCategory ?? []).map((cat, i) => ({
    name: cat.categoryDisplayName || cat.categoryName,
    value: totalForPie > 0 ? Math.round((cat.totalAmount / totalForPie) * 100) : 0,
    color: cat.categoryColor || PIE_COLORS[i % PIE_COLORS.length],
  }));

  const budgetSpentPercentage =
    budgetAmount > 0
      ? Math.min(Math.round((grandTotal / budgetAmount) * 100), 100)
      : 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      {/* Period Selector */}
      <div className="flex items-center justify-end">
        <Select value={period} onValueChange={(val) => setPeriod(val ?? "Bulan Ini")}>
          <SelectTrigger className="w-[178px] h-[52px] border-2 border-[#F1F1F1] rounded-[28px] gap-2 text-[18px] text-black tracking-[0.045em] font-medium hover:bg-gray-50">
            <CalendarDays className="w-6 h-6 text-[rgba(0,0,0,0.75)]" />
            <SelectValue placeholder="Pilih Periode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bulan Ini">Bulan Ini</SelectItem>
            <SelectItem value="Bulan Lalu">Bulan Lalu</SelectItem>
            <SelectItem value="Tahun Ini">Tahun Ini</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-semibold text-red-500 mb-2">Gagal Memuat Data</p>
          <p className="text-sm text-[rgba(0,0,0,0.5)] mb-4">{error}</p>
          <button
            onClick={() => loadData()}
            className="px-6 py-2 bg-[#07334C] text-white rounded-[12px] text-sm font-medium hover:bg-[#07334C]/90"
          >
            Coba Lagi
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[140px] bg-gray-200 rounded-[18px] animate-pulse" />
          <div className="h-[140px] bg-gray-200 rounded-[18px] animate-pulse" />
          <div className="lg:col-span-2 h-[350px] bg-gray-200 rounded-[18px] animate-pulse" />
        </div>
      ) : (
        <>
          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Pengeluaran */}
            <Card className="bg-white border-2 border-[rgba(213,213,213,0.33)] rounded-[18px] shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <HandCoins className="w-6 h-6 text-[rgba(0,0,0,0.75)]" />
                  <p className="text-[16px] font-normal text-[rgba(0,0,0,0.75)] tracking-[0.04em]">
                    Total Pengeluaran
                  </p>
                </div>
                <h2 className="text-[35px] font-medium tracking-tight text-[rgba(0,0,0,0.75)]">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <ArrowDown className="w-5 h-5 text-[#09A63C]" />
                  <span className="text-[16px] font-normal text-[#09A63C] tracking-[0.04em]">
                    {percentageChange}% dari{" "}
                    {period === "Bulan Ini" ? "bulan lalu" : "periode lalu"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Sisa Anggaran */}
            <Card className="bg-white border-2 border-[rgba(213,213,213,0.33)] rounded-[18px] shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <CircleDollarSign className="w-6 h-6 text-[rgba(0,0,0,0.75)]" />
                  <p className="text-[16px] font-normal text-[rgba(0,0,0,0.75)] tracking-[0.04em]">
                    Sisa Anggaran
                  </p>
                </div>
                <h2 className="text-[35px] font-medium tracking-tight text-[rgba(0,0,0,0.75)]">
                  Rp {budgetRemaining.toLocaleString("id-ID")}
                </h2>
                <p className="text-[18px] text-[#07334C] mt-1">
                  dari Rp {budgetAmount.toLocaleString("id-ID")}
                </p>
                <Progress
                  value={budgetSpentPercentage}
                  className="h-[13px] w-full mt-3 rounded-[18px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Bottom Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
            {/* Anggaran VS Aktual */}
            <Card className="bg-white border-2 border-[rgba(213,213,213,0.33)] rounded-[18px] shadow-none flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[25px] font-semibold text-[rgba(0,0,0,0.75)] tracking-[0.05em]">
                      Anggaran VS Aktual
                    </CardTitle>
                    <p className="text-[16px] text-[rgba(0,0,0,0.75)] mt-1 tracking-[0.04em]">
                      Berdasarkan Kategori Utama
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-3.5 w-3.5 rounded-full bg-[rgba(7,51,76,0.5)]" />
                      <span className="text-[10px] text-[rgba(0,0,0,0.75)] tracking-[0.05em]">
                        aktual
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-3.5 w-3.5 rounded-full bg-[rgba(0,112,178,0.5)]" />
                      <span className="text-[10px] text-[rgba(0,0,0,0.75)] tracking-[0.05em]">
                        anggaran
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-[300px]">
                {barData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-[rgba(0,0,0,0.5)]">
                    Belum ada data pengeluaran
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      barGap={8}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E2E8F0"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748B" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val: number) => `Rp${val / 1000000}M`}
                        tick={{ fill: "#64748B" }}
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #E2E8F0",
                        }}
                        formatter={(value: any) => [
                          `Rp ${Number(value).toLocaleString("id-ID")}`,
                          "",
                        ]}
                      />
                      <Bar
                        dataKey="aktual"
                        name="Aktual"
                        fill="rgba(7,51,76,0.5)"
                        radius={[4, 4, 0, 0]}
                        barSize={27}
                      />
                      <Bar
                        dataKey="anggaran"
                        name="Anggaran"
                        fill="rgba(0,112,178,0.5)"
                        radius={[4, 4, 0, 0]}
                        barSize={27}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Distribusi */}
            <Card className="bg-white border-2 border-[rgba(213,213,213,0.33)] rounded-[18px] shadow-none flex flex-col">
              <CardHeader>
                <CardTitle className="text-[25px] font-semibold text-[rgba(0,0,0,0.75)] tracking-[0.05em]">
                  Distribusi
                </CardTitle>
                <p className="text-[16px] text-[rgba(0,0,0,0.75)] mt-1 tracking-[0.04em]">
                  Presentase Pengeluaran
                </p>
              </CardHeader>
              <CardContent className="flex-1 min-h-[300px] flex flex-col items-center justify-center gap-2">
                {pieData.length === 0 || totalForPie === 0 ? (
                  <div className="flex items-center justify-center h-full text-[rgba(0,0,0,0.5)]">
                    Belum ada data
                  </div>
                ) : (
                  <>
                    <div className="relative w-full flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-sm font-medium text-muted-foreground">Total</span>
                        <span className="text-2xl font-bold text-[#07334C]">100%</span>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 pb-2 px-2 w-full">
                      {pieData.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-1.5">
                          <span
                            className="inline-block h-3.5 w-3.5 rounded-full shrink-0"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-[10px] font-normal text-[rgba(0,0,0,0.75)] tracking-[0.05em]">
                            {entry.name} ({entry.value}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
