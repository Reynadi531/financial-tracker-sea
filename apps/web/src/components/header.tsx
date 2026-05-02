import { PanelLeft } from "lucide-react";

export default function Header() {
  return (
    <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-[#d5d5d5]/50 bg-white shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-[38px] rounded-[5px] bg-[rgba(213,213,213,0.33)] border border-[#d7d7d7] border-[0.2px]">
          <PanelLeft className="w-5 h-5 text-foreground/75" />
        </div>
        <h1 className="text-xl md:text-[25px] font-semibold text-[rgba(0,0,0,0.75)] tracking-[0.025em]">
          Dashboard Utama
        </h1>

        {/* Divider */}
        <div className="hidden md:block w-px h-[44px] bg-border mx-2" />

        <p className="hidden md:block text-sm text-[rgba(117,117,117,0.46)] font-normal">
          Lacak kemana uang mu pergi
        </p>
      </div>
    </div>
  );
}