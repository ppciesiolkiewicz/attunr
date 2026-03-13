const FEATURES = [
  {
    color: "#a855f7",
    glow: "rgba(168,85,247,0.15)",
    title: "Calm arrives fast",
    description:
      "A single sustained tone activates your vagus nerve. Within seconds, your breathing slows and your body settles.",
  },
  {
    color: "#6366f1",
    glow: "rgba(99,102,241,0.15)",
    title: "Breathing finds its rhythm",
    description:
      "Your voice gives your breath something to do. Slow exhales happen naturally, without forcing anything.",
  },
  {
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.15)",
    title: "You feel it in your body",
    description:
      "Low tones land in your chest. High tones light up your skull. The vibration is the practice.",
  },
  {
    color: "#22c55e",
    glow: "rgba(34,197,94,0.15)",
    title: "You actually get better",
    description:
      "This isn\u2019t background noise. Each stage builds real skill \u2014 breath control, vocal range, body awareness \u2014 that you carry with you.",
  },
] as const;

export function Features() {
  return (
    <section className="landing-section px-6 py-16 sm:py-20">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-violet-400/60 text-center mb-3 font-medium">
          What happens when you hum
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-14">
          The reset your body already knows
        </h2>

        <div className="grid sm:grid-cols-2 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border border-white/[0.06] p-7 sm:p-8 transition-all duration-300 hover:border-white/[0.12] hover:translate-y-[-2px]"
              style={{ background: "rgba(255,255,255,0.015)" }}
            >
              {/* Colored accent line */}
              <div
                className="absolute top-0 left-8 right-8 h-px"
                style={{
                  background: `linear-gradient(90deg, transparent, ${f.color}40, transparent)`,
                }}
              />

              {/* Glow dot */}
              <div
                className="w-10 h-10 rounded-full mb-5 flex items-center justify-center"
                style={{ background: f.glow }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: f.color }}
                />
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/55 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
