import { PanelLeft } from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
  subtitle?: string;
}

export default function Header({ onToggleSidebar, title, subtitle }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-[#d5d5d5]/50 bg-white shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="flex items-center justify-center w-9 h-[38px] rounded-[5px] bg-[rgba(213,213,213,0.33)] border border-[#d7d7d7] border-[0.2px] hover:bg-[rgba(213,213,213,0.5)] transition-colors">
          <PanelLeft className="w-5 h-5 text-foreground/75" />
        </button>
        <h1 className="text-xl md:text-[25px] font-semibold text-[rgba(0,0,0,0.75)] tracking-[0.025em]">
          {title}
        </h1>

        {subtitle && (
          <>
            {/* Divider */}
            <div className="hidden md:block w-px h-[44px] bg-border mx-2" />
            <p className="hidden md:block text-sm text-[rgba(117,117,117,0.46)] font-normal">
              {subtitle}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
