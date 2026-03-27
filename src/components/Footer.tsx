"use client";

import Link from "next/link";
import { Text } from "@/components/ui";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export default function Footer() {
  const year = new Date().getFullYear();
  const { canInstall, install } = useInstallPrompt();

  return (
    <footer className="shrink-0 border-t border-white/4 px-5 py-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
        <div className="flex items-center gap-3">
          <Text as="span" variant="caption" color="muted-1">© {year} attunr</Text>
          <Text as="span" variant="caption" color="muted-2" className="hidden sm:inline">·</Text>
          <Link
            href="/privacy"
            className="hover:text-white/70 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-white/70 transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/manifesto"
            className="hover:text-white/70 transition-colors"
          >
            Manifesto
          </Link>
          <Link
            href="/contact"
            className="hover:text-white/70 transition-colors"
          >
            Talk to us
          </Link>
          {canInstall && (
            <button
              type="button"
              onClick={install}
              className="hover:text-white/70 transition-colors cursor-pointer"
            >
              Install app
            </button>
          )}
        </div>
        <Text as="span" variant="caption" color="muted-1" className="hidden sm:inline">Align your voice · find your frequency</Text>
      </div>
    </footer>
  );
}
