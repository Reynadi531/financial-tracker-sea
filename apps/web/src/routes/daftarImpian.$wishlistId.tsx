import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@financial-tracker-sea/ui/components/card";
import { Progress } from "@financial-tracker-sea/ui/components/progress";
import { Button } from "@financial-tracker-sea/ui/components/button";
import { Input } from "@financial-tracker-sea/ui/components/input";
import { PlusCircle, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import {
  fetchWishlists,
  fetchCurrentBudget,
  fetchWishlistHistory,
  contributeWishlist,
  type ApiWishlist,
  type HistoryEntry,
} from "../lib/api";

export const Route = createFileRoute("/daftarImpian/$wishlistId")({
  component: WishlistDetail,
});

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const QUICK_AMOUNTS = [500000, 100000, 75000, 50000];

function WishlistDetail() {
  const { wishlistId } = Route.useParams();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState<ApiWishlist | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [budgetAmount, setBudgetAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [contributing, setContributing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allWishlists, historyData] = await Promise.all([
        fetchWishlists(),
        fetchWishlistHistory(wishlistId),
      ]);
      const found = allWishlists.find((w) => w.id === wishlistId) ?? null;
      setWishlist(found);
      setHistory(historyData);

      // Fetch current budget for terkumpul value
      try {
        const budget = await fetchCurrentBudget();
        setBudgetAmount(budget.totalAmount);
      } catch {
        // No budget yet — fallback to 0
        setBudgetAmount(0);
      }
    } catch (err) {
      console.error("Failed to load wishlist detail", err);
      toast.error("Gagal memuat data impian");
    } finally {
      setLoading(false);
    }
  }, [wishlistId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleContribute = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Masukkan jumlah tabungan yang valid");
      return;
    }
    setContributing(true);
    try {
      await contributeWishlist(wishlistId, value);
      toast.success(
        `Berhasil menambahkan tabungan ${formatRupiah(value)} ke impian & budget!`,
      );
      setAmount("");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan tabungan");
    } finally {
      setContributing(false);
    }
  };

  const handleQuickContribute = async (value: number) => {
    setContributing(true);
    try {
      await contributeWishlist(wishlistId, value);
      toast.success(
        `Berhasil menambahkan tabungan ${formatRupiah(value)} ke impian & budget!`,
      );
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan tabungan");
    } finally {
      setContributing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-6">
        <div className="flex-1 h-[689px] bg-gray-200 rounded-[18px] animate-pulse" />
        <div className="w-[187px] h-[314px] bg-gray-200 rounded-[18px] animate-pulse" />
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-xl font-semibold text-[rgba(0,0,0,0.75)] mb-4">
          Impian tidak ditemukan
        </p>
        <Button
          onClick={() => navigate({ to: "/daftarImpian" })}
          className="bg-[#07334c] hover:bg-[#07334c]/90 text-white rounded-[12px] px-6"
        >
          Kembali ke Daftar Impian
        </Button>
      </div>
    );
  }

  // Progress: terkumpul is the budget balance (affected by both tabungan and pengeluaran)
  const terkumpul = budgetAmount || 0;
  const pct = wishlist.targetAmount > 0
    ? Math.min(Math.round((terkumpul / wishlist.targetAmount) * 100), 100)
    : 0;
  const isCompleted = wishlist.status === "Tercapai";

  return (
    <div className="flex gap-6 items-start">
      {/* Main Detail Card */}
      <Card className="flex-1 bg-white border-2 border-[rgba(213,213,213,0.33)] shadow-none rounded-[18px] overflow-hidden">
        <CardContent className="p-0">
          {/* Top Section: Image + Info side-by-side */}
          <div className="flex items-start gap-0 mx-6 mt-6">
            {/* Image */}
            <div className="w-[221px] h-[212px] rounded-[18px] overflow-hidden flex-shrink-0">
              <img
                src={
                  wishlist.imageUrl ||
                  "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&q=80"
                }
                alt={wishlist.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info beside image */}
            <div className="flex-1 pl-0 px-6">
              <h2 className="text-[22px] font-semibold text-[rgba(0,0,0,0.75)] tracking-[1.1px] capitalize mb-0.5">
                {wishlist.name}
              </h2>
              <p className="text-[18px] font-normal text-[rgba(0,0,0,0.75)] tracking-[0.9px] capitalize mb-1">
                nabung untuk
              </p>
              {wishlist.notes && (
                <p className="text-[15px] font-normal text-[rgba(0,0,0,0.75)] tracking-[0.75px] line-clamp-3 mb-4">
                  &ldquo;{wishlist.notes}&rdquo;
                </p>
              )}
            </div>
          </div>

          {/* Contribution Input — full width, below image+info */}
          <div className="mx-6 mt-6 mb-0">
            <p className="text-[18px] font-normal text-[rgba(0,0,0,0.75)] tracking-[0.9px] mb-1">
              tambah tabungan
            </p>
            <Input
              type="number"
              placeholder="Masukkan jumlah tabungan (Rp)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isCompleted}
              className="w-full h-12 rounded-[12px] border-gray-200 text-[16px] text-[rgba(0,0,0,0.5)] focus-visible:ring-[#07334c]"
            />
            {amount && Number(amount) > 0 && (
              <p className="text-[14px] text-[rgba(0,0,0,0.5)] mt-1">
                = {formatRupiah(Number(amount))}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-[#d9d9d9] mt-4" />

          {/* Quick Add Chips */}
          <div className="px-6 py-4 flex items-center gap-3 flex-wrap">
            <p className="text-[16px] font-normal text-black whitespace-nowrap">
              tambah cepat :
            </p>
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                disabled={isCompleted || contributing}
                onClick={() => handleQuickContribute(val)}
                className="bg-[#07334c] text-white text-[16px] font-normal rounded-[12px] px-4 py-1 whitespace-nowrap hover:bg-[#07334c]/85 transition-colors disabled:opacity-50"
              >
                Rp {val.toLocaleString("id-ID")}
              </button>
            ))}
          </div>

          {/* Progress Section — terkumpul based on budget */}
          <div className="px-6 pb-4">
            <p className="text-[16px] font-normal text-black mb-1">
              terkumpul :{" "}
              <span className="font-semibold">
                {formatRupiah(terkumpul)}
              </span>
              /{formatRupiah(wishlist.targetAmount)}
            </p>
            <div className="relative">
              <div className="[&_[data-slot=progress-indicator]]:bg-[#07334c] [&_[data-slot=progress-track]]:bg-[#d9d9d9]">
                <Progress value={pct} className="h-[19px] rounded-[18px]" />
              </div>
              {pct > 0 && (
                <span
                  className="absolute top-1/2 -translate-y-1/2 text-[16px] font-medium text-white"
                  style={{
                    left: `calc(${Math.min(pct, 95)}% - 32px)`,
                  }}
                >
                  {pct}%
                </span>
              )}
            </div>
          </div>

          {/* Contribute Button */}
          <div className="px-6 pb-6">
            <Button
              onClick={handleContribute}
              disabled={isCompleted || contributing || !amount || Number(amount) <= 0}
              className="w-full h-[47px] bg-[#07334c] hover:bg-[#07334c]/90 text-white rounded-[32px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] font-semibold text-[20px] disabled:opacity-50"
            >
              <PlusCircle className="w-6 h-6 mr-2" />
              {contributing ? "Menyimpan..." : "tambah tabungan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Riwayat (History) Sidebar — shows both tabungan & pengeluaran */}
      <Card className="w-[187px] bg-white border-2 border-[rgba(213,213,213,0.33)] shadow-none rounded-[18px] flex-shrink-0">
        <CardContent className="p-4">
          <h3 className="text-[20px] font-semibold text-[rgba(0,0,0,0.75)] tracking-[1px] text-center mb-4 capitalize">
            riwayat
          </h3>

          {history.length === 0 ? (
            <p className="text-[10px] text-[#404040] text-center">
              Belum ada riwayat
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {history.slice(0, 5).map((entry) => (
                <div key={entry.id} className="relative">
                  {/* Date */}
                  <p className="text-[10px] font-light text-[#404040] tracking-[0.5px] text-center">
                    {formatDate(entry.date)}
                  </p>
                  {/* Amount with icon */}
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {entry.type === "contribution" ? (
                      <ArrowDown className="w-[14px] h-[14px] text-green-600" />
                    ) : (
                      <ArrowUp className="w-[14px] h-[14px] text-red-500" />
                    )}
                    <p className={`text-[10px] font-semibold tracking-[0.5px] ${
                      entry.type === "contribution" ? "text-green-700" : "text-red-600"
                    }`}>
                      {entry.type === "contribution" ? "+" : "-"}
                      {formatRupiah(entry.amount)}
                    </p>
                  </div>
                  {/* Label */}
                  <p className="text-[10px] font-semibold text-[#404040] tracking-[0.5px] text-center mt-1 truncate">
                    {entry.type === "contribution"
                      ? `\u201C${entry.label}\u201D`
                      : entry.label}
                  </p>
                  {/* Divider line */}
                  <div className="border-t border-[#d9d9d9] mt-2" />
                </div>
              ))}

              {/* View all link */}
              {history.length > 5 && (
                <p className="text-[10px] font-light text-black tracking-[0.5px] text-center underline decoration-solid cursor-pointer">
                  view all
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}