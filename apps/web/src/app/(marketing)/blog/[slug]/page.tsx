import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const posts: Record<string, { title: string; content: string; date: string }> = {
  'como-comecar': {
    title: 'Como começar com Go Lev',
    content:
      'Este é um post de exemplo. Substitua pelo conteúdo real do seu blog. Você pode integrar com um CMS headless como Sanity, Contentful ou usar arquivos MDX.',
    date: '2026-01-15',
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return {};

  return {
    title: post.title,
    description: post.content.slice(0, 155),
    // noindex até termos conteúdo real (Fase 1). Remover quando publicar artigos.
    robots: { index: false, follow: true },
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-24">
      <time className="text-sm text-muted-foreground">{post.date}</time>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">{post.title}</h1>
      <div className="mt-8 prose prose-neutral dark:prose-invert max-w-none">
        <p>{post.content}</p>
      </div>
    </article>
  );
}
