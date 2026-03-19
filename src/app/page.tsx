import type { Metadata } from "next";
import LandingPageV7 from "@/components/LandingPage/variants/v7/LandingPageV7";

export const metadata: Metadata = {
  title: "attunr — your voice, your calm",
  description:
    "You already know how a long hum makes you feel. attunr gives that a path — guided vocal exercises that calm your nervous system, one tone at a time.",
};

export default function Home() {
  return <LandingPageV7 />;
}
