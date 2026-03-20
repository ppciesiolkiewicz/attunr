"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui";
import { LandingHeader } from "../../components/LandingHeader";

const FEATURES = [
  {
    title: "It just feels good",
    body: "A long hum, a melody in the shower \u2014 your body relaxes. You\u2019ve always known this. attunr just gives it a path.",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.15)",
  },
  {
    title: "Breathing finds its rhythm",
    body: "Your voice gives your breath something to do. Slow exhales happen naturally, without forcing anything.",
    color: "#6366f1",
    glow: "rgba(99,102,241,0.15)",
  },
  {
    title: "You feel it in your body",
    body: "Low tones land in your chest. High tones light up your skull. The vibration is the practice.",
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.15)",
  },
  {
    title: "It deepens every time",
    body: "This isn\u2019t background noise. Each stage opens something new \u2014 something you carry with you.",
    color: "#22c55e",
    glow: "rgba(34,197,94,0.15)",
  },
] as const;

const STEPS = [
  {
    title: "Find your range",
    body: "A quick vocal scan tunes everything to your voice. Takes about a minute.",
  },
  {
    title: "Follow the path",
    body: "Voice. Breath. Rhythm. Each stage builds on the last. Open the app and pick up where you left off.",
  },
  {
    title: "Feel the difference",
    body: "Not just relaxation. Something shifts in how you carry yourself. You\u2019ll notice.",
  },
] as const;

const TAGS = [
  { label: "Voice", color: "#a855f7" },
  { label: "Body", color: "#3b82f6" },
  { label: "Breathwork", color: "#22c55e" },
  { label: "Rhythm", color: "#f97316" },
] as const;

const TONE_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
];

const RING_COLORS = [
  "rgba(139,92,246,0.65)",
  "rgba(99,102,241,0.48)",
  "rgba(59,130,246,0.32)",
];

const PARTICLE_COLORS = [
  "rgba(167,139,250,0.7)",
  "rgba(139,92,246,0.6)",
  "rgba(129,140,248,0.55)",
  "rgba(99,102,241,0.5)",
  "rgba(192,180,255,0.65)",
];

const fraunces = `"Fraunces", serif`;
const body = `"Outfit", sans-serif`;

function Divider() {
  return (
    <div className="flex justify-center py-4">
      <div
        className="w-80 h-0.5 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(139,92,246,0.35), transparent)",
        }}
      />
    </div>
  );
}

function handleMagnetic(e: React.MouseEvent<HTMLButtonElement>) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width / 2;
  const y = e.clientY - rect.top - rect.height / 2;
  btn.style.transition = "transform 0.15s cubic-bezier(0.33, 1, 0.68, 1)";
  btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
}

function handleMagneticLeave(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.transition =
    "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
  e.currentTarget.style.transform = "translate(0, 0)";
}

function handleRipple(e: React.MouseEvent<HTMLButtonElement>) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const ripple = document.createElement("span");
  ripple.className = "v7-ripple";
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
  btn.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

