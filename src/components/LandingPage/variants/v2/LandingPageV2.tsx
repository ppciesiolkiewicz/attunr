"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui";
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
  { label: "Voice", x: "5%", y: "0%" },
  { label: "Body", x: "52%", y: "12%" },
  { label: "Breathwork", x: "18%", y: "55%" },
  { label: "Rhythm", x: "62%", y: "48%" },
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
    <div className="h-full overflow-y-auto landing-scroll" style={{ background: "#030305" }}>
      <LandingHeader />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Outfit:wght@300;400;500;600&display=swap');
        .v2-serif { font-family: 'Playfair Display', serif; }
        .v2-sans { font-family: 'Outfit', sans-serif; }

        @keyframes v2-shimmer {
          0%, 100% { background-position: -200% center; }
          50% { background-position: 200% center; }
        }
        @keyframes v2-drift {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.18; }
          25%  { transform: translate(80px, -40px) scale(1.1); opacity: 0.22; }
          50%  { transform: translate(-30px, 60px) scale(0.95); opacity: 0.15; }
          75%  { transform: translate(-70px, -20px) scale(1.05); opacity: 0.2; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.18; }
        }
        @keyframes v2-grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          30% { transform: translate(1%, 2%); }
          50% { transform: translate(-2%, 1%); }
          70% { transform: translate(2%, -1%); }
          90% { transform: translate(1%, 1%); }
        }
        @keyframes v2-reveal {
          from { clip-path: inset(100% 0 0 0); opacity: 0; }
          to   { clip-path: inset(0 0 0 0); opacity: 1; }
        }
        @keyframes v2-glow-pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .v2-shimmer-text {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.85) 0%,
            rgba(255,255,255,0.85) 30%,
            #818cf8 45%,
            #a78bfa 55%,
            rgba(255,255,255,0.85) 70%,
            rgba(255,255,255,0.85) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: v2-shimmer 5s ease-in-out infinite;
        }

        .landing-section {
          clip-path: inset(20% 0 0 0);
          opacity: 0;
          transition: clip-path 0.9s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .landing-visible {
          clip-path: inset(0 0 0 0);
          opacity: 1;
        }
      `}</style>

      {/* Animated background layers */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.035,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            animation: "v2-grain 0.4s steps(8) infinite",
          }}
        />
        <div
          className="absolute rounded-full blur-[200px]"
          style={{
            width: "600px",
            height: "600px",
            top: "15%",
            left: "50%",
            marginLeft: "-300px",
            background: "linear-gradient(135deg, #818cf8, #a78bfa, #6366f1)",
            animation: "v2-drift 20s ease-in-out infinite",
          }}
        />
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Hero */}
        <section className="min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-24 pt-20 pb-16">
          <div className="landing-section flex justify-center pt-8">
            <Logo layout="vertical" size="lg" animate={3} />
          </div>
          <div className="landing-section max-w-[65vw]">
            <h1 className="v2-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.95] tracking-tight text-white mb-8">
              Feel your voice<br />
              <span className="v2-shimmer-text">in your body</span>
            </h1>
            <p className="v2-sans text-lg sm:text-xl text-white/40 mb-10 max-w-md font-light">
              You already know how this feels. We just gave it a path.
            </p>
            <Link
              href="/journey"
              className="v2-sans inline-block text-sm text-white/50 hover:text-white transition-colors cursor-pointer group"
            >
              <span className="relative">
                Try it now <span className="inline-block ml-1">&rarr;</span>
                <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-white/60 transition-all duration-300 group-hover:w-full" />
              </span>
            </Link>
          </div>
        </section>

        {/* Features — staggered 2-col */}
        <section className="px-6 sm:px-12 lg:px-24 py-32 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-24 sm:gap-y-32 gap-x-16">
            {FEATURES.map((f, i) => (
              <div
                key={f.num}
                className={`landing-section relative ${i % 2 === 1 ? "sm:mt-20" : ""}`}
              >
                <span
                  className="v2-serif absolute -top-10 font-black leading-none select-none pointer-events-none"
                  style={{ fontSize: "120px", color: "rgba(255,255,255,0.03)" }}
                >
                  {f.num}
                </span>
                <h3 className="v2-serif text-2xl sm:text-3xl font-bold text-white/90 mb-3 relative">
                  {f.title}
                </h3>
                <p className="v2-sans text-white/35 leading-relaxed relative font-light">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What You Do */}
        <section className="landing-section px-6 sm:px-12 lg:px-24 py-32 w-full">
          <h2 className="v2-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white/90 leading-[0.95] mb-4">
            Not singing<br />lessons.
          </h2>
          <p className="v2-serif text-xl sm:text-2xl text-white/40 mb-6 font-normal">
            A body practice that uses sound.
          </p>
          <p className="v2-sans text-white/30 leading-relaxed max-w-lg mb-16 font-light">
            The pitch visualizer isn&apos;t a score &mdash; it&apos;s a mirror.
            You watch your voice move in real time so you can feel where it
            lands in your body.
          </p>
          <div className="relative h-32 sm:h-40 max-w-xl">
            {TAGS.map((t) => (
              <span
                key={t.label}
                className="v2-sans absolute text-xs sm:text-sm tracking-widest uppercase text-white/50 px-4 py-2 rounded-full border border-white/8 bg-white/2 flex items-center gap-2.5"
                style={{ left: t.x, top: t.y }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #818cf8, #a78bfa)",
                    boxShadow: "0 0 10px rgba(129,140,248,0.6)",
                    animation: "v2-glow-pulse 3s ease-in-out infinite",
                  }}
                />
                {t.label}
              </span>
            ))}
          </div>
        </section>

        {/* How It Works — horizontal timeline */}
        <section className="landing-section px-6 sm:px-12 lg:px-24 py-32 max-w-5xl mx-auto">
          <p className="v2-sans text-xs tracking-[0.3em] uppercase text-white/25 mb-3">
            Start in two minutes
          </p>
          <h2 className="v2-serif text-3xl sm:text-5xl font-bold text-white/90 mb-20">
            As easy as taking a deep breath
          </h2>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-16">
            {/* Connecting gradient line */}
            <div
              className="hidden sm:block absolute top-4 left-[10%] right-[10%] h-px"
              style={{ background: "linear-gradient(90deg, #818cf8 0%, #a78bfa 50%, #818cf8 100%)", opacity: 0.2 }}
            />
            {STEPS.map((s, i) => (
              <div key={i} className="relative">
                <div
                  className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center mb-5"
                  style={{ background: "#030305" }}
                >
                  <span className="v2-sans text-[10px] font-semibold text-white/40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h4 className="v2-serif text-lg font-bold text-white/85 mb-2">
                  {s.title}
                </h4>
                <p className="v2-sans text-sm text-white/30 leading-relaxed font-light">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="landing-section px-6 sm:px-12 lg:px-24 py-40">
          <h2 className="v2-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white/90 leading-none mb-4 max-w-4xl">
            Your voice is already the instrument.
          </h2>
          <p className="v2-serif text-xl sm:text-2xl text-white/35 mb-12">
            attunr shows you how to play it.
          </p>
          <Link
            href="/journey"
            className="v2-sans inline-block text-sm text-white/50 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="relative">
              Start your practice <span className="inline-block ml-1">&rarr;</span>
              <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-white/60 transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>
        </section>

        {/* Footer */}
        <footer className="px-6 sm:px-12 lg:px-24 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5">
          <Logo layout="horizontal" size="sm" />
          <div className="flex gap-6">
            <Link href="/privacy" className="v2-sans text-xs text-white/20 hover:text-white/40 transition-colors cursor-pointer">Privacy</Link>
            <Link href="/terms" className="v2-sans text-xs text-white/20 hover:text-white/40 transition-colors cursor-pointer">Terms</Link>
            <Link href="/manifesto" className="v2-sans text-xs text-white/20 hover:text-white/40 transition-colors cursor-pointer">Manifesto</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
