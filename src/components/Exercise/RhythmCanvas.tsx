"use client";

import { useRef, useEffect, useCallback } from "react";
import type { Beat } from "@/constants/journey";

/** Beat status for rendering */
export type BeatStatus = "upcoming" | "active" | "hit" | "close" | "missed";

export interface RhythmBeatState {
  beat: Beat;
  status: BeatStatus;
}

import { DOT_SPACING_PX, DOT_INTERVAL_MS, PLAYHEAD_X } from "@/constants/settings";

/** Scroll speed — matches PitchCanvas DOT_SPACING_PX / DOT_INTERVAL_MS */
const PX_PER_MS = DOT_SPACING_PX / DOT_INTERVAL_MS;
/** Canvas height */
const CANVAS_H = 200;
/** Beat marker height */
const BEAT_H = 40;

const STATUS_COLORS: Record<BeatStatus, string> = {
  upcoming: "rgba(255, 255, 255, 0.25)",
  active: "rgba(255, 255, 255, 0.9)",
  hit: "#50dc64",
  close: "#dccc3c",
  missed: "#dc3c3c",
};

interface RhythmCanvasProps {
  beats: RhythmBeatState[];
  elapsedMs: number;
  tapFlash: boolean;
}

export function RhythmCanvas({ beats, elapsedMs, tapFlash }: RhythmCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, w, h);

    const nowX = w * PLAYHEAD_X;
    const centerY = h / 2;

    // Draw "now" line
    ctx.strokeStyle = tapFlash ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = tapFlash ? 3 * dpr : 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(nowX, 0);
    ctx.lineTo(nowX, h);
    ctx.stroke();

    // Draw tap flash circle
    if (tapFlash) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.arc(nowX, centerY, 30 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw beat markers
    for (const { beat, status } of beats) {
      const beatCenterMs = beat.startMs + beat.durationMs / 2;
      const offsetMs = beatCenterMs - elapsedMs;
      const x = nowX + offsetMs * PX_PER_MS * dpr;
      const beatW = Math.max(beat.durationMs * PX_PER_MS * dpr, 8 * dpr);
      const beatH = BEAT_H * dpr;

      // Skip if off-screen
      if (x + beatW / 2 < 0 || x - beatW / 2 > w) continue;

      ctx.fillStyle = STATUS_COLORS[status];
      const radius = 6 * dpr;
      const rx = x - beatW / 2;
      const ry = centerY - beatH / 2;

      ctx.beginPath();
      ctx.roundRect(rx, ry, beatW, beatH, radius);
      ctx.fill();

      // Active pulse — brighter border
      if (status === "active") {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.roundRect(rx, ry, beatW, beatH, radius);
        ctx.stroke();
      }
    }
  }, [beats, elapsedMs, tapFlash]);

  // Resize canvas to container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = CANVAS_H * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${CANVAS_H}px`;
      draw();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [draw]);

  // Redraw on state changes
  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div ref={containerRef} className="w-full" style={{ height: CANVAS_H }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
