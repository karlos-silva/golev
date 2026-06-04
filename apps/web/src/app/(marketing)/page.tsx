'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  FadeIn,
  SlideUp,
  ScrollReveal,
  StaggerChildren,
  StaggerItem,
  motion,
} from '@/components/app/animations';
import { Accordion } from '@/components/app/accordion';
import { Kicker } from '@/components/app/kicker';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  ArrowRight,
  Check,
  Minus,
  ShieldCheck,
  HeartHandshake,
  Activity,
  Sparkles,
  Stethoscope,
  Brain,
  Salad,
  Timer,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ----------------------------------------------------------- HERO */
function Hero() {
  const meta = [
    { k: 'Avaliação', v: 'Inicial gratuita' },
    { k: 'Cuidado', v: 'Acompanhamento médico' },
    { k: 'Ritmo', v: 'No seu tempo' },
  ];
  return (
    <section className="relative isolate -mt-16 flex min-h-screen items-center overflow-hidden pt-16">
      {/* fundo em gradiente (mesh) + textura — o efeito logo na entrada */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(50% 60% at 86% 6%, color-mix(in srgb, var(--gl-accent) 55%, transparent), transparent 60%), radial-gradient(46% 56% at 8% 28%, color-mix(in srgb, var(--gl-primary) 38%, transparent), transparent 60%), radial-gradient(60% 70% at 72% 92%, color-mix(in srgb, var(--gl-support) 45%, transparent), transparent 64%), linear-gradient(160deg, var(--gl-surface), var(--gl-accent-tint))',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* textura de pontos (dot grid) com máscara suave */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: 'radial-gradient(var(--gl-ink) 1px, transparent 1.4px)',
          backgroundSize: '22px 22px',
          opacity: 0.06,
          WebkitMaskImage: 'radial-gradient(115% 100% at 50% 0%, #000 25%, transparent 72%)',
          maskImage: 'radial-gradient(115% 100% at 50% 0%, #000 25%, transparent 72%)',
        }}
      />
      {/* emenda suave com o fundo da página */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40" style={{ background: 'linear-gradient(to bottom, transparent, var(--gl-paper))' }} />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-24">
        {/* coluna de texto */}
        <div>
          <FadeIn>
            {/* eyebrow editorial — lockup de masthead com a pena da marca */}
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 329 367" aria-hidden className="h-5 w-auto shrink-0">
                <path fill="var(--gl-accent)" d="M81.659 237.551C78.2552 237.126 76.2396 237.299 72.659 237.551C77.8254 234.262 81.1577 232.93 87.159 231.051L117.159 208.051C116.877 207.588 116.601 207.378 116.159 207.051C117.233 206.823 117.817 206.827 119.159 207.051C142.181 192.366 153.653 185.254 180.659 177.051C174.266 174.284 170.492 173.51 163.659 172.551C171.365 171.537 175.856 171.253 184.159 171.551C201.233 155.287 195.502 139.605 228.5 130.331C159.446 124.186 147.23 128.931 87.159 180.543C71.3519 209.092 47.0556 258.348 30.6342 298.426C33.1963 293.013 62.6775 254.035 81.659 237.551Z" />
                <path fill="var(--gl-primary)" d="M0.768685 356.051C-2.00099 370.156 3.12815 369.865 9.53604 357.051C17.4194 336.132 23.1761 316.628 30.6342 298.426C47.0556 258.348 71.3519 209.092 87.159 180.543C166.148 99.2141 202.823 78.3918 317.135 40.0508C335.773 31.6674 332.164 19.921 305.269 19.0547C296.092 19.02 271.977 18.0434 261.269 19.0547C250.562 20.066 272.608 6.62535 282.769 0.054714C225.417 -0.970039 198.696 12.0649 163.269 67.5547L171.269 40.0547C141.707 58.9603 129.101 74.9208 116.769 116.555C116.741 105.829 117.304 99.2905 120.769 86.5547C56.1105 205.353 31.0787 262.687 0.768685 356.051Z" />
              </svg>
              <span aria-hidden className="h-4 w-px bg-line" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-2">
                Emagrecimento com{' '}
                <span className="text-brand">acompanhamento humano</span>
              </span>
            </div>
          </FadeIn>
          <SlideUp delay={0.05}>
            <h1 className="mt-5 max-w-[15ch] text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
              Cuidado que{' '}
              <span className="font-serif font-medium italic text-primary">eleva</span>{' '}
              quem decide mudar.
            </h1>
          </SlideUp>
          <SlideUp delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              A Go&nbsp;Lev une acompanhamento médico e proximidade humana para você
              emagrecer com segurança — sem dietas malucas, sem julgamento, no seu ritmo.
            </p>
          </SlideUp>
          <SlideUp delay={0.15}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/avaliacao" className={buttonVariants({ size: 'lg' })}>
                Ver se faz sentido pra mim
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
              </Link>
              <Link href="#como-funciona" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                Como funciona
              </Link>
            </div>
          </SlideUp>
          <SlideUp delay={0.2}>
            <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-10 sm:gap-y-6">
              {meta.map((m) => (
                <div key={m.k} className="border-l-2 pl-3.5" style={{ borderColor: 'var(--gl-accent)' }}>
                  <div className="text-xs uppercase tracking-[0.12em] text-ink-3">{m.k}</div>
                  <div className="mt-0.5 font-semibold sm:whitespace-nowrap">{m.v}</div>
                </div>
              ))}
            </div>
          </SlideUp>
        </div>

        {/* coluna visual — composição editorial */}
        <SlideUp delay={0.12} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative">
            {/* halo suave atrás da imagem */}
            <div
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-[2.6rem] opacity-70 blur-2xl"
              style={{ background: 'radial-gradient(60% 60% at 60% 30%, var(--gl-accent), transparent 70%)' }}
            />
            {/* moldura da imagem */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/60 shadow-[0_40px_90px_-30px_rgba(31,59,76,0.45)]">
              <Image
                src="/hero.png"
                alt="Cliente da Go Lev segurando a caixa da marca"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 460px"
                className="object-cover"
              />
              {/* leve degradê para legibilidade do chip sobre a base da foto */}
              <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 62%, color-mix(in srgb, var(--gl-primary-strong) 18%, transparent))' }} />
            </div>

            {/* selo de avaliação gratuita */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65, type: 'spring', stiffness: 220, damping: 18 }}
              className="absolute -right-3 top-8 flex items-center gap-2 rounded-full border border-white/60 bg-white/80 py-2 pl-2.5 pr-3.5 shadow-[0_14px_30px_-14px_rgba(31,59,76,0.45)] backdrop-blur-md"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                <ShieldCheck className="h-3.5 w-3.5 text-primary-foreground" />
              </span>
              <span className="text-xs font-bold text-foreground">Avaliação gratuita</span>
            </motion.div>
          </div>
        </SlideUp>
      </div>
    </section>
  );
}

