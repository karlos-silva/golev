import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Stethoscope } from 'lucide-react';
import { CalculadoraImc } from '@/components/app/calculadora-imc';
import { Accordion } from '@/components/app/accordion';
import { Kicker } from '@/components/app/kicker';
import { buttonVariants } from '@/components/ui/button';
import { FadeIn, SlideUp, ScrollReveal } from '@/components/app/animations';
import { JsonLd, breadcrumbSchema, faqPageSchema } from '@/components/app/schema';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Calculadora de IMC',
  description:
    'Calcule seu IMC (Índice de Massa Corporal) grátis e descubra sua faixa de peso — abaixo do peso, normal, sobrepeso ou obesidade. Simples, rápido e sem cadastro.',
  alternates: { canonical: '/calculadora-imc' },
  openGraph: {
    title: 'Calculadora de IMC — Go Lev',
    description: 'Descubra seu IMC e sua faixa de peso em segundos. Grátis e sem cadastro.',
    type: 'website',
    url: '/calculadora-imc',
  },
};

const FAIXAS: { faixa: string; classe: string; dot: string }[] = [
  { faixa: 'Abaixo de 18,5', classe: 'Abaixo do peso', dot: 'var(--gl-support)' },
  { faixa: '18,5 – 24,9', classe: 'Peso normal', dot: 'var(--gl-primary)' },
  { faixa: '25,0 – 29,9', classe: 'Sobrepeso', dot: 'var(--gl-accent)' },
  { faixa: '30,0 – 34,9', classe: 'Obesidade grau I', dot: 'var(--gl-accent-strong)' },
  { faixa: '35,0 – 39,9', classe: 'Obesidade grau II', dot: 'var(--gl-accent-strong)' },
  { faixa: '40,0 ou mais', classe: 'Obesidade grau III', dot: 'var(--gl-accent-strong)' },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: 'O que é o IMC?',
    a: 'O Índice de Massa Corporal (IMC) relaciona seu peso e sua altura para classificar, de forma simples, se você está abaixo do peso, com peso normal, sobrepeso ou obesidade. É uma triagem inicial — não um diagnóstico.',
  },
  {
    q: 'Como calcular o IMC?',
    a: 'Divida o peso (em quilos) pela altura (em metros) elevada ao quadrado. Exemplo: 72 kg ÷ (1,70 m × 1,70 m) ≈ 24,9. A calculadora acima faz essa conta automaticamente.',
  },
  {
    q: 'Qual é o IMC ideal?',
    a: 'A Organização Mundial da Saúde considera normal a faixa de 18,5 a 24,9. A partir de 25 é sobrepeso e, de 30 em diante, obesidade. Ainda assim, o IMC é só um indicador — pessoas com muita massa muscular, por exemplo, podem ter IMC alto sem excesso de gordura.',
  },
  {
    q: 'IMC alto significa que preciso de remédio para emagrecer?',
    a: 'Não necessariamente. O IMC é um ponto de partida. A indicação de qualquer tratamento depende de uma avaliação médica que considera seu histórico completo. Na Go Lev, essa avaliação inicial é gratuita.',
  },
];

