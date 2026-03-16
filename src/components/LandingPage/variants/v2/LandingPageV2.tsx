"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { LandingHeader } from "../../components/LandingHeader";

const FEATURES = [
  {
    num: "01",
    title: "It just feels good",
    body: "A long hum, a melody in the shower \u2014 your body relaxes. You\u2019ve always known this. attunr just gives it a path.",
  },
  {
    num: "02",
    title: "Breathing finds its rhythm",
    body: "Your voice gives your breath something to do. Slow exhales happen naturally, without forcing anything.",
  },
  {
    num: "03",
    title: "You feel it in your body",
    body: "Low tones land in your chest. High tones light up your skull. The vibration is the practice.",
  },
  {
    num: "04",
    title: "It deepens every time",
    body: "This isn\u2019t background noise. Each stage opens something new \u2014 something you carry with you.",
  },
];

const STEPS = [
  { title: "Find your range", body: "A quick vocal scan tunes everything to your voice. Takes about a minute." },
  { title: "Follow the path", body: "Voice. Breath. Rhythm. Each stage builds on the last. Open the app and pick up where you left off." },
  { title: "Feel the difference", body: "Not just relaxation. Something shifts in how you carry yourself. You\u2019ll notice." },
];

const TAGS = [
  { label: "Voice", color: "#a855f7" },
  { label: "Body", color: "#3b82f6" },
  { label: "Breathwork", color: "#22c55e" },
  { label: "Rhythm", color: "#f97316" },
];

