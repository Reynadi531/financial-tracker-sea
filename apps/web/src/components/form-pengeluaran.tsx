import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@financial-tracker-sea/ui/components/card";
import { Label } from "@financial-tracker-sea/ui/components/label";
import { Input } from "@financial-tracker-sea/ui/components/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@financial-tracker-sea/ui/components/select";
import { Button } from "@financial-tracker-sea/ui/components/button";

export function FormPengeluaran({ onSubmit }: { onSubmit?: (data: any) => void }) {
  const [jumlahRp, setJumlahRp] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [kategori, setKategori] = useState("");
  const [catatan, setCatatan] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        jumlahRp: Number(jumlahRp),
        tanggal,
        kategori,
        catatan,
      });
      // reset form
      setJumlahRp("");
      setTanggal("");
      setKategori("");
      setCatatan("");
    }
  };

  return (
    <Card className="h-full border-border shadow-sm flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Form Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jumlahRp">Jumlah (Rp)</Label>
              <Input
                id="jumlahRp"
                type="number"
                placeholder="0"
                value={jumlahRp}
                onChange={(e) => setJumlahRp(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select value={kategori} onValueChange={(val) => setKategori(val || "")} required>
                <SelectTrigger id="kategori">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Makanan">Makanan</SelectItem>
                  <SelectItem value="Transportasi">Transportasi</SelectItem>
                  <SelectItem value="Kebutuhan Harian">Kebutuhan Harian</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan</Label>
              <Input
                id="catatan"
                placeholder="Deskripsi pengeluaran..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-auto pt-4 flex justify-end">
            <Button
              type="submit"
              className="w-full md:w-auto px-8 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Simpan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
