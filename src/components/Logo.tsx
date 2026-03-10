const CHAKRA_SPECTRUM = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
] as const;

type LogoLayout = "horizontal" | "vertical";

type LogoProps = {
  layout?: LogoLayout;
  /** Size variant: default for header, sm for compact (e.g. menu) */
  size?: "default" | "sm";
  className?: string;
};

export default function Logo({ layout = "horizontal", size = "default", className = "" }: LogoProps) {
  const dotSize = size === "sm" ? "w-2 h-2" : "w-2.5 sm:w-3 h-2.5 sm:h-3";
  const dotGap = size === "sm" ? "gap-1" : "gap-1.5 sm:gap-2";

  const dots = (
    <span
      className={`inline-flex items-center ${dotGap} shrink-0`}
      style={{ transform: layout === "horizontal" ? "translateY(2px)" : undefined }}
    >
      {CHAKRA_SPECTRUM.map((color, i) => (
        <span
          key={i}
          className={`block ${dotSize} rounded-full opacity-80`}
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );

  if (layout === "vertical") {
    return (
      <div className={`flex flex-col items-center gap-1.5 ${className}`}>
        <span className="font-semibold tracking-tight text-white leading-none">attunr</span>
        {dots}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      <span className="font-semibold tracking-tight text-white leading-none">attunr</span>
      {dots}
    </div>
  );
}
