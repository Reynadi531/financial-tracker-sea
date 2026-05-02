export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width="220"
        height="48"
        viewBox="0 0 220 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Stylized "FTS" text working as an icon background */}
        <text
          x="0"
          y="34"
          fill="#012B40"
          className="dark:fill-white"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 800,
            fontSize: "32px",
            letterSpacing: "-2px",
          }}
        >
          FTS
        </text>

        {/* Green Upward Arrow traversing the text */}
        <path d="M 2,34 L 54,8" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
        <path
          d="M 44,5 L 56,6 L 54,18"
          stroke="#10B981"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Top Text: Financial */}
        <text
          x="72"
          y="20"
          fill="#012B40"
          className="dark:fill-white"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px" }}
        >
          Financial
        </text>

        {/* Bottom Text: Tracker SEA */}
        <text
          x="72"
          y="40"
          fill="#012B40"
          className="dark:fill-white"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "15px" }}
        >
          Tracker <tspan fill="#10B981">SEA</tspan>
        </text>
      </svg>
    </div>
  );
}
