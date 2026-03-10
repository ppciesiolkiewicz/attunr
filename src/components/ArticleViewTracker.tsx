"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

export default function ArticleViewTracker({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  useEffect(() => {
    analytics.articleViewed(slug, title);
  }, [slug, title]);

  return null;
}