export default function CalculadoraImcPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Início', url: '/' },
            { name: 'Calculadora de IMC', url: '/calculadora-imc' },
          ]),
          faqPageSchema(FAQ),
          {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Calculadora de IMC',
            url: `${SITE_URL}/calculadora-imc`,
            applicationCategory: 'HealthApplication',
            operatingSystem: 'Web',
            inLanguage: 'pt-BR',
            isAccessibleForFree: true,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
            provider: { '@id': `${SITE_URL}/#organization` },
          },
        ]}
      />

      {/* ---------- HERO: ferramenta + atmosfera da marca ---------- */}
      <section className="relative isolate -mt-16 overflow-hidden pt-16">
        {/* mesh gradient */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(46% 56% at 88% 2%, color-mix(in srgb, var(--gl-accent) 44%, transparent), transparent 60%), radial-gradient(42% 52% at 4% 18%, color-mix(in srgb, var(--gl-support) 46%, transparent), transparent 62%), radial-gradient(64% 64% at 72% 104%, color-mix(in srgb, var(--gl-primary) 24%, transparent), transparent 64%), linear-gradient(165deg, var(--gl-surface), var(--gl-accent-tint))',
          }}
        />
        {/* grão */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        {/* dot grid com máscara */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: 'radial-gradient(var(--gl-ink) 1px, transparent 1.4px)',
            backgroundSize: '22px 22px',
            opacity: 0.05,
            WebkitMaskImage: 'radial-gradient(120% 90% at 50% 0%, #000 22%, transparent 70%)',
            maskImage: 'radial-gradient(120% 90% at 50% 0%, #000 22%, transparent 70%)',
          }}
        />
        {/* emenda com o paper */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 -z-10 h-40"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--gl-paper))' }}
        />

        <div className="mx-auto max-w-2xl px-6 pb-20 pt-12 sm:pt-16">
          <FadeIn>
            <nav aria-label="Trilha" className="flex items-center gap-1.5 text-sm text-ink-3">
              <Link href="/" className="transition-colors hover:text-foreground">
                Início
              </Link>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              <span className="text-ink-2">Calculadora de IMC</span>
            </nav>
          </FadeIn>

          <SlideUp delay={0.05}>
            <div className="mt-7 flex items-center gap-3">
              <svg viewBox="0 0 329 367" aria-hidden className="h-5 w-auto shrink-0">
                <path fill="var(--gl-accent)" d="M81.659 237.551C78.2552 237.126 76.2396 237.299 72.659 237.551C77.8254 234.262 81.1577 232.93 87.159 231.051L117.159 208.051C116.877 207.588 116.601 207.378 116.159 207.051C117.233 206.823 117.817 206.827 119.159 207.051C142.181 192.366 153.653 185.254 180.659 177.051C174.266 174.284 170.492 173.51 163.659 172.551C171.365 171.537 175.856 171.253 184.159 171.551C201.233 155.287 195.502 139.605 228.5 130.331C159.446 124.186 147.23 128.931 87.159 180.543C71.3519 209.092 47.0556 258.348 30.6342 298.426C33.1963 293.013 62.6775 254.035 81.659 237.551Z" />
                <path fill="var(--gl-primary)" d="M0.768685 356.051C-2.00099 370.156 3.12815 369.865 9.53604 357.051C17.4194 336.132 23.1761 316.628 30.6342 298.426C47.0556 258.348 71.3519 209.092 87.159 180.543C166.148 99.2141 202.823 78.3918 317.135 40.0508C335.773 31.6674 332.164 19.921 305.269 19.0547C296.092 19.02 271.977 18.0434 261.269 19.0547C250.562 20.066 272.608 6.62535 282.769 0.054714C225.417 -0.970039 198.696 12.0649 163.269 67.5547L171.269 40.0547C141.707 58.9603 129.101 74.9208 116.769 116.555C116.741 105.829 117.304 99.2905 120.769 86.5547C56.1105 205.353 31.0787 262.687 0.768685 356.051Z" />
              </svg>
              <span aria-hidden className="h-4 w-px bg-line" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-2">
                Ferramenta gratuita
              </span>
            </div>
          </SlideUp>

          <SlideUp delay={0.1}>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Calculadora de IMC
            </h1>
          </SlideUp>

          <SlideUp delay={0.15}>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Descubra seu Índice de Massa Corporal e veja em qual faixa você está, pela classificação
              da OMS.{' '}
              <span className="font-serif italic text-primary">Grátis e sem cadastro.</span>
            </p>
          </SlideUp>

          <SlideUp delay={0.2}>
            <div className="mt-9">
              <CalculadoraImc />
            </div>
          </SlideUp>
        </div>
      </section>

      {/* ---------- CONTEÚDO ---------- */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-2xl px-6 py-20 sm:py-24">
          <ScrollReveal>
            <Kicker n="01" label="Entenda" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              O que é o <span className="font-serif font-medium italic text-primary">IMC</span>?
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              O <strong className="text-foreground">Índice de Massa Corporal</strong> relaciona peso e
              altura para estimar se uma pessoa está dentro de uma faixa de peso saudável. É calculado
              dividindo o peso (kg) pela altura (em metros) ao quadrado: IMC = peso ÷ altura². Por ser
              simples e rápido, é a triagem mais usada no mundo — mas funciona como ponto de partida, não
              como diagnóstico.
            </p>
          </ScrollReveal>

          <ScrollReveal className="mt-20">
            <Kicker n="02" label="Referência" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              As faixas, <span className="font-serif font-medium italic text-primary">sem mistério.</span>
            </h2>
            <div className="mt-6 overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-support-tint/60">
                    <th className="px-5 py-3.5 font-semibold text-primary-strong">IMC</th>
                    <th className="px-5 py-3.5 font-semibold text-primary-strong">Classificação</th>
                  </tr>
                </thead>
                <tbody>
                  {FAIXAS.map((f, i) => (
                    <tr key={f.classe} className={i % 2 === 1 ? 'bg-card' : 'bg-background'}>
                      <td className="border-t border-border px-5 py-3.5 font-medium tabular-nums text-foreground">
                        {f.faixa}
                      </td>
                      <td className="border-t border-border px-5 py-3.5 text-muted-foreground">
                        <span className="inline-flex items-center gap-2.5">
                          <span
                            aria-hidden
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: f.dot }}
                          />
                          {f.classe}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>

          <ScrollReveal className="mt-20">
            <Kicker n="03" label="Importante" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Os <span className="font-serif font-medium italic text-primary">limites</span> do IMC
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              O IMC não distingue gordura de massa muscular nem mostra onde a gordura está distribuída.
              Atletas podem ter IMC alto sem excesso de gordura, e pessoas idosas podem ter IMC normal com
              pouca massa muscular. Por isso, para decidir qualquer cuidado ou tratamento, o número precisa
              ser lido por um <strong className="text-foreground">médico</strong>, junto do seu histórico
              de saúde.
            </p>
          </ScrollReveal>

          <ScrollReveal className="mt-20">
            <Kicker n="04" label="Perguntas frequentes" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              A gente <span className="font-serif font-medium italic text-primary">te explica.</span>
            </h2>
            <div className="mt-6">
              <Accordion items={FAQ} />
            </div>
          </ScrollReveal>

          <ScrollReveal className="mt-16">
            <div className="rounded-2xl border border-border bg-support-tint/40 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold tracking-tight">Informativo, não substitui consulta</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                    Esta calculadora tem caráter educativo. Para saber se você tem indicação para
                    acompanhamento de emagrecimento, faça uma avaliação médica — gratuita e em poucos
                    minutos.
                  </p>
                </div>
              </div>
              <Link
                href="/avaliacao?utm_source=calculadora-imc&utm_medium=tool"
                className={buttonVariants({
                  variant: 'accent',
                  size: 'lg',
                  className: 'group/btn mt-5 w-full sm:ml-14 sm:w-auto',
                })}
              >
                Fazer avaliação gratuita
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
