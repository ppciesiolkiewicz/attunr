interface VideoProps {
  /** Compact inline style (e.g. onboarding) vs boxed card style (default) */
  variant?: "box" | "inline";
}

export function Video({
  variant = "box",
}: VideoProps) {
  if (variant === "inline") {
    return (
      <p className="text-[11px] text-white/40 italic">
        Video guide coming soon
      </p>
    );
  }

  return (
    <div
      className="rounded-xl px-5 py-8 flex flex-col items-center justify-center gap-2"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px dashed rgba(255,255,255,0.15)",
      }}
    >
      <span className="text-2xl opacity-50">▶</span>
      <p className="text-sm text-white/55 font-medium">
        Video coming soon
      </p>
    </div>
  );
}
