import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, PieChart, Target } from "lucide-react";
import { Logo } from "./logo";

export default function Sidebar({
  className = "",
  collapsed = false,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  const location = useLocation();

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/visualisasiData", label: "Visualisasi Data", icon: PieChart },
    { to: "/daftarImpian", label: "Daftar Impian", icon: Target },
  ];

  return (
    <div className={`flex flex-col h-full bg-[#fafafa] transition-all duration-300 ${collapsed ? "w-[108px]" : "w-[287px]"} ${className}`}>
      <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} p-6 pb-8`}>
        <Logo collapsed={collapsed} />
      </div>

      <nav className="flex-1 px-6 flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-[15px] transition-colors font-medium text-sm
                ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground/75 hover:bg-accent hover:text-foreground"
                }
                ${collapsed ? "justify-center" : ""}
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}

        <div className={`mt-8 pt-4 border-t border-sidebar-border ${collapsed ? "flex justify-center" : ""}`}>
          <button className={`flex items-center justify-center gap-2 bg-[#07334C] hover:bg-[#07334C]/90 text-white px-4 py-3 rounded-[32px] font-semibold text-sm transition-colors shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)] ${collapsed ? "w-12 h-12 rounded-full p-0" : "w-full"}`}>
            <span className="text-lg">+</span>
            {!collapsed && <span>Tambah Pengeluaran</span>}
          </button>
        </div>
      </nav>
    </div>
  );
}