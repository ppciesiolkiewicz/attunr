import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, getArticleBySlug } from "@/data/articles";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article — attunr" };
  return {
    title: `${article.title} — attunr`,
    description: article.excerpt,
  };
}

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-5 py-8">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1 text-sm text-white/55 hover:text-white/85 mb-6"
        >
          ← Articles
        </Link>
        <article>
          <h1 className="text-xl font-semibold text-white mb-2">{article.title}</h1>
          <div className="prose prose-invert prose-sm max-w-none">
            {article.content.split("\n\n").map((para, i) => (
              <p key={i} className="text-white/75 leading-relaxed mb-3">
                {para}
              </p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
