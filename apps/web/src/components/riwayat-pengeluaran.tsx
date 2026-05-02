import { History, ChevronDown, ChevronLeft, ChevronRight, LogOut } from "lucide-react";

export interface Transaction {
  id: string;
  amount: number;
  categoryTag: string;
  description: string;
  date: string;
}

interface RiwayatPengeluaranProps {
  transactions: Transaction[];
}

const categoryColors: Record<string, string> = {
  Makanan: "text-[#0070B2]",
  Transportasi: "text-[#003B99]",
  "Kebutuhan Harian": "text-[#66A1FF]",
  Lainnya: "text-[#001D4C]",
  Daily: "text-[#0070B2]",
  daily: "text-[#003B99]",
  fixed: "text-[#66A1FF]",
  lainnya: "text-[#001D4C]",
};

export function RiwayatPengeluaran({ transactions }: RiwayatPengeluaranProps) {
  return (
    <div className="bg-white border-2 border-[#F1F1F1] rounded-[18px] p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-[rgba(0,0,0,0.75)]" />
        <h2 className="text-[18px] font-semibold text-[rgba(0,0,0,0.75)] tracking-[0.045em]">
          Riwayat Pengeluaran
        </h2>
      </div>

      {transactions.length === 0 ? (
        <p className="text-center py-8 text-[rgba(0,0,0,0.5)] text-sm">
          Belum ada pengeluaran.
        </p>
      ) : (
        <div className="flex flex-col">
          {/* Header Row */}
          <div className="grid grid-cols-[1fr_auto_2.5fr_auto] gap-x-4 pb-3 border-b border-[#F1F1F1] text-[14px] font-semibold text-[rgba(0,0,0,0.5)] tracking-[0.04em]">
            <span>Jumlah</span>
            <span>Kategori</span>
            <span>Catatan</span>
            <span>Tanggal</span>
          </div>

          {/* Data Rows */}
          {transactions.map((tx) => {
            const catColor = categoryColors[tx.categoryTag] || "text-[#001D4C]";
            return (
              <div
                key={tx.id}
                className="grid grid-cols-[1fr_auto_2.5fr_auto] gap-x-4 py-3 border-b border-[#F1F1F1] last:border-b-0 items-center text-[14px] tracking-[0.04em]"
              >
                <span className="font-medium text-[rgba(194,28,28,0.75)]">
                  -Rp {tx.amount.toLocaleString("id-ID")}
                </span>
                <span className={`capitalize ${catColor}`}>
                  {tx.categoryTag}
                </span>
                <span className="text-[rgba(0,0,0,0.75)] truncate">
                  &ldquo;{tx.description || "-"}&rdquo;
                </span>
                <span className="text-[rgba(0,0,0,0.75)] tracking-[0.064em]">
                  {new Date(tx.date).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  }).replace(/\//g, "/")}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-2">
        <div className="flex items-center gap-2 text-[12px] text-[rgba(0,0,0,0.75)]">
          <span>tampilkan</span>
          <div className="border border-[rgba(0,0,0,0.3)] rounded-[6px] px-2 py-1 flex items-center gap-1">
            5
            <ChevronDown className="w-3 h-3" />
          </div>
          <span>perhalaman</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-[25px] h-[27px] border border-[rgba(0,0,0,0.3)] rounded-[6px] flex items-center justify-center text-white text-[12px]">
            ‹
          </button>
          <button className="w-[25px] h-[27px] bg-[#07334C] rounded-[6px] flex items-center justify-center text-white text-[12px] font-medium">
            1
          </button>
          <button className="w-[25px] h-[27px] border border-[rgba(0,0,0,0.3)] rounded-[6px] flex items-center justify-center text-[rgba(0,0,0,0.75)] text-[12px]">
            2
          </button>
          <button className="w-[25px] h-[27px] border border-[rgba(0,0,0,0.3)] rounded-[6px] flex items-center justify-center text-[rgba(0,0,0,0.75)] text-[12px]">
            3
          </button>
          <span className="text-[rgba(0,0,0,0.75)] text-[12px]">...</span>
          <button className="w-[25px] h-[27px] border border-[rgba(0,0,0,0.3)] rounded-[6px] flex items-center justify-center text-[rgba(0,0,0,0.75)] text-[12px]">
            5
          </button>
          <button className="w-[25px] h-[27px] border border-[rgba(0,0,0,0.3)] rounded-[6px] flex items-center justify-center text-white text-[12px]">
            ›
          </button>
        </div>
      </div>
    </div>
  );
}