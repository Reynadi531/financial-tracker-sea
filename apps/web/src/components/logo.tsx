import FtsLogo from "../assets/fts.svg";
import FtsShortLogo from "../assets/fts-short.svg";

export function Logo({ className = "", collapsed = false }: { className?: string; collapsed?: boolean }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={collapsed ? FtsShortLogo : FtsLogo}
        alt="FTS Logo"
        className={`shrink-0 transition-all duration-300 ${collapsed ? "w-[40px] h-auto" : "w-[140px] h-auto"}`}
      />
    </div>
  );
}
