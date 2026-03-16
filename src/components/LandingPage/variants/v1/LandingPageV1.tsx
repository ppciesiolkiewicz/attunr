"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui";
import { LandingHeader } from "../../components/LandingHeader";

const FEATURES = [
  {
    title: "It just feels good",
    description:
      "A long hum, a melody in the shower \u2014 your body relaxes. You\u2019ve always known this. attunr just gives it a path.",
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
      "This isn\u2019t background noise. Each stage opens something new \u2014 something you carry with you.",
  },
] as const;

const PRACTICES = [
  { label: "Voice", color: "#a855f7" },
  { label: "Body", color: "#3b82f6" },
  { label: "Breathwork", color: "#22c55e" },
  { label: "Rhythm", color: "#f97316" },
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

const AMBER = "#c4956a";
const SAGE = "#8a9a7b";
const CREAM = "#e8e0d4";
const CHARCOAL = "#0f0e0c";

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
    <div className="h-full overflow-y-auto landing-scroll" style={{ background: CHARCOAL }}>
      <LandingHeader />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');
        .v1-heading { font-family: 'DM Serif Display', serif; }
        @keyframes v1-drift {
          0%, 100% { transform: translate(-50%, -50%) translate(0px, 0px); }
          25% { transform: translate(-50%, -50%) translate(60px, -40px); }
          50% { transform: translate(-50%, -50%) translate(-30px, 50px); }
          75% { transform: translate(-50%, -50%) translate(-50px, -20px); }
        }
        @keyframes v1-breathe {
          0%, 100% { opacity: 0.12; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.18; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes v1-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{ backgroundImage: NOISE_SVG, backgroundRepeat: "repeat", opacity: 0.5 }}
      />

      {/* Ambient gradient orb */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: "40%",
          left: "50%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${AMBER}18 0%, ${SAGE}10 40%, transparent 70%)`,
          animation: "v1-drift 25s ease-in-out infinite, v1-breathe 6s ease-in-out infinite",
        }}
      />

      {/* Hero */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 z-20">
        <div className="flex flex-col items-center text-center max-w-xl" style={{ animation: "v1-fade-up 2s ease-out" }}>
          <Logo layout="vertical" size="lg" animate={3} className="mb-16" />

          <h1 className="v1-heading text-4xl sm:text-5xl md:text-6xl leading-[1.15] tracking-tight mb-8" style={{ color: CREAM }}>
            Feel your voice
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${AMBER}, #d4a574)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              in your body
            </span>
          </h1>

          <p className="text-lg leading-relaxed max-w-sm mb-14" style={{ color: `${CREAM}88` }}>
            You already know how this feels.
            <br />
            We just gave it a path.
          </p>

          <Link href="/journey">
            <Button size="lg" className="px-12 text-lg">
              Try it now
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="landing-section relative z-20 px-6 py-24 sm:py-32">
        <div className="max-w-lg mx-auto flex flex-col gap-16">
          {FEATURES.map((f) => (
            <div key={f.title} className="relative pl-6" style={{ borderLeft: `1px solid ${AMBER}30` }}>
              <h3 className="v1-heading text-xl sm:text-2xl mb-3" style={{ color: CREAM }}>
                {f.title}
              </h3>
              <p className="text-sm sm:text-base leading-relaxed" style={{ color: `${CREAM}77` }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What You Do */}
      <section className="landing-section relative z-20 px-6 py-24 sm:py-32">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="v1-heading text-3xl sm:text-4xl mb-4" style={{ color: CREAM }}>
            Not singing lessons.
          </h2>
          <p className="text-xl mb-8" style={{ color: `${CREAM}55` }}>
            A body practice that uses sound.
          </p>
          <p className="leading-relaxed max-w-md mx-auto mb-12" style={{ color: `${CREAM}77` }}>
            The pitch visualizer isn&apos;t a score &mdash; it&apos;s a mirror.
            You watch your voice move in real time so you can feel where it
            lands in your body.
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            {PRACTICES.map((p) => (
              <span
                key={p.label}
                className="text-sm tracking-wide"
                style={{ color: p.color, opacity: 0.7 }}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-section relative z-20 px-6 py-24 sm:py-32">
        <div className="max-w-lg mx-auto">
          <p className="text-xs uppercase tracking-[0.3em] text-center mb-3" style={{ color: `${SAGE}99` }}>
            Start in two minutes
          </p>
          <h2 className="v1-heading text-3xl sm:text-4xl text-center mb-16" style={{ color: CREAM }}>
            As easy as taking a deep breath
          </h2>

          <div className="flex flex-col gap-14">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-5 items-baseline">
                <span
                  className="v1-heading text-2xl shrink-0"
                  style={{ color: `${AMBER}66`, minWidth: "1.5rem" }}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="v1-heading text-lg sm:text-xl mb-2" style={{ color: CREAM }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: `${CREAM}77` }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="landing-section relative z-20 px-6 py-24 sm:py-32">
        <div className="max-w-xl mx-auto text-center">
          <p className="v1-heading text-2xl sm:text-3xl leading-snug mb-3" style={{ color: CREAM }}>
            Your voice is already the instrument.
          </p>
          <p className="v1-heading text-xl sm:text-2xl leading-snug mb-14" style={{ color: `${CREAM}55` }}>
            attunr shows you how to play it.
          </p>

          <Link href="/journey">
            <Button size="lg" className="px-14 text-lg">
              Start your practice
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 px-6 py-12" style={{ borderTop: `1px solid ${CREAM}08` }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo layout="horizontal" size="sm" />
          <div className="flex items-center gap-6 text-xs" style={{ color: `${CREAM}44` }}>
            <Link href="/privacy" className="hover:opacity-70 transition-opacity">
              Privacy
            </Link>
            <Link href="/terms" className="hover:opacity-70 transition-opacity">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
