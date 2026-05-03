import { useState, useEffect } from "react";
import { Label } from "@financial-tracker-sea/ui/components/label";
import { Input } from "@financial-tracker-sea/ui/components/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@financial-tracker-sea/ui/components/select";
import { CalendarDays, LogOut } from "lucide-react";
import { toast } from "sonner";
import { fetchCategories, type ApiCategory } from "../lib/api";

export interface FormPengeluaranData {
  jumlahRp: number;
  tanggal: string;
  kategoriId: string;
  catatan: string;
}

export function FormPengeluaran({
  onSubmit,
}: {
  onSubmit?: (data: FormPengeluaranData) => Promise<void>;
}) {
  const [jumlahRp, setJumlahRp] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [catatan, setCatatan] = useState("");
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => toast.error("Gagal memuat kategori"));
  }, []);

  const resetForm = () => {
    setJumlahRp("");
    setTanggal("");
    setKategoriId("");
    setCatatan("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit || submitting) return;

    // Validate
    if (!jumlahRp || Number(jumlahRp) <= 0) {
      toast.error("Jumlah harus diisi dengan angka positif");
      return;
    }
    if (!tanggal) {
      toast.error("Tanggal harus diisi");
      return;
    }
    if (!kategoriId) {
      toast.error("Kategori harus dipilih");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        jumlahRp: Number(jumlahRp),
        tanggal,
        kategoriId,
        catatan,
      });
      resetForm();
    } catch {
      // Error already shown by parent (handleAddTransaction)
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#F1F1F1] rounded-[18px] p-6">
      <div className="flex items-center gap-2 mb-5">
        <LogOut className="w-5 h-5 text-[rgba(0,0,0,0.75)]" />
        <h2 className="text-[20px] font-semibold text-[rgba(0,0,0,0.75)] tracking-[0.9px]">
          Form Pengeluaran
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Jumlah */}
          <div className="space-y-1.5">
            <Label className="!text-[18px] font-normal text-[rgba(0,0,0,0.75)] tracking-[0.9px]">
              Jumlah (Rp)
            </Label>
            <Input
              type="number"
              placeholder="0"
              value={jumlahRp}
              onChange={(e) => setJumlahRp(e.target.value)}
              required
              className="!h-[41px] !rounded-[13px] !border-[rgba(0,0,0,0.75)] !bg-white !text-[16px] !text-[rgba(0,0,0,0.5)] !tracking-[0.8px] !placeholder:text-[rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Tanggal */}
          <div className="space-y-1.5">
            <Label className="!text-[18px] font-normal text-[rgba(0,0,0,0.75)] tracking-[0.9px]">
              Tanggal
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="!h-[41px] !rounded-[13px] !border-[rgba(0,0,0,0.75)] !bg-white !text-[16px] !text-[rgba(0,0,0,0.5)] !tracking-[0.8px] !placeholder:text-[rgba(0,0,0,0.5)] pr-10"
              />
              <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgba(0,0,0,0.5)] pointer-events-none" />
            </div>
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
            <Label className="!text-[18px] font-normal text-[rgba(0,0,0,0.75)] tracking-[0.9px]">
              Kategori
            </Label>
            <Select value={kategoriId} onValueChange={(val) => setKategoriId(val || "")}>
              <SelectTrigger className="!h-[41px] !w-full !rounded-[13px] !border-[rgba(0,0,0,0.75)] !bg-white !text-[16px] !text-[rgba(0,0,0,0.5)] !tracking-[0.8px] !py-0 !px-3">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent className="!rounded-[13px] !border-[rgba(0,0,0,0.75)] !bg-white !text-[16px]">
                {categories.map((cat) => (
                  <SelectItem
                    key={cat.id}
                    value={cat.id}
                    className="!rounded-[8px] !text-[16px] !tracking-[0.8px] !py-2.5"
                  >
                    {cat.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Catatan */}
          <div className="space-y-1.5">
            <Label className="!text-[18px] font-normal text-[rgba(0,0,0,0.75)] tracking-[0.9px]">
              Catatan
            </Label>
            <Input
              placeholder="makan siang, bensin, dll"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="!h-[41px] !rounded-[13px] !border-[rgba(0,0,0,0.75)] !bg-white !text-[16px] !text-[rgba(0,0,0,0.5)] !tracking-[0.8px] !placeholder:text-[rgba(0,0,0,0.5)]"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full max-w-[332px] h-[47px] bg-[#07334C] hover:bg-[#07334C]/90 text-white text-[20px] font-semibold tracking-[0.9px] rounded-[32px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] transition-colors disabled:opacity-60"
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
