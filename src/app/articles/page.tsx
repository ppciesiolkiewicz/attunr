import Link from "next/link";
import { ARTICLES } from "@/data/articles";

export const metadata = {
  title: "Articles",
  description:
    "Learn about chakra tones, vocal warmups, Solfeggio frequencies, and sound healing.",
};

export default function ArticlesPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-5 py-8">
        <h1 className="text-xl font-semibold text-white mb-1">Articles</h1>
        <p className="text-sm text-white/55 mb-6">
          Short reads on chakra tones, voice, and sound.
        </p>
        <div className="flex flex-col gap-4">
          {ARTICLES.map((a) => (
            <Link
              key={a.slug}
              href={"/articles/" + a.slug}
              className="block rounded-xl p-4 border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <h2 className="text-base font-medium text-white">{a.title}</h2>
              <p className="text-sm text-white/55 mt-1">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
