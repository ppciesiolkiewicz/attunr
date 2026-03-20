"use client";

import { useRef, useEffect, useCallback } from "react";
import { useAnimationLoop } from "@/hooks/usePageVisible";
import { findClosestNote as findClosestResolvedNote, matchesNoteTarget } from "@/lib/pitch";
import type { ColoredNote } from "@/lib/VocalRange";

/** Typed wrapper — preserves ColoredNote return type when input is ColoredNote[]. */
function findClosestNote(hz: number, notes: ColoredNote[]): ColoredNote {
  return findClosestResolvedNote(hz, notes) as ColoredNote;
}

interface HillBallCanvasProps {
  bands: ColoredNote[];
  /** Ref updated synchronously by pitch detection — no React latency */
  currentHzRef: React.RefObject<number | null>;
  /** "up" = user pushes ball uphill (Hoo hoo), "down" = user pushes ball downhill (Low U) */
  direction: "up" | "down";
  /** Range accept value for in-tune detection */
  accept: "above" | "below";
}

// ── Layout constants ────────────────────────────────────────────────────────
const PAD_X = 40;
const TOP_Y_RATIO = 0.18;
const BOTTOM_Y_RATIO = 0.85;

// ── Ball ────────────────────────────────────────────────────────────────────
const BALL_RADIUS = 20;
const BALL_LERP = 0.08;

// ── Trail ───────────────────────────────────────────────────────────────────
const TRAIL_MAX = 14;
const TRAIL_INTERVAL_MS = 60;

// ── Note markers ────────────────────────────────────────────────────────────
const MARKER_RADIUS = 5;

/** How many semitones of deviation maps across the full slope for a single note. */
const RANGE_ST = 8;

/**
 * Map parameter t ∈ [0,1] to (x,y) on a smooth slope.
 * direction "down": high on left (t=0), low on right (t=1)
 * direction "up":   low on left (t=0), high on right (t=1)
 */
function slopePoint(
  t: number,
  W: number,
  H: number,
  direction: "up" | "down",
) {
  const x = PAD_X + t * (W - 2 * PAD_X);
  const topY = H * TOP_Y_RATIO;
  const bottomY = H * BOTTOM_Y_RATIO;

  // Smooth S-curve using cosine interpolation
  const s = (1 - Math.cos(Math.PI * t)) / 2;

  if (direction === "down") {
    // Left = high, right = low
    return { x, y: topY + s * (bottomY - topY) };
  }
  // Left = low, right = high
  return { x, y: bottomY - s * (bottomY - topY) };
}

/**
 * Map detected Hz to curve parameter t ∈ [0,1].
 * For "down" direction (Low U / accept "below"):
 *   lower pitch → higher t → further down the slope → good
 * For "up" direction (Hoo hoo / accept "above"):
 *   higher pitch → higher t → further up the slope → good
 */
function hzToT(
  hz: number,
  bands: ColoredNote[],
  direction: "up" | "down",
): number {
  if (bands.length === 0) return 0.5;

  // Use the middle band as the reference/threshold point
  const refBand = bands[Math.floor(bands.length / 2)];
  const semitones = 12 * Math.log2(hz / refBand.frequencyHz);

  if (direction === "down") {
    // Lower pitch (negative semitones) → higher t (further right/down)
    return 0.5 - (semitones / (2 * RANGE_ST));
  }
  // "up": Higher pitch (positive semitones) → higher t (further right/up)
  return 0.5 + (semitones / (2 * RANGE_ST));
}

