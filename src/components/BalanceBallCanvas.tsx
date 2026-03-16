"use client";

import { useRef, useEffect, useCallback } from "react";
import { findClosestNote as findClosestResolvedNote, isInTune, matchesNoteTarget } from "@/lib/pitch";
import type { ColoredNote } from "@/constants/tone-slots";

/** Typed wrapper — preserves ColoredNote return type when input is ColoredNote[]. */
function findClosestNote(hz: number, notes: ColoredNote[]): ColoredNote {
  return findClosestResolvedNote(hz, notes) as ColoredNote;
}
import type { InTuneOverride } from "./PitchCanvas";

interface BalanceBallCanvasProps {
  bands: ColoredNote[];
  /** Ref updated synchronously by pitch detection — no React latency */
  currentHzRef: React.RefObject<number | null>;
  /** When set, non-listed band IDs are dimmed (Journey mode) */
  highlightIds?: string[];
  /** When set, use matchesNoteTarget instead of isInTune. For chest/head exercises. */
  inTuneOverride?: InTuneOverride;
}

// ── Curve layout ────────────────────────────────────────────────────────────
const CURVE_PAD_X = 40;
const CURVE_PEAK_Y_RATIO = 0.38; // Y of hill plateau (higher on screen)
const CURVE_EDGE_Y_RATIO = 0.72; // Y of slope bottoms (lower on screen)
/** Notes live on the flat plateau in [NOTE_INSET, 1−NOTE_INSET]; slopes are outside. */
const NOTE_INSET = 0.2;

// ── Ball ────────────────────────────────────────────────────────────────────
const BALL_RADIUS = 18;
const BALL_LERP = 0.08;

// ── Note markers ────────────────────────────────────────────────────────────
const MARKER_RADIUS = 5;

// ── Trail ───────────────────────────────────────────────────────────────────
const TRAIL_MAX = 14;
const TRAIL_INTERVAL_MS = 60;

/**
 * Map parameter t ∈ [0,1] to (x,y) on a smooth circular-style hill.
 * Peak at t = 0.5, descending symmetrically to both edges.
 */
function curvePoint(t: number, W: number, H: number) {
  const x = CURVE_PAD_X + t * (W - 2 * CURVE_PAD_X);
  const peakY = H * CURVE_PEAK_Y_RATIO;
  const edgeY = H * CURVE_EDGE_Y_RATIO;
  const depth = edgeY - peakY;

  // Smooth cosine hill — peak at center, slopes down to edges
  const drop = (1 - Math.cos(Math.PI * (2 * t - 1))) / 2;

  return { x, y: peakY + depth * drop };
}

/** How many semitones of deviation maps across the full note zone for a single note. */
const SINGLE_NOTE_RANGE_ST = 5;

/**
 * Map detected Hz to curve parameter t.
 * Notes are positioned in [NOTE_INSET, 1−NOTE_INSET].
 * Out-of-range pitch maps outside that zone → ball rolls down the slopes.
 */
function hzToT(hz: number, bands: ColoredNote[]): number {
  const n = bands.length;
  const noteRange = 1 - 2 * NOTE_INSET;

  if (n === 0) return 0.5;

  // Single note — map pitch deviation (in semitones) across the hill
  if (n === 1) {
    const semitones = 12 * Math.log2(hz / bands[0].frequencyHz);
    return 0.5 + (semitones / (2 * SINGLE_NOTE_RANGE_ST)) * noteRange;
  }

  let raw: number; // 0 = lowest band, 1 = highest band

  if (hz <= bands[0].frequencyHz) {
    const span = bands[1].frequencyHz - bands[0].frequencyHz;
    raw = span === 0 ? 0 : ((hz - bands[0].frequencyHz) / span) / (n - 1);
  } else if (hz >= bands[n - 1].frequencyHz) {
    const span = bands[n - 1].frequencyHz - bands[n - 2].frequencyHz;
    raw = span === 0 ? 1 : (n - 2 + (hz - bands[n - 2].frequencyHz) / span) / (n - 1);
  } else {
    raw = 0.5;
    for (let i = 0; i < n - 1; i++) {
      if (hz >= bands[i].frequencyHz && hz <= bands[i + 1].frequencyHz) {
        const span = bands[i + 1].frequencyHz - bands[i].frequencyHz;
        raw = span === 0 ? 0.5 : (i + (hz - bands[i].frequencyHz) / span) / (n - 1);
        break;
      }
    }
  }

  // Map note-space [0,1] → note zone [NOTE_INSET, 1−NOTE_INSET]
  return NOTE_INSET + raw * noteRange;
}

function checkInTune(
  hz: number,
  notes: ColoredNote[],
  closest: ColoredNote,
  override?: InTuneOverride,
): boolean {
  if (override?.bands.length) {
    return matchesNoteTarget(hz, override.bands, override.accept);
  }
  return isInTune(hz, closest.frequencyHz);
}

