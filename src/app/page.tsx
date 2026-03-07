import ChakraTrainer from "@/components/ChakraTrainer";

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-white">
            attunr
          </h1>
          <span className="text-xs text-white/30 font-normal">
            chakra frequencies
          </span>
        </div>

        {/* Dot indicator — decorative chakra spectrum */}
        <div className="flex items-center gap-1.5">
          {[
            "#ef4444", "#f97316", "#eab308",
            "#22c55e", "#3b82f6", "#6366f1", "#a855f7",
          ].map((color, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full opacity-60"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-h-0">
        <ChakraTrainer />
      </main>
    </div>
  );
}
