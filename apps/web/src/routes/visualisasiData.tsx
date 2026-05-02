import { createFileRoute } from "@tanstack/react-router";
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

export const Route = createFileRoute("/visualisasiData")({
  component: VisualisasiData,
});

const barData = [
  { name: "Daily", aktual: 4000000, anggaran: 5000000 },
  { name: "Fixed", aktual: 5000000, anggaran: 6000000 },
  { name: "Lainnya", aktual: 1500000, anggaran: 4000000 },
];

const pieData = [
  { name: "Daily", value: 30, color: "#10B981" },
  { name: "Fixed", value: 45, color: "#012B40" },
  { name: "Others", value: 25, color: "#E2E8F0" },
];

function VisualisasiData() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#012B40] dark:text-white">
            Visualisasi Data
          </h1>
          <p className="text-muted-foreground mt-1">Pantau Data Pengeluaran Secara Real Time</p>
        </div>
        <div className="w-full sm:w-48">
          <Select defaultValue="bulanIni">
            <SelectTrigger>
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bulanIni">Bulan Ini</SelectItem>
              <SelectItem value="bulanLalu">Bulan Lalu</SelectItem>
              <SelectItem value="tahunIni">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Pengeluaran</p>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Rp 10.500.000</h2>
              <span className="text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                ↓ 12% Dari Bulan Lalu
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Sisa Anggaran</p>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Rp 4.500.000</h2>
              <span className="text-sm font-semibold text-primary">70%</span>
            </div>
            <Progress value={70} className="h-2 w-full" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#012B40] dark:text-white">
              Anggaran VS Aktual
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
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
                  contentStyle={{ borderRadius: "8px", border: "1px solid #E2E8F0" }}
                  formatter={(value: any) => [`Rp ${Number(value).toLocaleString("id-ID")}`, ""]}
                />
                <Bar dataKey="aktual" name="Aktual" fill="#012B40" radius={[4, 4, 0, 0]} />
                <Bar dataKey="anggaran" name="Anggaran" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#012B40] dark:text-white">
              Distribusi
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
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
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-[#012B40] dark:text-white">100%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
