"use client";

import { useState } from "react";

interface TabInfoModalProps {
  title: string;
  children: React.ReactNode;
  /** Called when the user closes the modal. `persist` is true when "don't show again" is checked. */
  onClose: (persist: boolean) => void;
}

function HeadphonesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

export function InfoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Show info"
      className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.5)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)";
        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.85)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <circle cx="12" cy="8" r="0.5" fill="currentColor" />
      </svg>
    </button>
  );
}

export function HeadphonesNotice() {
  return (
    <div
      className="flex flex-col items-center text-center gap-2 rounded-xl px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <span className="text-white/52">
        <HeadphonesIcon />
      </span>
      <p className="text-sm text-white/58 leading-relaxed">
        For the best experience, use headphones — they keep the playback out of your
        mic so we can hear your voice clearly.
      </p>
    </div>
  );
}

export default function TabInfoModal({ title, children, onClose }: TabInfoModalProps) {
  const [persist, setPersist] = useState(false);

  return (
    <div
      className="fixed inset-0 z-20 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}
      onClick={() => onClose(persist)}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "#0f0f1a",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          maxHeight: "88vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={() => onClose(persist)}
            className="text-white/42 hover:text-white/75 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4 min-h-0">
          {children}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06] flex items-center gap-4 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer flex-1 group">
            <input
              type="checkbox"
              checked={persist}
              onChange={(e) => setPersist(e.target.checked)}
              className="w-3.5 h-3.5 accent-violet-500 cursor-pointer"
            />
            <span className="text-xs text-white/50 group-hover:text-white/65 transition-colors select-none">
              Don&apos;t show this again
            </span>
          </label>

          <button
            onClick={() => onClose(persist)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0 transition-all"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              boxShadow: "0 0 16px rgba(124,58,237,0.3)",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
