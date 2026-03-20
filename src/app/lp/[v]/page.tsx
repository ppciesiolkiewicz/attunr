import type { Metadata } from "next";
import { LandingVariant } from "@/components/LandingPage/LandingVariant";

export const metadata: Metadata = {
  title: "attunr — your voice, your calm",
  description:
    "You already know how a long hum makes you feel. attunr gives that a path — guided vocal exercises that calm your nervous system, one tone at a time.",
};

export function generateStaticParams() {
  return [{ v: "0" }, { v: "1" }, { v: "2" }, { v: "3" }, { v: "4" }, { v: "5" }, { v: "6" }, { v: "7" }, { v: "8" }];
}

export default async function LandingVariantPage({
  params,
}: {
  params: Promise<{ v: string }>;
}) {
  const { v } = await params;
  return <LandingVariant v={v} />;
}
