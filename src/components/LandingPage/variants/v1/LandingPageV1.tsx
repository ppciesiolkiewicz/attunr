"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui";
import { LandingHeader } from "../../components/LandingHeader";

const AMBER = "#d4a574";
const MOON = "#94a3c4";
const BG = "#060B18";

const FEATURES = [
  {
    title: "It just feels good",
    description:
      "A long hum, a melody in the shower — your body relaxes. You\u2019ve always known this. attunr just gives it a path.",
  },
  {
    title: "Breathing finds its rhythm",
    description:
      "Your voice gives your breath something to do. Slow exhales happen naturally, without forcing anything.",
  },
  {
    title: "You feel it in your body",
    description:
      "Low tones land in your chest. High tones light up your skull. The vibration is the practice.",
  },
  {
    title: "It deepens every time",
    description:
      "This isn\u2019t background noise. Each stage opens something new — something you carry with you.",
  },
] as const;

const STEPS = [
  {
    title: "Find your range",
    description:
      "A quick vocal scan tunes everything to your voice. Takes about a minute.",
  },
  {
    title: "Follow the path",
    description:
      "Voice. Breath. Rhythm. Each stage builds on the last. Open the app and pick up where you left off.",
  },
  {
    title: "Feel the difference",
    description:
      "Not just relaxation. Something shifts in how you carry yourself. You\u2019ll notice.",
  },
] as const;

const PRACTICES = ["Voice", "Body", "Breathwork", "Rhythm"] as const;

const HERO_WORDS = ["Feel", "your", "voice"];

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

