"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Toast, type ToastVariant } from "@/components/ui/Toast";

export interface ToastOptions {
  variant: ToastVariant;
  title: string;
  message?: string;
  cta?: { label: string; onClick: () => void };
  /** Auto-dismiss in ms. Default 6000, or 12000 if cta is present. 0 = no auto-dismiss. */
  duration?: number;
}

interface ToastEntry extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback((options: ToastOptions): string => {
    const id = crypto.randomUUID();
    const entry: ToastEntry = { ...options, id };

    setToasts((prev) => {
      const next = [...prev, entry];
      // Remove oldest if over limit
      return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
    });

    const duration = options.duration ?? (options.cta ? 12000 : 6000);
    if (duration > 0) {
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
    }

    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Toast container — fixed top-right */}
      {toasts.length > 0 && (
        <div
          className="fixed top-4 right-4 z-[60] flex flex-col gap-2.5"
          style={{ pointerEvents: "none" }}
        >
          {toasts.map((t) => (
            <div key={t.id} style={{ pointerEvents: "auto" }}>
              <Toast
                id={t.id}
                variant={t.variant}
                title={t.title}
                message={t.message}
                cta={t.cta}
                onDismiss={dismiss}
              />
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
