"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  findClosestBand,
  isInTune,
  matchesBandTarget,
  pitchConfidence,
} from "@/lib/pitch";
import type { Band } from "@/constants/chakras";

interface PitchDot {
  hz: number;
  ts: number; // performance.now() when captured — used for time-based scrolling
}

/** When set, use this instead of exact-pitch isInTune. E.g. "below" = chest voice (any tone low enough), "above" = head voice. */
export type InTuneOverride = {
  bands: Band[];
  accept: "within" | "below" | "above";
};

interface PitchCanvasProps {
  bands: Band[];
  /** Ref updated synchronously by the pitch detection hook — no React latency */
  currentHzRef: React.RefObject<number | null>;
  /** When set, non-listed band IDs are dimmed (Journey mode) */
  highlightIds?: string[];
  /** When set, use matchesBandTarget(hz, bands, accept) instead of isInTune. For chest/head exercises. */
  inTuneOverride?: InTuneOverride;
  onBandClick?: (band: Band) => void;
  /** When true, show chakra name labels (e.g. "HEART CHAKRA") on chakra-slot bands. False = note + Hz only. */
  showChakraLabels?: boolean;
  /** When true, use generous tolerance for dot rendering so lip roll exercises look more encouraging. */
  lipRollMode?: boolean;
}

const DOT_INTERVAL_MS = 85;
const MAX_DOTS = 90;
const DOT_SPACING_PX = 8;
/** Pixels per millisecond — constant scroll speed regardless of whether pitch is detected */
const PX_PER_MS = DOT_SPACING_PX / DOT_INTERVAL_MS;
/** Dots older than this are discarded (~7.6 s of history) */
const DOT_MAX_AGE_MS = MAX_DOTS * DOT_INTERVAL_MS;
const DOT_RADIUS = 5;
const NEWEST_X = 0.68;

/**
 * Minimum distance from the top edge to the highest band. Large enough so that
 * the Hz readout overlay (absolute top-left) never overlaps the top band.
 */
const PAD_TOP_MIN = 96;
/** Minimum distance from the bottom edge to the lowest band. */
const PAD_BOTTOM_MIN = 50;
/**
 * Maximum vertical slot between adjacent bands. Caps the spread on tall
 * screens so the bands stay tightly grouped rather than filling all space.
 */
const MAX_SLOT_H = 68;
/** Left padding before dashed band line when showing chakra labels */
const LINE_START_X_CHAKRA = 118;
/** Left padding before dashed band line when showing note + Hz only */
const LINE_START_X_PLAIN = 82;

/**
 * Compute the Y positions of the lowest (bottom) and highest (top) bands given
 * the canvas height and number of bands. The cluster is centred vertically
 * while honouring PAD_TOP_MIN and the MAX_SLOT_H cap.
 */
function computeBandLayout(n: number, H: number) {
  if (n <= 1) {
    const mid = H / 2;
    return { topY: mid, bottomY: mid, clusterH: 0, slotH: 0 };
  }
  const maxClusterH = (n - 1) * MAX_SLOT_H;
  const naturalH = Math.max(0, H - PAD_TOP_MIN - PAD_BOTTOM_MIN);
  const clusterH = Math.min(maxClusterH, naturalH);
  const idealTopY = (H - clusterH) / 2;
  const topY = Math.max(PAD_TOP_MIN, idealTopY);
  const bottomY = topY + clusterH;
  return { topY, bottomY, clusterH, slotH: clusterH / (n - 1) };
}

/**
 * Y position of band at sorted index idx.
 * idx 0 = lowest (bottomY, lower on screen), idx n-1 = highest (topY, higher).
 */
function bandIndexY(idx: number, n: number, bottomY: number, topY: number): number {
  if (n <= 1) return (bottomY + topY) / 2;
  return bottomY - (idx / (n - 1)) * (bottomY - topY);
}

/**
 * Map a detected Hz value to canvas Y by linear interpolation in band-index
 * space. Adjacent bands are always equally spaced visually, regardless of
 * their actual Hz gap. Requires bands[] sorted ascending by frequencyHz.
 */
function hzToY(hz: number, bands: Band[], bottomY: number, topY: number): number {
  const n = bands.length;
  if (n <= 1) return (bottomY + topY) / 2;

  const idxY = (i: number) => bandIndexY(i, n, bottomY, topY);

  // Below lowest — extrapolate
  if (hz <= bands[0].frequencyHz) {
    const t =
      (hz - bands[0].frequencyHz) /
      (bands[1].frequencyHz - bands[0].frequencyHz);
    return idxY(0) + t * (idxY(1) - idxY(0));
  }

  // Above highest — extrapolate
  if (hz >= bands[n - 1].frequencyHz) {
    const t =
      (hz - bands[n - 2].frequencyHz) /
      (bands[n - 1].frequencyHz - bands[n - 2].frequencyHz);
    return idxY(n - 2) + t * (idxY(n - 1) - idxY(n - 2));
  }

  // Interpolate between the two bracketing bands
  for (let i = 0; i < n - 1; i++) {
    if (hz >= bands[i].frequencyHz && hz <= bands[i + 1].frequencyHz) {
      const t =
        (hz - bands[i].frequencyHz) /
        (bands[i + 1].frequencyHz - bands[i].frequencyHz);
      return idxY(i) + t * (idxY(i + 1) - idxY(i));
    }
  }

  return (bottomY + topY) / 2;
}

