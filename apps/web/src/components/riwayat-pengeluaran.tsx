import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@financial-tracker-sea/ui/components/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@financial-tracker-sea/ui/components/table";

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

export function RiwayatPengeluaran({ transactions }: RiwayatPengeluaranProps) {
  // Utility for tag colors based on category
  const getTagColor = (category: string) => {
    switch (category) {
      case "Makanan":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "Transportasi":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "Kebutuhan Harian":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <Card className="h-full border-border shadow-sm flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Riwayat Pengeluaran</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="font-semibold px-6 py-3">Jumlah</TableHead>
              <TableHead className="font-semibold px-6">Kategori</TableHead>
              <TableHead className="font-semibold px-6 hidden sm:table-cell">Catatan</TableHead>
              <TableHead className="font-semibold px-6 text-right">Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Belum ada pengeluaran.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id} className="border-b border-border">
                  <TableCell className="px-6 py-4 font-medium text-destructive">
                    -Rp {tx.amount.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTagColor(
                        tx.categoryTag,
                      )}`}
                    >
                      {tx.categoryTag}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground hidden sm:table-cell">
                    {tx.description || "-"}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
