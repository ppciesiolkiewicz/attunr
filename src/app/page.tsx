import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "attunr — somatic regulation through voice",
  description:
    "Guided vocal exercises that activate your nervous system, deepen your breath, and bring you back to calm.",
};

export default function Home() {
  return <LandingPage />;
}
