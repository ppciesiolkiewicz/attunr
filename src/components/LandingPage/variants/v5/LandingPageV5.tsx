"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui";
import { LandingHeader } from "../../components/LandingHeader";

const FEATURES = [
  { title: "It just feels good", body: "A long hum, a melody in the shower \u2014 your body relaxes. You\u2019ve always known this. attunr just gives it a path.", color: "#a855f7", glow: "rgba(168,85,247,0.15)" },
  { title: "Breathing finds its rhythm", body: "Your voice gives your breath something to do. Slow exhales happen naturally, without forcing anything.", color: "#6366f1", glow: "rgba(99,102,241,0.15)" },
  { title: "You feel it in your body", body: "Low tones land in your chest. High tones light up your skull. The vibration is the practice.", color: "#3b82f6", glow: "rgba(59,130,246,0.15)" },
  { title: "It deepens every time", body: "This isn\u2019t background noise. Each stage opens something new \u2014 something you carry with you.", color: "#22c55e", glow: "rgba(34,197,94,0.15)" },
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

const TONE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#6366f1", "#a855f7"];

const RING_COLORS = [
  "rgba(139,92,246,0.65)",
  "rgba(99,102,241,0.48)",
  "rgba(59,130,246,0.32)",
];

const fraunces = `"Fraunces", serif`;
const body = `"Outfit", sans-serif`;

function Divider() {
  return (
    <div className="flex justify-center py-2">
      <div
        className="w-48 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)" }}
      />
    </div>
  );
}

