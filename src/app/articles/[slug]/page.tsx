import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, getArticleBySlug } from "@/data/articles";
import ArticleViewTracker from "@/components/ArticleViewTracker";
import { Text } from "@/components/ui/Text";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article" };
  return {
    title: article.title,
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
      <ArticleViewTracker slug={article.slug} title={article.title} />
      <div className="max-w-xl mx-auto px-5 py-8">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1 text-sm text-white/65 hover:text-white/90 mb-6"
        >
          ← Articles
        </Link>
        <article>
          <Text variant="heading" className="mb-2">{article.title}</Text>
          <div className="prose prose-invert prose-sm max-w-none">
            {article.content.split("\n\n").map((para, i) => (
              <Text key={i} variant="body" color="text-1" className="mb-3">
                {para}
              </Text>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
