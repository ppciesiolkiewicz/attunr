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
type LogoSize = "sm" | "default" | "lg";

type LogoProps = {
  layout?: LogoLayout;
  /** Size variant: sm for compact, default for header, lg for hero/marketing */
  size?: LogoSize;
  className?: string;
};

const dotSizes: Record<LogoSize, string> = {
  sm: "w-2 h-2",
  default: "w-2.5 sm:w-3 h-2.5 sm:h-3",
  lg: "w-3.5 sm:w-4 h-3.5 sm:h-4",
};

const dotGaps: Record<LogoSize, string> = {
  sm: "gap-1",
  default: "gap-1.5 sm:gap-2",
  lg: "gap-2 sm:gap-2.5",
};

const textSizes: Record<LogoSize, string> = {
  sm: "text-base",
  default: "",
  lg: "text-2xl sm:text-3xl",
};

export default function Logo({ layout = "horizontal", size = "default", className = "" }: LogoProps) {
  const dots = (
    <span
      className={`inline-flex items-center ${dotGaps[size]} shrink-0`}
      style={{ transform: layout === "horizontal" ? "translateY(2px)" : undefined }}
    >
      {CHAKRA_SPECTRUM.map((color, i) => (
        <span
          key={i}
          className={`block ${dotSizes[size]} rounded-full opacity-80`}
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );

  if (layout === "vertical") {
    return (
      <div className={`flex flex-col items-center ${size === "lg" ? "gap-3" : "gap-1.5"} ${className}`}>
        <span className={`font-semibold tracking-tight text-white leading-none ${textSizes[size]}`}>attunr</span>
        {dots}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      <span className={`font-semibold tracking-tight text-white leading-none ${textSizes[size]}`}>attunr</span>
      {dots}
    </div>
  );
}
