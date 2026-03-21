import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Loading from "./loading";

const LandingPageV8 = dynamic(
  () => import("@/components/LandingPage/variants/v8/LandingPageV8"),
  { loading: () => <Loading /> },
);

export const metadata: Metadata = {
  title: "attunr — your voice, your calm",
  description:
    "You already know how a long hum makes you feel. attunr gives that a path — guided vocal exercises that calm your nervous system, one tone at a time.",
};

export default function Home() {
  return <LandingPageV8 />;
}
