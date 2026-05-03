import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
import { Plus, ImagePlus, ListChecks } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  fetchWishlists,
  fetchWishlistStats,
  createWishlist,
  type ApiWishlist,
  type WishlistStats,
} from "../lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/daftarImpian")({
  component: DaftarImpianLayout,
});

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

function DaftarImpianLayout() {
  const location = useLocation();
  const isDetailPage = location.pathname !== "/daftarImpian" && location.pathname.startsWith("/daftarImpian/");

  if (isDetailPage) {
    return <Outlet />;
  }

  return <DaftarImpian />;
}

function DaftarImpian() {
  const [wishlists, setWishlists] = useState<ApiWishlist[]>([]);
  const [stats, setStats] = useState<WishlistStats>({
    totalTarget: 0,
    totalCurrent: 0,
    totalCollected: 0,
    count: 0,
    overallProgress: 0,
    budgetRemaining: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Semua");

  // Form state
  const [formName, setFormName] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [wishlistData, statsData] = await Promise.all([
        fetchWishlists(),
        fetchWishlistStats(),
      ]);
      setWishlists(wishlistData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load wishlist data", err);
      toast.error("Gagal memuat data impian");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle file to base64 for image preview (store as data URL)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setFormImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreateWishlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await createWishlist({
        name: formName,
        targetAmount: Number(formTarget),
        imageUrl: formImage,
        notes: formNotes || undefined,
      });
      toast.success("Impian berhasil ditambahkan!");
      setFormName("");
      setFormTarget("");
      setFormNotes("");
      setFormImage(null);
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan impian");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredList =
    activeTab === "Semua"
      ? wishlists
      : wishlists.filter((item) => item.status === activeTab);

  return (
    <div className="flex flex-col gap-8 w-full mx-auto pb-10 bg-[#fbfbfb] min-h-screen">
      <div className="px-8 max-w-[1200px]">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[204px] bg-gray-200 rounded-[10px] animate-pulse" />
            <div className="h-[204px] bg-gray-200 rounded-[10px] animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Overview Card */}
            <Card className="lg:col-span-2 bg-[#001d4c] text-white border-none shadow-[0px_0px_10px_0px_rgba(0,29,76,0.3)] overflow-hidden rounded-[10px] h-[204px]">
              <CardContent className="p-6 px-10 h-full flex items-center justify-between">
                <div className="flex flex-col h-full justify-center">
                  <p className="text-[18px] font-medium text-[#7eaffe] uppercase mb-4 tracking-wider">
                    WISHLIST OVERVIEW
                  </p>
                  <h2 className="text-[32px] font-extrabold mb-4">
                    {formatRupiah(stats.totalTarget)}
                  </h2>
                  <div className="text-[18px] font-medium text-[#7eaffe] leading-snug">
                    <p>Total Terkumpul dari Target</p>
                    <p>{formatRupiah(stats.totalCollected)}</p>
                  </div>
                  {stats.budgetRemaining > 0 && (
                    <div className="mt-2 text-[14px] font-medium text-[#7eaffe]/70 leading-snug">
                      <p>
                        Termasuk Budget Tersisa{" "}
                        <span className="text-white font-bold">
                          {formatRupiah(stats.budgetRemaining)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-[rgba(0,69,179,0.2)] rounded-[10px] w-[209px] h-[174px] flex flex-col items-center justify-center text-center -mr-2">
                  <p className="text-[14px] font-bold text-white mb-2">TOTAL KESELURUHAN</p>
                  <div className="relative w-[99px] h-[99px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { value: Math.min(stats.overallProgress, 100) },
                            { value: Math.max(100 - Math.min(stats.overallProgress, 100), 0) },
                          ]}
                          innerRadius={38}
                          outerRadius={50}
                          dataKey="value"
                          stroke="none"
                          startAngle={90}
                          endAngle={-270}
                        >
                          <Cell fill={stats.overallProgress >= 100 ? "#10B981" : "#10B981"} />
                          <Cell fill="#0070b2" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[21.12px] font-extrabold">
                        {Math.min(stats.overallProgress, 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-[11.75px] font-medium text-[#6a90cd] mt-2">
                    {stats.overallProgress >= 100
                      ? "Impian Tercapai! 🎉"
                      : "Tingkatkan TabunganMu!"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Card */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger
                render={
                  <Card className="border-[0.5px] border-[rgba(213,197,213,0.33)] bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)] hover:bg-gray-50 cursor-pointer transition-colors group flex items-center justify-center h-[204px] rounded-[10px]">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                      <div className="w-[76px] h-[76px] rounded-full bg-[#0045b3] flex items-center justify-center mb-1">
                        <ListChecks className="text-white w-8 h-8" />
                      </div>
                      <p className="font-medium text-black text-[13.88px]">Buat Impian Baru</p>
                      <div className="text-[12px] text-[#757575] font-normal leading-tight">
                        <p>Tetapkan target</p>
                        <p>dan mulai menabung</p>
                      </div>
                    </CardContent>
                  </Card>
                }
              />
              <DialogContent className="sm:max-w-[480px] p-6 sm:p-8 !rounded-[24px]">
                <DialogHeader className="mb-2">
                  <DialogTitle className="text-2xl font-bold text-[#001d4c]">
                    Buat Impian Baru
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateWishlist} className="grid gap-6">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-[16px] cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors">
                      {formImage ? (
                        <img
                          src={formImage}
                          alt="Preview"
                          className="h-full w-full object-cover rounded-[16px]"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <ImagePlus className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="text-sm text-gray-500 font-medium">
                            Upload gambar impian (Maks 5MB)
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nama" className="text-[#001d4c] font-semibold">
                        Nama Impian
                      </Label>
                      <Input
                        id="nama"
                        placeholder="Contoh: Macbook Pro M5 Max"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                        className="h-12 rounded-[12px] border-gray-200 focus-visible:ring-[#10B981]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target" className="text-[#001d4c] font-semibold">
                        Target Harga (Rp)
                      </Label>
                      <Input
                        id="target"
                        type="number"
                        placeholder="60000000"
                        value={formTarget}
                        onChange={(e) => setFormTarget(e.target.value)}
                        required
                        className="h-12 rounded-[12px] border-gray-200 focus-visible:ring-[#10B981]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="catatan" className="text-[#001d4c] font-semibold">
                        Catatan Tambahan (Opsional)
                      </Label>
                      <Textarea
                        id="catatan"
                        placeholder="Warna Space Black, RAM 16GB..."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                        className="resize-none min-h-[100px] rounded-[12px] border-gray-200 focus-visible:ring-[#10B981]"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-12 mt-4 bg-[#001d4c] hover:bg-[#001d4c]/90 text-white rounded-[12px] font-bold text-[16px] shadow-md"
                    >
                      <Plus className="w-5 h-5 mr-2 stroke-[3]" />{" "}
                      {submitting ? "Menambahkan..." : "Tambahkan Impian"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="mt-10">
          <Tabs defaultValue="Semua" onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent space-x-6 border-none w-full justify-start rounded-none p-0 h-auto mb-8">
              {["Semua", "Berjalan", "Tercapai"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="data-[state=active]:bg-[#001d4c] data-[state=active]:text-white data-[state=active]:border-[#001d4c] bg-white border border-[#001d4c] text-[#001d4c] rounded-[16px] px-8 py-1.5 text-[14px] font-semibold transition-colors"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[297px] bg-gray-200 rounded-[15px] animate-pulse"
                  />
                ))}
              </div>
            ) : filteredList.length === 0 ? (
              <div className="text-center py-16 text-[rgba(0,0,0,0.5)]">
                <p className="text-lg">Belum ada impian yang ditambahkan.</p>
                <p className="text-sm mt-2">Klik "Buat Impian Baru" untuk memulai!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredList.map((item) => {
                  const pct = Math.min(
                    Math.round((item.currentAmount / item.targetAmount) * 100),
                    100,
                  );
                  return (
                    <Link
                      key={item.id}
                      to="/daftarImpian/$wishlistId"
                      params={{ wishlistId: item.id }}
                      className="block"
                    >
                    <Card className="overflow-hidden bg-white border-[#d5d5d5] border-[0.5px] shadow-none flex flex-col rounded-[15px] h-[297px] hover:shadow-md hover:border-[#0070b2] transition-all cursor-pointer">
                      <div className="h-[168px] overflow-hidden relative">
                        <img
                          src={
                            item.imageUrl ||
                            "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&q=80"
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0.05)] to-[rgba(0,0,0,0.5)] opacity-80" />
                      </div>
                      <CardContent className="p-5 flex-1 flex flex-col justify-between">
                        <h3 className="font-semibold text-[14px] text-black line-clamp-1">
                          {item.name}
                        </h3>

                        <div className="flex justify-between items-end mt-2">
                          <div className="flex flex-col">
                            <p className="text-[12px] text-[#757575] font-medium mb-1">Terkumpul</p>
                            <p className="font-bold text-[#0070b2] text-[12px]">
                              {formatRupiah(item.currentAmount)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <p className="text-[12px] text-[#757575] font-medium mb-1">Target</p>
                            <p className="font-bold text-black text-[12px]">
                              {formatRupiah(item.targetAmount)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1 mt-4">
                          <div className="[&_[data-slot=progress-indicator]]:bg-[#0070b2] [&_[data-slot=progress-track]]:bg-[#d9d9d9]">
                            <Progress value={pct} className="h-[9px] rounded-[10px]" />
                          </div>
                          <p className="text-[10px] font-medium text-left text-[#757575] mt-1">
                            {pct}% tercapai
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
