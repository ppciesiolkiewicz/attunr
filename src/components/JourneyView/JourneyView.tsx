"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { JourneyList } from "./components/JourneyList";
import { journey } from "@/constants/journey";

export default function JourneyView() {
  const router = useRouter();

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
