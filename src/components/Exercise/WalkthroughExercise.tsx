"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, Text } from "@/components/ui";

function HeadphonesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

// ── Step definitions ────────────────────────────────────────────────────────

type SpotlightTarget = "info" | "reps-progress" | "play-tone" | "start" | "canvas" | "next-skip" | null;

interface Step {
  target: SpotlightTarget;
  mockup: "hill" | "farinelli" | "none";
  text: string;
  /** Rich content rendered below the text. */
  extra?: React.ReactNode;
  button: string;
}

const STEPS: Step[] = [
  { target: null, mockup: "none", text: "Welcome! Let's do a quick walkthrough of the app.", button: "Next" },
  {
    target: null,
    mockup: "none",
    text: "",
    extra: (
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="shrink-0 mt-0.5">
            <HeadphonesIcon />
          </span>
          <Text variant="body-sm" color="text-1">
            For the best experience, use headphones. Some content is voice-guided, and headphones keep the playback out of your mic so we can hear your voice clearly.
          </Text>
        </div>
        <Text variant="caption" color="text-2">
          Wired headphones work best — Bluetooth (like AirPods) can add latency.
        </Text>
        <div className="flex flex-col gap-1.5">
          <Text variant="caption" color="muted-1">To learn more, read the articles below. You can always do it later.</Text>
          <Link href="/articles/headphones-and-mic" target="_blank" className="text-violet-400 text-xs underline underline-offset-2">
            Why headphones matter
          </Link>
          <Link href="/articles/airpods-audio-routing" target="_blank" className="text-violet-400 text-xs underline underline-offset-2">
            AirPods audio routing on iPhone
          </Link>
        </div>
      </div>
    ),
    button: "Next",
  },
  { target: "info", mockup: "hill", text: "Tap this icon anytime to see detailed information.", button: "Next" },
  { target: "reps-progress", mockup: "hill", text: "This shows your progress and how many reps are left.", button: "Next" },
  { target: "play-tone", mockup: "hill", text: "Some steps play a reference tone for you to match. Tap this to hear it again.", button: "Next" },
  { target: "start", mockup: "hill", text: "Sometimes you need to press Start to begin.", button: "Next" },
  { target: "canvas", mockup: "farinelli", text: "There's a variety of things to explore. Each one guides you.", button: "Next" },
  { target: "next-skip", mockup: "farinelli", text: "Tap Next to move on, or Skip to come back later.", button: "Got it" },
];

// ── Minimal static mockups ──────────────────────────────────────────────────

function MockInfoButton() {
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <circle cx="12" cy="8" r="0.5" fill="rgba(255,255,255,0.5)" />
      </svg>
    </div>
  );
}

function MockProgressArc() {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = circ * 0.35;
  return (
    <svg width={50} height={50} viewBox="0 0 50 50" className="shrink-0">
      <circle cx={25} cy={25} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
      <circle cx={25} cy={25} r={r} fill="none" stroke="#7c3aed" strokeWidth={3} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 25 25)" />
      <text x={25} y={29} textAnchor="middle" fontSize={13} fill="rgba(255,255,255,0.75)" fontFamily="system-ui">35%</text>
    </svg>
  );
}

function MockRepDots() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full bg-violet-400" />
      <div className="w-2 h-2 rounded-full bg-violet-400/50" />
      <div className="w-2 h-2 rounded-full bg-white/15" />
      <div className="w-2 h-2 rounded-full bg-white/15" />
      <div className="w-2 h-2 rounded-full bg-white/15" />
      <Text variant="caption" color="muted-1" className="ml-0.5 tabular-nums">2/5</Text>
    </div>
  );
}

