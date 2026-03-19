import type { Metadata } from "next";
import JourneyPage from "./JourneyPage";

export const metadata: Metadata = {
  title: "Journey",
};

export default function Journey() {
  return <JourneyPage />;
}
