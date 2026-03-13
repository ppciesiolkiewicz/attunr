"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Button, Modal } from "@/components/ui";
import { BadgeIcon } from "./BadgeIcon";

interface PartCompleteModalProps {
  part: number;
  partName: string;
  learned: string;
  tip: string;
  onContinue: () => void;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

export function PartCompleteModal({
  part,
  partName,
  learned,
  tip,
  onContinue,
}: PartCompleteModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = headerRef.current;
        if (el) {
          const rect = el.getBoundingClientRect();
          const x = (rect.left + rect.width / 2) / window.innerWidth;
          const y = (rect.top + rect.height / 2) / window.innerHeight;
          confetti({ particleCount: 80, spread: 70, origin: { x, y } });
        } else {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.35 } });
        }
      });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!isClosing) return;
    const id = setTimeout(() => onContinue(), 280);
    return () => clearTimeout(id);
  }, [isClosing, onContinue]);

  return (
    <Modal
      className={isClosing ? "pointer-events-none" : ""}
      style={{ zIndex: 40, background: "rgba(0,0,0,0.85)" }}
      panelStyle={{ border: "1px solid rgba(255,255,255,0.12)", maxHeight: "none" }}
    >
        <div
          ref={headerRef}
          className="px-5 pt-5 pb-4 flex flex-col items-center gap-3"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: "rgba(124,58,237,0.2)" }}
          >
            <BadgeIcon className="text-violet-400" style={{ width: 24, height: 24 }} />
          </div>
          <h2 className="text-xl font-semibold text-white text-center">
            Part {ROMAN[part - 1]} Complete
          </h2>
          <p className="text-sm text-white/80 text-center">{partName}</p>
        </div>
        <div className="px-5 py-4 border-t border-white/[0.06] flex flex-col gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/55 mb-1">
              What you learnt
            </p>
            <p className="text-sm text-white/90">{learned}</p>
          </div>
          {tip && (
            <p className="text-sm font-medium" style={{ color: "#a78bfa" }}>
              {tip}
            </p>
          )}
        </div>
        <div className="px-5 pb-5 pt-3 border-t border-white/[0.06]">
          <Button size="lg" onClick={() => !isClosing && setIsClosing(true)} disabled={isClosing} className="w-full">
            Continue →
          </Button>
        </div>
    </Modal>
  );
}
