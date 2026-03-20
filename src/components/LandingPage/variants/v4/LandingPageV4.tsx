"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui";
import { LandingHeader } from "../../components/LandingHeader";

const FEATURES = [
  { title: "It just feels good", body: "A long hum, a melody in the shower \u2014 your body relaxes. You\u2019ve always known this. attunr just gives it a path." },
  { title: "Breathing finds its rhythm", body: "Your voice gives your breath something to do. Slow exhales happen naturally, without forcing anything." },
  { title: "You feel it in your body", body: "Low tones land in your chest. High tones light up your skull. The vibration is the practice." },
  { title: "It deepens every time", body: "This isn\u2019t background noise. Each stage opens something new \u2014 something you carry with you." },
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

const cinzel = `"Cinzel", serif`;
const outfit = `"Outfit", sans-serif`;

function Star() {
  return (
    <div className="flex justify-center py-10">
      <span style={{ color: "#c9a96e", fontFamily: cinzel, fontSize: "0.75rem", opacity: 0.5 }}>{"\u2726"}</span>
    </div>
  );
}

function Diamond({ color, size = 6 }: { color: string; size?: number }) {
  return (
    <span
      className="inline-block"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        transform: "rotate(45deg)",
        flexShrink: 0,
      }}
    />
  );
}

