import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Conheça as funcionalidades do Go Lev.',
};

export default function FeaturesPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <h1 className="text-center text-4xl font-bold tracking-tight">
        Funcionalidades
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
        Tudo incluído para você focar no que importa: seu produto.
      </p>
    </section>
  );
}
