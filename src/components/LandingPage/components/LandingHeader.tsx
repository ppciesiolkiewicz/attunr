"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const scroller = document.querySelector(".landing-scroll");
    if (!scroller) return;

    function onScroll() {
      setScrolled(scroller!.scrollTop > 200);
    }

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 py-4 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(8,8,16,0.2)"
          : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid transparent",
      }}
    >
      <div
        className="transition-opacity duration-700 ease-out"
        style={{ opacity: scrolled ? 1 : 0 }}
      >
        <Logo layout="horizontal" size="sm" animate={4} />
      </div>

      <Link href="/journey">
        <Button variant="outline" size="sm">
          Open app
        </Button>
      </Link>
    </header>
  );
}
