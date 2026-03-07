"use client";

import { useRef, useEffect, useCallback } from "react";
import { findClosestChakra, isInTune } from "@/constants/chakras";
import type { Chakra } from "@/constants/chakras";

interface PitchDot {
  hz: number;
}

interface PitchCanvasProps {
  chakras: Chakra[];
  currentHz: number | null;
  onChakraClick?: (chakra: Chakra) => void;
}

const DOT_INTERVAL_MS = 85;
const MAX_DOTS = 90;
const DOT_SPACING_PX = 8;
const DOT_RADIUS = 5;
/** Newest dot is drawn at this fraction of canvas width */
const NEWEST_X = 0.68;

function freqToY(hz: number, minHz: number, maxHz: number, h: number): number {
  const t = (Math.log(hz) - Math.log(minHz)) / (Math.log(maxHz) - Math.log(minHz));
  return h - t * h; // low freq at bottom
}

export default function PitchCanvas({ chakras, currentHz, onChakraClick }: PitchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<PitchDot[]>([]);
  const currentHzRef = useRef<number | null>(null);
  const chakrasRef = useRef<Chakra[]>(chakras);
  const lastDotMs = useRef(0);
  const rafRef = useRef<number | null>(null);
  const dprRef = useRef(1);

  useEffect(() => { currentHzRef.current = currentHz; }, [currentHz]);
  useEffect(() => { chakrasRef.current = chakras; }, [chakras]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
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
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = dprRef.current;
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const chakras = chakrasRef.current;
    const hz = currentHzRef.current;

    const freqs = chakras.map((c) => c.frequencyHz);
    const minHz = Math.min(...freqs) * 0.76;
    const maxHz = Math.max(...freqs) * 1.30;
    const toY = (f: number) => freqToY(f, minHz, maxHz, H);

    // ── Background ────────────────────────────────────────────────────────────
    ctx.fillStyle = "#080810";
    ctx.fillRect(0, 0, W, H);

    // Subtle vertical gradient overlay
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "rgba(120,60,200,0.04)");
    bgGrad.addColorStop(1, "rgba(30,10,80,0.06)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // ── Chakra bands ─────────────────────────────────────────────────────────
    const sortedFreqs = [...freqs].sort((a, b) => a - b);

    for (const chakra of chakras) {
      const cy = toY(chakra.frequencyHz);
      const idx = sortedFreqs.indexOf(chakra.frequencyHz);
      const belowHz = sortedFreqs[idx - 1] ?? minHz;
      const aboveHz = sortedFreqs[idx + 1] ?? maxHz;
      const halfBelow = Math.abs(cy - toY(belowHz)) * 0.44;
      const halfAbove = Math.abs(toY(aboveHz) - cy) * 0.44;
      const bh = Math.min(halfBelow, halfAbove, 38);

      const active = hz !== null && isInTune(hz, chakra.frequencyHz);

      // Band fill gradient
      const grad = ctx.createLinearGradient(0, cy - bh, 0, cy + bh);
      const alpha = active ? 0.22 : 0.08;
      grad.addColorStop(0,   `rgba(${chakra.rgb}, 0)`);
      grad.addColorStop(0.5, `rgba(${chakra.rgb}, ${alpha})`);
      grad.addColorStop(1,   `rgba(${chakra.rgb}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, cy - bh, W, bh * 2);

      // Dashed centre line
      ctx.save();
      ctx.setLineDash([3, 7]);
      ctx.strokeStyle = `rgba(${chakra.rgb}, ${active ? 0.6 : 0.22})`;
      ctx.lineWidth = active ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(W, cy);
      ctx.stroke();
      ctx.restore();

      // Right-side labels
      const lx = W - 16;
      ctx.textAlign = "right";
      ctx.font = `600 11px system-ui, sans-serif`;
      ctx.fillStyle = `rgba(${chakra.rgb}, ${active ? 1 : 0.55})`;
      ctx.fillText(chakra.name.toUpperCase(), lx, cy - 7);
      ctx.font = `400 10px system-ui, sans-serif`;
      ctx.fillStyle = `rgba(${chakra.rgb}, ${active ? 0.85 : 0.32})`;
      ctx.fillText(`${chakra.frequencyHz} Hz`, lx, cy + 8);

      // Note badge (left side)
      const noteX = 14;
      ctx.textAlign = "left";
      ctx.font = `500 10px system-ui, sans-serif`;
      ctx.fillStyle = `rgba(${chakra.rgb}, ${active ? 0.9 : 0.30})`;
      ctx.fillText(chakra.note, noteX, cy + 4);
    }

    // ── Accumulate dot trail ──────────────────────────────────────────────────
    const now = performance.now();
    if (hz !== null && now - lastDotMs.current > DOT_INTERVAL_MS) {
      dotsRef.current.push({ hz });
      if (dotsRef.current.length > MAX_DOTS) dotsRef.current.shift();
      lastDotMs.current = now;
    }

    // ── Draw trail ────────────────────────────────────────────────────────────
    const trail = dotsRef.current;
    const newestX = W * NEWEST_X;

    for (let i = 0; i < trail.length; i++) {
      const dot = trail[trail.length - 1 - i];
      const x = newestX - i * DOT_SPACING_PX;
      if (x < 0) break;

      const y = toY(dot.hz);
      const age = i / trail.length;
      const opacity = (1 - age) * 0.88;
      const r = DOT_RADIUS * (1 - age * 0.45);
      const closest = findClosestChakra(dot.hz, chakras);
      const inTune = isInTune(dot.hz, closest.frequencyHz);

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);

      if (inTune) {
        ctx.fillStyle = `rgba(${closest.rgb}, ${opacity})`;
        ctx.fill();
        // White core on the very newest dot
        if (i === 0) {
          ctx.beginPath();
          ctx.arc(x, y, r * 0.38, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.65)";
          ctx.fill();
        }
      } else {
        ctx.strokeStyle = `rgba(${closest.rgb}, ${opacity * 0.55})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    // ── Current pitch dash ────────────────────────────────────────────────────
    if (hz !== null) {
      const y = toY(hz);
      const closest = findClosestChakra(hz, chakras);
      ctx.save();
      ctx.setLineDash([2, 5]);
      ctx.strokeStyle = `rgba(${closest.rgb}, 0.35)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(newestX + 12, y);
      ctx.lineTo(W - 95, y);
      ctx.stroke();
      ctx.restore();
    }

    rafRef.current = requestAnimationFrame(render);
  }, []);

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

  // Map a click Y position back to the closest chakra
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!onChakraClick) return;
      const rect = canvasRef.current!.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const H = rect.height;
      const chakras = chakrasRef.current;
      const freqs = chakras.map((c) => c.frequencyHz);
      const minHz = Math.min(...freqs) * 0.76;
      const maxHz = Math.max(...freqs) * 1.30;

      // Inverse of freqToY
      const t = 1 - clickY / H;
      const clickedHz = Math.exp(
        t * (Math.log(maxHz) - Math.log(minHz)) + Math.log(minHz)
      );
      onChakraClick(findClosestChakra(clickedHz, chakras));
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