export default function BalanceBallCanvas({
  bands,
  currentHzRef,
  highlightIds,
  inTuneOverride,
}: BalanceBallCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bandsRef = useRef<ColoredNote[]>([]);
  const highlightIdsRef = useRef(highlightIds);
  const inTuneOverrideRef = useRef(inTuneOverride);
  const rafRef = useRef<number | null>(null);

  const ballTRef = useRef(0.5);
  const trailRef = useRef<{ t: number; ts: number }[]>([]);
  const lastTrailMs = useRef(0);

  useEffect(() => {
    bandsRef.current = [...bands].sort((a, b) => a.frequencyHz - b.frequencyHz);
    trailRef.current = [];
    ballTRef.current = 0.5;
  }, [bands]);

  useEffect(() => {
    highlightIdsRef.current = highlightIds;
  }, [highlightIds]);

  useEffect(() => {
    inTuneOverrideRef.current = inTuneOverride;
  }, [inTuneOverride]);

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

  const render = useCallback(() => {
    rafRef.current = requestAnimationFrame(render);

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
    const override = inTuneOverrideRef.current;
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

    // ── Curve track ─────────────────────────────────────────────────────
    const STEPS = 80;

    // Glow layer (wide, faint)
    ctx.beginPath();
    for (let s = 0; s <= STEPS; s++) {
      const { x, y } = curvePoint(s / STEPS, W, H);
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 10;
    ctx.stroke();

    // Main track line
    ctx.beginPath();
    for (let s = 0; s <= STEPS; s++) {
      const { x, y } = curvePoint(s / STEPS, W, H);
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // ── Note markers ────────────────────────────────────────────────────
    for (let i = 0; i < n; i++) {
      const band = bands[i];
      const t = n === 1 ? 0.5 : NOTE_INSET + (i / (n - 1)) * (1 - 2 * NOTE_INSET);
      const { x, y } = curvePoint(t, W, H);
      const highlighted =
        !highlightIdsRef.current ||
        highlightIdsRef.current.includes(band.id);
      const dim = highlighted ? 1 : 0.4;

      // Radial glow around marker
      const glow = ctx.createRadialGradient(x, y, 0, x, y, MARKER_RADIUS * 5);
      glow.addColorStop(0, `rgba(${band.rgb}, ${0.18 * dim})`);
      glow.addColorStop(1, `rgba(${band.rgb}, 0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, MARKER_RADIUS * 5, 0, Math.PI * 2);
      ctx.fill();

      // Marker circle
      ctx.beginPath();
      ctx.arc(x, y, MARKER_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${band.rgb}, ${0.7 * dim})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${band.rgb}, ${0.9 * dim})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Note name label (below marker on the hill)
      ctx.textAlign = "center";
      ctx.font = "700 15px system-ui, sans-serif";
      ctx.fillStyle = `rgba(${band.rgb}, ${0.92 * dim})`;
      ctx.fillText(band.note, x, y + MARKER_RADIUS + 18);

      // Hz label
      ctx.font = "400 11px system-ui, sans-serif";
      ctx.fillStyle = `rgba(${band.rgb}, ${0.55 * dim})`;
      ctx.fillText(`${band.frequencyHz} Hz`, x, y + MARKER_RADIUS + 32);
    }

    // ── Ball + trail ────────────────────────────────────────────────────
    if (hz !== null) {
      const targetT = Math.max(-0.15, Math.min(1.15, hzToT(hz, bands)));
      ballTRef.current += (targetT - ballTRef.current) * BALL_LERP;

      // Record trail position
      if (now - lastTrailMs.current > TRAIL_INTERVAL_MS) {
        trailRef.current.push({ t: ballTRef.current, ts: now });
        if (trailRef.current.length > TRAIL_MAX) trailRef.current.shift();
        lastTrailMs.current = now;
      }

      const closest = findClosestNote(hz, bands);
      const inTune = checkInTune(hz, bands, closest, override);
      const { x: bx, y: by } = curvePoint(ballTRef.current, W, H);

      // Trail — fading ghost balls
      const maxAge = TRAIL_MAX * TRAIL_INTERVAL_MS;
      for (const tr of trailRef.current) {
        const age = now - tr.ts;
        if (age > maxAge) continue;
        const frac = age / maxAge;
        const { x, y } = curvePoint(tr.t, W, H);
        ctx.beginPath();
        ctx.arc(x, y, BALL_RADIUS * (1 - frac * 0.6), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${closest.rgb}, ${(1 - frac) * 0.18})`;
        ctx.fill();
      }

      // Outer glow (pulsing when in-tune)
      const pulse = (Math.sin(now / 400) + 1) / 2;
      const glowR =
        (inTune ? BALL_RADIUS * 3.5 : BALL_RADIUS * 2) +
        (inTune ? pulse * 10 : pulse * 3);

      const outerGlow = ctx.createRadialGradient(bx, by, 0, bx, by, glowR);
      outerGlow.addColorStop(0, `rgba(${closest.rgb}, ${inTune ? 0.28 : 0.1})`);
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
      bodyGrad.addColorStop(0, `rgba(255,255,255,${inTune ? 0.95 : 0.7})`);
      bodyGrad.addColorStop(0.4, `rgba(${closest.rgb},${inTune ? 0.9 : 0.6})`);
      bodyGrad.addColorStop(1, `rgba(${closest.rgb},${inTune ? 0.55 : 0.3})`);

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
      trailRef.current = trailRef.current.filter((t) => now - t.ts < maxAge);

      if (trailRef.current.length > 0) {
        const midBand = bands[Math.floor(n / 2)];
        for (const tr of trailRef.current) {
          const age = now - tr.ts;
          const frac = age / maxAge;
          const { x, y } = curvePoint(tr.t, W, H);
          ctx.beginPath();
          ctx.arc(x, y, BALL_RADIUS * (1 - frac * 0.6), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${midBand.rgb}, ${(1 - frac) * 0.12})`;
          ctx.fill();
        }
      }
    }
  }, [currentHzRef]);

  useEffect(() => {
    setupCanvas();
    rafRef.current = requestAnimationFrame(render);

    const observer = new ResizeObserver(setupCanvas);
    if (canvasRef.current?.parentElement) {
      observer.observe(canvasRef.current.parentElement);
    }

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [render, setupCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      aria-label="Balance ball pitch visualiser"
    />
  );
}
