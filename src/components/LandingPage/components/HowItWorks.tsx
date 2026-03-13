const STEPS = [
  {
    title: "Find your range",
    description:
      "A quick vocal scan sets everything to your voice. Takes about a minute.",
  },
  {
    title: "Follow along",
    description:
      "Open the app, pick up where you left off. Each stage builds on the last.",
  },
  {
    title: "Feel the difference",
    description:
      "Not just relaxation \u2014 real progress. Better breath control, wider range, deeper body awareness. You grow every session.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="landing-section px-6 py-16 sm:py-20">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-violet-400/60 text-center mb-3 font-medium">
          Start in two minutes
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-14">
          As simple as humming along
        </h2>

        <div className="relative flex flex-col gap-16 pl-12 sm:pl-16">
          {/* Connecting line */}
          <div
            className="absolute left-[15px] sm:left-[19px] top-3 bottom-3 w-px"
            style={{
              background:
                "linear-gradient(to bottom, rgba(139,92,246,0.3), rgba(139,92,246,0.08))",
            }}
          />

          {STEPS.map((step, i) => (
            <div key={step.title} className="relative flex gap-6 sm:gap-8 items-start">
              {/* Step dot */}
              <div className="absolute left-[-48px] sm:left-[-64px] top-1 flex items-center justify-center">
                <div
                  className="w-[30px] h-[30px] sm:w-[38px] sm:h-[38px] rounded-full flex items-center justify-center text-xs sm:text-sm font-bold"
                  style={{
                    background: "rgba(139,92,246,0.12)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    color: "rgba(167,139,250,0.8)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-white/55 leading-relaxed text-base">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
