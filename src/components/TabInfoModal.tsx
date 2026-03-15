"use client";

import { useState } from "react";
import { Button, CloseButton, Modal, Text } from "@/components/ui";

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

export function InfoIcon({ className, size = 12 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <circle cx="12" cy="8" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function InfoButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="icon"
      onClick={onClick}
      aria-label="Show info"
      className="w-8 h-8"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.5)",
      }}
    >
      <InfoIcon size={14} />
    </Button>
  );
}

export function HeadphonesNotice() {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <Text as="span" variant="caption" color="muted-1" className="shrink-0 flex items-center justify-center">
        <HeadphonesIcon />
      </Text>
      <Text variant="body-sm" color="text-2" className="text-left">
        For the best experience, use headphones — they keep the playback out of your
        mic so we can hear your voice clearly.
      </Text>
    </div>
  );
}

export default function TabInfoModal({ title, children, onClose }: TabInfoModalProps) {
  const [persist, setPersist] = useState(false);

  return (
    <Modal
      onBackdropClick={() => onClose(persist)}
      style={{ zIndex: 20, background: "rgba(0,0,0,0.72)" }}
      panelStyle={{ maxHeight: "88vh" }}
    >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <Text variant="heading-sm">{title}</Text>
          <CloseButton onClick={() => onClose(persist)} />
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
            <Text as="span" variant="caption" color="muted-1" className="group-hover:text-white/75 transition-colors select-none">
              Don&apos;t show this again
            </Text>
          </label>

          <Button onClick={() => onClose(persist)} className="shrink-0">
            Got it
          </Button>
        </div>
    </Modal>
  );
}
