export default function Header() {
  return (
    <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-border bg-sidebar shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-[#012B40] dark:text-white">
          Dashboard Utama
        </h1>

        {/* Divider + text */}
        <div className="hidden md:flex items-center gap-4 text-muted-foreground">
          <span>|</span>
          <span>Lacak Kemana Uang Mu Pergi</span>
        </div>
      </div>
    </div>
  );
}
