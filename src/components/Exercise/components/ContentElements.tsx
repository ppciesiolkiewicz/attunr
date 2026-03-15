"use client";

import { HeadphonesNotice } from "@/components/TabInfoModal";
import { Text, Video } from "@/components/ui";
import type { ContentElement } from "@/constants/journey";

interface ContentElementsProps {
  elements: ContentElement[];
}

/** Renders an array of ContentElement — shared by modals and exercise bodies. */
export function ContentElements({ elements }: ContentElementsProps) {
  return (
    <>
      {elements.map((el, i) => {
        switch (el.type) {
          case "warning":
            return (
              <div
                key={i}
                className="rounded-xl px-4 py-3"
                style={{
                  border: "2px solid rgba(251,191,36,0.6)",
                  background: "rgba(251,191,36,0.08)",
                }}
              >
                <Text variant="body-sm" color="warning" className="font-semibold mb-1.5">
                  Before you begin
                </Text>
                <Text variant="body-sm" color="text-1">{el.text}</Text>
              </div>
            );

          case "paragraph":
            return (
              <Text
                key={i}
                variant="body"
                style={{
                  color:
                    el.variant === "secondary"
                      ? "rgba(255,255,255,0.55)"
                      : "rgba(255,255,255,0.88)",
                }}
              >
                {el.text}
              </Text>
            );

          case "video":
            return <Video key={i} />;

          case "headphones-notice":
            return <HeadphonesNotice key={i} />;

          case "tip-list":
            return (
              <div key={i} className="flex flex-col gap-3">
                <Text variant="label" color="text-2" className="font-medium tracking-wide">
                  {el.title}
                </Text>
                <ul className="flex flex-col gap-2.5">
                  {el.tips.map((tip, j) => (
                    <Text
                      as="li"
                      key={j}
                      variant="body"
                      className="flex gap-2.5 text-[15px]"
                      style={{ color: "rgba(255,255,255,0.72)" }}
                    >
                      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400/70" />
                      <Text as="span" variant="body" style={{ color: "rgba(255,255,255,0.72)" }}>{tip}</Text>
                    </Text>
                  ))}
                </ul>
              </div>
            );

          case "separator":
            return (
              <div key={i} className="flex items-center justify-center py-3">
                <Text as="span" variant="caption" color="muted-1" className="text-[0.5em] leading-none">●</Text>
              </div>
            );
        }
      })}
    </>
  );
}
