import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CalculadoraImc } from '@/components/app/calculadora-imc';
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

const FAIXAS: { faixa: string; classe: string }[] = [
  { faixa: 'Abaixo de 18,5', classe: 'Abaixo do peso' },
  { faixa: '18,5 – 24,9', classe: 'Peso normal' },
  { faixa: '25,0 – 29,9', classe: 'Sobrepeso' },
  { faixa: '30,0 – 34,9', classe: 'Obesidade grau I' },
  { faixa: '35,0 – 39,9', classe: 'Obesidade grau II' },
  { faixa: '40,0 ou mais', classe: 'Obesidade grau III' },
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
    <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
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

      {/* breadcrumb visível */}
      <nav aria-label="Trilha" className="flex items-center gap-1.5 text-sm text-ink-3">
        <Link href="/" className="transition-colors hover:text-foreground">
          Início
        </Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-ink-2">Calculadora de IMC</span>
      </nav>

      <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
        Calculadora de IMC
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-2">
        Descubra seu Índice de Massa Corporal em segundos. Informe sua altura e seu peso — a calculadora
        mostra o resultado e a faixa correspondente, de acordo com a classificação da OMS. Grátis e sem
        cadastro.
      </p>

      <div className="mt-8">
        <CalculadoraImc />
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-bold tracking-tight">O que é o IMC?</h2>
        <p className="mt-3 leading-relaxed text-ink-2">
          O <strong className="text-foreground">Índice de Massa Corporal</strong> é uma medida que
          relaciona peso e altura para estimar se uma pessoa está dentro de uma faixa de peso saudável.
          Ele é calculado dividindo o peso (kg) pela altura (em metros) ao quadrado: IMC = peso ÷
          altura². Por ser simples e rápido, é a triagem mais usada no mundo — mas funciona como ponto de
          partida, não como diagnóstico.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">Faixas de IMC (OMS)</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ background: 'var(--gl-support-tint)' }}>
                <th className="px-5 py-3 font-semibold text-primary-strong">IMC</th>
                <th className="px-5 py-3 font-semibold text-primary-strong">Classificação</th>
              </tr>
            </thead>
            <tbody>
              {FAIXAS.map((f, i) => (
                <tr key={f.classe} className={i % 2 === 1 ? 'bg-surface' : undefined}>
                  <td className="border-t border-line px-5 py-3 font-medium text-foreground">
                    {f.faixa}
                  </td>
                  <td className="border-t border-line px-5 py-3 text-ink-2">{f.classe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">Os limites do IMC</h2>
        <p className="mt-3 leading-relaxed text-ink-2">
          O IMC não distingue gordura de massa muscular nem mostra onde a gordura está distribuída. Atletas
          podem ter IMC alto sem excesso de gordura, e pessoas idosas podem ter IMC normal com pouca massa
          muscular. Por isso, para decidir qualquer cuidado ou tratamento, o número precisa ser lido por um{' '}
          <strong className="text-foreground">médico</strong>, junto do seu histórico de saúde.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight">Perguntas frequentes</h2>
        <dl className="mt-4 divide-y divide-line rounded-xl border border-line">
          {FAQ.map((item) => (
            <div key={item.q} className="px-5 py-4">
              <dt className="font-semibold text-foreground">{item.q}</dt>
              <dd className="mt-1.5 leading-relaxed text-ink-2">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-12 rounded-xl border border-line bg-surface px-5 py-4 text-sm leading-relaxed text-ink-3">
        Esta calculadora tem caráter informativo e não substitui avaliação médica. Para entender se você tem
        indicação para acompanhamento de emagrecimento,{' '}
        <Link
          href="/avaliacao?utm_source=calculadora-imc&utm_medium=tool"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          faça a avaliação gratuita da Go Lev
        </Link>
        .
      </p>
    </div>
  );
}
