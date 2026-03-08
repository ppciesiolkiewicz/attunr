"use client";

import { useRef, useEffect, useCallback } from "react";
import { findClosestChakra, isInTune, pitchConfidence } from "@/constants/chakras";
import type { Chakra } from "@/constants/chakras";

interface PitchDot {
  hz: number;
  ts: number; // performance.now() when captured — used for time-based scrolling
}

interface PitchCanvasProps {
  chakras: Chakra[];
  /** Ref updated synchronously by the pitch detection hook — no React latency */
  currentHzRef: React.RefObject<number | null>;
  /** When set, non-listed chakras are dimmed (Journey mode) */
  highlightIds?: string[];
  onChakraClick?: (chakra: Chakra) => void;
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
 * Minimum distance from the top edge to the Crown band. Large enough so that
 * the Hz readout overlay (absolute top-left) never overlaps the top band.
 */
const PAD_TOP_MIN = 96;
/** Minimum distance from the bottom edge to the Root band. */
const PAD_BOTTOM_MIN = 50;
/**
 * Maximum vertical slot between adjacent bands. Caps the spread on tall
 * screens so the bands stay tightly grouped rather than filling all space.
 */
const MAX_SLOT_H = 68;

/**
 * Compute the Y positions of the Root (bottom) and Crown (top) bands given
 * the canvas height and number of chakras. The cluster is centred vertically
 * while honouring PAD_TOP_MIN and the MAX_SLOT_H cap.
 */
function computeBandLayout(n: number, H: number) {
  if (n <= 1) {
    const mid = H / 2;
    return { crownY: mid, rootY: mid, clusterH: 0, slotH: 0 };
  }
  const maxClusterH = (n - 1) * MAX_SLOT_H;
  const naturalH = Math.max(0, H - PAD_TOP_MIN - PAD_BOTTOM_MIN);
  const clusterH = Math.min(maxClusterH, naturalH);
  // Centre the cluster, but never closer than PAD_TOP_MIN to the top edge
  const idealCrownY = (H - clusterH) / 2;
  const crownY = Math.max(PAD_TOP_MIN, idealCrownY);
  const rootY = crownY + clusterH;
  return { crownY, rootY, clusterH, slotH: clusterH / (n - 1) };
}

/**
 * Y position of chakra at sorted index idx.
 * idx 0 = Root (rootY, lower on screen), idx n-1 = Crown (crownY, higher).
 */
function chakraIndexY(idx: number, n: number, rootY: number, crownY: number): number {
  if (n <= 1) return (rootY + crownY) / 2;
  return rootY - (idx / (n - 1)) * (rootY - crownY);
}

/**
 * Map a detected Hz value to canvas Y by linear interpolation in chakra-index
 * space. Adjacent chakras are always equally spaced visually, regardless of
 * their actual Hz gap. Requires chakras[] sorted ascending by frequencyHz.
 */
function hzToY(hz: number, chakras: Chakra[], rootY: number, crownY: number): number {
  const n = chakras.length;
  if (n <= 1) return (rootY + crownY) / 2;

  const idxY = (i: number) => chakraIndexY(i, n, rootY, crownY);

  // Below Root — extrapolate using Root→Sacral slope
  if (hz <= chakras[0].frequencyHz) {
    const t =
      (hz - chakras[0].frequencyHz) /
      (chakras[1].frequencyHz - chakras[0].frequencyHz);
    return idxY(0) + t * (idxY(1) - idxY(0));
  }

  // Above Crown — extrapolate using ThirdEye→Crown slope
  if (hz >= chakras[n - 1].frequencyHz) {
    const t =
      (hz - chakras[n - 2].frequencyHz) /
      (chakras[n - 1].frequencyHz - chakras[n - 2].frequencyHz);
    return idxY(n - 2) + t * (idxY(n - 1) - idxY(n - 2));
  }

  // Interpolate between the two bracketing chakras
  for (let i = 0; i < n - 1; i++) {
    if (hz >= chakras[i].frequencyHz && hz <= chakras[i + 1].frequencyHz) {
      const t =
        (hz - chakras[i].frequencyHz) /
        (chakras[i + 1].frequencyHz - chakras[i].frequencyHz);
      return idxY(i) + t * (idxY(i + 1) - idxY(i));
    }
  }

  return (rootY + crownY) / 2;
}

export default function PitchCanvas({
  chakras,
  currentHzRef,
  highlightIds,
  onChakraClick,
}: PitchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<PitchDot[]>([]);
  /** Kept sorted ascending by frequencyHz so index-based rendering is correct */
  const chakrasRef = useRef<Chakra[]>([]);
  const highlightIdsRef = useRef<string[] | undefined>(highlightIds);
  const lastDotMs = useRef(0);
  const rafRef = useRef<number | null>(null);
  /** Stores canvas dimensions + computed band positions for the click handler */
  const layoutRef = useRef({ W: 0, H: 0, rootY: 0, crownY: 0 });

  // Sort on every prop change and flush stale dots so they don't appear in
  // the wrong position after a frequency-mode switch.
  useEffect(() => {
    chakrasRef.current = [...chakras].sort(
      (a, b) => a.frequencyHz - b.frequencyHz
    );
    dotsRef.current = [];
  }, [chakras]);

  useEffect(() => {
    highlightIdsRef.current = highlightIds;
  }, [highlightIds]);

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
    const chakras = chakrasRef.current;
    const n = chakras.length;
    const hz = currentHzRef.current;
    const newestX = W * NEWEST_X;

    // ── Band layout (computed fresh each frame so it adapts to resize) ────────
    const { crownY, rootY, slotH } = computeBandLayout(n, H);
    // Persist in ref so the click handler can use the same values
    layoutRef.current.crownY = crownY;
    layoutRef.current.rootY = rootY;

    const bh = Math.min(slotH * 0.42, 32);
    const idxY = (i: number) => chakraIndexY(i, n, rootY, crownY);

    // ── Background ────────────────────────────────────────────────────────────
    ctx.fillStyle = "#080810";
    ctx.fillRect(0, 0, W, H);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "rgba(120,60,200,0.04)");
    bgGrad.addColorStop(1, "rgba(30,10,80,0.06)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ── Chakra bands + left labels ────────────────────────────────────────────
    for (let i = 0; i < n; i++) {
      const chakra = chakras[i]; // sorted Root → Crown
      const cy = idxY(i);
      const active = hz !== null && isInTune(hz, chakra.frequencyHz);
      const highlighted =
        !highlightIdsRef.current ||
        highlightIdsRef.current.includes(chakra.id);
      const dim = highlighted ? 1 : 0.2;

      // Band fill — feathered gradient centred on cy
      const grad = ctx.createLinearGradient(0, cy - bh, 0, cy + bh);
      const bandAlpha = (active ? 0.22 : 0.13) * dim;
      grad.addColorStop(0, `rgba(${chakra.rgb}, 0)`);
      grad.addColorStop(0.5, `rgba(${chakra.rgb}, ${bandAlpha})`);
      grad.addColorStop(1, `rgba(${chakra.rgb}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, cy - bh, W, bh * 2);

      // Dashed centre line (full width)
      ctx.save();
      ctx.setLineDash([3, 7]);
      ctx.strokeStyle = `rgba(${chakra.rgb}, ${(active ? 0.6 : 0.38) * dim})`;
      ctx.lineWidth = active ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(W, cy);
      ctx.stroke();
      ctx.restore();

      // ── Left labels ─────────────────────────────────────────────────────────
      ctx.textAlign = "left";

      // Note letter — large, acts as a musical anchor
      ctx.font = `700 17px system-ui, sans-serif`;
      ctx.fillStyle = `rgba(${chakra.rgb}, ${(active ? 1 : 0.82) * dim})`;
      ctx.fillText(chakra.note, 12, cy + 3);

      // Chakra name — medium, stacked to the right of the note
      ctx.font = `600 13px system-ui, sans-serif`;
      ctx.fillStyle = `rgba(${chakra.rgb}, ${(active ? 0.9 : 0.7) * dim})`;
      ctx.fillText(chakra.name.toUpperCase(), 32, cy - 4);

      // Frequency — small and muted, below the name
      ctx.font = `400 10px system-ui, sans-serif`;
      ctx.fillStyle = `rgba(${chakra.rgb}, ${(active ? 0.65 : 0.45) * dim})`;
      ctx.fillText(`${chakra.frequencyHz} Hz`, 32, cy + 9);
    }

    // ── Accumulate trail dot (every DOT_INTERVAL_MS) ─────────────────────────
    const now = performance.now();
    if (hz !== null && now - lastDotMs.current > DOT_INTERVAL_MS) {
      dotsRef.current.push({ hz, ts: now });
      lastDotMs.current = now;
    }

    // Expire old dots — they scroll off the left edge naturally during silence
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
      const y = hzToY(dot.hz, chakras, rootY, crownY);
      const closest = findClosestChakra(dot.hz, chakras);
      const inTune = isInTune(dot.hz, closest.frequencyHz);

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);

      if (inTune) {
        ctx.fillStyle = `rgba(${closest.rgb}, ${opacity})`;
        ctx.fill();
      } else {
        ctx.strokeStyle = `rgba(${closest.rgb}, ${opacity * 0.55})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // ── Live cursor dot + waveform ring (60 fps) ──────────────────────────────
    if (hz !== null) {
      const y = hzToY(hz, chakras, rootY, crownY);
      const closest = findClosestChakra(hz, chakras);
      const inTune = isInTune(hz, closest.frequencyHz);
      const conf = pitchConfidence(hz, chakras);

      // Waveform ring — pulses at ~2 Hz, expands with confidence
      const pulse = (Math.sin(now / 500) + 1) / 2;
      const ringRadius = DOT_RADIUS + 4 + conf * 6 + pulse * 3;
      const ringOpacity = conf * 0.55 + pulse * 0.1;

      ctx.beginPath();
      ctx.arc(newestX, y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${closest.rgb}, ${ringOpacity})`;
      ctx.lineWidth = inTune ? 1.5 : 1;
      ctx.stroke();

      // Main live dot
      ctx.beginPath();
      ctx.arc(newestX, y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${closest.rgb}, ${inTune ? 1 : 0.65})`;
      ctx.fill();

      // White core
      ctx.beginPath();
      ctx.arc(newestX, y, DOT_RADIUS * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fill();

      // Horizontal pitch indicator dash — extends rightward from the ring
      ctx.save();
      ctx.setLineDash([2, 5]);
      ctx.strokeStyle = `rgba(${closest.rgb}, 0.25)`;
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
      if (!onChakraClick) return;
      const rect = canvasRef.current!.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const { rootY, crownY } = layoutRef.current;
      const chakras = chakrasRef.current;
      const n = chakras.length;
      if (n === 0 || rootY === crownY) return;

      // Invert chakraIndexY: idx = (rootY - clickY) / (rootY - crownY) * (n - 1)
      const idx = ((rootY - clickY) / (rootY - crownY)) * (n - 1);
      const nearest = Math.max(0, Math.min(n - 1, Math.round(idx)));
      onChakraClick(chakras[nearest]);
    },
    [onChakraClick]
  );

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="block w-full h-full cursor-pointer"
      aria-label="Chakra frequency pitch visualiser"
    />
  );
}
