"use client";

import { CHAKRAS } from "@/constants/chakras";
import type { ChakraId } from "@/constants/chakras";

interface ChakraDetailCardProps {
  chakraIds: ChakraId[];
  frequencyOverrides?: Partial<Record<ChakraId, number>>;
  /** "full" = name, mantra, element, longDescription; "brief" = mantra + interestingFact; "minimal" = tone only (lip-rolls); "rainbow" = tone + rainbow bar, no mantra (warmups like Low U, Hoo hoo) */
  style?: "full" | "brief" | "minimal" | "rainbow";
}

export default function ChakraDetailCard({
  chakraIds,
  frequencyOverrides = {},
  style = "full",
}: ChakraDetailCardProps) {
  const items = chakraIds.map((id) => CHAKRAS.find((c) => c.id === id)!);

  const isRainbow = style === "rainbow";

  return (
    <div
      className="rounded-xl px-5 py-4 flex flex-col gap-3"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {isRainbow ? (
        /* Voice focus: low/high only, no specific frequency */
        <p className="text-sm text-white/58">
          {chakraIds[0] === "root"
            ? "Low tone — Find your chest voice"
            : "High tone — Find your head voice"}
        </p>
      ) : (
      items.map((chakra) => {
        const displayHz = frequencyOverrides[chakra.id] ?? chakra.frequencyHz;
        const isMinimal = style === "minimal";
        return (
          <div key={chakra.id} className="flex gap-4 items-start">
            {/* Colour dot */}
            <div
              className="mt-1 shrink-0 rounded-full"
              style={{
                width: 12,
                height: 12,
                backgroundColor: chakra.color,
                boxShadow: `0 0 8px ${chakra.color}88`,
              }}
            />

            <div className="flex flex-col gap-0.5 min-w-0">
              {/* Minimal: tone + warmup cue only; else name + mantra + element */}
              {isMinimal ? (
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-base font-semibold tabular-nums text-white/85">
                    {displayHz} Hz
                  </span>
                  <span className="text-sm text-white/58">
                    Comfortable middle tone — focus on sustaining the buzz.
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span
                      className="text-base font-semibold"
                      style={{ color: chakra.color }}
                    >
                      {chakra.name}
                    </span>
                    <span className="text-sm font-mono text-white/62">
                      {chakra.mantra}
                    </span>
                    <span className="text-xs text-white/42 uppercase tracking-wider">
                      {chakra.element}
                    </span>
                    <span className="text-xs text-white/42 tabular-nums ml-auto">
                      {displayHz} Hz
                    </span>
                  </div>
                  {style === "full" ? (
                    <p className="text-sm text-white/58 leading-relaxed">
                      {chakra.longDescription}
                    </p>
                  ) : chakra.interestingFact ? (
                    <p className="text-sm text-white/58 leading-relaxed">
                      {chakra.interestingFact}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        );
      })) }
    </div>
  );
}
