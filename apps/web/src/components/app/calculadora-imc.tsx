'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import posthog from 'posthog-js';
import { computeBmi, ELIGIBILITY_CONFIG } from '@golev/shared';
import { buttonVariants } from '@/components/ui/button';

type Band = { max: number; label: string; color: string; tint: string };

// Faixas da OMS. Cores na linguagem da marca (azul = calmo, pêssego = atenção).
const PESO_ALTO: Band = {
  max: Infinity,
  label: 'Obesidade grau III',
  color: 'var(--gl-accent-strong)',
  tint: 'var(--gl-accent-tint)',
};

const BANDS: Band[] = [
  { max: 18.5, label: 'Abaixo do peso', color: 'var(--gl-support)', tint: 'var(--gl-support-tint)' },
  { max: 25, label: 'Peso normal', color: 'var(--gl-primary)', tint: 'var(--gl-support-tint)' },
  { max: 30, label: 'Sobrepeso', color: 'var(--gl-accent-strong)', tint: 'var(--gl-accent-tint)' },
  { max: 35, label: 'Obesidade grau I', color: 'var(--gl-accent-strong)', tint: 'var(--gl-accent-tint)' },
  { max: 40, label: 'Obesidade grau II', color: 'var(--gl-accent-strong)', tint: 'var(--gl-accent-tint)' },
  PESO_ALTO,
];

function classify(imc: number): Band {
  return BANDS.find((b) => imc < b.max) ?? PESO_ALTO;
}

function Field({
  label,
  unit,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink-2">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-background px-4 py-3 transition-colors focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--gl-support-tint)]">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          // só dígitos e separador decimal — sem texto/valores absurdos no campo
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, '').slice(0, 6))}
          placeholder={placeholder}
          aria-label={`${label} em ${unit}`}
          className="w-full bg-transparent text-2xl font-bold tracking-tight outline-none"
        />
        <span className="text-base font-medium text-ink-3">{unit}</span>
      </div>
    </label>
  );
}

export function CalculadoraImc() {
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const fired = useRef(false);

  const altNum = Number(altura.replace(',', '.'));
  const pesoNum = Number(peso.replace(',', '.'));
  const valid = altNum >= 100 && altNum <= 250 && pesoNum >= 20 && pesoNum <= 400;
  const imc = valid ? computeBmi(pesoNum, altNum) : 0;
  const band = imc > 0 ? classify(imc) : null;
  const eligible = imc >= ELIGIBILITY_CONFIG.MIN_BMI;

  // PostHog — engajamento com a ferramenta (entra antes do funil).
  useEffect(() => {
    if (!fired.current && imc > 0 && band) {
      fired.current = true;
      posthog.capture('imc_calculado', { imc, faixa: band.label, elegivel: eligible });
    }
  }, [imc, band, eligible]);

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Altura" unit="cm" value={altura} onChange={setAltura} placeholder="170" />
        <Field label="Peso" unit="kg" value={peso} onChange={setPeso} placeholder="72" />
      </div>

      <div className="mt-7" aria-live="polite">
        {band ? (
          <div className="rounded-xl p-5" style={{ background: band.tint }}>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink-2">Seu IMC</p>
                <p
                  className="mt-1 text-5xl font-extrabold tracking-tight"
                  style={{ color: band.color }}
                >
                  {imc.toFixed(1).replace('.', ',')}
                </p>
              </div>
              <span
                className="rounded-full px-4 py-1.5 text-sm font-semibold"
                style={{ background: band.color, color: 'var(--gl-paper)' }}
              >
                {band.label}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line p-5 text-center text-sm text-ink-3">
            Preencha altura e peso para ver seu IMC.
          </div>
        )}
      </div>

      {band && (
        <div className="mt-6">
          {eligible ? (
            <div className="rounded-xl border border-line p-5" style={{ background: 'var(--gl-paper)' }}>
              <p className="text-sm leading-relaxed text-ink-2">
                Seu IMC indica que você{' '}
                <strong className="text-foreground">pode ter indicação</strong> para o acompanhamento
                médico de emagrecimento da Go Lev. A avaliação é gratuita e leva poucos minutos.
              </p>
              <Link
                href="/avaliacao?utm_source=calculadora-imc&utm_medium=tool"
                className={buttonVariants({ size: 'lg', className: 'mt-4 w-full sm:w-auto' })}
              >
                Fazer avaliação gratuita
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-ink-3">
              Seu IMC está abaixo da faixa em que o acompanhamento medicamentoso costuma ser indicado.
              Manter alimentação equilibrada, sono e atividade física segue sendo o melhor cuidado — e, se
              tiver dúvidas sobre sua saúde, vale conversar com um médico.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
