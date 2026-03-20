"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui";
import { LandingHeader } from "../../components/LandingHeader";

const FEATURE_COLORS = ["#7c3aed", "#3b82f6", "#22c55e", "#f97316"];

const FEATURES = [
  { title: "It just feels good", body: "A long hum, a melody in the shower \u2014 your body relaxes. You\u2019ve always known this. attunr just gives it a path.", color: FEATURE_COLORS[0] },
  { title: "Breathing finds its rhythm", body: "Your voice gives your breath something to do. Slow exhales happen naturally, without forcing anything.", color: FEATURE_COLORS[1] },
  { title: "You feel it in your body", body: "Low tones land in your chest. High tones light up your skull. The vibration is the practice.", color: FEATURE_COLORS[2] },
  { title: "It deepens every time", body: "This isn\u2019t background noise. Each stage opens something new \u2014 something you carry with you.", color: FEATURE_COLORS[3] },
] as const;

const STEPS = [
  { title: "Find your range", body: "A quick vocal scan tunes everything to your voice. Takes about a minute." },
  { title: "Follow the path", body: "Voice. Breath. Rhythm. Each stage builds on the last. Open the app and pick up where you left off." },
  { title: "Feel the difference", body: "Not just relaxation. Something shifts in how you carry yourself. You\u2019ll notice." },
] as const;

const TAGS = [
  { label: "Voice", color: "#a855f7" },
  { label: "Body", color: "#3b82f6" },
  { label: "Breathwork", color: "#22c55e" },
  { label: "Rhythm", color: "#f97316" },
] as const;

const SPECTRUM = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#a855f7"];

const sora = `"Sora", sans-serif`;

