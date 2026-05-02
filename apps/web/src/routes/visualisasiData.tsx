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
import { CalendarDays, ArrowDown, HandCoins, CircleDollarSign } from "lucide-react";

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
  { name: "Fixed", value: 45, color: "#07334C" },
  { name: "Lainnya", value: 15, color: "#0070B2" },
  { name: "Sisa Anggaran", value: 10, color: "#E2E8F0" },
];

function VisualisasiData() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[25px] font-semibold text-[rgba(0,0,0,0.75)] tracking-[0.05em]">
            Visualisasi Data
          </h1>
          <p className="text-[16px] text-[rgba(0,0,0,0.75)] mt-1 tracking-[0.04em]">
            Pantau pola pengeluaran dan anggaran anda
          </p>
        </div>
        <Select defaultValue="Bulan Ini">
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

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Pengeluaran */}
        <Card className="bg-white border-2 border-[rgba(213,213,213,0.33)] rounded-[18px] shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <HandCoins className="w-6 h-6 text-[rgba(0,0,0,0.75)]" />
              <p className="text-[16px] font-normal text-[rgba(0,0,0,0.75)] tracking-[0.04em]">Total Pengeluaran</p>
            </div>
            <h2 className="text-[35px] font-medium tracking-tight text-[rgba(0,0,0,0.75)]">
              Rp 10.500.000
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <ArrowDown className="w-5 h-5 text-[#09A63C]" />
              <span className="text-[16px] font-normal text-[#09A63C] tracking-[0.04em]">
                12% dari bulan lalu
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Sisa Anggaran */}
        <Card className="bg-white border-2 border-[rgba(213,213,213,0.33)] rounded-[18px] shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <CircleDollarSign className="w-6 h-6 text-[rgba(0,0,0,0.75)]" />
              <p className="text-[16px] font-normal text-[rgba(0,0,0,0.75)] tracking-[0.04em]">Sisa Anggaran</p>
            </div>
            <h2 className="text-[35px] font-medium tracking-tight text-[rgba(0,0,0,0.75)]">
              Rp 4.500.000
            </h2>
            <p className="text-[18px] text-[#07334C] mt-1">dari Rp 15.000.000</p>
            <Progress value={70} className="h-[13px] w-full mt-3 rounded-[18px]" />
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
                <p className="text-[16px] text-[rgba(0,0,0,0.75)] mt-1 tracking-[0.04em]">Berdasarkan Kategori Utama</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3.5 w-3.5 rounded-full bg-[rgba(7,51,76,0.5)]" />
                  <span className="text-[10px] text-[rgba(0,0,0,0.75)] tracking-[0.05em]">anggaran</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-3.5 w-3.5 rounded-full bg-[rgba(0,112,178,0.5)]" />
                  <span className="text-[10px] text-[rgba(0,0,0,0.75)] tracking-[0.05em]">sisa</span>
                </div>
              </div>
            </div>
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
                <Bar dataKey="aktual" name="Aktual" fill="rgba(7,51,76,0.5)" radius={[4, 4, 0, 0]} barSize={27} />
                <Bar dataKey="anggaran" name="Anggaran" fill="rgba(0,112,178,0.5)" radius={[4, 4, 0, 0]} barSize={27} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribusi */}
        <Card className="bg-white border-2 border-[rgba(213,213,213,0.33)] rounded-[18px] shadow-none flex flex-col">
          <CardHeader>
            <CardTitle className="text-[25px] font-semibold text-[rgba(0,0,0,0.75)] tracking-[0.05em]">
              Distribusi
            </CardTitle>
            <p className="text-[16px] text-[rgba(0,0,0,0.75)] mt-1 tracking-[0.04em]">Presentase Pengeluaran</p>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px] flex flex-col items-center justify-center gap-2">
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
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-medium text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-[#07334C]">100%</span>
              </div>
            </div>
            {/* Legend - 2x2 grid matching Figma */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pb-2 px-2 w-full">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span className="inline-block h-3.5 w-3.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-[10px] font-normal text-[rgba(0,0,0,0.75)] tracking-[0.05em]">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}