export default function LandingPageV2() {
  useEffect(() => {
    const els = document.querySelectorAll(".landing-section");
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("landing-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full overflow-y-auto landing-scroll" style={{ background: "#050508" }}>
      <LandingHeader />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Space+Mono:wght@400;700&display=swap');
        .v2-eyebrow { font-family: 'Space Mono', monospace; }
        .v2-heading { font-family: 'Playfair Display', serif; }
        @keyframes v2-shimmer {
          0%, 80%, 100% { background-position: -200% center; }
          40% { background-position: 200% center; }
        }
        @keyframes v2-blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes v2-grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          30% { transform: translate(1%, 2%); }
          50% { transform: translate(-2%, 1%); }
          70% { transform: translate(2%, -1%); }
          90% { transform: translate(1%, 1%); }
        }
        .v2-shimmer-text {
          background: linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.9) 35%, #7dd3fc 45%, #c084fc 55%, rgba(255,255,255,0.9) 65%, rgba(255,255,255,0.9) 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: v2-shimmer 4s ease-in-out infinite;
        }
      `}</style>

      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", animation: "v2-grain 0.5s steps(6) infinite" }}
        />
        <div
          className="absolute w-150 h-150 rounded-full blur-[160px] opacity-20"
          style={{ top: "10%", right: "-10%", background: "linear-gradient(135deg, #7dd3fc, #c084fc)", animation: "v2-blob 20s ease-in-out infinite" }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Hero */}
        <section className="min-h-screen flex flex-col justify-center px-6 sm:px-12 lg:px-24 pt-20 pb-16">
          <div className="landing-section mb-12">
            <Logo layout="vertical" size="lg" animate={3} />
          </div>
          <div className="landing-section max-w-2xl">
            <h1 className="v2-heading text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white/90 mb-6">
              Feel your voice<br />
              <span className="v2-shimmer-text">in your body</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/40 mb-10 max-w-md" style={{ fontFamily: "system-ui, sans-serif" }}>
              You already know how this feels. We just gave it a path.
            </p>
            <Link href="/journey" className="v2-eyebrow inline-flex items-center gap-2 text-sm tracking-widest uppercase text-white/60 hover:text-white/90 transition-colors cursor-pointer">
              Try it now <span className="text-lg">&rarr;</span>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 sm:px-12 lg:px-24 py-24 max-w-6xl">
          {FEATURES.map((f, i) => (
            <div
              key={f.num}
              className={`landing-section relative mb-20 sm:mb-28 ${i % 2 === 1 ? "sm:ml-auto sm:text-right" : ""}`}
              style={{ maxWidth: "520px", animationDelay: `${i * 0.1}s` }}
            >
              <span className="v2-heading absolute -top-8 text-[6rem] sm:text-[8rem] font-bold text-white/3 leading-none select-none pointer-events-none">
                {f.num}
              </span>
              <h3 className="v2-heading text-2xl sm:text-3xl font-bold text-white/85 mb-3 relative">{f.title}</h3>
              <p className="text-white/35 leading-relaxed relative" style={{ fontFamily: "system-ui, sans-serif" }}>{f.body}</p>
            </div>
          ))}
        </section>

        {/* What You Do */}
        <section className="landing-section px-6 sm:px-12 lg:px-24 py-24 max-w-4xl">
          <p className="v2-eyebrow text-xs tracking-[0.25em] uppercase text-white/30 mb-4">The practice</p>
          <h2 className="v2-heading text-3xl sm:text-5xl font-bold text-white/90 mb-2">Not singing lessons.</h2>
          <p className="v2-heading text-xl sm:text-2xl text-white/50 mb-8">A body practice that uses sound.</p>
          <p className="text-white/35 leading-relaxed max-w-lg mb-12" style={{ fontFamily: "system-ui, sans-serif" }}>
            The pitch visualizer isn&apos;t a score &mdash; it&apos;s a mirror. You watch your voice move in real time so you can feel where it lands in your body.
          </p>
          <div className="flex flex-wrap gap-4">
            {TAGS.map((t) => (
              <span
                key={t.label}
                className="v2-eyebrow relative text-xs tracking-widest uppercase px-4 py-2 rounded-full border"
                style={{ color: t.color, borderColor: `${t.color}33`, background: `${t.color}0a` }}
              >
                <span
                  className="absolute top-1/2 left-3 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: t.color, boxShadow: `0 0 8px ${t.color}88` }}
                />
                <span className="pl-2">{t.label}</span>
              </span>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="landing-section px-6 sm:px-12 lg:px-24 py-24 max-w-5xl">
          <p className="v2-eyebrow text-xs tracking-[0.25em] uppercase text-white/30 mb-4">Start in two minutes</p>
          <h2 className="v2-heading text-3xl sm:text-5xl font-bold text-white/90 mb-16">As easy as taking a deep breath</h2>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-3 left-[16%] right-[16%] h-px bg-linear-to-r from-[#7dd3fc33] via-[#c084fc33] to-[#7dd3fc33]" />
            {STEPS.map((s, i) => (
              <div key={i} className="relative">
                <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center mb-4" style={{ background: "#050508" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: "linear-gradient(135deg, #7dd3fc, #c084fc)" }} />
                </div>
                <h4 className="v2-heading text-lg font-bold text-white/80 mb-2">{s.title}</h4>
                <p className="text-sm text-white/30 leading-relaxed" style={{ fontFamily: "system-ui, sans-serif" }}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="landing-section px-6 sm:px-12 lg:px-24 py-32 max-w-3xl">
          <h2 className="v2-heading text-3xl sm:text-5xl font-bold text-white/90 mb-3 leading-tight">
            Your voice is already the instrument.
          </h2>
          <p className="v2-heading text-xl sm:text-2xl text-white/40 mb-10">attunr shows you how to play it.</p>
          <Link href="/journey" className="v2-eyebrow inline-flex items-center gap-2 text-sm tracking-widest uppercase text-white/60 hover:text-white/90 transition-colors cursor-pointer">
            Start your practice <span className="text-lg">&rarr;</span>
          </Link>
        </section>

        {/* Footer */}
        <footer className="px-6 sm:px-12 lg:px-24 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5">
          <Logo layout="horizontal" size="sm" />
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-white/20 hover:text-white/40 transition-colors cursor-pointer">Privacy</Link>
            <Link href="/terms" className="text-xs text-white/20 hover:text-white/40 transition-colors cursor-pointer">Terms</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
