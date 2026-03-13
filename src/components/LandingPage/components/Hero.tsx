import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui";

const RING_COLORS = [
  "rgba(139,92,246,0.45)",
  "rgba(99,102,241,0.32)",
  "rgba(59,130,246,0.20)",
];

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Layered background glows */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.06) 35%, transparent 65%)",
          animation: "landing-breathe 4s ease-in-out infinite",
        }}
      />

      {/* Concentric rings */}
      {RING_COLORS.map((color, i) => (
        <div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none border"
          style={{
            width: `${280 + i * 160}px`,
            height: `${280 + i * 160}px`,
            borderColor: color,
            animation: `landing-ring-pulse ${2 + i * 0.5}s ease-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <div className="mb-12" style={{ animation: "landing-float 5s ease-in-out infinite" }}>
          <Logo layout="vertical" size="lg" />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6">
          Feel your voice
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
            in your body
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-white/60 leading-relaxed max-w-md mb-12">
          You already know how this feels.
          <br />
          We just gave it a path.
        </p>

        <Link href="/journey">
          <Button size="lg" className="px-12 text-lg glow-pulse">
            Try it now
          </Button>
        </Link>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25">
        <svg
          width="20"
          height="28"
          viewBox="0 0 20 28"
          fill="none"
          className="animate-bounce"
        >
          <rect x="1" y="1" width="18" height="26" rx="9" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="8" r="2" fill="currentColor" className="animate-pulse" />
        </svg>
      </div>
    </section>
  );
}
