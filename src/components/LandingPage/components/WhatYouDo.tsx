const PRACTICES = [
  { label: "Voice", color: "#a855f7" },
  { label: "Body", color: "#3b82f6" },
  { label: "Breathwork", color: "#22c55e" },
  { label: "Rhythm", color: "#f97316" },
] as const;

const TONE_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#6366f1", "#a855f7",
];

export function WhatYouDo() {
  return (
    <section className="landing-section relative px-6 py-16 sm:py-20 overflow-hidden">
      {/* Subtle background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.04), transparent)",
        }}
      />

      <div className="relative max-w-2xl mx-auto text-center">
        {/* Spectrum line */}
        <div className="flex justify-center gap-1 mb-12">
          {TONE_COLORS.map((color) => (
            <div
              key={color}
              className="w-8 sm:w-10 h-0.5 rounded-full"
              style={{ backgroundColor: color, opacity: 0.5 }}
            />
          ))}
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          Not singing lessons.
        </h2>
        <p className="text-xl sm:text-2xl text-white/40 mb-8">
          A body practice that uses sound.
        </p>
        <p className="text-white/55 leading-relaxed max-w-md mx-auto mb-14">
          The pitch visualizer isn&apos;t a score &mdash; it&apos;s a mirror.
          You watch your voice move in real time so you can feel where it
          lands in your body.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {PRACTICES.map((p) => (
            <span
              key={p.label}
              className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-medium text-white/75 border transition-colors hover:bg-white/[0.04]"
              style={{
                borderColor: `${p.color}25`,
                background: `${p.color}08`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: p.color,
                  boxShadow: `0 0 8px ${p.color}60`,
                }}
              />
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