function MockButton({ children, variant = "outline" }: { children: React.ReactNode; variant?: "outline" | "primary" }) {
  return (
    <div
      className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium ${
        variant === "primary"
          ? "bg-violet-600 text-white"
          : "border border-white/[0.15] text-white/70"
      }`}
    >
      {children}
    </div>
  );
}

/** Minimal hill curve SVG */
function HillShape() {
  return (
    <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="hill-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path d="M0 100 Q75 100 150 30 Q225 100 300 100 L300 120 L0 120 Z" fill="url(#hill-grad)" />
      <path d="M0 100 Q75 100 150 30 Q225 100 300 100" fill="none" stroke="#7c3aed" strokeWidth="2" strokeOpacity="0.5" />
      <circle cx="120" cy="55" r="8" fill="#a78bfa" fillOpacity="0.8" />
    </svg>
  );
}

/** Minimal Farinelli breathing circle */
function FarinelliShape() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full">
      <div
        className="w-28 h-28 rounded-full border-2 border-violet-500/40 flex items-center justify-center"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }}
      >
        <Text variant="heading-lg" color="text-2">4</Text>
      </div>
      <Text variant="body-sm" color="muted-1">Inhale</Text>
    </div>
  );
}

// ── Hill mockup ─────────────────────────────────────────────────────────────

function HillMockup() {
  return (
    <div className="flex flex-col h-full">
      {/* Header area with info button */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <Text variant="body-sm" color="muted-1">Gentle hum</Text>
        <div data-spotlight="info"><MockInfoButton /></div>
      </div>

      {/* Canvas area with hill + centered start button */}
      <div className="flex-1 min-h-35 relative">
        <HillShape />
        {/* Start button centered in canvas */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div data-spotlight="start" className="pointer-events-auto">
            <div className="bg-violet-600 text-white px-6 py-3 rounded-xl text-base font-medium">
              ▶ Start
            </div>
          </div>
        </div>
      </div>

      {/* Bottom panel */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div data-spotlight="reps-progress" className="shrink-0 order-first sm:order-none flex items-center gap-2">
          <MockProgressArc />
          <MockRepDots />
        </div>
        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0 sm:flex-initial sm:min-w-0 justify-end sm:ml-auto">
          <div data-spotlight="play-tone">
            <MockButton variant="outline">♪ Play</MockButton>
          </div>
          <MockButton>Skip →</MockButton>
        </div>
      </div>
    </div>
  );
}

// ── Farinelli mockup ────────────────────────────────────────────────────────

function FarinelliMockup({ live, onComplete, onSkip }: { live?: boolean; onComplete?: () => void; onSkip?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <Text variant="body-sm" color="muted-1">Farinelli breathwork</Text>
        <MockInfoButton />
      </div>

      {/* Canvas area */}
      <div data-spotlight="canvas" className="flex-1 min-h-0 relative">
        <FarinelliShape />
      </div>

      {/* Bottom panel */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row items-center justify-end gap-2 sm:gap-3 shrink-0">
        {live ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={onSkip} className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm">
              Skip →
            </Button>
            <Button onClick={onComplete} className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm">
              Next →
            </Button>
          </div>
        ) : (
          <div data-spotlight="next-skip" className="flex gap-2">
            <MockButton>Skip →</MockButton>
            <MockButton variant="primary">Next →</MockButton>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Spotlight overlay ───────────────────────────────────────────────────────

interface BubblePos {
  x: number;
  y: number;
  anchor: "above" | "below";
}

function computeBubblePos(
  targetRect: DOMRect,
  containerRect: DOMRect,
  bubbleW: number,
  target: SpotlightTarget,
): BubblePos {
  const relLeft = targetRect.left - containerRect.left;
  const relTop = targetRect.top - containerRect.top;
  const relBottom = relTop + targetRect.height;
  const centerX = relLeft + targetRect.width / 2;
  const centerY = relTop + targetRect.height / 2;

  // Clamp bubble horizontally within container with 12px margin
  const x = Math.max(12, Math.min(centerX - bubbleW / 2, containerRect.width - bubbleW - 12));

  // Large targets (canvas): place bubble in lower half of the target area
  if (target === "canvas") {
    return {
      x,
      y: relTop + targetRect.height * 0.6,
      anchor: "below",
    };
  }

  // Place above if target is in the lower half, below otherwise
  const placeAbove = centerY > containerRect.height * 0.45;

  return {
    x,
    y: placeAbove ? relTop - 16 : relBottom + 16,
    anchor: placeAbove ? "above" : "below",
  };
}

const BUBBLE_W = 280;

interface SpotlightOverlayProps {
  target: SpotlightTarget;
  containerRef: React.RefObject<HTMLDivElement | null>;
  text: string;
  extra?: React.ReactNode;
  buttonLabel: string;
  onAction: () => void;
  /** Show only the highlight ring — no overlay, no bubble. */
  ringOnly?: boolean;
}

function SpotlightOverlay({ target, containerRef, text, extra, buttonLabel, onAction, ringOnly }: SpotlightOverlayProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    setContainerRect(containerRef.current.getBoundingClientRect());

    if (!target) {
      setTargetRect(null);
      return;
    }

    const el = containerRef.current.querySelector(`[data-spotlight="${target}"]`);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [target, containerRef]);

  // Measure after paint and on target change
  useEffect(() => {
    // RAF ensures flex layout has settled
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [measure]);

  const bubbleContent = (
    <div
      className="max-w-[280px] rounded-xl px-4 py-3 flex flex-col gap-3"
      style={{ background: "rgba(20,10,40,0.95)", border: "1px solid rgba(167,139,250,0.35)", boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}
    >
      <div>
        <Text variant="body-sm" color="text-1">{text}</Text>
        {extra}
      </div>
      <Button size="sm" onClick={onAction} className="self-start">{buttonLabel}</Button>
    </div>
  );

  // No spotlight target (summary step) — centered bubble, no overlay
  if (!target) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          {bubbleContent}
        </div>
      </div>
    );
  }

  // Waiting for layout measurement
  if (!targetRect || !containerRect) return null;

  const pad = 8;
  const cutout = {
    x: targetRect.left - containerRect.left - pad,
    y: targetRect.top - containerRect.top - pad,
    w: targetRect.width + pad * 2,
    h: targetRect.height + pad * 2,
    rx: 12,
  };

  const bubble = computeBubblePos(targetRect, containerRect, BUBBLE_W, target);

  // Ring-only mode: just the highlight ring, no overlay or bubble
  if (ringOnly) {
    return (
      <svg className="absolute inset-0 z-30 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
        <rect
          x={cutout.x} y={cutout.y}
          width={cutout.w} height={cutout.h}
          rx={cutout.rx}
          fill="none"
          stroke="rgba(167,139,250,0.5)"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <>
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 z-30 w-full h-full pointer-events-none" style={{ overflow: "visible" }}>
        <defs>
          <mask id={`spotlight-mask-${target}`}>
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={cutout.x} y={cutout.y}
              width={cutout.w} height={cutout.h}
              rx={cutout.rx}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%" height="100%"
          fill="rgba(0,0,0,0.7)"
          mask={`url(#spotlight-mask-${target})`}
        />
        {/* Highlight ring */}
        <rect
          x={cutout.x} y={cutout.y}
          width={cutout.w} height={cutout.h}
          rx={cutout.rx}
          fill="none"
          stroke="rgba(167,139,250,0.5)"
          strokeWidth="2"
        />
      </svg>

      {/* Explanation bubble */}
      <div
        className="absolute z-40 pointer-events-auto"
        style={{
          left: bubble.x,
          ...(bubble.anchor === "above"
            ? { bottom: containerRect.height - bubble.y }
            : { top: bubble.y }),
        }}
      >
        {bubbleContent}
      </div>
    </>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

interface WalkthroughExerciseProps {
  isLast: boolean;
  onComplete: () => void;
  onPrev?: () => void;
}

export function WalkthroughExercise({ onComplete }: WalkthroughExerciseProps) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const current = STEPS[step];

  const handleAction = useCallback(() => {
    if (step >= STEPS.length - 1) {
      // Last step — dismiss overlay, show live buttons
      setDone(true);
    } else {
      setStep((s) => s + 1);
    }
  }, [step]);

  return (
    <div ref={containerRef} className="relative flex flex-col h-full overflow-hidden">
      {/* Mockup layer */}
      <div className="flex-1 min-h-0 flex flex-col">
        {done ? (
          <FarinelliMockup live onComplete={onComplete} onSkip={onComplete} />
        ) : (
          <>
            {current.mockup === "hill" && <HillMockup />}
            {current.mockup === "farinelli" && <FarinelliMockup />}
          </>
        )}
      </div>

      {/* Spotlight + bubble (ring-only when done) */}
      <SpotlightOverlay
        target={done ? "next-skip" : current.target}
        containerRef={containerRef}
        text={done ? "" : current.text}
        extra={done ? undefined : current.extra}
        buttonLabel={done ? "" : current.button}
        onAction={handleAction}
        ringOnly={done}
      />
    </div>
  );
}
