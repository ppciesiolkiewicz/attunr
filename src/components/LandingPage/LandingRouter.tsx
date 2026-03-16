"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, lazy } from "react";

const LandingPageV0 = lazy(() => import("./LandingPage"));
const LandingPageV1 = lazy(() => import("./variants/v1/LandingPageV1"));
const LandingPageV2 = lazy(() => import("./variants/v2/LandingPageV2"));
const LandingPageV3 = lazy(() => import("./variants/v3/LandingPageV3"));
const LandingPageV4 = lazy(() => import("./variants/v4/LandingPageV4"));
const LandingPageV5 = lazy(() => import("./variants/v5/LandingPageV5"));

function LandingContent() {
  const params = useSearchParams();
  const v = params.get("v");

  switch (v) {
    case "1":
      return <LandingPageV1 />;
    case "2":
      return <LandingPageV2 />;
    case "3":
      return <LandingPageV3 />;
    case "4":
      return <LandingPageV4 />;
    case "5":
      return <LandingPageV5 />;
    case "0":
      return <LandingPageV0 />;
    default:
      return <LandingPageV5 />;
  }
}

export function LandingRouter() {
  return (
    <Suspense>
      <LandingContent />
    </Suspense>
  );
}
