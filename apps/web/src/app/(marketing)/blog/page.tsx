import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Artigos sobre produto, tecnologia e boas práticas para SaaS.',
  // noindex até termos conteúdo real (Fase 1). Remover quando publicar artigos.
  robots: { index: false, follow: true },
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | Go Lev',
    description: 'Artigos sobre produto, tecnologia e boas práticas para SaaS.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

const posts = [
  {
    slug: 'como-comecar',
    title: 'Como começar com Go Lev',
    excerpt: 'Um guia rápido para dar os primeiros passos na plataforma Go Lev.',
    date: '2026-01-15',
  },
];

export default function BlogPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Artigos sobre produto, tecnologia e boas práticas.
      </p>

      <div className="mt-12 space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="group">
            <Link href={`/blog/${post.slug}`} className="block">
              <time className="text-sm text-muted-foreground">{post.date}</time>
              <h2 className="mt-1 text-xl font-semibold group-hover:text-brand transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
