import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preços',
  description: 'Planos e preços do Go Lev.',
  openGraph: {
    title: 'Preços | Go Lev',
    description: 'Planos e preços do Go Lev.',
    type: 'website',
  },
};

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <h1 className="text-center text-4xl font-bold tracking-tight">
        Preços simples e transparentes
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
        Escolha o plano ideal para o seu negócio.
      </p>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-8 shadow-sm ${
              plan.featured ? 'border-brand ring-1 ring-brand' : ''
            }`}
          >
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {plan.description}
            </p>
            <p className="mt-6 text-4xl font-bold tracking-tight">
              {plan.price}
              <span className="text-base font-normal text-muted-foreground">
                /mês
              </span>
            </p>
            <ul className="mt-8 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <span className="text-brand">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

const plans = [
  {
    name: 'Starter',
    description: 'Para quem está começando.',
    price: 'R$ 49',
    featured: false,
    features: ['Até 3 membros', '1.000 registros', 'Suporte por email'],
  },
  {
    name: 'Pro',
    description: 'Para times em crescimento.',
    price: 'R$ 149',
    featured: true,
    features: [
      'Até 15 membros',
      '50.000 registros',
      'Suporte prioritário',
      'Analytics avançado',
    ],
  },
  {
    name: 'Enterprise',
    description: 'Para grandes operações.',
    price: 'Sob consulta',
    featured: false,
    features: [
      'Membros ilimitados',
      'Registros ilimitados',
      'SLA dedicado',
      'Onboarding personalizado',
    ],
  },
];
