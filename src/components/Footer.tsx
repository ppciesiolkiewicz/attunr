"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 px-5 py-3 border-t border-white/[0.04]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
        <div className="flex items-center gap-3">
          <span>© {year} attunr</span>
          <span className="hidden sm:inline text-white/25">·</span>
          <Link
            href="/privacy"
            className="hover:text-white/60 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-white/60 transition-colors"
          >
            Terms
          </Link>
        </div>
        <span>Align your voice · find your frequency</span>
      </div>
    </footer>
  );
}