/* ------------------------------------------------- COMO FUNCIONA */
const steps = [
  { n: '01', title: 'Avaliação', desc: 'Você conta sua história e seus objetivos. A gente escuta com atenção — sem cobrança, sem julgamento.' },
  { n: '02', title: 'Plano sob medida', desc: 'Um time de saúde monta um acompanhamento pensado pro seu corpo e a sua rotina. Nada genérico.' },
  { n: '03', title: 'Acompanhamento', desc: 'Consultas, mensagens e suporte de verdade. A gente segue junto, não só no começo.' },
  { n: '04', title: 'No seu ritmo', desc: 'Ajustes ao longo do caminho, respeitando o seu tempo. Aqui, cada passo conta.' },
];
function ComoFunciona() {
  return (
    <section id="como-funciona" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <ScrollReveal>
          <Kicker n="01" label="Como funciona" />
          <h2 className="max-w-[18ch] text-3xl font-bold tracking-tight sm:text-4xl">
            Do primeiro passo ao seu ritmo,{' '}
            <span className="font-serif font-medium italic text-primary">sem pressa.</span>
          </h2>
        </ScrollReveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="group bg-card p-8 transition-colors duration-300 hover:bg-support-tint/40">
              <div className="font-serif text-3xl italic text-brand transition-transform duration-300 group-hover:-translate-y-0.5">{s.n}</div>
              <h3 className="mt-4 text-xl font-bold tracking-tight">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- ABORDAGEM */
const pilares: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: ShieldCheck, title: 'Acompanhamento médico', desc: 'Profissionais de saúde ao seu lado em cada etapa. Segurança vem primeiro, sempre.' },
  { icon: HeartHandshake, title: 'Sem julgamento', desc: 'Um espaço pra mudar com leveza, no seu tempo. A gente torce por você de verdade.' },
  { icon: Activity, title: 'Base científica', desc: 'Decisões guiadas por evidência e bom senso — nada de modismo ou promessa milagrosa.' },
  { icon: Sparkles, title: 'Cuidado contínuo', desc: 'Acompanhamento próximo que continua depois do começo. Você nunca fica sozinho.' },
];
function Abordagem() {
  return (
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <ScrollReveal>
          <Kicker n="02" label="Nossa abordagem" />
          <h2 className="max-w-[20ch] text-3xl font-bold tracking-tight sm:text-4xl">
            A gente acompanha.{' '}
            <span className="font-serif font-medium italic text-primary">Não cobra.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Não vendemos um “antes e depois”. Caminhamos junto com quem decidiu mudar,
            com método, ciência e respeito ao ritmo de cada um.
          </p>
        </ScrollReveal>
        <StaggerChildren staggerDelay={0.08} className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {pilares.map((p) => (
            <StaggerItem key={p.title}>
              <div className="group h-full bg-background p-7 transition-colors duration-300 hover:bg-support-tint/40">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-surface ring-1 ring-line">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold tracking-tight">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

/* ----------------------------------------------------- TRATAMENTOS */
function Pen({ band, base = false }: { band: string; base?: boolean }) {
  return (
    <svg viewBox="0 0 120 244" width="116" height="208" aria-hidden>
      <ellipse cx="60" cy={base ? 236 : 232} rx="27" ry="5" fill="rgba(0,0,0,0.07)" />
      {/* corpo */}
      <rect x="45" y="62" width="30" height="158" rx="13" fill="#FCFBF9" stroke="rgba(0,0,0,0.10)" />
      {/* brilho lateral */}
      <rect x="50" y="74" width="5" height="120" rx="2.5" fill="#ffffff" opacity="0.85" />
      {/* banda de acento (dose) */}
      <rect x="45" y="150" width="30" height="24" fill={band} />
      <rect x="45" y="150" width="30" height="24" fill="#000000" opacity="0.06" />
      {/* janela de dose */}
      <rect x="55" y="118" width="10" height="22" rx="2" fill="#EAE8E3" />
      {/* tampa */}
      <rect x="47" y="24" width="26" height="44" rx="11" fill="#F1EFEA" stroke="rgba(0,0,0,0.08)" />
      <rect x="47" y="38" width="26" height="6" fill={band} opacity="0.55" />
      {base ? (
        <>
          <rect x="53" y="216" width="14" height="8" fill="#D9D6D1" />
          <rect x="38" y="220" width="44" height="16" rx="7" fill="#E7E4DF" stroke="rgba(0,0,0,0.06)" />
        </>
      ) : (
        <rect x="56" y="216" width="8" height="16" rx="2" fill="#D2CFCA" />
      )}
    </svg>
  );
}

const tratamentos: { nome: string; brands: string[]; band: string; base: boolean }[] = [
  { nome: 'Semaglutida', brands: ['Ozempic®', 'Wegovy®'], band: 'var(--gl-accent)', base: false },
  { nome: 'Tirzepatida', brands: ['Mounjaro®'], band: 'var(--gl-primary)', base: true },
];

function Tratamentos() {
  return (
    <section id="tratamentos" className="scroll-mt-20 border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <ScrollReveal>
          <Kicker n="03" label="Tratamentos" />
          <h2 className="max-w-[24ch] text-3xl font-bold tracking-tight sm:text-4xl">
            Faça uma avaliação médica e tenha o{' '}
            <span className="font-serif font-medium italic text-primary">diagnóstico certo.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Existem tratamentos seguros e registrados na ANVISA que atuam como inibidores de
            apetite, cada um com um princípio ativo. É essencial que o médico entenda a sua
            necessidade antes de qualquer prescrição.
          </p>
        </ScrollReveal>
        <StaggerChildren staggerDelay={0.1} className="mt-14 grid gap-6 sm:grid-cols-2">
          {tratamentos.map((t) => (
            <StaggerItem key={t.nome}>
              <div className="group overflow-hidden rounded-2xl border border-border bg-card transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-support hover:shadow-[0_28px_60px_-24px_rgba(31,59,76,0.22)]">
                <div
                  className="flex h-64 items-center justify-center"
                  style={{ background: 'radial-gradient(130% 95% at 50% 0%, var(--gl-accent-tint), var(--gl-surface) 72%)' }}
                >
                  <div className="transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                    <Pen band={t.band} base={t.base} />
                  </div>
                </div>
                <div className="p-7">
                  <h3 className="text-xl font-bold tracking-tight">{t.nome}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                    Princípio ativo encontrado em tratamentos como{' '}
                    {t.brands.map((b, i) => (
                      <span key={b}>
                        {i > 0 && ' e '}
                        <span
                          className="font-medium text-foreground underline decoration-2 underline-offset-4"
                          style={{ textDecorationColor: 'var(--gl-accent)' }}
                        >
                          {b}
                        </span>
                      </span>
                    ))}
                    . Sob prescrição.
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
        <p className="mt-6 text-xs leading-relaxed text-ink-3">
          O uso de qualquer medicamento depende de avaliação e prescrição médica individual.
          Esta página é informativa e não substitui uma consulta.
        </p>
      </div>
    </section>
  );
}

/* --------------------------------------------------- GLP-1 EXPLAINER */
const glpSteps: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Sparkles, title: 'O corpo já conhece', body: 'O GLP‑1 é um hormônio que você mesmo produz — ele ajuda a regular a fome e a sensação de saciedade. Nada de exótico.' },
  { icon: Brain, title: 'A medicação reforça o sinal', body: 'Análoga a esse hormônio, ela conversa com o cérebro: a vontade de comer aperta menos ao longo do dia.' },
  { icon: Timer, title: 'A digestão fica mais calma', body: 'O estômago esvazia mais devagar, então a saciedade dura mais tempo depois das refeições.' },
  { icon: Salad, title: 'Você come o suficiente', body: 'Sem passar fome o dia inteiro, fica mais fácil seguir o plano e manter a mudança no seu ritmo.' },
];
function ExplicaGLP() {
  return (
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-28">
        <ScrollReveal>
          <Kicker n="04" label="Entenda o GLP‑1" />
          <h2 className="max-w-[22ch] text-3xl font-bold tracking-tight sm:text-4xl">
            Sem mistério,{' '}
            <span className="font-serif font-medium italic text-primary">sem promessa mágica.</span>
          </h2>
          <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-muted-foreground">
            Como o GLP‑1 age no seu corpo, em quatro passos — porque decidir com clareza faz parte do cuidado.
          </p>
        </ScrollReveal>

        {/* Trilha: o fio se desenha conforme rola; cada passo surge em sequência */}
        <div className="relative mt-14 sm:mt-16">
          <motion.div
            aria-hidden
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ transformOrigin: 'top' }}
            className="absolute left-[23px] top-6 bottom-10 w-0.5 rounded-full bg-gradient-to-b from-support via-support to-support/10"
          />
          <StaggerChildren className="space-y-9" staggerDelay={0.16}>
            {glpSteps.map((s, i) => {
              const isLast = i === glpSteps.length - 1;
              return (
                <StaggerItem key={s.title}>
                  <div className="relative flex items-start gap-5 sm:gap-6">
                    <div
                      className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        isLast
                          ? 'border-transparent bg-brand text-white shadow-[0_12px_30px_-8px_rgba(188,107,67,0.5)]'
                          : 'border-border bg-card text-primary shadow-[0_8px_22px_-12px_rgba(31,59,76,0.3)]'
                      }`}
                    >
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="pt-1">
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
                        Passo 0{i + 1}
                      </span>
                      <h3 className="mt-1 text-lg font-bold tracking-tight">{s.title}</h3>
                      <p className="mt-1.5 max-w-[48ch] text-[15px] leading-relaxed text-muted-foreground">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>

        {/* Fecho de segurança — indicação individual */}
        <div className="mt-12 flex items-start gap-4 rounded-2xl border border-border bg-support-tint/40 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight">Sempre como parte de um plano maior</h3>
            <p className="mt-1 max-w-[60ch] text-[14px] leading-relaxed text-muted-foreground">
              A indicação é individual e definida por um médico, a partir do seu histórico e dos seus exames. Já tem prescrição? A gente dá continuidade ao acompanhamento com segurança.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ TIME */
const team: { icon: LucideIcon; role: string; desc: string }[] = [
  { icon: Stethoscope, role: 'Médicos', desc: 'Avaliam, cuidam da sua saúde e, quando faz sentido, prescrevem com segurança.' },
  { icon: Salad, role: 'Nutrição', desc: 'Um plano alimentar que cabe na sua vida — comida de verdade, sem cardápio impossível.' },
  { icon: Brain, role: 'Apoio emocional', desc: 'Mudar de hábito também é sobre a cabeça. Aqui, você é cuidado por inteiro.' },
];
function Time() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <ScrollReveal>
          <Kicker n="05" label="Um time com você" />
          <h2 className="max-w-[22ch] text-3xl font-bold tracking-tight sm:text-4xl">
            Gente de verdade,{' '}
            <span className="font-serif font-medium italic text-primary">do seu lado.</span>
          </h2>
        </ScrollReveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {team.map((t) => (
            <div key={t.role} className="group rounded-2xl border border-border bg-card p-8 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-support hover:shadow-[0_24px_50px_-22px_rgba(31,59,76,0.2)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-support-tint">
                <t.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-bold tracking-tight">{t.role}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ DEPOIMENTOS */
const depo = [
  { quote: 'Pela primeira vez senti que tinha alguém do meu lado — não me cobrando, mas torcendo por mim.', name: 'Ana, 34', meta: '3 meses com a Go Lev', img: 'https://i.pravatar.cc/120?img=47' },
  { quote: 'Sem dieta maluca, sem culpa. Fui no meu ritmo e, quando vi, tinha mudado de verdade.', name: 'Rafael, 41', meta: '6 meses com a Go Lev', img: 'https://i.pravatar.cc/120?img=12' },
];
function Depoimentos() {
  return (
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <ScrollReveal>
          <Kicker n="06" label="Histórias" />
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

/* ------------------------------------------------------ COMPARAÇÃO */
const compareGolev = [
  'Acompanhamento médico contínuo',
  'Plano sob medida e sustentável',
  'Acolhimento, sem julgamento',
  'Ajustes e suporte sempre que precisar',
];
const compareSolo = [
  'Tentativa e erro, sem orientação',
  'Dietas restritivas e efeito sanfona',
  'Culpa quando algo sai do plano',
  'Custos avulsos que se acumulam',
];

function Comparacao() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <ScrollReveal>
          <Kicker n="07" label="A diferença" />
          <h2 className="max-w-[20ch] text-3xl font-bold tracking-tight sm:text-4xl">
            Fazer sozinho ou{' '}
            <span className="font-serif font-medium italic text-primary">com a Go&nbsp;Lev.</span>
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
          {/* Sozinho */}
          <div className="flex flex-col bg-card p-8 sm:p-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-3">Sozinho</span>
            <ul className="mt-6 space-y-4 pb-8">
              {compareSolo.map((s) => (
                <li key={s} className="flex items-start gap-3 text-[15px] text-muted-foreground">
                  <Minus className="mt-1 h-4 w-4 shrink-0 text-ink-3" />
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-auto border-t border-border pt-6">
              <p className="max-w-[32ch] font-serif text-[15px] italic leading-relaxed text-ink-2">
                A boa notícia: ninguém precisa fazer isso sozinho.
              </p>
            </div>
          </div>

          {/* Com a Go Lev */}
          <div className="flex flex-col bg-background p-8 sm:p-10">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand">Com a Go&nbsp;Lev</span>
              <Badge variant="brand">Recomendado</Badge>
            </div>
            <ul className="mt-6 space-y-4 pb-8">
              {compareGolev.map((s) => (
                <li key={s} className="flex items-start gap-3 text-[15px] text-foreground">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-support-tint">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-auto border-t border-border pt-6">
              <Link href="/avaliacao" className={buttonVariants({ size: 'lg', className: 'w-full' })}>
                Quero ver se faz sentido pra mim
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
              </Link>
              <p className="mt-3 text-center text-[13px] text-ink-3">
                Avaliação inicial gratuita, sem compromisso.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- FAQ */
const faqs = [
  { q: 'Preciso fazer dieta restritiva?', a: 'Não. A gente monta um plano realista que cabe na sua rotina — comida de verdade, no seu ritmo, sem sofrimento e sem efeito sanfona.' },
  { q: 'Onde entram a alimentação e o treino no plano?', a: 'Bem no centro. O medicamento, quando faz sentido, é só uma parte do caminho — quem sustenta a mudança são os hábitos. Por isso seu plano tem nutrição e movimento pensados para a sua vida, sem cardápio impossível.' },
  { q: 'Tem acompanhamento médico de verdade?', a: 'Tem. Profissionais de saúde avaliam o seu caso, acompanham sua evolução de perto e ajustam o plano com segurança. Você não caminha sozinho.' },
  { q: 'As medicações são seguras?', a: 'Quando indicadas e acompanhadas por um médico, sim. A indicação é sempre individual: a gente avalia seu histórico, seus exames e seus objetivos antes de qualquer passo. Sem atalho, sem automedicação.' },
  { q: 'E as novas regras da ANVISA para esses medicamentos?', a: 'A gente acompanha as atualizações de perto e segue todas elas. Esses medicamentos exigem prescrição e acompanhamento profissional — e é assim que a Go Lev trabalha desde o início, com responsabilidade.' },
  { q: 'E quando eu parar a medicação? Vou recuperar o peso?', a: 'Essa é a parte que mais importa para a gente. O remédio ajuda na jornada, mas não segura o resultado sozinho. Por isso o foco é construir hábitos que ficam — com o apoio da nutrição — para você se manter bem mesmo depois de parar.' },
  { q: 'Quanto tempo dura o acompanhamento?', a: 'O tempo que a sua saúde pedir. Sem prazo mágico e sem alta de surpresa — a gente acompanha enquanto fizer sentido e ajusta o ritmo junto com você.' },
  { q: 'Como a Go Lev me ajuda a longo prazo?', a: 'Nosso objetivo não é só te ver emagrecer — é te ver manter, com leveza. Mais do que perder peso, a gente cuida para você criar uma relação saudável com comida, corpo e rotina, que continua de pé bem depois do plano.' },
  { q: 'Como funciona o pagamento?', a: 'Planos simples e transparentes, sem letra miúda. Dá para começar com uma avaliação inicial gratuita e decidir com calma se faz sentido para você.' },
];
function Faq() {
  return (
    <section id="perguntas" className="scroll-mt-20 border-t border-border bg-card/50">
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-28">
        <ScrollReveal>
          <Kicker n="08" label="Perguntas frequentes" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">A gente te explica.</h2>
        </ScrollReveal>
        <div className="mt-10">
          <Accordion items={faqs} />
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- CTA */
function CtaFinal() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      {/* fundo em gradiente (mesh) da seção */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 80% at 14% 18%, color-mix(in srgb, var(--gl-accent) 60%, transparent), transparent 60%), radial-gradient(55% 75% at 88% 26%, color-mix(in srgb, var(--gl-primary) 48%, transparent), transparent 60%), radial-gradient(80% 90% at 60% 110%, color-mix(in srgb, var(--gl-support) 55%, transparent), transparent 62%), linear-gradient(135deg, var(--gl-surface), var(--gl-accent-tint))',
        }}
      />
      {/* textura de grão fina e moderna */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 py-32 sm:py-36">
        <ScrollReveal>
          <div
            className="relative overflow-hidden rounded-3xl border border-white/50 px-8 py-24 text-center shadow-[0_24px_70px_rgba(0,0,0,0.10)] backdrop-blur-2xl sm:px-16 sm:py-32"
            style={{ background: 'color-mix(in srgb, var(--gl-surface) 52%, transparent)' }}
          >
            {/* sheen de vidro no topo */}
            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/70" />
            <div className="relative">
              <h2 className="mx-auto max-w-[22ch] text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                O primeiro passo é o mais leve.{' '}
                <span className="font-serif font-medium italic text-primary">A gente segue com você.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                Faça a avaliação gratuita em alguns minutos e veja se faz sentido. Sem compromisso, no seu tempo.
              </p>
              <div className="mt-9 flex items-center justify-center">
                <Link href="/avaliacao" className={buttonVariants({ size: 'lg' })}>
                  Ver se faz sentido pra mim
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ComoFunciona />
      <Abordagem />
      <Tratamentos />
      <ExplicaGLP />
      <Time />
      <Depoimentos />
      <Comparacao />
      <Faq />
      <CtaFinal />
    </>
  );
}
