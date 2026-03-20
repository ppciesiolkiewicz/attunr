"use client";

import { useEffect, useRef } from "react";
import { Text } from "./Text";
import { Button } from "./Button";
import { CloseButton } from "./CloseButton";

export type ToastVariant = "info" | "success" | "warning";

export interface ToastProps {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  cta?: { label: string; onClick: () => void };
  onDismiss: (id: string) => void;
}

const borderColor: Record<ToastVariant, string> = {
  info: "rgba(139,92,246,0.6)",     // violet
  success: "rgba(74,222,128,0.6)",  // green
  warning: "rgba(251,191,36,0.6)",  // amber
};

export function Toast({ id, variant, title, message, cta, onDismiss }: ToastProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Slide in on mount
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Force reflow then add visible class
    el.offsetHeight;
    el.style.opacity = "1";
    el.style.transform = "translateX(0)";
  }, []);

  function handleDismiss() {
    const el = ref.current;
    if (el) {
      el.style.opacity = "0";
      el.style.transform = "translateX(100%)";
      setTimeout(() => onDismiss(id), 200);
    } else {
      onDismiss(id);
    }
  }

  return (
    <div
      ref={ref}
      role="alert"
      className="flex items-start gap-3 px-4 py-3.5 rounded-xl w-80 max-w-[calc(100vw-2rem)]"
      style={{
        background: "#16162a",
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeft: `3px solid ${borderColor[variant]}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        opacity: 0,
        transform: "translateX(100%)",
        transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
      }}
    >
      <div className="flex-1 min-w-0">
        <Text variant="body-sm" color="text-1" className="font-medium">{title}</Text>
        {message && (
          <Text variant="caption" color="text-2" className="mt-1">{message}</Text>
        )}
        {cta && (
          <Button
            variant="ghost"
            size="sm"
            onClick={cta.onClick}
            className="mt-2 text-violet-400 hover:text-violet-300 px-0"
          >
            {cta.label}
          </Button>
        )}
      </div>
      <CloseButton onClick={handleDismiss} className="shrink-0 mt-0.5" />
    </div>
  );
}
