'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import posthog from 'posthog-js';
import { computeBmi, ELIGIBILITY_CONFIG } from '@golev/shared';
import { buttonVariants } from '@/components/ui/button';

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

type Band = { max: number; label: string; color: string; tint: string; note: string };

// Faixas da OMS. Zona azul = peso ok · zona pêssego = atenção (linguagem da marca).
const PESO_ALTO: Band = {
  max: Infinity,
  label: 'Obesidade grau III',
  color: 'var(--gl-accent-strong)',
  tint: 'var(--gl-accent-tint)',
  note: 'Uma avaliação médica ajuda a cuidar da sua saúde com segurança.',
};

const BANDS: Band[] = [
  { max: 18.5, label: 'Abaixo do peso', color: 'var(--gl-primary)', tint: 'var(--gl-support-tint)', note: 'Pode valer reforçar a nutrição — converse com um profissional de saúde.' },
  { max: 25, label: 'Peso normal', color: 'var(--gl-primary)', tint: 'var(--gl-support-tint)', note: 'Seu peso está dentro da faixa de referência da OMS.' },
  { max: 30, label: 'Sobrepeso', color: 'var(--gl-accent-strong)', tint: 'var(--gl-accent-tint)', note: 'Uma avaliação ajuda a entender o melhor caminho pra você.' },
  { max: 35, label: 'Obesidade grau I', color: 'var(--gl-accent-strong)', tint: 'var(--gl-accent-tint)', note: 'Uma avaliação médica pode indicar o acompanhamento certo.' },
  { max: 40, label: 'Obesidade grau II', color: 'var(--gl-accent-strong)', tint: 'var(--gl-accent-tint)', note: 'Uma avaliação médica pode indicar o acompanhamento certo.' },
  PESO_ALTO,
];

function classify(imc: number): Band {
  return BANDS.find((b) => imc < b.max) ?? PESO_ALTO;
}

// Medidor visual — escala 15→40 cobre a faixa relevante de IMC.
const SCALE_MIN = 15;
const SCALE_MAX = 40;
const SEGMENTS = [
  { label: 'Abaixo', from: 15, to: 18.5, color: 'var(--gl-support)' },
  { label: 'Normal', from: 18.5, to: 25, color: 'var(--gl-primary)' },
  { label: 'Sobrepeso', from: 25, to: 30, color: 'var(--gl-accent)' },
  { label: 'Obesidade', from: 30, to: 40, color: 'var(--gl-accent-strong)' },
];
const TICKS = [
  { v: 18.5, t: '18,5' },
  { v: 25, t: '25' },
  { v: 30, t: '30' },
];
const pct = (v: number) => ((v - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
const clampPct = (v: number) => Math.min(100, Math.max(0, pct(v)));

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
      <div className="flex items-center gap-2 rounded-xl border border-line bg-background px-4 py-3.5 transition-[border-color,box-shadow] focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--gl-support-tint)]">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          // só dígitos e separador decimal — nunca texto/valor absurdo no campo
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, '').slice(0, 6))}
          placeholder={placeholder}
          aria-label={`${label} em ${unit}`}
          className="w-full bg-transparent text-2xl font-extrabold tracking-tight text-foreground outline-none placeholder:font-bold placeholder:text-ink-3/45"
        />
        <span className="text-base font-semibold text-ink-3">{unit}</span>
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

  // PostHog — engajamento com a ferramenta (topo do funil).
  useEffect(() => {
    if (!fired.current && imc > 0 && band) {
      fired.current = true;
      posthog.capture('imc_calculado', { imc, faixa: band.label, elegivel: eligible });
    }
  }, [imc, band, eligible]);

  return (
    <div className="relative">
      {/* halo da marca atrás do card */}
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-[2rem] opacity-60 blur-2xl"
        style={{ background: 'radial-gradient(58% 60% at 50% 0%, var(--gl-accent-tint), transparent 72%)' }}
      />
      <div className="rounded-2xl border border-white/70 bg-surface p-6 shadow-[0_30px_70px_-32px_rgba(31,59,76,0.42)] sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Altura" unit="cm" value={altura} onChange={setAltura} placeholder="170" />
          <Field label="Peso" unit="kg" value={peso} onChange={setPeso} placeholder="72" />
        </div>

        <div className="mt-7" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {band ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="rounded-2xl p-6"
                style={{ background: band.tint }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-ink-2">Seu IMC</p>
                    <p
                      className="mt-1 text-6xl font-extrabold leading-none tracking-tight tabular-nums"
                      style={{ color: band.color }}
                    >
                      {imc.toFixed(1).replace('.', ',')}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold"
                    style={{ background: band.color, color: 'var(--gl-paper)' }}
                  >
                    {band.label}
                  </span>
                </div>

                {/* medidor de faixa */}
                <div className="mt-7">
                  <div className="relative">
                    <div className="flex h-3 overflow-hidden rounded-full">
                      {SEGMENTS.map((s) => (
                        <div
                          key={s.label}
                          style={{ width: `${pct(s.to) - pct(s.from)}%`, background: s.color, opacity: 0.9 }}
                        />
                      ))}
                    </div>
                    <motion.div
                      className="absolute top-1/2 h-5 w-5 rounded-full border-[3px] border-white shadow-[0_2px_10px_rgba(31,59,76,0.42)]"
                      style={{ background: band.color, x: '-50%', y: '-50%' }}
                      initial={false}
                      animate={{ left: `${clampPct(imc)}%` }}
                      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                    />
                  </div>
                  <div className="relative mt-2 h-4">
                    {TICKS.map((tk) => (
                      <span
                        key={tk.t}
                        className="absolute -translate-x-1/2 text-[11px] tabular-nums text-ink-3"
                        style={{ left: `${pct(tk.v)}%` }}
                      >
                        {tk.t}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="mt-5 font-serif text-[15px] italic leading-relaxed text-ink-2">
                  {band.note}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-3"
              >
                Preencha altura e peso para ver seu IMC.
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {band && eligible && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mt-6 rounded-2xl border border-line bg-background p-5"
            >
              <p className="text-sm leading-relaxed text-ink-2">
                Seu IMC indica que você{' '}
                <strong className="text-foreground">pode ter indicação</strong> para o acompanhamento
                médico de emagrecimento da Go&nbsp;Lev. A avaliação é gratuita e leva poucos minutos.
              </p>
              <Link
                href="/avaliacao?utm_source=calculadora-imc&utm_medium=tool"
                className={buttonVariants({ size: 'lg', className: 'group/btn mt-4 w-full sm:w-auto' })}
              >
                Fazer avaliação gratuita
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        {band && !eligible && (
          <p className="mt-6 text-sm leading-relaxed text-ink-3">
            Seu IMC está abaixo da faixa em que o acompanhamento medicamentoso costuma ser indicado.
            Manter alimentação equilibrada, sono e atividade física segue sendo o melhor cuidado — e, se
            tiver dúvidas, vale conversar com um médico.
          </p>
        )}
      </div>
    </div>
  );
}
