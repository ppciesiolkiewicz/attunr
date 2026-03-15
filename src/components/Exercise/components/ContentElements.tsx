"use client";

import { HeadphonesNotice } from "@/components/TabInfoModal";
import { Video } from "@/components/ui";
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
                <p className="text-sm font-semibold text-amber-400/95 mb-1.5">
                  Before you begin
                </p>
                <p className="text-sm text-white/82 leading-relaxed">{el.text}</p>
              </div>
            );

          case "paragraph":
            return (
              <p
                key={i}
                className="text-base leading-relaxed"
                style={{
                  color:
                    el.variant === "secondary"
                      ? "rgba(255,255,255,0.55)"
                      : "rgba(255,255,255,0.88)",
                }}
              >
                {el.text}
              </p>
            );

          case "video":
            return <Video key={i} />;

          case "headphones-notice":
            return <HeadphonesNotice key={i} />;

          case "tip-list":
            return (
              <div key={i} className="flex flex-col gap-3">
                <p className="text-sm font-medium text-white/78 tracking-wide uppercase">
                  {el.title}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {el.tips.map((tip, j) => (
                    <li
                      key={j}
                      className="flex gap-2.5 text-[15px] leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.72)" }}
                    >
                      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400/70" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );

          case "separator":
            return (
              <div key={i} className="flex items-center justify-center py-3">
                <span className="text-white/55 text-[0.5em] leading-none">●</span>
              </div>
            );
        }
      })}
    </>
  );
}
