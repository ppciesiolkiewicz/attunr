"use client";

import { useEffect } from "react";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { HowItWorks } from "./components/HowItWorks";
import { WhatYouDo } from "./components/WhatYouDo";
import { CallToAction } from "./components/CallToAction";
import { LandingFooter } from "./components/LandingFooter";

function Divider() {
  return (
    <div className="flex justify-center py-2">
      <div
        className="w-48 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)",
        }}
      />
    </div>
  );
}

export default function LandingPage() {
  // Observe sections and fade them in on scroll
  useEffect(() => {
    const els = document.querySelectorAll(".landing-section");
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("landing-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full overflow-y-auto landing-scroll">
      <Hero />
      <Divider />
      <Features />
      <Divider />
      <WhatYouDo />
      <Divider />
      <HowItWorks />
      <Divider />
      <CallToAction />
      <LandingFooter />
    </div>
  );
}
