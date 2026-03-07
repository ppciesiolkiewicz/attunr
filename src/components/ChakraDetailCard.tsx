"use client";

import { CHAKRAS } from "@/constants/chakras";
import type { ChakraId } from "@/constants/chakras";

interface ChakraDetailCardProps {
  chakraIds: ChakraId[];
  frequencyOverrides?: Partial<Record<ChakraId, number>>;
}

export default function ChakraDetailCard({
  chakraIds,
  frequencyOverrides = {},
}: ChakraDetailCardProps) {
  const items = chakraIds.map((id) => CHAKRAS.find((c) => c.id === id)!);

  return (
    <div
      className="rounded-xl px-5 py-4 flex flex-col gap-3"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {items.map((chakra) => {
        const displayHz = frequencyOverrides[chakra.id] ?? chakra.frequencyHz;
        return (
          <div key={chakra.id} className="flex gap-4 items-start">
            {/* Colour dot */}
            <div
              className="mt-1 shrink-0 rounded-full"
              style={{
                width: 10,
                height: 10,
                backgroundColor: chakra.color,
                boxShadow: `0 0 8px ${chakra.color}88`,
              }}
            />

            <div className="flex flex-col gap-0.5 min-w-0">
              {/* Name + mantra + element */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="text-sm font-semibold"
                  style={{ color: chakra.color }}
                >
                  {chakra.name}
                </span>
                <span className="text-xs font-mono text-white/50">
                  {chakra.mantra}
                </span>
                <span className="text-[10px] text-white/25 uppercase tracking-wider">
                  {chakra.element}
                </span>
                <span className="text-[10px] text-white/25 tabular-nums ml-auto">
                  {displayHz} Hz
                </span>
              </div>

              {/* Long description */}
              <p className="text-xs text-white/45 leading-relaxed">
                {chakra.longDescription}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
