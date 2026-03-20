import Link from "next/link";
import Logo from "@/components/Logo";

export function LandingFooter() {
  return (
    <footer className="px-6 py-12 border-t border-white/[0.04]">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo layout="horizontal" size="sm" />
        <div className="flex items-center gap-6 text-xs text-white/35">
          <Link href="/privacy" className="hover:text-white/55 transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white/55 transition-colors">
            Terms
          </Link>
          <Link href="/manifesto" className="hover:text-white/55 transition-colors">
            Manifesto
          </Link>
        </div>
      </div>
    </footer>
  );
}
