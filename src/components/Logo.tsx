import { Text } from "@/components/ui";

const TONE_SPECTRUM = [
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
  /** Dot animation: 1 = bounce wave (up only), 2 = sine wave (up & down), 3 = both combined, 4 = unified wave (letters + dots) */
  animate?: 1 | 2 | 3 | 4;
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

const LOGO_LETTERS = ["a", "t", "t", "u", "n", "r"] as const;

export default function Logo({ layout = "horizontal", size = "default", animate, className = "" }: LogoProps) {
  const text = (
    <span className={`inline-flex font-semibold tracking-tight text-white leading-none ${textSizes[size]}`} style={{ fontFamily: "var(--font-outfit), 'Outfit', sans-serif" }}>
      {LOGO_LETTERS.map((letter, i) => (
        <span
          key={i}
          style={animate === 4 ? {
            display: "inline-block",
            animation: `logo-wave 5s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          } : animate ? {
            display: "inline-block",
            animation: `logo-bend 5s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          } : undefined}
        >
          {letter}
        </span>
      ))}
    </span>
  );

  const dots = (
    <Text
      as="span"
      variant="body-sm"
      className={`inline-flex items-center ${dotGaps[size]} shrink-0`}
      style={{ transform: layout === "horizontal" ? "translateY(2px)" : undefined }}
    >
      {TONE_SPECTRUM.map((color, i) => (
        <Text
          as="span"
          variant="body-sm"
          key={i}
          className={`block ${dotSizes[size]} rounded-full opacity-80`}
          style={{
            backgroundColor: color,
            ...((animate === 2 || animate === 3 || animate === 4) && {
              animation: `logo-wave 5s ease-in-out infinite`,
              animationDelay: animate === 4 ? `${(LOGO_LETTERS.length + i) * 0.3}s` : `${i * 0.4}s`,
            }),
          }}
        />
      ))}
    </Text>
  );

  const bounceStyle = (animate === 1 || animate === 3)
    ? { animation: "logo-bounce 5s ease-in-out infinite" } as const
    : undefined;

  if (layout === "vertical") {
    return (
      <div className={`flex flex-col items-center select-none ${size === "lg" ? "gap-3" : "gap-1.5"} ${className}`} style={bounceStyle}>
        {text}
        {dots}
      </div>
    );
  }

  return (
    <div className={`flex items-center select-none gap-2 sm:gap-3 ${className}`} style={bounceStyle}>
      {text}
      {dots}
    </div>
  );
}
