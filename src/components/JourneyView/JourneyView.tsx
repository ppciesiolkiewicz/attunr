"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { JourneyList } from "./components/JourneyList";
import { journey } from "@/constants/journey";
import { analytics } from "@/lib/analytics";

export default function JourneyView() {
  const router = useRouter();

  useEffect(() => {
    analytics.journeyViewed();
  }, []);

  return (
    <div className="h-full">
      <Suspense>
        <JourneyList
          onSelect={(exercise) => router.push(journey.exerciseHref(exercise))}
        />
      </Suspense>
    </div>
  );
}
