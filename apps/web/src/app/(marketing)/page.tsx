'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  FadeIn,
  SlideUp,
  ScrollReveal,
  StaggerChildren,
  StaggerItem,
} from '@/components/app/animations';
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  HeartHandshake,
  Activity,
  Sparkles,
  Stethoscope,
  Brain,
  Salad,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ------------------------------------------------- kicker editorial */
function Kicker({ n, label }: { n: string; label: string }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <span className="font-serif text-sm italic text-brand">{n}</span>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-3">{label}</span>
      <span className="ml-1 h-px flex-1 bg-border" />
    </div>
  );
}

/* ----------------------------------------------------------- HERO */
function Hero() {
  const meta = [
    { k: 'Avaliação', v: 'Inicial gratuita' },
    { k: 'Cuidado', v: 'Acompanhamento médico' },
    { k: 'Ritmo', v: 'No seu tempo' },
  ];
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden">
      {/* fundo em gradiente (mesh) + textura — o efeito logo na entrada */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 60% at 86% 6%, color-mix(in srgb, var(--gl-accent) 55%, transparent), transparent 60%), radial-gradient(46% 56% at 8% 28%, color-mix(in srgb, var(--gl-primary) 38%, transparent), transparent 60%), radial-gradient(60% 70% at 72% 92%, color-mix(in srgb, var(--gl-support) 45%, transparent), transparent 64%), linear-gradient(160deg, var(--gl-surface), var(--gl-accent-tint))',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* textura de pontos (dot grid) com máscara suave */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(var(--gl-ink) 1px, transparent 1.4px)',
          backgroundSize: '22px 22px',
          opacity: 0.06,
          WebkitMaskImage: 'radial-gradient(115% 100% at 50% 0%, #000 25%, transparent 72%)',
          maskImage: 'radial-gradient(115% 100% at 50% 0%, #000 25%, transparent 72%)',
        }}
      />
      {/* emenda suave com o fundo da página */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40" style={{ background: 'linear-gradient(to bottom, transparent, var(--gl-paper))' }} />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-20">
        <div>
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/40 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--gl-accent)' }} />
              Emagrecimento com acompanhamento humano
            </span>
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
              <Link
                href="/avaliacao"
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong"
              >
                Ver se faz sentido pra mim
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex items-center justify-center rounded-lg border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
              >
                Como funciona
              </Link>
            </div>
          </SlideUp>
          <SlideUp delay={0.2}>
            <div className="mt-12 flex flex-wrap gap-x-10 gap-y-6">
              {meta.map((m) => (
                <div key={m.k} className="border-l-2 pl-3.5" style={{ borderColor: 'var(--gl-accent)' }}>
                  <div className="text-xs uppercase tracking-[0.12em] text-ink-3">{m.k}</div>
                  <div className="mt-0.5 font-semibold">{m.v}</div>
                </div>
              ))}
            </div>
          </SlideUp>
        </div>

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
            <div key={s.n} className="bg-card p-8">
              <div className="font-serif text-3xl italic text-brand">{s.n}</div>
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
              <div className="h-full bg-background p-7">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: 'var(--gl-support-tint)' }}>
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
              <div className="group overflow-hidden rounded-2xl border border-border bg-card transition-shadow duration-300 hover:shadow-[0_24px_60px_rgba(0,0,0,0.08)]">
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
const glp = [
  { q: 'O que são os tratamentos com GLP‑1?', a: 'São medicamentos análogos do GLP‑1, um hormônio que o corpo produz e que ajuda a regular o apetite e a sensação de saciedade. Usados com acompanhamento, apoiam o emagrecimento.' },
  { q: 'Como funcionam?', a: 'Eles aumentam a saciedade e deixam a digestão mais lenta, ajudando você a comer menos sem passar fome o dia inteiro — sempre como parte de um plano maior.' },
  { q: 'Para quem são indicados?', a: 'A indicação é individual e definida por um médico, considerando seu histórico, seus exames e seus objetivos. Não serve para todo mundo, e tudo bem.' },
  { q: 'Já tenho prescrição. E aí?', a: 'Sem problema. A gente avalia o seu caso e dá continuidade ao acompanhamento com segurança, do seu jeito.' },
];
function ExplicaGLP() {
  return (
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-28">
        <ScrollReveal>
          <Kicker n="04" label="Entenda o GLP‑1" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Sem mistério, sem promessa mágica.</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            A gente explica de forma simples — porque decidir com clareza faz parte do cuidado.
          </p>
        </ScrollReveal>
        <div className="mt-10">
          {glp.map((f) => (
            <details key={f.q} className="group border-b border-border py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="h-5 w-5 shrink-0 text-brand transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
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
            <div key={t.role} className="rounded-2xl border border-border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--gl-support-tint)' }}>
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
            <blockquote key={d.name} className="rounded-2xl border border-border border-l-2 border-l-brand bg-background p-8">
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
          <div className="bg-card p-8 sm:p-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-3">Sozinho</span>
            <ul className="mt-6 space-y-4">
              {compareSolo.map((s) => (
                <li key={s} className="flex items-start gap-3 text-[15px] text-muted-foreground">
                  <Minus className="mt-1 h-4 w-4 shrink-0 text-ink-3" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Com a Go Lev */}
          <div className="bg-background p-8 sm:p-10">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-brand">Com a Go&nbsp;Lev</span>
              <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand" style={{ background: 'var(--gl-accent-tint)' }}>
                Recomendado
              </span>
            </div>
            <ul className="mt-6 space-y-4">
              {compareGolev.map((s) => (
                <li key={s} className="flex items-start gap-3 text-[15px] text-foreground">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-8 border-t border-border pt-6">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm text-ink-2">a partir de</span>
                <span className="font-serif text-3xl font-medium italic text-primary">R$ 249</span>
                <span className="text-sm text-ink-2">/mês</span>
              </div>
              <p className="mt-1 text-[13px] text-ink-3">Tudo incluído — acompanhamento, ajustes e suporte.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <Link
            href="/avaliacao"
            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong"
          >
            Quero ver se faz sentido pra mim
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <p className="text-xs text-ink-3">
            <span className="font-semibold text-ink-2">Valor de exemplo</span> · avaliação inicial gratuita, sem compromisso.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- FAQ */
const faqs = [
  { q: 'Preciso fazer dieta restritiva?', a: 'Não. A gente monta um plano realista que cabe na sua vida — sustentável, sem sofrimento e sem efeito sanfona.' },
  { q: 'Tem acompanhamento médico de verdade?', a: 'Tem. Profissionais de saúde avaliam o seu caso, acompanham sua evolução e ajustam o plano com segurança.' },
  { q: 'Em quanto tempo vejo resultado?', a: 'Cada corpo tem o seu tempo — e a gente respeita o seu. O foco é mudança consistente e saudável, não promessa de prazo.' },
  { q: 'Como funciona o pagamento?', a: 'Planos simples e transparentes, sem letra miúda. Dá pra começar com uma avaliação inicial gratuita.' },
];
function Faq() {
  return (
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-28">
        <ScrollReveal>
          <Kicker n="08" label="Perguntas frequentes" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">A gente te explica.</h2>
        </ScrollReveal>
        <div className="mt-10">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-border py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="h-5 w-5 shrink-0 text-brand transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
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
                <Link
                  href="/avaliacao"
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong"
                >
                  Ver se faz sentido pra mim
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
