import Link from "next/link";
import { Button } from "@/components/ui";

export function CallToAction() {
  return (
    <section className="landing-section relative px-6 py-16 sm:py-20 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-xl mx-auto text-center">
        <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white leading-snug mb-3">
          Your voice is already the instrument.
        </p>
        <p className="text-xl sm:text-2xl md:text-3xl text-white/45 leading-snug mb-12">
          attunr shows you how to play it.
        </p>

        <Link href="/journey">
          <Button size="lg" className="px-14 text-lg glow-pulse">
            Start your practice
          </Button>
        </Link>
      </div>
    </section>
  );
}
