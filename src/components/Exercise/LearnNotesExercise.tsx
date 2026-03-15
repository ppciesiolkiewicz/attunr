"use client";

import { useRef, useEffect, useCallback, useMemo } from "react";
import { Button, Text } from "@/components/ui";
import type { Band } from "@/constants/tone-slots";

interface LearnNotesExerciseProps {
  exerciseId: number;
  isLast: boolean;
  allBands: Band[];
  onComplete: () => void;
  onPrev?: () => void;
}

// ── Static range canvas (slots only) ─────────────────────────────────────────

const PAD_TOP = 28;
const PAD_BOTTOM = 28;
const MAX_SLOT_H = 48;

function NoteRangeCanvas({ bands }: { bands: Band[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const W = container.clientWidth;
    const H = container.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const n = bands.length;
    if (n === 0) return;

    // Layout — bands spread vertically, lowest at bottom
    const maxCluster = (n - 1) * MAX_SLOT_H;
    const available = Math.max(0, H - PAD_TOP - PAD_BOTTOM);
    const clusterH = Math.min(maxCluster, available);
    const topY = (H - clusterH) / 2;
    const bottomY = topY + clusterH;
    const bandY = (i: number) =>
      n <= 1 ? H / 2 : bottomY - (i / (n - 1)) * (bottomY - topY);

    // Background
    ctx.fillStyle = "#080810";
    ctx.fillRect(0, 0, W, H);
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "rgba(120,60,200,0.04)");
    bgGrad.addColorStop(1, "rgba(30,10,80,0.06)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const slotH = n > 1 ? clusterH / (n - 1) : 40;
    const bh = Math.min(slotH * 0.42, 26);
    const lineStartX = 80;

    for (let i = 0; i < n; i++) {
      const band = bands[i];
      const cy = bandY(i);

      // Band fill — feathered gradient
      const grad = ctx.createLinearGradient(0, cy - bh, 0, cy + bh);
      grad.addColorStop(0, `rgba(${band.rgb}, 0)`);
      grad.addColorStop(0.5, `rgba(${band.rgb}, 0.22)`);
      grad.addColorStop(1, `rgba(${band.rgb}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, cy - bh, W, bh * 2);

      // Dashed centre line
      ctx.save();
      ctx.setLineDash([3, 7]);
      ctx.strokeStyle = `rgba(${band.rgb}, 0.5)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lineStartX, cy);
      ctx.lineTo(W, cy);
      ctx.stroke();
      ctx.restore();

      // Note name (large)
      const label = `${band.note}${band.octave}`;
      ctx.font = "700 18px system-ui, sans-serif";
      ctx.fillStyle = `rgba(${band.rgb}, 0.92)`;
      ctx.textAlign = "left";
      ctx.fillText(label, 16, cy + 6);
    }

    // "LOW" and "HIGH" labels on the right side
    if (n >= 2) {
      ctx.font = "600 10px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.letterSpacing = "1.5px";

      ctx.fillStyle = `rgba(${bands[0].rgb}, 0.6)`;
      ctx.fillText("LOW", W - 14, bandY(0) + 4);

      ctx.fillStyle = `rgba(${bands[n - 1].rgb}, 0.6)`;
      ctx.fillText("HIGH", W - 14, bandY(n - 1) + 4);

      ctx.letterSpacing = "0px";
    }
  }, [bands]);

  useEffect(() => {
    draw();
    const observer = new ResizeObserver(draw);
    if (canvasRef.current?.parentElement) {
      observer.observe(canvasRef.current.parentElement);
    }
    return () => observer.disconnect();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full"
      aria-label="Your vocal range — 7 reference notes from low to high"
    />
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function LearnNotesExercise({
  exerciseId,
  isLast,
  allBands,
  onComplete,
  onPrev,
}: LearnNotesExerciseProps) {
  // Show only the 7 slot bands — keeps the canvas clean
  const slotBands = useMemo(() => allBands.filter((b) => b.isSlot), [allBands]);
  const lowest = slotBands[0];
  const highest = slotBands[slotBands.length - 1];

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-lg mx-auto px-5 py-6 flex flex-col gap-5">
          {/* Intro */}
          <div className="flex flex-col gap-3">
            <Text variant="heading-sm">A little about notes</Text>
            <Text variant="body" color="text-2">
              We won&apos;t bore you with too much theory — just the bare
              minimum so the exercises make sense. Every sound you sing is a{" "}
              <Text as="span" color="text-1" className="font-medium">
                note
              </Text>
              . Notes go in order:{" "}
              <Text as="span" color="text-1" className="font-medium">
                A B C D E F G
              </Text>
              , then back to A — one step higher. That cycle repeats across your
              whole range.
            </Text>
          </div>

          {/* Range canvas — slots only */}
          <div className="h-72 rounded-xl overflow-hidden border border-white/[0.08]">
            <NoteRangeCanvas bands={slotBands} />
          </div>

          {/* Low / High explanation */}
          <div className="flex flex-col gap-4">
            {lowest && highest && (
              <Text variant="body" color="text-2">
                This is your voice. Your lowest note is{" "}
                <Text as="span" color="note-low" className="font-semibold">
                  {lowest.note}
                  {lowest.octave}
                </Text>{" "}
                and your highest is{" "}
                <Text as="span" color="note-high" className="font-semibold">
                  {highest.note}
                  {highest.octave}
                </Text>
                . We use{" "}
                <Text as="span" color="note-low">
                  warm colors
                </Text>{" "}
                for low notes and{" "}
                <Text as="span" color="note-high">
                  cool colors
                </Text>{" "}
                for high ones.
              </Text>
            )}

            {/* Try it */}
            <Text variant="body" color="text-2">
              Try singing your lowest note and holding it for a moment — then
              your highest. You&apos;ll hear these at the start and end of the
              glide exercises coming up.
            </Text>

            {/* Sharps */}
            <div className="flex flex-col gap-1.5">
              <Text variant="heading-sm">Sharps (#)</Text>
              <Text variant="body" color="text-2">
                You might see notes like{" "}
                <Text as="span" color="text-1" className="font-medium">
                  A#
                </Text>{" "}
                or{" "}
                <Text as="span" color="text-1" className="font-medium">
                  C#
                </Text>
                . A sharp is just a half-step up — so A# sits between A and B.
                That&apos;s it — you don&apos;t need to think about it beyond
                that.
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t border-white/[0.06] bg-white/[0.02] px-3 sm:px-5 py-2 sm:pt-2.5 sm:pb-1.5 flex flex-row flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-4 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 ml-auto w-full sm:w-auto justify-end">
          {exerciseId > 1 && onPrev && (
            <Button
              variant="outline"
              onClick={onPrev}
              title="Previous"
              className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
            >
              ← Prev
            </Button>
          )}
          <Button
            onClick={onComplete}
            className="flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm min-w-0"
          >
            {isLast ? "Complete ✓" : "Next →"}
          </Button>
        </div>
      </div>
    </>
  );
}