function checkInTune(
  hz: number,
  bands: Band[],
  closest: Band,
  override?: InTuneOverride,
  lipRoll?: boolean,
): boolean {
  if (override && override.bands.length > 0) {
    return matchesBandTarget(hz, override.bands, override.accept);
  }
  return isInTune(hz, closest.frequencyHz, lipRoll ? 0.15 : 0.03);
}

export default function PitchCanvas({
  bands,
  currentHzRef,
  highlightIds,
  inTuneOverride,
  onBandClick,
  showChakraLabels = false,
  lipRollMode = false,
}: PitchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<PitchDot[]>([]);
  /** Kept sorted ascending by frequencyHz so index-based rendering is correct */
  const bandsRef = useRef<Band[]>([]);
  const highlightIdsRef = useRef<string[] | undefined>(highlightIds);
  const inTuneOverrideRef = useRef<InTuneOverride | undefined>(inTuneOverride);
  const showChakraLabelsRef = useRef(showChakraLabels);
  const lipRollModeRef = useRef(lipRollMode);
  const lastDotMs = useRef(0);
  const rafRef = useRef<number | null>(null);
  /** Stores canvas dimensions + computed band positions for the click handler */
  const layoutRef = useRef({ W: 0, H: 0, bottomY: 0, topY: 0 });

  // Sort on every prop change and flush stale dots so they don't appear in
  // the wrong position after a frequency-mode switch.
  useEffect(() => {
    bandsRef.current = [...bands].sort(
      (a, b) => a.frequencyHz - b.frequencyHz
    );
    dotsRef.current = [];
  }, [bands]);

  useEffect(() => {
    highlightIdsRef.current = highlightIds;
  }, [highlightIds]);

  useEffect(() => {
    inTuneOverrideRef.current = inTuneOverride;
  }, [inTuneOverride]);

  useEffect(() => {
    showChakraLabelsRef.current = showChakraLabels;
  }, [showChakraLabels]);

  useEffect(() => {
    lipRollModeRef.current = lipRollMode;
  }, [lipRollMode]);

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

    layoutRef.current = { ...layoutRef.current, W: w, H: h };
  }, []);

  const render = useCallback(() => {
    // Schedule next frame first so the loop survives any early return.
    rafRef.current = requestAnimationFrame(render);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { W, H } = layoutRef.current;
    const bands = bandsRef.current;
    const n = bands.length;
    const hz = currentHzRef.current;
    const newestX = W * NEWEST_X;

    // ── Band layout (computed fresh each frame so it adapts to resize) ────────
    const { topY, bottomY, slotH } = computeBandLayout(n, H);
    layoutRef.current.topY = topY;
    layoutRef.current.bottomY = bottomY;

    const bh = Math.min(slotH * 0.42, 32);
    const idxY = (i: number) => bandIndexY(i, n, bottomY, topY);

    // ── Background ────────────────────────────────────────────────────────────
    ctx.fillStyle = "#080810";
    ctx.fillRect(0, 0, W, H);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "rgba(120,60,200,0.04)");
    bgGrad.addColorStop(1, "rgba(30,10,80,0.06)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const override = inTuneOverrideRef.current;
    const lipRoll = lipRollModeRef.current;
    const getInTune = (h: number) => {
      const closest = findClosestBand(h, bands);
      return checkInTune(h, bands, closest, override, lipRoll);
    };

    // ── Bands + left labels ────────────────────────────────────────────────
    for (let i = 0; i < n; i++) {
      const band = bands[i]; // sorted low → high
      const cy = idxY(i);
      const active =
        hz !== null &&
        (override && override.bands.length > 0
          ? getInTune(hz) && override.bands.some((b) => b.id === band.id)
          : isInTune(hz, band.frequencyHz));
      const highlighted =
        !highlightIdsRef.current ||
        highlightIdsRef.current.includes(band.id);
      const dim = highlighted ? 1 : 0.5;

      // Band fill — feathered gradient centred on cy
      const grad = ctx.createLinearGradient(0, cy - bh, 0, cy + bh);
      const bandAlpha = (active ? 0.28 : 0.18) * dim;
      grad.addColorStop(0, `rgba(${band.rgb}, 0)`);
      grad.addColorStop(0.5, `rgba(${band.rgb}, ${bandAlpha})`);
      grad.addColorStop(1, `rgba(${band.rgb}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, cy - bh, W, bh * 2);

      // Dashed centre line (starts after labels to avoid overlap)
      const showAsChakra = showChakraLabelsRef.current && band.isChakraSlot;
      const lineStartX = showAsChakra ? LINE_START_X_CHAKRA : LINE_START_X_PLAIN;
      ctx.save();
      ctx.setLineDash([3, 7]);
      ctx.strokeStyle = `rgba(${band.rgb}, ${(active ? 0.78 : 0.6) * dim})`;
      ctx.lineWidth = active ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(lineStartX, cy);
      ctx.lineTo(W, cy);
      ctx.stroke();
      ctx.restore();

      // ── Left labels ─────────────────────────────────────────────────────────
      ctx.textAlign = "left";

      // Note letter — large, acts as a musical anchor
      ctx.font = `700 19px system-ui, sans-serif`;
      ctx.fillStyle = `rgba(${band.rgb}, ${(active ? 1 : 0.92) * dim})`;
      ctx.fillText(band.note, 12, cy + 3);
      const noteW = ctx.measureText(band.note).width;

      if (showAsChakra) {
        // Chakra name + "Chakra" suffix — only for chakra-slot bands in Part 9
        ctx.font = `600 12px system-ui, sans-serif`;
        ctx.fillStyle = `rgba(${band.rgb}, ${(active ? 0.95 : 0.88) * dim})`;
        ctx.fillText(band.name.toUpperCase() + " CHAKRA", 32, cy - 3);

        ctx.font = `400 11px system-ui, sans-serif`;
        ctx.fillStyle = `rgba(${band.rgb}, ${(active ? 0.82 : 0.65) * dim})`;
        ctx.fillText(`${band.frequencyHz} Hz`, 32, cy + 9);
      } else {
        // Hz label — positioned after the note letter with a gap
        ctx.font = `400 11px system-ui, sans-serif`;
        ctx.fillStyle = `rgba(${band.rgb}, ${(active ? 0.82 : 0.65) * dim})`;
        ctx.fillText(`${band.frequencyHz} Hz`, 12 + noteW + 9, cy + 1);
      }
    }

    // ── Accumulate trail dot (every DOT_INTERVAL_MS) ─────────────────────────
    const now = performance.now();
    if (hz !== null && now - lastDotMs.current > DOT_INTERVAL_MS) {
      dotsRef.current.push({ hz, ts: now });
      lastDotMs.current = now;
    }

    dotsRef.current = dotsRef.current.filter(
      (d) => now - d.ts < DOT_MAX_AGE_MS
    );

    // ── Draw trail ────────────────────────────────────────────────────────────
    for (const dot of dotsRef.current) {
      const ageMs = now - dot.ts;
      const x = newestX - ageMs * PX_PER_MS;
      if (x < 0) continue;

      const ageFraction = ageMs / DOT_MAX_AGE_MS;
      const opacity = (1 - ageFraction) * 0.8;
      const r = DOT_RADIUS * (1 - ageFraction * 0.5);
      const y = hzToY(dot.hz, bands, bottomY, topY);
      const closest = findClosestBand(dot.hz, bands);
      const inTune = checkInTune(dot.hz, bands, closest, override, lipRoll);

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);

      if (inTune) {
        ctx.fillStyle = `rgba(${closest.rgb}, ${opacity})`;
        ctx.fill();
      } else {
        ctx.strokeStyle = `rgba(${closest.rgb}, ${opacity * 0.65})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // ── Live cursor dot + waveform ring (60 fps) ──────────────────────────────
    if (hz !== null) {
      const y = hzToY(hz, bands, bottomY, topY);
      const closest = findClosestBand(hz, bands);
      const inTune = checkInTune(hz, bands, closest, override, lipRoll);
      const conf = pitchConfidence(hz, bands);

      const pulse = (Math.sin(now / 500) + 1) / 2;
      const ringRadius = DOT_RADIUS + 4 + conf * 6 + pulse * 3;
      const ringOpacity = conf * 0.55 + pulse * 0.1;

      ctx.beginPath();
      ctx.arc(newestX, y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${closest.rgb}, ${ringOpacity})`;
      ctx.lineWidth = inTune ? 1.5 : 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(newestX, y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${closest.rgb}, ${inTune ? 1 : 0.75})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(newestX, y, DOT_RADIUS * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.82)";
      ctx.fill();

      ctx.save();
      ctx.setLineDash([2, 5]);
      ctx.strokeStyle = `rgba(${closest.rgb}, 0.35)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(newestX + ringRadius + 4, y);
      ctx.lineTo(W - 16, y);
      ctx.stroke();
      ctx.restore();
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

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onBandClick) return;
      const rect = canvasRef.current!.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const { bottomY, topY } = layoutRef.current;
      const bands = bandsRef.current;
      const n = bands.length;
      if (n === 0 || bottomY === topY) return;

      const idx = ((bottomY - clickY) / (bottomY - topY)) * (n - 1);
      const nearest = Math.max(0, Math.min(n - 1, Math.round(idx)));
      onBandClick(bands[nearest]);
    },
    [onBandClick]
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="block w-full h-full cursor-pointer"
      aria-label="Vocal placement pitch visualiser"
    />
  );
}