export default function LandingPageV5() {
  useEffect(() => {
    const els = document.querySelectorAll(".landing-section");
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("landing-visible");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full overflow-y-auto landing-scroll" style={{ background: "#080810", color: "#ebe8f5", fontFamily: `"Outfit", sans-serif` }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Outfit:wght@300;400;500&display=swap');
        .v5-grain::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 11;
          opacity: 0.045;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
        }
      `}</style>

      <LandingHeader />
      <div className="v5-grain relative">
        {/* -- Hero -- */}
        <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 overflow-hidden">
          {/* Background glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.20) 0%, rgba(99,102,241,0.10) 35%, transparent 65%)",
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
                animation: `landing-ring-pulse ${2 + i * 0.5}s ease-out ${i * 0.4}s infinite backwards`,
              }}
            />
          ))}

          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
            <Logo layout="vertical" size="lg" animate={3} className="mb-12" />

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight mb-6" style={{ fontFamily: fraunces, fontWeight: 700 }}>
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
              <Button size="lg" className="px-12 text-lg glow-pulse" style={{ fontFamily: fraunces, letterSpacing: "0.08em", fontSize: "0.95rem" }}>
                Try it now
              </Button>
            </Link>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25">
            <svg width="20" height="28" viewBox="0 0 20 28" fill="none" className="animate-bounce">
              <rect x="1" y="1" width="18" height="26" rx="9" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="10" cy="8" r="2" fill="currentColor" className="animate-pulse" />
            </svg>
          </div>
        </section>

        <Divider />

        {/* -- Features -- */}
        <section className="landing-section px-6 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400/60 text-center mb-3" style={{ fontFamily: fraunces }}>
              You already know this
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-white text-center mb-14" style={{ fontFamily: fraunces, fontWeight: 700 }}>
              The reset your body already knows
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group relative rounded-2xl border border-white/[0.08] p-8 sm:p-10 transition-all duration-300 hover:border-white/[0.16] hover:translate-y-[-3px]"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    boxShadow: `0 0 20px ${f.color}10, 0 0 40px ${f.color}06`,
                  }}
                >
                  <div
                    className="absolute top-0 left-6 right-6 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${f.color}60, transparent)` }}
                  />
                  <div className="w-12 h-12 rounded-full mb-6 flex items-center justify-center" style={{ background: f.glow, boxShadow: `0 0 20px ${f.color}30` }}>
                    <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: f.color, boxShadow: `0 0 8px ${f.color}80` }} />
                  </div>
                  <h3 className="text-xl mb-3 text-white" style={{ fontFamily: fraunces, fontWeight: 600 }}>{f.title}</h3>
                  <p className="text-base text-white/60 leading-relaxed" style={{ fontFamily: body }}>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* -- What You Do -- */}
        <section className="landing-section relative px-6 py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.04), transparent)" }} />
          <div className="relative max-w-2xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-12">
              {TONE_COLORS.map((color) => (
                <div key={color} className="w-8 sm:w-10 h-0.5 rounded-full" style={{ backgroundColor: color, opacity: 0.5 }} />
              ))}
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-white mb-4 leading-tight" style={{ fontFamily: fraunces, fontWeight: 700 }}>
              Not singing lessons.
            </h2>
            <p className="text-xl sm:text-2xl text-white/40 mb-8" style={{ fontFamily: body }}>
              A body practice that uses sound.
            </p>
            <p className="text-white/55 leading-relaxed max-w-md mx-auto mb-14" style={{ fontFamily: body }}>
              The pitch visualizer isn&apos;t a score &mdash; it&apos;s a mirror. You watch your voice move in real time so you can feel where it lands in your body.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {TAGS.map((p) => (
                <span
                  key={p.label}
                  className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm text-white/75 border transition-colors hover:bg-white/[0.04]"
                  style={{ borderColor: `${p.color}25`, background: `${p.color}08`, fontFamily: fraunces, fontWeight: 500, letterSpacing: "0.05em", boxShadow: `0 0 12px ${p.color}15, 0 0 24px ${p.color}08` }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}60` }} />
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* -- How It Works -- */}
        <section className="landing-section px-6 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-[0.25em] text-violet-400/60 text-center mb-3" style={{ fontFamily: fraunces }}>
              Start in two minutes
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-white text-center mb-14" style={{ fontFamily: fraunces, fontWeight: 700 }}>
              As easy as taking a deep breath
            </h2>

            <div className="relative flex flex-col gap-16 pl-12 sm:pl-16">
              <div
                className="absolute left-[15px] sm:left-[19px] top-3 bottom-3 w-px"
                style={{ background: "linear-gradient(to bottom, rgba(139,92,246,0.3), rgba(139,92,246,0.08))" }}
              />
              {STEPS.map((step, i) => (
                <div key={step.title} className="relative flex gap-6 sm:gap-8 items-start">
                  <div className="absolute left-[-48px] sm:left-[-64px] top-1 flex items-center justify-center">
                    <div
                      className="w-[30px] h-[30px] sm:w-[38px] sm:h-[38px] rounded-full flex items-center justify-center text-xs sm:text-sm"
                      style={{
                        background: "rgba(139,92,246,0.12)",
                        border: "1px solid rgba(139,92,246,0.25)",
                        color: "rgba(167,139,250,0.8)",
                        fontFamily: fraunces,
                        fontWeight: 700,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl text-white mb-2" style={{ fontFamily: fraunces, fontWeight: 600 }}>
                      {step.title}
                    </h3>
                    <p className="text-white/55 leading-relaxed text-base" style={{ fontFamily: body }}>
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* -- Call to Action -- */}
        <section className="landing-section relative px-6 py-16 sm:py-20 overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 60%)" }}
          />
          <div className="relative max-w-xl mx-auto text-center">
            <p className="text-2xl sm:text-3xl md:text-4xl text-white leading-snug mb-3" style={{ fontFamily: fraunces, fontWeight: 600 }}>
              Your voice is already the instrument.
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl text-white/45 leading-snug mb-12" style={{ fontFamily: body }}>
              attunr shows you how to play it.
            </p>
            <Link href="/journey">
              <Button size="lg" className="px-14 text-lg glow-pulse" style={{ fontFamily: fraunces, letterSpacing: "0.08em", fontSize: "0.95rem" }}>
                Start your practice
              </Button>
            </Link>
          </div>
        </section>

        {/* -- Footer -- */}
        <footer className="px-6 py-12 border-t border-white/[0.04]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo layout="horizontal" size="sm" />
            <div className="flex items-center gap-6 text-xs text-white/35">
              <Link href="/privacy" className="hover:text-white/55 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white/55 transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