export default function LandingPageV4() {
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
    <div className="h-full overflow-y-auto landing-scroll" style={{ background: "#08070e", color: "#e2ddd4" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;900&family=Outfit:wght@300;400;500;600&display=swap');

        @keyframes v4-ring-a { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes v4-ring-b { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(-360deg); } }
        @keyframes v4-ring-c { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes v4-glow-pulse { 0%, 100% { opacity: 0.12; transform: translate(-50%,-50%) scale(1); } 50% { opacity: 0.22; transform: translate(-50%,-50%) scale(1.05); } }
        @keyframes v4-fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .v4-grain::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 11;
          opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
        }

        .v4-vignette::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          background: radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, #08070e 100%);
        }

        .v4-gold-btn {
          border: 1px solid #c9a96e;
          color: #c9a96e;
          background: transparent;
          transition: all 1s ease;
        }
        .v4-gold-btn:hover {
          background: linear-gradient(135deg, rgba(201,169,110,0.15), rgba(232,213,176,0.08));
          box-shadow: 0 0 30px rgba(201,169,110,0.15);
        }

        .landing-section {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 1.2s ease, transform 1.2s ease;
        }
        .landing-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <LandingHeader />

      <div className="v4-grain v4-vignette relative">
        {/* ── Hero ── */}
        <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 overflow-hidden">
          {/* Ambient golden glow */}
          <div
            className="absolute top-1/2 left-1/2 pointer-events-none rounded-full"
            style={{
              width: 600,
              height: 600,
              background: "radial-gradient(circle, rgba(201,169,110,0.25) 0%, transparent 65%)",
              animation: "v4-glow-pulse 8s ease-in-out infinite",
            }}
          />

          {/* Three concentric golden circles */}
          {[
            { size: 400, opacity: 0.15, duration: 40, anim: "v4-ring-a" },
            { size: 560, opacity: 0.10, duration: 55, anim: "v4-ring-b" },
            { size: 720, opacity: 0.08, duration: 70, anim: "v4-ring-c" },
          ].map((ring) => (
            <div
              key={ring.size}
              className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
              style={{
                width: ring.size,
                height: ring.size,
                border: `0.5px solid rgba(201,169,110,${ring.opacity})`,
                animation: `${ring.anim} ${ring.duration}s linear infinite`,
              }}
            />
          ))}

          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl" style={{ animation: "v4-fade-in 1.2s ease-out" }}>
            <Logo layout="vertical" size="lg" animate={3} className="mb-14" />

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: cinzel, fontWeight: 700, color: "#e2ddd4" }}
            >
              Feel your voice
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #c9a96e, #e8d5b0)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                in your body
              </span>
            </h1>

            <p className="text-lg sm:text-xl leading-relaxed max-w-md mb-14" style={{ fontFamily: outfit, color: "rgba(226,221,212,0.5)" }}>
              You already know how this feels.
              <br />
              We just gave it a path.
            </p>

            <Link href="/journey">
              <Button
                size="lg"
                className="px-14 cursor-pointer"
                style={{ fontFamily: cinzel, letterSpacing: "0.12em", fontSize: "0.9rem", border: "1px solid #c9a96e", color: "#c9a96e", background: "transparent" }}
              >
                Try it now
              </Button>
            </Link>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" style={{ color: "rgba(201,169,110,0.2)" }}>
            <svg width="20" height="28" viewBox="0 0 20 28" fill="none" className="animate-bounce">
              <rect x="1" y="1" width="18" height="26" rx="9" stroke="currentColor" strokeWidth="1" />
              <circle cx="10" cy="8" r="2" fill="currentColor" className="animate-pulse" />
            </svg>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="landing-section px-6 py-20 sm:py-28">
          <div className="max-w-xl mx-auto flex flex-col items-center gap-20">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="flex flex-col items-center text-center">
                <h3
                  className="text-xl sm:text-2xl mb-3"
                  style={{ fontFamily: cinzel, fontWeight: 600, color: "#e2ddd4" }}
                >
                  {f.title}
                </h3>
                <div className="w-10 h-px mb-5" style={{ backgroundColor: "rgba(201,169,110,0.4)" }} />
                <p className="text-base leading-relaxed max-w-md" style={{ fontFamily: outfit, fontWeight: 300, color: "rgba(226,221,212,0.5)" }}>
                  {f.body}
                </p>
                {i < FEATURES.length - 1 && <Star />}
              </div>
            ))}
          </div>
        </section>

        <Star />

        {/* ── What You Do ── */}
        <section className="landing-section relative px-6 py-20 sm:py-28 overflow-hidden">
          <div className="relative max-w-xl mx-auto text-center">
            {/* Tone diamonds */}
            <div className="flex justify-center gap-3 mb-14">
              {TONE_COLORS.map((color) => (
                <Diamond key={color} color={color} size={8} />
              ))}
            </div>

            <h2
              className="text-3xl sm:text-4xl md:text-5xl mb-4 leading-tight"
              style={{ fontFamily: cinzel, fontWeight: 700, color: "#e2ddd4" }}
            >
              Not singing lessons.
            </h2>
            <p className="text-xl sm:text-2xl mb-8" style={{ fontFamily: outfit, fontWeight: 300, color: "rgba(139,123,181,0.7)" }}>
              A body practice that uses sound.
            </p>
            <p
              className="leading-relaxed max-w-md mx-auto mb-16"
              style={{ fontFamily: outfit, fontWeight: 300, color: "rgba(226,221,212,0.45)" }}
            >
              The pitch visualizer isn&apos;t a score &mdash; it&apos;s a mirror. You watch your voice move in real time so you can feel where it lands in your body.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              {TAGS.map((t) => (
                <span
                  key={t.label}
                  className="inline-flex items-center gap-2.5 text-sm"
                  style={{ fontFamily: cinzel, fontWeight: 500, letterSpacing: "0.08em", color: "rgba(226,221,212,0.6)" }}
                >
                  <Diamond color={t.color} size={5} />
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <Star />

        {/* ── How It Works ── */}
        <section className="landing-section px-6 py-20 sm:py-28">
          <div className="max-w-2xl mx-auto">
            <p
              className="text-xs uppercase tracking-[0.3em] text-center mb-3"
              style={{ fontFamily: cinzel, color: "rgba(201,169,110,0.4)" }}
            >
              Start in two minutes
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl text-center mb-20"
              style={{ fontFamily: cinzel, fontWeight: 700, color: "#e2ddd4" }}
            >
              As easy as taking a deep breath
            </h2>

            <div className="flex flex-col gap-20">
              {STEPS.map((step, i) => (
                <div key={step.title} className="relative text-center">
                  {/* Watermark number */}
                  <span
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl sm:text-8xl pointer-events-none select-none"
                    style={{ fontFamily: cinzel, fontWeight: 900, color: "rgba(201,169,110,0.15)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative z-10">
                    <h3
                      className="text-xl sm:text-2xl mb-3"
                      style={{ fontFamily: cinzel, fontWeight: 600, color: "#e2ddd4" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="leading-relaxed max-w-sm mx-auto"
                      style={{ fontFamily: outfit, fontWeight: 300, color: "rgba(226,221,212,0.5)" }}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Star />

        {/* ── Call to Action ── */}
        <section className="landing-section relative px-6 py-20 sm:py-28 overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 60%)" }}
          />
          <div className="relative max-w-xl mx-auto text-center">
            <p
              className="text-2xl sm:text-3xl md:text-4xl leading-snug mb-3"
              style={{ fontFamily: cinzel, fontWeight: 600, color: "#e2ddd4" }}
            >
              Your voice is already the instrument.
            </p>
            <p
              className="text-xl sm:text-2xl md:text-3xl leading-snug mb-14"
              style={{ fontFamily: outfit, fontWeight: 300, color: "rgba(139,123,181,0.5)" }}
            >
              attunr shows you how to play it.
            </p>
            <Link href="/journey">
              <Button
                size="lg"
                className="px-16 cursor-pointer"
                style={{ fontFamily: cinzel, letterSpacing: "0.12em", fontSize: "0.9rem", border: "1px solid #c9a96e", color: "#c9a96e", background: "transparent" }}
              >
                Start your practice
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="px-6 py-12" style={{ borderTop: "1px solid rgba(201,169,110,0.08)" }}>
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo layout="horizontal" size="sm" />
            <div className="flex items-center gap-6 text-xs" style={{ fontFamily: outfit, color: "rgba(226,221,212,0.3)" }}>
              <Link href="/privacy" className="hover:text-white/55 transition-colors duration-800">Privacy</Link>
              <Link href="/terms" className="hover:text-white/55 transition-colors duration-800">Terms</Link>
              <Link href="/manifesto" className="hover:text-white/55 transition-colors duration-800">Manifesto</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
