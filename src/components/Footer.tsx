"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-white/4 px-5 py-3">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
        <div className="flex items-center gap-3">
          <span>© {year} attunr</span>
          <span className="hidden sm:inline text-white/35">·</span>
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
        </div>
        <span className="hidden sm:inline">Align your voice · find your frequency</span>
      </div>
    </footer>
  );
}
