'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import {
  SlideUp,
  FadeIn,
  ScaleIn,
  ScrollReveal,
  Parallax,
  StaggerChildren,
  StaggerItem,
  GrowLine,
  motion,
  useScroll,
  useTransform,
} from '@/components/app/animations';
import { ScrollGradientBackground } from '@/components/app/scroll-gradient-background';
import { HeroBackground } from '@/components/app/hero-background';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Check,
  Lock,
  Building2,
  CreditCard,
  Palette,
  BarChart3,
  Rocket,
  Triangle,
  Server,
  Database,
  Box,
  Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

function FloatingShape({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

function SectionDivider() {
  return (
    <div className="relative py-4">
      <GrowLine className="mx-auto h-px w-full max-w-4xl bg-gradient-to-r from-transparent via-[#264E9B]/20 to-transparent" />
    </div>
  );
}

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden">
      <HeroBackground />

      {/* Floating decorative shapes */}
      <Parallax speed={0.3} className="absolute left-[8%] top-[15%] -z-[1]">
        <FloatingShape
          className="h-16 w-16 rounded-full border border-[#264E9B]/15 bg-gradient-to-br from-[#264E9B]/5 to-transparent"
          delay={0}
        />
      </Parallax>
      <Parallax speed={-0.2} className="absolute right-[12%] top-[25%] -z-[1]">
        <FloatingShape
          className="h-12 w-12 rotate-45 rounded-lg border border-[#10244A]/10 bg-gradient-to-br from-[#10244A]/5 to-transparent"
          delay={1.5}
        />
      </Parallax>
      <Parallax speed={0.25} className="absolute left-[15%] bottom-[20%] -z-[1]">
        <FloatingShape
          className="h-10 w-10 rounded-full border border-[#264E9B]/10 bg-gradient-to-br from-[#264E9B]/5 to-transparent"
          delay={3}
        />
      </Parallax>

      <motion.div
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 text-center"
      >
        <FadeIn>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#264E9B]/20 bg-[#264E9B]/5 px-4 py-1.5 text-sm text-[#264E9B] dark:border-[#6B8FD4]/30 dark:bg-[#6B8FD4]/10 dark:text-[#A0B8E8]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#264E9B] opacity-75 dark:bg-[#6B8FD4]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#264E9B] dark:bg-[#6B8FD4]" />
            </span>
            Template SaaS pronto para produção
          </div>
        </FadeIn>

        <SlideUp delay={0.05}>
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Trianox"
              width={80}
              height={80}
              priority
            />
          </div>
        </SlideUp>

        <SlideUp delay={0.1}>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Construa seu SaaS
            <br />
            <span className="bg-gradient-to-r from-[#10244A] to-[#264E9B] bg-clip-text text-transparent dark:from-[#6B8FD4] dark:to-[#A0B8E8]">
              mais rápido.
            </span>
          </h1>
        </SlideUp>

        <SlideUp delay={0.15}>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Template completo com autenticação, billing, multi-tenancy e tudo que
            você precisa para lançar seu produto SaaS rapidamente.
          </p>
        </SlideUp>

        <SlideUp delay={0.2}>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#10244A] to-[#264E9B] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#10244A]/20 transition-all hover:shadow-xl hover:shadow-[#10244A]/30 dark:from-[#264E9B] dark:to-[#4A7ADB]"
            >
              Começar grátis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/features"
              className="rounded-lg border border-[#264E9B]/20 bg-white/50 px-8 py-3.5 text-sm font-semibold shadow-sm backdrop-blur-sm transition-all hover:border-[#264E9B]/40 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10"
            >
              Ver features
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Sem cartão de crédito. Setup em 5 minutos.
          </p>
        </SlideUp>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
            <span className="text-xs">Scroll</span>
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
              <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
              <motion.circle
                cx="8" cy="8" r="2" fill="currentColor"
                animate={{ cy: [8, 14, 8] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#264E9B] dark:text-[#6B8FD4]">
            Tudo incluído
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Tudo que você precisa
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Stack moderna, arquitetura sólida e infraestrutura pronta para escalar.
          </p>
        </ScrollReveal>

        <SectionDivider />

        <StaggerChildren staggerDelay={0.08} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <StaggerItem key={feature.title}>
              <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#264E9B]/5">
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#264E9B]/0 to-[#10244A]/0 transition-all duration-500 group-hover:from-[#264E9B]/[0.02] group-hover:to-[#10244A]/[0.04]" />
                <CardHeader>
                  <motion.div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#10244A]/10 to-[#264E9B]/10 dark:from-[#6B8FD4]/15 dark:to-[#A0B8E8]/15"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <feature.icon className="h-5 w-5 text-[#264E9B] dark:text-[#6B8FD4]" />
                  </motion.div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#264E9B]/0 to-transparent transition-all duration-500 group-hover:via-[#264E9B]/30" />
              </Card>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: '5min', label: 'Setup completo' },
    { value: '100%', label: 'TypeScript strict' },
    { value: '12+', label: 'Componentes prontos' },
    { value: '∞', label: 'Escalabilidade' },
  ];

  return (
    <section className="relative overflow-hidden py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-[#10244A]/[0.03] via-[#264E9B]/[0.06] to-[#10244A]/[0.03] dark:from-[#264E9B]/[0.05] dark:via-[#264E9B]/[0.1] dark:to-[#264E9B]/[0.05]" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <div className="text-center">
                <Parallax speed={0.05 * (i % 2 === 0 ? 1 : -1)}>
                  <div className="text-4xl font-bold tracking-tight text-[#10244A] dark:text-[#A0B8E8] sm:text-5xl">
                    {stat.value}
                  </div>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </Parallax>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StackSection() {
  const stack: { name: string; desc: string; icon: LucideIcon }[] = [
    { name: 'Next.js', desc: 'App Router + SSR', icon: Triangle },
    { name: 'NestJS', desc: 'API robusta', icon: Server },
    { name: 'PostgreSQL', desc: 'Drizzle ORM', icon: Database },
    { name: 'Stripe', desc: 'Billing integrado', icon: CreditCard },
    { name: 'Docker', desc: 'Deploy simples', icon: Box },
    { name: 'Tailwind', desc: 'CSS moderno', icon: Wind },
  ];

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <ScrollReveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#264E9B] dark:text-[#6B8FD4]">
                Stack completa
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                Construído com as{' '}
                <span className="bg-gradient-to-r from-[#10244A] to-[#264E9B] bg-clip-text text-transparent dark:from-[#6B8FD4] dark:to-[#A0B8E8]">
                  melhores ferramentas.
                </span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Cada tecnologia foi escolhida por performance, DX e maturidade.
                Sem hype, só ferramentas battle-tested.
              </p>
            </ScrollReveal>
          </div>

          <StaggerChildren staggerDelay={0.06} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {stack.map((item) => (
              <StaggerItem key={item.name}>
                <motion.div
                  className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-5 text-center transition-all"
                  whileHover={{
                    y: -4,
                    boxShadow: '0 20px 40px rgba(16,36,74,0.08)',
                  }}
                >
                  <item.icon className="h-6 w-6 text-[#264E9B] dark:text-[#6B8FD4]" />
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.desc}</span>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  const steps = [
    {
      step: '01',
      title: 'Clone o template',
      desc: 'Fork o repositório e configure as variáveis de ambiente. Tudo documentado.',
    },
    {
      step: '02',
      title: 'Customize',
      desc: 'Adapte o design, configure Stripe, e adicione suas features de negócio.',
    },
    {
      step: '03',
      title: 'Deploy',
      desc: 'Push para o GitHub e o CI/CD cuida do resto. Staging e produção automáticos.',
    },
  ];

  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#264E9B] dark:text-[#6B8FD4]">
            Simples de usar
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Do zero ao deploy em 3 passos
          </h2>
        </ScrollReveal>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">
          {steps.map((item, i) => (
            <ScrollReveal key={item.step} delay={i * 0.15}>
              <div className="relative">
                {/* Connecting line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-px w-[calc(100%+2rem)] bg-gradient-to-r from-[#264E9B]/20 to-[#264E9B]/5 lg:block" />
                )}

                <div className="flex flex-col items-center text-center">
                  <Parallax speed={0.05}>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#10244A] to-[#264E9B] text-lg font-bold text-white shadow-lg shadow-[#10244A]/15 dark:from-[#264E9B] dark:to-[#4A7ADB]">
                      {item.step}
                    </div>
                  </Parallax>
                  <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: 'Grátis',
      period: '',
      desc: 'Perfeito para validar sua ideia',
      features: ['Autenticação completa', 'Multi-tenancy básico', 'Deploy Docker', '1 ambiente'],
      highlighted: false,
    },
    {
      name: 'Pro',
      price: 'R$ 97',
      period: '/mês',
      desc: 'Para times que precisam escalar',
      features: [
        'Tudo do Starter',
        'Billing com Stripe',
        'Analytics avançado',
        'Staging + Produção',
        'Suporte prioritário',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      desc: 'Para grandes organizações',
      features: [
        'Tudo do Pro',
        'SLA dedicado',
        'Integrações custom',
        'Onboarding guiado',
        'White-label',
      ],
      highlighted: false,
    },
  ];

  return (
    <section className="relative py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#264E9B]/[0.03] to-transparent dark:via-[#264E9B]/[0.06]" />
      <div className="relative mx-auto max-w-7xl px-6">
        <ScrollReveal className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#264E9B] dark:text-[#6B8FD4]">
            Preços
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Simples e transparente
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Escolha o plano ideal para o momento do seu produto.
          </p>
        </ScrollReveal>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative"
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
                    <span className="whitespace-nowrap rounded-full bg-gradient-to-r from-[#10244A] to-[#264E9B] px-4 py-1 text-xs font-semibold text-white shadow-md dark:from-[#264E9B] dark:to-[#4A7ADB]">
                      Mais popular
                    </span>
                  </div>
                )}
                <Card
                  className={`relative h-full ${
                    plan.highlighted
                      ? 'border-[#264E9B]/40 shadow-xl shadow-[#264E9B]/10 dark:border-[#6B8FD4]/40'
                      : ''
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#264E9B] to-transparent" />
                  )}
                  <CardHeader className="pb-2">
                    <p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-sm text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="mt-4 space-y-3">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#264E9B] dark:text-[#6B8FD4]" />
                          <span className="text-sm">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/register"
                      className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-semibold transition-all ${
                        plan.highlighted
                          ? 'bg-gradient-to-r from-[#10244A] to-[#264E9B] text-white shadow-lg shadow-[#10244A]/20 hover:shadow-xl dark:from-[#264E9B] dark:to-[#4A7ADB]'
                          : 'border bg-card hover:bg-accent'
                      }`}
                    >
                      Começar agora
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScaleIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10244A] to-[#264E9B] p-14 text-center text-white shadow-2xl dark:from-[#1a3366] dark:to-[#3568c7] lg:p-20">
            {/* Decorative elements inside CTA */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/5"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 20, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/5"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 15, repeat: Infinity }}
              />
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 0.8px, transparent 0.8px)',
                  backgroundSize: '20px 20px',
                }}
              />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                Pronto para começar?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
                Crie sua conta em segundos e comece a construir seu produto SaaS hoje.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-sm font-semibold text-[#10244A] shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
                >
                  Criar conta grátis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/features"
                  className="rounded-lg border border-white/20 bg-white/10 px-8 py-4 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/20"
                >
                  Explorar features
                </Link>
              </div>
            </div>
          </div>
        </ScaleIn>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <ScrollGradientBackground />
      <HeroSection />
      <SectionDivider />
      <FeaturesSection />
      <StatsSection />
      <SectionDivider />
      <StackSection />
      <WorkflowSection />
      <SectionDivider />
      <PricingSection />
      <CtaSection />
    </>
  );
}

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Lock,
    title: 'Autenticação completa',
    description:
      'JWT com access/refresh tokens, rate limiting, password hashing com argon2 e role-based access control.',
  },
  {
    icon: Building2,
    title: 'Multi-tenancy nativo',
    description:
      'Isolamento de dados por tenant com roles e permissions granulares. Cada organização tem seu espaço.',
  },
  {
    icon: CreditCard,
    title: 'Billing com Stripe',
    description:
      'Subscriptions, webhooks, invoices e gestão de planos integrados com Stripe pronto para usar.',
  },
  {
    icon: Palette,
    title: 'UI moderna e acessível',
    description:
      'shadcn/ui + Tailwind CSS v4 com dark mode, componentes acessíveis e design system consistente.',
  },
  {
    icon: BarChart3,
    title: 'Analytics integrado',
    description:
      'PostHog para product analytics e Plausible/Umami para web analytics das landing pages.',
  },
  {
    icon: Rocket,
    title: 'Deploy simples',
    description:
      'Docker + Caddy com TLS automático. CI/CD com GitHub Actions. Staging e produção na mesma VPS.',
  },
];
