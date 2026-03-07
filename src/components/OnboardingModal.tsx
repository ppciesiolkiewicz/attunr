"use client";

interface OnboardingModalProps {
  onBegin: () => void;
}

const CHAKRA_COLORS = [
  "#ef4444", // Root
  "#f97316", // Sacral
  "#eab308", // Solar Plexus
  "#22c55e", // Heart
  "#3b82f6", // Throat
  "#6366f1", // Third Eye
  "#a855f7", // Crown
];

const CHAKRA_NAMES = [
  "Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown",
];

export default function OnboardingModal({ onBegin }: OnboardingModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(5, 5, 12, 0.88)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="fade-in w-full max-w-sm rounded-2xl flex flex-col items-center gap-6 px-8 py-10 text-center"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.025) 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Chakra spectrum */}
        <div className="flex items-center gap-2.5">
          {CHAKRA_COLORS.map((color, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 10,
                height: 10,
                backgroundColor: color,
                boxShadow: `0 0 8px ${color}88`,
              }}
            />
          ))}
        </div>

        {/* Wordmark */}
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            attunr
          </h1>
          <p className="mt-1.5 text-sm text-white/40 font-normal">
            chakra frequency trainer
          </p>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-white/70">
            Sing in tune with the seven sacred Solfeggio frequencies — 
            and watch your voice find its place in real time.
          </p>

          {/* Chakra list */}
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 py-1">
            {CHAKRA_NAMES.map((name, i) => (
              <span
                key={name}
                className="text-xs font-medium"
                style={{ color: CHAKRA_COLORS[i] + "cc" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={onBegin}
            className="w-full py-3.5 rounded-xl font-medium text-sm text-white transition-all active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              boxShadow: "0 0 24px rgba(124,58,237,0.35), 0 2px 8px rgba(0,0,0,0.4)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 36px rgba(124,58,237,0.55), 0 2px 8px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 24px rgba(124,58,237,0.35), 0 2px 8px rgba(0,0,0,0.4)";
            }}
          >
            Allow microphone &amp; begin
          </button>

          <p className="text-[11px] text-white/25 leading-relaxed px-2">
            Your microphone is used only for real-time pitch detection.
            Nothing is recorded or stored.
          </p>
        </div>
      </div>
    </div>
  );
}
