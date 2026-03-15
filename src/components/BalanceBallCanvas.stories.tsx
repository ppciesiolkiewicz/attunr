import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef, useEffect } from "react";
import BalanceBallCanvas from "./BalanceBallCanvas";
import type { Band } from "@/constants/tone-slots";

// ── Mock bands ──────────────────────────────────────────────────────────────

const ROOT: Band = {
  id: "root",
  midi: 58,
  frequencyHz: 233,
  note: "Bb",
  octave: 3,
  color: "#ef4444",
  rgb: "239, 68, 68",
  name: "Root",
  isSlot: true,
  slotId: "slot-1",
};

const SACRAL: Band = {
  id: "sacral",
  midi: 63,
  frequencyHz: 311,
  note: "Eb",
  octave: 4,
  color: "#f97316",
  rgb: "249, 115, 22",
  name: "Sacral",
  isSlot: true,
  slotId: "slot-2",
};

const SOLAR: Band = {
  id: "solar-plexus",
  midi: 66,
  frequencyHz: 370,
  note: "F#",
  octave: 4,
  color: "#eab308",
  rgb: "234, 179, 8",
  name: "Solar Plexus",
  isSlot: true,
  slotId: "slot-3",
};

const HEART: Band = {
  id: "heart",
  midi: 60,
  frequencyHz: 262,
  note: "C",
  octave: 4,
  color: "#22c55e",
  rgb: "34, 197, 94",
  name: "Heart",
  isSlot: true,
  slotId: "slot-4",
};

const THROAT: Band = {
  id: "throat",
  midi: 67,
  frequencyHz: 392,
  note: "G",
  octave: 4,
  color: "#3b82f6",
  rgb: "59, 130, 246",
  name: "Throat",
  isSlot: true,
  slotId: "slot-5",
};

// ── Simulated-pitch wrapper ─────────────────────────────────────────────────

type SimPattern = "steady" | "wobble" | "drift" | "none";

function SimWrapper({
  bands,
  pattern,
  highlightIds,
}: {
  bands: Band[];
  pattern: SimPattern;
  highlightIds?: string[];
}) {
  const hzRef = useRef<number | null>(null);

  useEffect(() => {
    if (pattern === "none") {
      hzRef.current = null;
      return;
    }

    const sorted = [...bands].sort((a, b) => a.frequencyHz - b.frequencyHz);
    const center = sorted[Math.floor(sorted.length / 2)].frequencyHz;
    const low = sorted[0].frequencyHz;
    const high = sorted[sorted.length - 1].frequencyHz;
    let t = 0;

    const id = setInterval(() => {
      t += 0.05;
      switch (pattern) {
        case "steady":
          // Tiny jitter around center note — in-tune most of the time
          hzRef.current = center * (1 + Math.sin(t) * 0.008);
          break;
        case "wobble":
          // Moderate wobble — drifts in and out of tune
          hzRef.current = center * (1 + Math.sin(t * 0.7) * 0.06);
          break;
        case "drift":
          // Smooth sweep across the full range
          hzRef.current = low + ((Math.sin(t * 0.3) + 1) / 2) * (high - low);
          break;
      }
    }, 50);

    return () => clearInterval(id);
  }, [bands, pattern]);

  return (
    <div style={{ width: "100%", height: 400, background: "#080810" }}>
      <BalanceBallCanvas
        bands={bands}
        currentHzRef={hzRef}
        highlightIds={highlightIds}
      />
    </div>
  );
}

// ── Storybook meta ──────────────────────────────────────────────────────────

const meta: Meta<typeof BalanceBallCanvas> = {
  title: "Components/BalanceBallCanvas",
  component: BalanceBallCanvas,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof BalanceBallCanvas>;

// ── Stories ─────────────────────────────────────────────────────────────────

/** Single note — ball balanced at center of bowl, tiny wobble around target. */
export const SingleNoteSteady: Story = {
  render: () => <SimWrapper bands={[HEART]} pattern="steady" />,
};

/** Single note — ball wobbles left/right as pitch drifts. */
export const SingleNoteWobble: Story = {
  render: () => <SimWrapper bands={[HEART]} pattern="wobble" />,
};

/** Two notes — low left, high right, ball drifts between them. */
export const TwoNotesDrift: Story = {
  render: () => <SimWrapper bands={[ROOT, THROAT]} pattern="drift" />,
};

/** Three notes — ball sweeps across the full range. */
export const ThreeNotesDrift: Story = {
  render: () => <SimWrapper bands={[ROOT, HEART, THROAT]} pattern="drift" />,
};

/** Five notes with highlighting — only the first two are active targets. */
export const FiveNotesHighlighted: Story = {
  render: () => (
    <SimWrapper
      bands={[ROOT, SACRAL, SOLAR, HEART, THROAT]}
      pattern="drift"
      highlightIds={["root", "sacral"]}
    />
  ),
};

/** No pitch detected — just the track and markers, no ball. */
export const NoPitch: Story = {
  render: () => <SimWrapper bands={[ROOT, HEART, THROAT]} pattern="none" />,
};

/** Single note, no pitch — idle state for a single-note exercise. */
export const SingleNoteIdle: Story = {
  render: () => <SimWrapper bands={[HEART]} pattern="none" />,
};