export default function LandingPageV3() {
  useEffect(() => {
    const els = document.querySelectorAll(".landing-section");
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("landing-visible"); observer.unobserve(e.target); }
      }),
      { threshold: 0.12 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full overflow-y-auto landing-scroll" style={{ fontFamily: sora, background: "#09090f" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes ring-cw { to { transform: rotate(360deg); } }
        @keyframes ring-ccw { to { transform: rotate(-360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes glow-pulse { 0%,100% { box-shadow: 0 0 24px rgba(124,58,237,0.4); } 50% { box-shadow: 0 0 40px rgba(124,58,237,0.7); } }
        @keyframes grain { 0%,100% { transform: translate(0,0); } 10% { transform: translate(-5%,-10%); } 30% { transform: translate(3%,5%); } 50% { transform: translate(-3%,2%); } 70% { transform: translate(7%,-5%); } 90% { transform: translate(-2%,8%); } }
        .landing-section { opacity: 0; transform: translateY(20px); transition: opacity 0.4s ease-out, transform 0.4s ease-out; }
        .landing-visible { opacity: 1; transform: translateY(0); }
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; }
        .glass-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.15); }
      `}</style>

      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-100"
        style={{ opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, animation: "grain 8s steps(10) infinite" }}
      />

      <LandingHeader />

      {/* Hero */}
      <section className="landing-section relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-24 sm:pt-40 sm:pb-36 overflow-hidden min-h-[90vh]">
        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(800px circle at 50% 35%, rgba(124,58,237,0.12) 0%, transparent 70%)" }} />

        {/* Dashed rotating rings */}
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 sm:w-200 sm:h-200 pointer-events-none" viewBox="0 0 800 800">
          <circle cx="400" cy="400" r="280" fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="1" strokeDasharray="12 8" style={{ animation: "ring-cw 60s linear infinite", transformOrigin: "400px 400px" }} />
          <circle cx="400" cy="400" r="360" fill="none" stroke="rgba(124,58,237,0.08)" strokeWidth="1" strokeDasharray="8 14" style={{ animation: "ring-ccw 60s linear infinite", transformOrigin: "400px 400px" }} />
        </svg>

        <div className="relative z-10 flex flex-col items-center gap-8">
          <Logo layout="vertical" size="lg" animate={3} />
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] leading-[1.08] text-white max-w-2xl">
            Feel your voice<br />
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>in your body</span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-md leading-relaxed">
            You already know how this feels.
            <br />
            We just gave it a path.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link href="/journey">
              <Button size="lg" className="px-10 hover:scale-[1.03] transition-transform duration-200" style={{ animation: "glow-pulse 3s ease-in-out infinite" }}>
                Try it now
              </Button>
            </Link>
            <span className="text-sm text-white/35">Free &middot; No account needed</span>
          </div>
        </div>
      </section>

      {/* Features — 2x2 glassmorphic grid */}
      <section className="landing-section px-6 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-6 cursor-default"
              style={{ borderTop: `2px solid ${f.color}66` }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 32px ${f.color}20`; e.currentTarget.style.borderTopColor = `${f.color}`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderTopColor = `${f.color}66`; }}
            >
              <h3 className="text-lg font-bold text-white mb-2 tracking-[-0.02em]">{f.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What You Do */}
      <section className="landing-section px-6 py-20 sm:py-28">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-white">Not singing lessons.</h2>
            <p className="text-white/70 mt-3 text-base sm:text-lg">A body practice that uses sound.</p>
          </div>
          <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-lg">
            The pitch visualizer isn&apos;t a score &mdash; it&apos;s a mirror. You watch your voice move in real time so you can feel where it lands in your body.
          </p>
          {/* Spectrum dots */}
          <div className="flex items-center gap-4 mt-2">
            {SPECTRUM.map((c, i) => (
              <div key={i} className="w-3 h-3 rounded-full transition-transform duration-200 hover:scale-150 cursor-default" style={{ background: c }} />
            ))}
          </div>
          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {TAGS.map((t) => (
              <span
                key={t.label}
                className="inline-flex items-center text-xs font-semibold text-white/80 rounded-full px-3.5 py-1.5 transition-colors duration-200 hover:text-white cursor-default"
                style={{ background: "rgba(255,255,255,0.04)", borderLeft: `2px solid ${t.color}` }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — 3 columns */}
      <section className="landing-section px-6 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center flex flex-col gap-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-400 mb-3 block">Start in two minutes</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-white">As easy as taking a deep breath</h2>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-6">
            {/* Connecting line with shimmer */}
            <div
              className="hidden sm:block absolute top-[22px] left-[16.67%] right-[16.67%] h-0.5 rounded-full"
              style={{ background: "linear-gradient(90deg, #7c3aed44, #7c3aed, #7c3aed44)", backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }}
            />
            {STEPS.map((s, i) => (
              <div key={i} className="relative flex flex-col items-center gap-4 text-center">
                <span
                  className="relative z-10 flex items-center justify-center w-11 h-11 rounded-full text-sm font-bold text-white border-2 border-violet-500"
                  style={{ background: "#09090f" }}
                >
                  {i + 1}
                </span>
                <h3 className="text-base font-bold text-white tracking-[-0.02em]">{s.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed max-w-[260px]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-section px-6 py-24 sm:py-32 text-center">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-white leading-snug">
            Your voice is already<br />the instrument.
          </h2>
          <p className="text-white/70 text-base sm:text-lg">attunr shows you how to play it.</p>
          <Link href="/journey">
            <Button size="lg" className="px-10 hover:scale-[1.03] transition-transform duration-200" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", animation: "glow-pulse 3s ease-in-out infinite" }}>
              Start your practice
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] max-w-3xl mx-auto">
        <Logo layout="horizontal" size="sm" />
        <div className="flex gap-6 text-xs text-white/40">
          <Link href="/privacy" className="hover:text-white/70 transition-colors duration-200">Privacy</Link>
          <Link href="/terms" className="hover:text-white/70 transition-colors duration-200">Terms</Link>
          <Link href="/manifesto" className="hover:text-white/70 transition-colors duration-200">Manifesto</Link>
        </div>
      </footer>
    </div>
  );
}
