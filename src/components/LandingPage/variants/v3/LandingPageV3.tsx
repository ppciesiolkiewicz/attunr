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

const font = `"Inter Tight", "Manrope", sans-serif`;

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`landing-section px-6 py-20 sm:py-28 ${className}`}>{children}</section>;
}

function Heading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-3xl sm:text-4xl font-black tracking-[-0.04em] text-white ${className}`} style={{ fontFamily: font }}>
      {children}
    </h2>
  );
}

function CtaButton({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link href={href}>
      <Button size="lg" className="px-10 hover:scale-[1.03] transition-transform duration-200">
        {children}
      </Button>
    </Link>
  );
}

export default function LandingPageV3() {
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
    <div className="h-full overflow-y-auto landing-scroll" style={{ fontFamily: font, background: "#0a0a0f" }}>
      <LandingHeader />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;900&display=swap');`}</style>

      {/* Hero */}
      <section className="landing-section relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-24 sm:pt-36 sm:pb-32 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(124,58,237,0.18) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 flex flex-col items-center gap-8">
          <Logo layout="vertical" size="lg" animate={3} />
          <h1
            className="text-4xl sm:text-6xl font-black tracking-[-0.04em] leading-[1.1] text-white max-w-2xl"
            style={{ fontFamily: font }}
          >
            Feel your voice<br />
            <span className="bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">in your body</span>
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-md">
            You already know how this feels. We just gave it a path.
          </p>
          <div className="flex flex-col items-center gap-3">
            <CtaButton href="/journey">Try it now</CtaButton>
            <span className="text-sm text-white/40">Free. No account needed.</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <Section>
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="rounded-xl p-5 border border-white/[0.06] hover:translate-y-[-2px] transition-transform duration-200"
              style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)", borderTop: "2px solid rgba(124,58,237,0.5)" }}
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-violet-400 border border-violet-500/30 mb-3">
                {i + 1}
              </span>
              <h3 className="text-lg font-bold text-white mb-2 tracking-[-0.02em]" style={{ fontFamily: font }}>{f.title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* What You Do */}
      <Section>
        <div className="max-w-2xl mx-auto text-center flex flex-col gap-6">
          <div>
            <Heading>Not singing lessons.</Heading>
            <p className="text-white/70 mt-3 text-base sm:text-lg">A body practice that uses sound.</p>
          </div>
          <p className="text-sm sm:text-base text-white/60 leading-relaxed max-w-lg mx-auto">
            The pitch visualizer isn&apos;t a score &mdash; it&apos;s a mirror. You watch your voice move in real time so you can feel where it lands in your body.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {TAGS.map((t) => (
              <span
                key={t.label}
                className="inline-flex items-center text-xs font-semibold text-white/80 rounded-full px-3 py-1.5"
                style={{ background: "rgba(255,255,255,0.05)", borderLeft: `3px solid ${t.color}` }}
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section>
        <div className="max-w-3xl mx-auto text-center flex flex-col gap-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-3 block">Start in two minutes</span>
            <Heading>As easy as taking a deep breath</Heading>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {/* Connector line (desktop) */}
            <div
              className="hidden sm:block absolute top-[22px] left-[16.67%] right-[16.67%] h-px"
              style={{ background: "linear-gradient(90deg, rgba(124,58,237,0.4), rgba(124,58,237,0.15))" }}
            />
            {STEPS.map((s, i) => (
              <div key={i} className="relative flex flex-col items-center gap-4 text-center">
                <span
                  className="relative z-10 flex items-center justify-center w-11 h-11 rounded-full text-sm font-bold text-white border-2 border-violet-500/50"
                  style={{ background: "#0a0a0f" }}
                >
                  {i + 1}
                </span>
                <h3 className="text-base font-bold text-white tracking-[-0.02em]" style={{ fontFamily: font }}>{s.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed max-w-[260px]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Call to Action */}
      <Section className="text-center">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
          <Heading className="leading-snug">
            Your voice is already<br />the instrument.
          </Heading>
          <p className="text-white/70 text-base sm:text-lg">attunr shows you how to play it.</p>
          <CtaButton href="/journey">Start your practice</CtaButton>
        </div>
      </Section>

      {/* Footer */}
      <footer className="px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] max-w-3xl mx-auto">
        <Logo layout="horizontal" size="sm" />
        <div className="flex gap-6 text-xs text-white/40">
          <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
