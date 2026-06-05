import Image from 'next/image';
import { ScrollReveal } from '@/components/app/animations';
import { Kicker } from '@/components/app/kicker';

/**
 * Seção de depoimentos/histórias — DORMENTE.
 *
 * Removida da landing até termos relatos reais de clientes. Para reativar,
 * importe e renderize `<Depoimentos />` em `(marketing)/page.tsx` (entre `Time`
 * e `Comparacao`) e ajuste o `n` do Kicker conforme a posição na página.
 * Os dados abaixo são ilustrativos — substituir por relatos reais antes de usar.
 */
const depo = [
  { quote: 'Pela primeira vez senti que tinha alguém do meu lado — não me cobrando, mas torcendo por mim.', name: 'Ana, 34', meta: '3 meses com a Go Lev', img: 'https://i.pravatar.cc/120?img=47' },
  { quote: 'Sem dieta maluca, sem culpa. Fui no meu ritmo e, quando vi, tinha mudado de verdade.', name: 'Rafael, 41', meta: '6 meses com a Go Lev', img: 'https://i.pravatar.cc/120?img=12' },
];

export function Depoimentos({ n = '06' }: { n?: string }) {
  return (
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <ScrollReveal>
          <Kicker n={n} label="Histórias" />
          <h2 className="max-w-[20ch] text-3xl font-bold tracking-tight sm:text-4xl">
            Cada passo conta —{' '}
            <span className="font-serif font-medium italic text-primary">e a gente celebra junto.</span>
          </h2>
        </ScrollReveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {depo.map((d) => (
            <blockquote key={d.name} className="group rounded-2xl border border-border border-l-2 border-l-brand bg-background p-8 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-22px_rgba(31,59,76,0.18)]">
              <p className="font-serif text-xl italic leading-relaxed text-foreground sm:text-2xl">“{d.quote}”</p>
              <footer className="mt-6 flex items-center gap-3">
                <Image src={d.img} alt={d.name} width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                <span>
                  <span className="block text-sm font-semibold">{d.name}</span>
                  <span className="block text-sm text-ink-3">{d.meta}</span>
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
        <p className="mt-6 text-xs text-ink-3">Imagens ilustrativas. Resultados variam de pessoa para pessoa.</p>
      </div>
    </section>
  );
}