export default function HillBallCanvas({
  bands,
  currentHzRef,
  direction,
  accept,
}: HillBallCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bandsRef = useRef<ColoredNote[]>([]);

  const ballTRef = useRef(0.2);
  const trailRef = useRef<{ t: number; ts: number }[]>([]);
  const lastTrailMs = useRef(0);

  useEffect(() => {
    bandsRef.current = [...bands].sort(
      (a, b) => a.frequencyHz - b.frequencyHz,
    );
    trailRef.current = [];
    ballTRef.current = 0.2;
  }, [bands]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    ctx?.scale(dpr, dpr);
  }, []);

  const flushStale = useCallback(() => {
    trailRef.current = [];
    lastTrailMs.current = 0;
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const container = canvas.parentElement;
    if (!container) return;
    const W = container.clientWidth;
    const H = container.clientHeight;
    const bands = bandsRef.current;
    const n = bands.length;
    const hz = currentHzRef.current;
    const now = performance.now();

    // ── Background ──────────────────────────────────────────────────────
    ctx.fillStyle = "#080810";
    ctx.fillRect(0, 0, W, H);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "rgba(120,60,200,0.04)");
    bgGrad.addColorStop(1, "rgba(30,10,80,0.06)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    if (n === 0) return;

    // ── Slope track ─────────────────────────────────────────────────────
    const STEPS = 80;

    // Glow layer
    ctx.beginPath();
    for (let s = 0; s <= STEPS; s++) {
      const { x, y } = slopePoint(s / STEPS, W, H, direction);
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 10;
    ctx.stroke();

    // Main track line
    ctx.beginPath();
    for (let s = 0; s <= STEPS; s++) {
      const { x, y } = slopePoint(s / STEPS, W, H, direction);
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // ── Compute note t positions ───────────────────────────────────────
    const refBand = bands[Math.floor(n / 2)];
    const noteTs: number[] = [];
    for (let i = 0; i < n; i++) {
      const semitones = 12 * Math.log2(bands[i].frequencyHz / refBand.frequencyHz);
      let t: number;
      if (direction === "down") {
        t = 0.5 - (semitones / (2 * RANGE_ST));
      } else {
        t = 0.5 + (semitones / (2 * RANGE_ST));
      }
      noteTs.push(Math.max(0.05, Math.min(0.95, t)));
    }

    // ── Goal zone highlight — starts at the first note ──────────────────
    const goalStart = Math.min(...noteTs);
    ctx.beginPath();
    for (let s = Math.floor(goalStart * STEPS); s <= STEPS; s++) {
      const { x, y } = slopePoint(s / STEPS, W, H, direction);
      s === Math.floor(goalStart * STEPS)
        ? ctx.moveTo(x, y)
        : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(167,139,250,0.12)";
    ctx.lineWidth = 14;
    ctx.stroke();

    // ── Arrow indicators along the slope ────────────────────────────────
    const arrowPositions = [0.15, 0.35, 0.55, 0.75];
    for (const ap of arrowPositions) {
      const { x, y } = slopePoint(ap, W, H, direction);
      const { x: nx, y: ny } = slopePoint(ap + 0.02, W, H, direction);
      const angle = Math.atan2(ny - y, nx - x);
      const alpha = ap > goalStart ? 0.12 : 0.06;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-6, -5);
      ctx.lineTo(4, 0);
      ctx.lineTo(-6, 5);
      ctx.strokeStyle = `rgba(167,139,250,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // ── Note markers — on the slope ─────────────────────────────────────
    for (let i = 0; i < n; i++) {
      const band = bands[i];
      const t = noteTs[i];
      const { x, y } = slopePoint(t, W, H, direction);
      const isRef = i === Math.floor(n / 2);

      // Radial glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, MARKER_RADIUS * 5);
      glow.addColorStop(0, `rgba(${band.rgb}, ${isRef ? 0.18 : 0.12})`);
      glow.addColorStop(1, `rgba(${band.rgb}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, MARKER_RADIUS * 5, 0, Math.PI * 2);
      ctx.fill();

      // Marker circle
      ctx.beginPath();
      ctx.arc(x, y, isRef ? MARKER_RADIUS : MARKER_RADIUS * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${band.rgb}, ${isRef ? 0.7 : 0.5})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${band.rgb}, ${isRef ? 0.9 : 0.6})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Note name label
      ctx.textAlign = "center";
      ctx.font = `${isRef ? 700 : 500} ${isRef ? 15 : 12}px system-ui, sans-serif`;
      ctx.fillStyle = `rgba(${band.rgb}, ${isRef ? 0.9 : 0.6})`;
      ctx.fillText(band.note, x, y + MARKER_RADIUS + 18);

      // Hz label (only for ref band)
      if (isRef) {
        ctx.font = "400 11px system-ui, sans-serif";
        ctx.fillStyle = `rgba(${band.rgb}, 0.5)`;
        ctx.fillText(`${band.frequencyHz} Hz`, x, y + MARKER_RADIUS + 32);
      }
    }

    // ── "Go lower" / "Go higher" label at the goal end ──────────────────
    const labelT = 0.88;
    const { x: lx, y: ly } = slopePoint(labelT, W, H, direction);
    ctx.textAlign = "center";
    ctx.font = "600 12px system-ui, sans-serif";
    ctx.fillStyle = "rgba(167,139,250,0.25)";
    ctx.fillText(
      direction === "down" ? "↓ Go lower" : "↑ Go higher",
      lx,
      ly + (direction === "down" ? -20 : 20),
    );

    // ── Ball + trail ────────────────────────────────────────────────────
    if (hz !== null) {
      const targetT = Math.max(-0.05, Math.min(1.1, hzToT(hz, bands, direction)));
      ballTRef.current += (targetT - ballTRef.current) * BALL_LERP;

      // Record trail
      if (now - lastTrailMs.current > TRAIL_INTERVAL_MS) {
        trailRef.current.push({ t: ballTRef.current, ts: now });
        if (trailRef.current.length > TRAIL_MAX) trailRef.current.shift();
        lastTrailMs.current = now;
      }

      const closest = findClosestNote(hz, bands);
      const inTune = matchesNoteTarget(hz, bands, accept);
      const { x: bx, y: by } = slopePoint(ballTRef.current, W, H, direction);

      // Trail — fading ghost balls
      const maxAge = TRAIL_MAX * TRAIL_INTERVAL_MS;
      for (const tr of trailRef.current) {
        const age = now - tr.ts;
        if (age > maxAge) continue;
        const frac = age / maxAge;
        const { x, y } = slopePoint(tr.t, W, H, direction);
        ctx.beginPath();
        ctx.arc(x, y, BALL_RADIUS * (1 - frac * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${closest.rgb}, ${(1 - frac) * 0.18})`;
        ctx.fill();
      }

      // Outer glow — stronger when in-tune / further along
      const pulse = (Math.sin(now / 400) + 1) / 2;
      const glowR =
        (inTune ? BALL_RADIUS * 3.5 : BALL_RADIUS * 2) +
        (inTune ? pulse * 10 : pulse * 3);

      const outerGlow = ctx.createRadialGradient(bx, by, 0, bx, by, glowR);
      outerGlow.addColorStop(
        0,
        `rgba(${closest.rgb}, ${inTune ? 0.3 : 0.1})`,
      );
      outerGlow.addColorStop(1, `rgba(${closest.rgb}, 0)`);
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(bx, by, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Ball body — 3D-ish radial gradient
      const bodyGrad = ctx.createRadialGradient(
        bx - BALL_RADIUS * 0.3,
        by - BALL_RADIUS * 0.3,
        BALL_RADIUS * 0.1,
        bx,
        by,
        BALL_RADIUS,
      );
      bodyGrad.addColorStop(
        0,
        `rgba(255,255,255,${inTune ? 0.95 : 0.7})`,
      );
      bodyGrad.addColorStop(
        0.4,
        `rgba(${closest.rgb},${inTune ? 0.9 : 0.6})`,
      );
      bodyGrad.addColorStop(
        1,
        `rgba(${closest.rgb},${inTune ? 0.55 : 0.3})`,
      );

      ctx.beginPath();
      ctx.arc(bx, by, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Specular highlight
      ctx.beginPath();
      ctx.arc(
        bx - BALL_RADIUS * 0.25,
        by - BALL_RADIUS * 0.25,
        BALL_RADIUS * 0.35,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = `rgba(255,255,255,${inTune ? 0.5 : 0.25})`;
      ctx.fill();
    } else {
      // No pitch — decay remaining trail
      const maxAge = TRAIL_MAX * TRAIL_INTERVAL_MS;
      trailRef.current = trailRef.current.filter(
        (t) => now - t.ts < maxAge,
      );

      if (trailRef.current.length > 0) {
        const midBand = bands[Math.floor(n / 2)];
        for (const tr of trailRef.current) {
          const age = now - tr.ts;
          const frac = age / maxAge;
          const { x, y } = slopePoint(tr.t, W, H, direction);
          ctx.beginPath();
          ctx.arc(x, y, BALL_RADIUS * (1 - frac * 0.6), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${midBand.rgb}, ${(1 - frac) * 0.12})`;
          ctx.fill();
        }
      }
    }
  }, [currentHzRef, direction, accept]);

  const startLoop = useAnimationLoop(render, flushStale);

  useEffect(() => {
    setupCanvas();
    startLoop();

    const observer = new ResizeObserver(setupCanvas);
    if (canvasRef.current?.parentElement) {
      observer.observe(canvasRef.current.parentElement);
    }

    return () => observer.disconnect();
  }, [startLoop, setupCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      aria-label="Hill ball pitch visualiser"
    />
  );
}
