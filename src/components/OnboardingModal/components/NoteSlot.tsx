"use client";

import { hzToNoteName } from "@/constants/chakras";

export interface NoteSlotProps {
  variant: "low" | "high";
  mode: "detecting" | "detected";
  valueHz: number | null;
  progress?: number;
  currentNote?: string | null;
  currentHz?: number | null;
  onClick?: () => void;
}

export function NoteSlot({
  variant,
  mode,
  valueHz,
  progress = 0,
  currentNote,
  currentHz,
  onClick,
}: NoteSlotProps) {
  const isLow = variant === "low";
  const color = isLow ? "#ef8b5a" : "#818cf8";
  const bgColor = isLow ? "rgba(239,139,90,0.12)" : "rgba(129,140,248,0.12)";
  const borderColor = isLow ? "rgba(239,139,90,0.5)" : "rgba(129,140,248,0.5)";
  const label = isLow ? "Low" : "High";

  const baseStyle = {
    backgroundColor: bgColor,
    borderColor,
    borderWidth: 2,
    borderStyle: "solid" as const,
  };

  if (mode === "detecting") {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="relative shrink-0">
          <svg
            width={80}
            height={80}
            viewBox="0 0 80 80"
            className="block"
          >
            <circle
              cx={40}
              cy={40}
              r={34}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={4}
            />
            <circle
              cx={40}
              cy={40}
              r={34}
              fill="none"
              stroke={color}
              strokeWidth={4}
              strokeDasharray={`${2 * Math.PI * 34 * progress} ${2 * Math.PI * 34}`}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              style={{ transition: "stroke-dasharray 0.15s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span
              className="text-xl font-light tabular-nums"
              style={{
                color: currentNote
                  ? "rgba(255,255,255,0.92)"
                  : "rgba(255,255,255,0.25)",
              }}
            >
              {currentNote ?? "—"}
            </span>
            <span
              className="text-xs tabular-nums"
              style={{
                color: currentNote
                  ? "rgba(255,255,255,0.4)"
                  : "rgba(255,255,255,0.15)",
              }}
            >
              {currentHz ? `${Math.round(currentHz)} Hz` : "— Hz"}
            </span>
          </div>
        </div>
        <span className="text-xs text-white/48">{label}</span>
      </div>
    );
  }

  const isPlaceholder = valueHz === null;
  const squareStyle = isPlaceholder
    ? {
        ...baseStyle,
        borderStyle: "dashed" as const,
        backgroundColor: isLow ? "rgba(239,139,90,0.06)" : "rgba(129,140,248,0.06)",
        borderColor: isLow ? "rgba(239,139,90,0.3)" : "rgba(129,140,248,0.3)",
      }
    : baseStyle;

  const content = (
    <div
      className="rounded-xl flex flex-col items-center justify-center px-5 py-3 min-w-[72px]"
      style={squareStyle}
    >
      <span className="text-lg font-semibold" style={{ color: isPlaceholder ? "rgba(255,255,255,0.35)" : color }}>
        {valueHz ? hzToNoteName(valueHz) : "…"}
      </span>
      <span className="text-xs text-white/48 mt-0.5">
        {valueHz ? `${valueHz} Hz` : ""} · {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-1.5">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="rounded-xl flex flex-col items-center justify-center px-5 py-3 min-w-[72px] cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
          style={squareStyle}
        >
          <span className="text-lg font-semibold" style={{ color: isPlaceholder ? "rgba(255,255,255,0.35)" : color }}>
            {valueHz ? hzToNoteName(valueHz) : "…"}
          </span>
          <span className="text-xs text-white/48 mt-0.5">
            {valueHz ? `${valueHz} Hz` : ""} · {label}
          </span>
        </button>
      ) : (
        content
      )}
    </div>
  );
}