export default function LandingPageV1() {
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
    <div className="h-full overflow-y-auto landing-scroll" style={{ background: BG }}>
      <LandingHeader />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400;500;600&family=Outfit:wght@300;400;500&display=swap');
        .v1-serif { font-family: 'Cormorant', serif; font-weight: 300; }
        .v1-sans { font-family: 'Outfit', sans-serif; font-weight: 300; }
        @keyframes v1-ocean {
          0%, 100% { background-position: 50% 50%; transform: scale(1); }
          50% { background-position: 50% 50%; transform: scale(1.15); }
        }
        @keyframes v1-orbit {
          0% { transform: translate(-50%, -50%) rotate(0deg) translateX(200px) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg) translateX(200px) rotate(-360deg); }
        }
        @keyframes v1-letter {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes v1-fade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes v1-spectrum {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .v1-word { opacity: 0; animation: v1-letter 1s ease-out forwards; }
        .landing-section { opacity: 0; transform: translateY(20px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .landing-visible { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* Grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-30"
        style={{ backgroundImage: NOISE_SVG, backgroundRepeat: "repeat", opacity: 0.5 }}
      />

      {/* Breathing ocean gradient */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse 80% 80% at 50% 50%, #0c1a3a 0%, #060B18 70%)`,
          animation: "v1-ocean 6s ease-in-out infinite",
        }}
      />

      {/* Ambient orbiting light */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: "50%",
          left: "50%",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${MOON}08 0%, transparent 60%)`,
          animation: "v1-orbit 30s linear infinite",
          opacity: 0.06,
        }}
      />

      {/* Hero */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 z-20">
        <div className="flex flex-col items-center text-center max-w-2xl">
          <Logo layout="vertical" size="lg" animate={3} className="mb-20" />

          <h1 className="v1-serif text-5xl sm:text-6xl md:text-7xl leading-[1.1] tracking-tight mb-2">
            {HERO_WORDS.map((word, i) => (
              <span
                key={word}
                className="v1-word inline-block mr-[0.3em]"
                style={{ color: MOON, animationDelay: `${0.6 + i * 0.25}s` }}
              >
                {word}
              </span>
            ))}
            <br />
            <span
              className="v1-word inline-block"
              style={{
                background: `linear-gradient(135deg, ${AMBER}, #e8c4a0)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animationDelay: "1.5s",
              }}
            >
              in your body
            </span>
          </h1>

          <p
            className="v1-sans text-lg sm:text-xl leading-relaxed max-w-md mt-10 mb-16"
            style={{ color: `${MOON}88`, animation: "v1-fade 1.5s ease-out 2s both" }}
          >
            You already know how this feels.
            <br />
            We just gave it a path.
          </p>

          <Link
            href="/journey"
            className="v1-serif text-xl tracking-wide transition-opacity hover:opacity-70"
            style={{ color: AMBER, animation: "v1-fade 1.5s ease-out 2.5s both" }}
          >
            Try it now &rarr;
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section relative z-20 px-6 py-32 sm:py-40">
        <div className="max-w-xl mx-auto flex flex-col gap-24 sm:gap-32">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center">
              <div className="mx-auto mb-8" style={{ width: 60, height: 1, background: `${AMBER}40` }} />
              <h3 className="v1-serif text-3xl sm:text-4xl mb-5" style={{ color: MOON }}>
                {f.title}
              </h3>
              <p className="v1-sans text-base sm:text-lg leading-relaxed max-w-md mx-auto" style={{ color: `${MOON}77` }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What You Do */}
      <section className="landing-section relative z-20 px-6 py-32 sm:py-40">
        <div className="max-w-2xl mx-auto text-center">
          {/* Spectrum bar */}
          <div
            className="mx-auto mb-16 rounded-full"
            style={{
              width: "100%",
              maxWidth: 400,
              height: 3,
              background: "linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #6366f1, #a855f7, #ef4444, #f97316, #eab308, #22c55e, #3b82f6)",
              backgroundSize: "200% 100%",
              animation: "v1-spectrum 20s linear infinite",
            }}
          />

          <h2 className="v1-serif text-6xl sm:text-7xl md:text-8xl leading-none mb-6" style={{ color: MOON }}>
            Not singing lessons.
          </h2>
          <p className="v1-serif text-2xl sm:text-3xl mb-10" style={{ color: `${MOON}55` }}>
            A body practice that uses sound.
          </p>
          <p className="v1-sans text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-14" style={{ color: `${MOON}66` }}>
            The pitch visualizer isn&apos;t a score &mdash; it&apos;s a mirror.
            You watch your voice move in real time so you can feel where it
            lands in your body.
          </p>

          <div className="flex flex-wrap justify-center gap-8">
            {PRACTICES.map((p) => (
              <span key={p} className="v1-sans text-sm tracking-[0.15em] uppercase" style={{ color: `${MOON}44` }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-section relative z-20 px-6 py-32 sm:py-40">
        <div className="max-w-xl mx-auto">
          <p className="v1-sans text-xs uppercase tracking-[0.3em] text-center mb-3" style={{ color: `${AMBER}66` }}>
            Start in two minutes
          </p>
          <h2 className="v1-serif text-3xl sm:text-4xl text-center mb-20" style={{ color: MOON }}>
            As easy as taking a deep breath
          </h2>

          <div className="flex flex-col gap-20">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <span
                  className="v1-serif text-[8rem] sm:text-[10rem] leading-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
                  style={{ color: MOON, opacity: 0.04 }}
                >
                  {i + 1}
                </span>
                <div className="relative">
                  <h3 className="v1-serif text-2xl sm:text-3xl mb-3" style={{ color: MOON }}>
                    {step.title}
                  </h3>
                  <p className="v1-sans text-base leading-relaxed max-w-sm mx-auto" style={{ color: `${MOON}66` }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-section relative z-20 px-6 py-32 sm:py-40">
        <div className="max-w-2xl mx-auto text-center">
          <p className="v1-serif text-3xl sm:text-4xl md:text-5xl leading-snug mb-4" style={{ color: MOON }}>
            Your voice is already the instrument.
          </p>
          <p className="v1-serif text-xl sm:text-2xl mb-16" style={{ color: `${MOON}44` }}>
            attunr shows you how to play it.
          </p>

          <Link
            href="/journey"
            className="v1-serif text-xl tracking-wide transition-opacity hover:opacity-70"
            style={{ color: AMBER }}
          >
            Begin &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 px-6 py-12" style={{ borderTop: `1px solid ${MOON}08` }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo layout="horizontal" size="sm" />
          <div className="flex items-center gap-6 v1-sans text-xs" style={{ color: `${MOON}44` }}>
            <Link href="/privacy" className="hover:opacity-70 transition-opacity">Privacy</Link>
            <Link href="/terms" className="hover:opacity-70 transition-opacity">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
