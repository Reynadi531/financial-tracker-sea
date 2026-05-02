import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, PieChart, Target } from "lucide-react";
import { Logo } from "./logo";
import { ModeToggle } from "./mode-toggle";

export default function Sidebar({ className = "" }: { className?: string }) {
  const location = useLocation();

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/visualisasiData", label: "Visualisasi Data", icon: PieChart },
    { to: "/daftarImpian", label: "Daftar Impian", icon: Target },
  ];

  return (
    <div className={`flex flex-col h-full bg-sidebar ${className}`}>
      <div className="flex items-center gap-2 p-6 pb-8">
        <Logo />
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm
                ${
                  isActive
                    ? "bg-[#012B40] text-white"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}

        <div className="mt-8 pt-4 border-t border-sidebar-border">
          <button className="w-full flex items-center justify-center gap-2 bg-[#012B40] hover:bg-[#012B40]/90 text-white px-4 py-3 rounded-xl font-medium text-sm transition-colors shadow-sm">
            <span>+</span> Tambah Pengeluaran
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border mt-auto">
        <ModeToggle />
      </div>
    </div>
  );
}
