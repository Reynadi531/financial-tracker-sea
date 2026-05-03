import { History, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { ApiTransaction } from "../lib/api";

interface RiwayatPengeluaranProps {
  transactions: ApiTransaction[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function RiwayatPengeluaran({
  transactions,
  loading = false,
  pagination,
  onPageChange,
  onPageSizeChange,
}: RiwayatPengeluaranProps) {
  const getVisiblePages = () => {
    if (!pagination) return [];
    const { page, totalPages } = pagination;
    const pages: (number | "...")[] = [];
    const delta = 1;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  return (
    <div className="bg-white border-2 border-[#F1F1F1] rounded-[18px] p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-[rgba(0,0,0,0.75)]" />
        <h2 className="text-[18px] font-semibold text-[rgba(0,0,0,0.75)] tracking-[0.045em]">
          Riwayat Pengeluaran
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2 py-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
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
            const colorHex = tx.category?.colorHex ?? "#001D4C";
            return (
              <div
                key={tx.id}
                className="grid grid-cols-[1fr_auto_2.5fr_auto] gap-x-4 py-3 border-b border-[#F1F1F1] last:border-b-0 items-center text-[14px] tracking-[0.04em]"
              >
                <span className="font-medium text-[rgba(194,28,28,0.75)]">
                  -Rp {tx.amount.toLocaleString("id-ID")}
                </span>
                <span className="capitalize" style={{ color: colorHex }}>
                  {tx.category?.displayName ?? tx.category?.name ?? "-"}
                </span>
                <span className="text-[rgba(0,0,0,0.75)] truncate">
                  &ldquo;{tx.description || "-"}&rdquo;
                </span>
                <span className="text-[rgba(0,0,0,0.75)] tracking-[0.064em]">
                  {new Date(tx.date).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 0 && (
        <div className="flex items-center justify-between mt-4 pt-2">
          <div className="flex items-center gap-2 text-[12px] text-[rgba(0,0,0,0.75)]">
            <span>tampilkan</span>
            <select
              value={pagination.limit}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="border border-[rgba(0,0,0,0.3)] rounded-[6px] px-2 py-1 text-[12px]"
            >
              {[5, 10, 20].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span>perhalaman</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="w-[25px] h-[27px] border border-[rgba(0,0,0,0.3)] rounded-[6px] flex items-center justify-center disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {getVisiblePages().map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="text-[rgba(0,0,0,0.75)] text-[12px] px-1">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  className={`w-[25px] h-[27px] rounded-[6px] flex items-center justify-center text-[12px] font-medium ${
                    p === pagination.page
                      ? "bg-[#07334C] text-white"
                      : "border border-[rgba(0,0,0,0.3)] text-[rgba(0,0,0,0.75)]"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="w-[25px] h-[27px] border border-[rgba(0,0,0,0.3)] rounded-[6px] flex items-center justify-center disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
