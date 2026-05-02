import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@financial-tracker-sea/ui/components/card";
import { Progress } from "@financial-tracker-sea/ui/components/progress";
import { Tabs, TabsList, TabsTrigger } from "@financial-tracker-sea/ui/components/tabs";
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
import { Textarea } from "@financial-tracker-sea/ui/components/textarea";
import { Plus, ImagePlus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/daftarImpian")({
  component: DaftarImpian,
});

const mockWishlist = [
  {
    id: 1,
    name: "Macbook Pro",
    target: 20000000,
    current: 5000000,
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    status: "Berjalan",
  },
  {
    id: 2,
    name: "Liburan Jepang",
    target: 15000000,
    current: 15000000,
    img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80",
    status: "Tercapai",
  },
];

function DaftarImpian() {
  const [activeTab, setActiveTab] = useState("Semua");

  const totalTarget = 35000000;
  const totalCollected = 20000000;
  const overallProgress = Math.round((totalCollected / totalTarget) * 100);

  const filteredList =
    activeTab === "Semua" ? mockWishlist : mockWishlist.filter((item) => item.status === activeTab);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#012B40] dark:text-white">
            Daftar Impian
          </h1>
          <p className="text-muted-foreground mt-1">Daftar barang dan tujuan tabunganmu.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overview Card */}
        <Card className="md:col-span-2 bg-[#012B40] text-white border-none shadow-md overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between h-full">
            <div className="z-10">
              <p className="text-sm font-medium text-blue-100/80 mb-2">Total Terkumpul / Target</p>
              <h2 className="text-3xl font-bold tracking-tight mb-1">Rp 20.000.000</h2>
              <p className="text-sm font-medium text-blue-200">dari Rp 35.000.000</p>
            </div>

            <div className="w-24 h-24 relative hidden sm:block">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: overallProgress }, { value: 100 - overallProgress }]}
                    innerRadius={30}
                    outerRadius={40}
                    dataKey="value"
                    stroke="none"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#FFFFFF" fillOpacity={0.2} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{overallProgress}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Card */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="border-2 border-dashed border-border hover:bg-secondary/50 cursor-pointer transition-colors group flex items-center justify-center h-full min-h-[120px]">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <p className="font-semibold text-foreground">Buat Impian Baru</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Buat Impian Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImagePlus className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload gambar (Maks 5MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/png, image/jpeg" />
                </label>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Impian</Label>
                  <Input id="nama" placeholder="Contoh: Beli Tiket Konser" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target Harga (Rp)</Label>
                  <Input id="target" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catatan">Catatan Tambahan (Opsional)</Label>
                  <Textarea
                    id="catatan"
                    placeholder="Detail spesifikasi..."
                    className="resize-none"
                  />
                </div>
                <Button className="w-full mt-2 bg-[#012B40] hover:bg-[#012B40]/90 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Tambahkan Impian
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="Semua" onValueChange={setActiveTab} className="mt-4">
        <TabsList className="bg-transparent space-x-2 border-b border-border w-full justify-start rounded-none p-0 h-auto">
          {["Semua", "Berjalan", "Tercapai"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-4 py-2 font-medium"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredList.map((item) => {
            const pct = Math.min(Math.round((item.current / item.target) * 100), 100);
            return (
              <Card
                key={item.id}
                className="overflow-hidden border-border shadow-sm flex flex-col group"
              >
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {item.status === "Tercapai" && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      TERCAPAI
                    </div>
                  )}
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.name}</h3>
                  <div className="flex justify-between items-end mb-4 flex-1">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Terkumpul</p>
                      <p className="font-bold text-primary">
                        Rp {(item.current / 1000000).toFixed(1)}M
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Target</p>
                      <p className="font-semibold text-foreground">
                        Rp {(item.target / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-auto">
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs font-semibold text-right text-muted-foreground">
                      {pct}% Tercapai
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Tabs>
    </div>
  );
}
