import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef, useEffect } from "react";
import HillBallCanvas from "./HillBallCanvas";
import type { Band } from "@/constants/chakras";

// ── Mock bands (simulating 3 low-range notes for Low U, 3 high-range for Hoo Hoo) ──

const LOW_BANDS: Band[] = [
  {
    id: "low-1",
    midi: 48,
    frequencyHz: 131,
    note: "C",
    octave: 3,
    color: "#ef4444",
    rgb: "239, 68, 68",
    name: "Low C",
    isChakraSlot: true,
    chakraId: "root",
  },
  {
    id: "low-2",
    midi: 50,
    frequencyHz: 147,
    note: "D",
    octave: 3,
    color: "#f97316",
    rgb: "249, 115, 22",
    name: "Low D",
    isChakraSlot: true,
    chakraId: "sacral",
  },
  {
    id: "low-3",
    midi: 52,
    frequencyHz: 165,
    note: "E",
    octave: 3,
    color: "#eab308",
    rgb: "234, 179, 8",
    name: "Low E",
    isChakraSlot: true,
    chakraId: "solar-plexus",
  },
];

const HIGH_BANDS: Band[] = [
  {
    id: "high-1",
    midi: 64,
    frequencyHz: 330,
    note: "E",
    octave: 4,
    color: "#22c55e",
    rgb: "34, 197, 94",
    name: "High E",
    isChakraSlot: true,
    chakraId: "heart",
  },
  {
    id: "high-2",
    midi: 66,
    frequencyHz: 370,
    note: "F#",
    octave: 4,
    color: "#3b82f6",
    rgb: "59, 130, 246",
    name: "High F#",
    isChakraSlot: true,
    chakraId: "throat",
  },
  {
    id: "high-3",
    midi: 68,
    frequencyHz: 415,
    note: "Ab",
    octave: 4,
    color: "#8b5cf6",
    rgb: "139, 92, 246",
    name: "High Ab",
    isChakraSlot: true,
    chakraId: "third-eye",
  },
];

// ── Simulated-pitch wrapper ─────────────────────────────────────────────────

type SimPattern = "going-low" | "going-high" | "wobble" | "none";

function SimWrapper({
  bands,
  direction,
  accept,
  pattern,
}: {
  bands: Band[];
  direction: "up" | "down";
  accept: "above" | "below";
  pattern: SimPattern;
}) {
  const hzRef = useRef<number | null>(null);

  useEffect(() => {
    if (pattern === "none") {
      hzRef.current = null;
      return;
    }

    const sorted = [...bands].sort((a, b) => a.frequencyHz - b.frequencyHz);
    const center = sorted[Math.floor(sorted.length / 2)].frequencyHz;
    let t = 0;

    const id = setInterval(() => {
      t += 0.03;
      switch (pattern) {
        case "going-low":
          // Gradually descends below center, then cycles back
          hzRef.current = center * (1 - Math.abs(Math.sin(t * 0.4)) * 0.3);
          break;
        case "going-high":
          // Gradually ascends above center, then cycles back
          hzRef.current = center * (1 + Math.abs(Math.sin(t * 0.4)) * 0.3);
          break;
        case "wobble":
          // Drifts around center
          hzRef.current = center * (1 + Math.sin(t * 0.7) * 0.15);
          break;
      }
    }, 50);

    return () => clearInterval(id);
  }, [bands, pattern]);

  return (
    <div style={{ width: "100%", height: 400, background: "#080810" }}>
      <HillBallCanvas
        bands={bands}
        currentHzRef={hzRef}
        direction={direction}
        accept={accept}
      />
    </div>
  );
}

// ── Storybook meta ──────────────────────────────────────────────────────────

const meta: Meta<typeof HillBallCanvas> = {
  title: "Components/HillBallCanvas",
  component: HillBallCanvas,
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
  },
};

export default meta;
type Story = StoryObj<typeof HillBallCanvas>;

// ── Stories ─────────────────────────────────────────────────────────────────

/** Low U — ball rolls downhill as user sings lower (3 notes). */
export const LowU_GoingLow: Story = {
  name: "Low U — Going Low (success)",
  render: () => (
    <SimWrapper
      bands={LOW_BANDS}
      direction="down"
      accept="below"
      pattern="going-low"
    />
  ),
};

/** Low U — wobbling around center. */
export const LowU_Wobble: Story = {
  name: "Low U — Wobble",
  render: () => (
    <SimWrapper
      bands={LOW_BANDS}
      direction="down"
      accept="below"
      pattern="wobble"
    />
  ),
};

/** Low U — idle, no pitch. */
export const LowU_Idle: Story = {
  name: "Low U — Idle",
  render: () => (
    <SimWrapper
      bands={LOW_BANDS}
      direction="down"
      accept="below"
      pattern="none"
    />
  ),
};

/** Low U — single note only. */
export const LowU_SingleNote: Story = {
  name: "Low U — Single Note",
  render: () => (
    <SimWrapper
      bands={[LOW_BANDS[0]]}
      direction="down"
      accept="below"
      pattern="going-low"
    />
  ),
};

/** Hoo hoo — ball climbs uphill as user sings higher (3 notes). */
export const HooHoo_GoingHigh: Story = {
  name: "Hoo Hoo — Going High (success)",
  render: () => (
    <SimWrapper
      bands={HIGH_BANDS}
      direction="up"
      accept="above"
      pattern="going-high"
    />
  ),
};

/** Hoo hoo — wobbling around center. */
export const HooHoo_Wobble: Story = {
  name: "Hoo Hoo — Wobble",
  render: () => (
    <SimWrapper
      bands={HIGH_BANDS}
      direction="up"
      accept="above"
      pattern="wobble"
    />
  ),
};

/** Hoo hoo — single note only. */
export const HooHoo_SingleNote: Story = {
  name: "Hoo Hoo — Single Note",
  render: () => (
    <SimWrapper
      bands={[HIGH_BANDS[1]]}
      direction="up"
      accept="above"
      pattern="going-high"
    />
  ),
};

/** Hoo hoo — idle, no pitch. */
export const HooHoo_Idle: Story = {
  name: "Hoo Hoo — Idle",
  render: () => (
    <SimWrapper
      bands={HIGH_BANDS}
      direction="up"
      accept="above"
      pattern="none"
    />
  ),
};
