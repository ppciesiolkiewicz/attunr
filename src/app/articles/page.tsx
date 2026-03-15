import Link from "next/link";
import { ARTICLES } from "@/data/articles";
import { Text } from "@/components/ui/Text";

export const metadata = {
  title: "Articles",
  description:
    "Why humming calms you down, how breath and voice regulate your nervous system, and the science behind somatic vocal practice.",
};

export default function ArticlesPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-5 py-8">
        <Text variant="heading" className="mb-1">Articles</Text>
        <Text variant="body-sm" color="text-2" className="mb-6">
          Short reads on vocal placement, voice, and sound.
        </Text>
        <div className="flex flex-col gap-4">
          {ARTICLES.map((a) => (
            <Link
              key={a.slug}
              href={"/articles/" + a.slug}
              className="block rounded-xl p-4 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <Text variant="body" as="h2" className="font-medium">{a.title}</Text>
              <Text variant="body-sm" color="text-2" className="mt-1">{a.excerpt}</Text>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
