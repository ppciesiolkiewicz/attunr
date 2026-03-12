import Link from "next/link";
import { Button } from "@/components/ui";
import Logo from "../../Logo";
import { CloseIcon, MenuJourneyIcon, MenuTrainIcon, MenuLearnIcon } from "./icons";

interface MobileMenuProps {
  pathname: string;
  onClose: () => void;
}

export function MobileMenu({ pathname, onClose }: MobileMenuProps) {
  return (
    <div
      className="fixed inset-0 z-50 sm:hidden"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm backdrop-fade sm:hidden"
        aria-hidden
      />
      <div
        className="absolute top-0 right-0 h-full w-72 max-w-[85vw] flex flex-col slide-in-right sm:hidden"
        style={{
          background: "linear-gradient(180deg, rgba(18,18,30,0.99) 0%, rgba(12,12,22,0.99) 100%)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "-12px 0 48px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="text-lg">
            <Logo layout="horizontal" size="sm" />
          </div>
          <Button variant="icon" onClick={onClose} aria-label="Close menu" className="p-2">
            <CloseIcon />
          </Button>
        </div>
        <nav className="flex flex-col gap-0.5 px-3 py-4">
          <Link
            href="/"
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
              pathname === "/" || pathname.startsWith("/journey")
                ? "bg-violet-600/90 text-white shadow-lg shadow-violet-600/20"
                : "text-white/80 hover:bg-white/[0.06] active:bg-white/[0.08]"
            }`}
            onClick={onClose}
          >
            <span className={pathname === "/" || pathname.startsWith("/journey") ? "text-white" : "text-white/60"}>
              <MenuJourneyIcon />
            </span>
            Journey
          </Link>
          <Link
            href="/train"
            className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
              pathname === "/train" ? "bg-violet-600/90 text-white shadow-lg shadow-violet-600/20" : "text-white/80 hover:bg-white/[0.06] active:bg-white/[0.08]"
            }`}
            onClick={onClose}
          >
            <span className={pathname === "/train" ? "text-white" : "text-white/60"}>
              <MenuTrainIcon />
            </span>
            Train
          </Link>
          <Link
            href="/articles"
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/[0.06] active:bg-white/[0.08] transition-all"
            onClick={onClose}
          >
            <span className="text-white/60">
              <MenuLearnIcon />
            </span>
            Learn
          </Link>
        </nav>
        <div className="mt-auto px-5 py-5 pt-5 border-t border-white/[0.06]">
          <p className="text-center text-[0.9rem] text-white/55 tracking-wide flex flex-col gap-1 items-center font-light">
            <span>Align your voice</span>
            <span className="text-violet-400/70 text-[0.5em] leading-none">●</span>
            <span>find your frequency</span>
          </p>
        </div>
      </div>
    </div>
  );
}