export default function LandingPageV8() {
  const particlesRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;
    const glow = container.querySelector(".v7-cursor-glow") as HTMLElement;
    const PULL_RADIUS = 180;
    const CAPTURE_RADIUS = 60;

    // Live set of active particles
    const alive = new Set<HTMLElement>();
    const captured = new Set<HTMLElement>();
    let capturedCount = 0;
    let colorIdx = 0;

    function spawnParticle(
      startX: number,
      startY: number,
      skipFadeIn?: boolean,
    ) {
      const el = document.createElement("div");
      const size = 1.5 + Math.random() * 2;
      const opacity = 0.3 + Math.random() * 0.5;
      const color = PARTICLE_COLORS[colorIdx++ % PARTICLE_COLORS.length];
      const driftX = (Math.random() - 0.5) * 120;
      const dur = 14 + Math.random() * 12;

      el.className = "v7-particle";
      el.style.cssText = `
        left: ${startX}%;
        top: ${startY}%;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        --drift-x: ${driftX}px;
        --p-opacity: ${opacity};
        ${skipFadeIn ? `opacity: ${opacity};` : ""}
        animation: v7-rise ${dur}s ease-in-out forwards;
        transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
      `;
      container!.appendChild(el);
      alive.add(el);

      el.addEventListener("animationend", () => {
        alive.delete(el);
        captured.delete(el);
        el.remove();
      });
    }

    // Initial batch — scattered across the viewport, already partially visible
    for (let i = 0; i < 30; i++) {
      spawnParticle(2 + Math.random() * 96, 20 + Math.random() * 80, true);
    }

    // Continuously spawn from bottom — no cap, replaces eaten + exited particles
    const spawnTimer = setInterval(() => {
      spawnParticle(Math.random() * 100, 102);
    }, 300);

    function onMouseMove(e: MouseEvent) {
      for (const dot of alive) {
        if (captured.has(dot)) {
          dot.style.transform = `translate(${e.clientX - dot.offsetLeft}px, ${e.clientY - dot.offsetTop}px)`;
          continue;
        }

        const rect = dot.getBoundingClientRect();
        const dotX = rect.left + rect.width / 2;
        const dotY = rect.top + rect.height / 2;
        const dx = e.clientX - dotX;
        const dy = e.clientY - dotY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CAPTURE_RADIUS) {
          captured.add(dot);
          capturedCount++;
          dot.style.transition =
            "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease";
          dot.style.transform = `translate(${dx}px, ${dy}px)`;
          dot.style.opacity = "0";
          dot.style.animation = "none";
        } else if (dist < PULL_RADIUS) {
          const strength = (1 - dist / PULL_RADIUS) * 30;
          const tx = (dx / dist) * strength;
          const ty = (dy / dist) * strength;
          dot.style.transition =
            "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
          dot.style.transform = `translate(${tx}px, ${ty}px)`;
        } else {
          dot.style.transition =
            "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)";
          dot.style.transform = "translate(0, 0)";
        }
      }

      if (glow) {
        const glowSize = capturedCount === 0 ? 0 : 6 + capturedCount * 5;
        const glowOpacity =
          capturedCount === 0 ? 0 : Math.min(0.15 + capturedCount * 0.08, 0.85);
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
        glow.style.width = `${glowSize}px`;
        glow.style.height = `${glowSize}px`;
        glow.style.opacity = String(glowOpacity);
      }
    }

    function onMouseLeave() {
      for (const dot of captured) {
        dot.style.transition =
          "transform 1.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.5s ease";
        dot.style.transform = "translate(0, 0)";
        dot.style.opacity = String(
          dot.style.getPropertyValue("--p-opacity") || "0.5",
        );
        dot.style.animation = "";
      }
      captured.clear();
      capturedCount = 0;
      for (const dot of alive) {
        dot.style.transition = "transform 1s cubic-bezier(0.22, 1, 0.36, 1)";
        dot.style.transform = "translate(0, 0)";
      }
      if (glow) glow.style.opacity = "0";
    }

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      clearInterval(spawnTimer);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      alive.forEach((d) => d.remove());
    };
  }, []);

  return (
    <div
      className="h-full overflow-y-auto overflow-x-hidden landing-scroll v7-grain"
      style={{
        background: "#080810",
        color: "#ebe8f5",
        fontFamily: `"Outfit", sans-serif`,
        cursor: "default",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Outfit:wght@300;400;500&display=swap');
        .v7-btn {
          transition: all 0.6s ease !important;
        }
        .v7-btn:hover {
          box-shadow: 0 0 40px rgba(139,92,246,0.35), 0 0 80px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.15) !important;
          border-color: rgba(139,92,246,0.7) !important;
          background: linear-gradient(135deg, rgba(139,92,246,0.35), rgba(99,102,241,0.2)) !important;
        }
        .v7-grain::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 11;
          opacity: 0.08;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px 256px;
        }
        .v7-chromatic {
          text-shadow: -1.5px 0.5px 0 rgba(255, 50, 80, 0.3), 1.5px -0.5px 0 rgba(80, 180, 255, 0.3);
        }
        .v7-mesh {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .v7-mesh-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          will-change: transform;
        }
        @keyframes v7-mesh-drift-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -40px) scale(1.1); }
          66% { transform: translate(-30px, 50px) scale(0.95); }
        }
        @keyframes v7-mesh-drift-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-50px, 30px) scale(1.05); }
          66% { transform: translate(40px, -60px) scale(0.9); }
        }
        @keyframes v7-mesh-drift-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 40px) scale(1.08); }
        }
        .v7-particle {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 10;
        }
        @keyframes v7-rise {
          0% { translate: 0 0; opacity: 0; }
          3% { opacity: var(--p-opacity, 0.5); }
          50% { translate: var(--drift-x) -50vh; }
          90% { opacity: calc(var(--p-opacity, 0.5) * 0.6); }
          100% { translate: calc(var(--drift-x) * 0.7) -110vh; opacity: 0; }
        }
        .v7-ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.3);
          transform: scale(0);
          animation: v7-ripple-expand 0.6s ease-out forwards;
          pointer-events: none;
        }
        @keyframes v7-ripple-expand {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>

      {/* Mesh gradient background */}
      <div className="v7-mesh">
        <div
          className="v7-mesh-blob"
          style={{
            width: 600,
            height: 600,
            top: "5%",
            left: "-10%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%)",
            animation: "v7-mesh-drift-1 20s ease-in-out infinite",
          }}
        />
        <div
          className="v7-mesh-blob"
          style={{
            width: 500,
            height: 500,
            top: "40%",
            right: "-5%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)",
            animation: "v7-mesh-drift-2 25s ease-in-out infinite",
          }}
        />
        <div
          className="v7-mesh-blob"
          style={{
            width: 450,
            height: 450,
            bottom: "10%",
            left: "20%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.05), transparent 70%)",
            animation: "v7-mesh-drift-3 18s ease-in-out infinite",
          }}
        />
      </div>

      {/* Interactive magnetic particles */}
      <div
        ref={particlesRef}
        className="fixed inset-0 pointer-events-none z-10"
      >
        <div
          className="v7-cursor-glow fixed pointer-events-none rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(circle, rgba(167,139,250,0.8) 0%, rgba(139,92,246,0.4) 40%, transparent 70%)",
            filter: "blur(8px)",
            opacity: 0,
            transition: "width 0.3s ease, height 0.3s ease, opacity 0.3s ease",
          }}
        />
        {/* Particles are dynamically spawned via useEffect */}
      </div>

      <LandingHeader />
      <div className="relative">
        {/* -- Hero -- */}
        <section className="relative min-h-dvh flex flex-col items-center justify-center px-6 overflow-hidden">
          {/* Background glow — purple / crown (slightly fainter) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              width: 1000,
              height: 700,
              background:
                "radial-gradient(ellipse, rgba(168,85,247,0.55) 0%, rgba(139,92,246,0.3) 25%, rgba(99,102,241,0.15) 45%, transparent 65%)",
              filter: "blur(60px)",
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

            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: fraunces, fontWeight: 700 }}
            >
              Feel your voice
              <br />
              <span className="bg-linear-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                in your body
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/60 leading-relaxed max-w-md mb-12">
              You already know how this feels.
              <br />
              We just gave it a path.
            </p>

            <Link href="/journey" tabIndex={-1}>
              <Button
                size="lg"
                className="v7-btn relative overflow-hidden px-14 text-lg cursor-pointer"
                onClick={handleRipple}
                onMouseMove={handleMagnetic}
                onMouseLeave={handleMagneticLeave}
                style={{
                  fontFamily: fraunces,
                  letterSpacing: "0.08em",
                  fontSize: "0.95rem",
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.15))",
                  border: "1px solid rgba(139,92,246,0.5)",
                  color: "#e0d4ff",
                  boxShadow:
                    "0 0 30px rgba(139,92,246,0.2), 0 0 60px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
                  transition:
                    "transform 0.3s ease, box-shadow 0.4s ease, background 0.4s ease, border-color 0.4s ease",
                }}
              >
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
              <rect
                x="1"
                y="1"
                width="18"
                height="26"
                rx="9"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="10"
                cy="8"
                r="2"
                fill="currentColor"
                className="animate-pulse"
              />
            </svg>
          </div>
        </section>

        <Divider />

        {/* -- Features -- */}
        <section className="landing-section relative px-6 py-16 sm:py-20">
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-0 pointer-events-none"
            style={{
              width: 900,
              height: 450,
              background:
                "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0.04) 40%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div className="relative max-w-4xl mx-auto">
            <p
              className="text-xs uppercase tracking-[0.25em] text-violet-400/60 text-center mb-3"
              style={{ fontFamily: fraunces }}
            >
              You already know this
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl text-white text-center mb-14"
              style={{ fontFamily: fraunces, fontWeight: 700 }}
            >
              The{" "}
              <span className="bg-linear-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                reset
              </span>{" "}
              your body already knows
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="group relative rounded-2xl border border-white/8 p-8 sm:p-10 transition-all duration-300 hover:border-white/16 hover:-translate-y-0.75"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(12px) saturate(1.3)",
                    WebkitBackdropFilter: "blur(12px) saturate(1.3)",
                    boxShadow: `0 0 20px ${f.color}10, 0 0 40px ${f.color}06, inset 0 1px 0 rgba(255,255,255,0.04)`,
                  }}
                >
                  <div
                    className="absolute top-0 left-6 right-6 h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${f.color}60, transparent)`,
                    }}
                  />
                  <div
                    className="w-12 h-12 rounded-full mb-6 flex items-center justify-center"
                    style={{
                      background: f.glow,
                      boxShadow: `0 0 20px ${f.color}30`,
                    }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full"
                      style={{
                        backgroundColor: f.color,
                        boxShadow: `0 0 8px ${f.color}80`,
                      }}
                    />
                  </div>
                  <h3
                    className="text-xl mb-3 text-white"
                    style={{ fontFamily: fraunces, fontWeight: 600 }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-base text-white/60 leading-relaxed"
                    style={{ fontFamily: body }}
                  >
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -- What You Do -- */}
        <section className="landing-section relative px-6 py-16 sm:py-20">
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-0 pointer-events-none"
            style={{
              width: 900,
              height: 450,
              background:
                "radial-gradient(ellipse, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 40%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div className="relative max-w-2xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-12">
              {TONE_COLORS.map((color) => (
                <div
                  key={color}
                  className="w-8 sm:w-10 h-0.5 rounded-full"
                  style={{ backgroundColor: color, opacity: 0.6 }}
                />
              ))}
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl text-white mb-4 leading-tight"
              style={{ fontFamily: fraunces, fontWeight: 700 }}
            >
              Find what&apos;s{" "}
              <span className="bg-linear-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                truly you.
              </span>
            </h2>
            <p
              className="text-xl sm:text-2xl text-white/40 mb-8"
              style={{ fontFamily: body }}
            >
              A body practice that uses{" "}
              <span className="v7-chromatic" data-text="voice">
                voice
              </span>
              .
            </p>
            <p
              className="text-white/55 leading-relaxed max-w-md mx-auto mb-14"
              style={{ fontFamily: body }}
            >
              Tuned to your voice. <br />
              You feel where each tone lands in your body. <br />
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {TAGS.map((p) => (
                <span
                  key={p.label}
                  className="inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm text-white/75 border transition-colors hover:bg-white/4"
                  style={{
                    borderColor: `${p.color}25`,
                    background: `${p.color}08`,
                    fontFamily: fraunces,
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    boxShadow: `0 0 12px ${p.color}15, 0 0 24px ${p.color}08`,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: p.color,
                      boxShadow: `0 0 8px ${p.color}60`,
                    }}
                  />
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <Divider />

        {/* -- How It Works (V6-style centered watermark) -- */}
        <section className="landing-section relative px-6 py-20 sm:py-28">
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-0 pointer-events-none"
            style={{
              width: 900,
              height: 450,
              background:
                "radial-gradient(ellipse, rgba(234,179,8,0.08) 0%, rgba(234,179,8,0.02) 40%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div className="relative max-w-2xl mx-auto">
            <p
              className="text-xs uppercase tracking-[0.25em] text-violet-400/60 text-center mb-3"
              style={{ fontFamily: fraunces }}
            >
              Start in two minutes
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl text-white text-center mb-20"
              style={{ fontFamily: fraunces, fontWeight: 700 }}
            >
              As easy as taking a <br />
              <span className="bg-linear-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                deep breath
              </span>
            </h2>

            <div className="flex flex-col gap-20">
              {STEPS.map((step, i) => (
                <div key={step.title} className="relative text-center">
                  {/* Watermark number */}
                  <span
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl sm:text-8xl pointer-events-none select-none"
                    style={{
                      fontFamily: fraunces,
                      fontWeight: 900,
                      color: "rgba(139,92,246,0.25)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative z-10">
                    <h3
                      className="text-xl sm:text-2xl text-white mb-3"
                      style={{ fontFamily: fraunces, fontWeight: 600 }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-white/55 leading-relaxed max-w-sm mx-auto"
                      style={{ fontFamily: body }}
                    >
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
        <section className="landing-section relative px-6 py-16 sm:py-20">
          <div
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-0 pointer-events-none"
            style={{
              width: 900,
              height: 450,
              background:
                "radial-gradient(ellipse, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.02) 40%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <div className="relative max-w-xl mx-auto text-center">
            <p
              className="text-2xl sm:text-3xl md:text-4xl text-white leading-snug mb-3"
              style={{ fontFamily: fraunces, fontWeight: 600 }}
            >
              Radically{" "}
              <span className="bg-linear-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
                internal
              </span>
              .
            </p>
            <p
              className="text-xl sm:text-2xl md:text-3xl text-white/45 leading-snug mb-12"
              style={{ fontFamily: body }}
            >
              Come back to your body.
            </p>
            <Link href="/journey" tabIndex={-1}>
              <Button
                size="lg"
                className="v7-btn relative overflow-hidden px-14 text-lg cursor-pointer"
                onClick={handleRipple}
                onMouseMove={handleMagnetic}
                onMouseLeave={handleMagneticLeave}
                style={{
                  fontFamily: fraunces,
                  letterSpacing: "0.08em",
                  fontSize: "0.95rem",
                  background:
                    "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.15))",
                  border: "1px solid rgba(139,92,246,0.5)",
                  color: "#e0d4ff",
                  boxShadow:
                    "0 0 30px rgba(139,92,246,0.2), 0 0 60px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
                  transition:
                    "transform 0.3s ease, box-shadow 0.4s ease, background 0.4s ease, border-color 0.4s ease",
                }}
              >
                Start your practice
              </Button>
            </Link>
            <p
              className="mt-5 text-xs text-white/30"
              style={{ fontFamily: body }}
            >
              or{" "}
              <a
                href="/manifesto"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white/50 transition-colors"
              >
                read our manifesto
              </a>
            </p>
          </div>
        </section>

        {/* -- Footer -- */}
        <footer className="px-6 py-12 border-t border-white/4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo layout="horizontal" size="sm" />
            <div className="flex items-center gap-6 text-xs text-white/35">
              <Link
                href="/privacy"
                className="hover:text-white/55 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white/55 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/manifesto"
                className="hover:text-white/55 transition-colors"
              >
                Manifesto
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
