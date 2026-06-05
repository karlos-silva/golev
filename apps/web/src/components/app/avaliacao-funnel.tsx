'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Logo } from '@/components/app/logo';
import { buttonVariants } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import {
  anamneseFieldsSchema,
  anamneseSubmissionSchema,
  computeBmi,
  computeEligibility,
  CONSENT_TEXT,
  EligibilityReason,
  type EligibilityReason as Reason,
} from '@golev/shared';
import { maskPhoneBR } from '@/lib/format';
import { useCreateAnamnese } from '@/hooks/use-anamnese';

/* ============================================================
   Avaliação de elegibilidade — pré-anamnese.
   Fluxo com ramificações, validação por passo, cálculo de IMC,
   triagem (elegível x inelegível) e persistência do lead elegível.
   ============================================================ */

type Choice = { value: string; label: string };
type NumberField = 'idade' | 'alturaCm' | 'pesoKg';
type Answers = Record<string, string | string[]>;

type BaseQ = { id: string; title: string; help?: string; when?: (a: Answers) => boolean };
type Question =
  | (BaseQ & { kind: 'single'; choices: Choice[] })
  | (BaseQ & { kind: 'multi'; choices: Choice[]; noneValue?: string })
  | (BaseQ & { kind: 'number'; field: NumberField; unit: string; placeholder?: string });

const QUESTIONS: Question[] = [
  {
    id: 'objetivos',
    kind: 'multi',
    title: 'O que você mais deseja alcançar com a perda de peso?',
    help: 'Selecione todas as opções que se aplicam.',
    choices: [
      { value: 'saude_geral', label: 'Melhorar minha saúde geral' },
      { value: 'prevenir_problemas', label: 'Prevenir problemas de saúde' },
      { value: 'corpo', label: 'Me sentir melhor com meu corpo' },
      { value: 'energia', label: 'Aumentar meu nível de energia' },
      { value: 'saude_mental', label: 'Melhorar minha saúde mental' },
      { value: 'sono', label: 'Dormir melhor e ter mais disposição' },
    ],
  },
  {
    id: 'sexo',
    kind: 'single',
    title: 'Qual seu sexo biológico?',
    help: 'Usamos isso só para a avaliação clínica.',
    choices: [
      { value: 'feminino', label: 'Feminino' },
      { value: 'masculino', label: 'Masculino' },
      { value: 'na', label: 'Prefiro não dizer' },
    ],
  },
  { id: 'idade', kind: 'number', field: 'idade', title: 'Quantos anos você tem?', unit: 'anos', placeholder: '32' },
  { id: 'alturaCm', kind: 'number', field: 'alturaCm', title: 'Qual a sua altura?', unit: 'cm', placeholder: '168' },
  {
    id: 'pesoKg',
    kind: 'number',
    field: 'pesoKg',
    title: 'E o seu peso atual?',
    help: 'Sem julgamento — é só um ponto de partida.',
    unit: 'kg',
    placeholder: '82',
  },
  {
    id: 'tratamentoPrevio',
    kind: 'single',
    title: 'Você já fez algum tratamento médico para emagrecer antes?',
    help: "Selecione 'Sim' se você já utilizou medicação GLP-1 como Mounjaro, Wegovy ou Ozempic.",
    choices: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
    ],
  },
  {
    id: 'medicacoes',
    kind: 'multi',
    title: 'Quais medicações você já usou?',
    when: (a) => a.tratamentoPrevio === 'sim',
    noneValue: 'nenhum',
    choices: [
      { value: 'tirzepatida', label: 'Mounjaro (Tirzepatida)' },
      { value: 'semaglutida', label: 'Ozempic ou Wegovy (Semaglutida)' },
      { value: 'nenhum', label: 'Nenhum desses medicamentos' },
    ],
  },
  {
    id: 'tentativas',
    kind: 'single',
    title: 'Você já tentou emagrecer antes?',
    choices: [
      { value: 'muitas', label: 'Sim, várias vezes' },
      { value: 'algumas', label: 'Sim, algumas vezes' },
      { value: 'primeira', label: 'É a primeira vez' },
    ],
  },
  {
    id: 'comorbidades',
    kind: 'multi',
    title: 'Você convive com alguma destas condições?',
    help: 'Pode marcar mais de uma. Se nenhuma, marque a última.',
    noneValue: 'nenhuma',
    choices: [
      { value: 'diabetes_t2', label: 'Diabetes tipo 2' },
      { value: 'pre_diabetes', label: 'Pré-diabetes' },
      { value: 'hipertensao', label: 'Pressão alta' },
      { value: 'colesterol', label: 'Colesterol alto' },
      { value: 'apneia', label: 'Apneia do sono' },
      { value: 'nenhuma', label: 'Nenhuma dessas' },
    ],
  },
  {
    id: 'contraindicacoes',
    kind: 'multi',
    title: 'Alguma destas situações se aplica a você?',
    help: 'Importante para a segurança da avaliação médica.',
    noneValue: 'nenhuma',
    choices: [
      { value: 'pancreatite', label: 'Histórico de pancreatite' },
      { value: 'cancer_tireoide_men2', label: 'Histórico de câncer medular de tireoide (ou MEN2)' },
      { value: 'transtorno_alimentar', label: 'Transtorno alimentar' },
      { value: 'nenhuma', label: 'Nenhuma dessas' },
    ],
  },
  {
    id: 'gravidez',
    kind: 'single',
    title: 'Você está grávida, amamentando ou tentando engravidar?',
    when: (a) => a.sexo === 'feminino',
    choices: [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
    ],
  },
];

const REASON_COPY: Partial<Record<Reason, string>> = {
  [EligibilityReason.IMC_ABAIXO_MINIMO]:
    'Pelo seu IMC atual, o tratamento medicamentoso para emagrecimento não é o mais indicado agora.',
  [EligibilityReason.IDADE_MENOR_18]:
    'Por enquanto, nosso acompanhamento é indicado apenas para maiores de 18 anos.',
  [EligibilityReason.CONTRAINDICACAO_GRAVIDEZ]:
    'Durante a gravidez ou amamentação, esse tratamento não é recomendado.',
  [EligibilityReason.CONTRAINDICACAO_CANCER_TIREOIDE]:
    'Pelo seu histórico de saúde, esse tratamento não é indicado sem uma avaliação especializada.',
};

const EASE = [0.22, 1, 0.36, 1] as const;
const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -48 : 48 }),
};

function fieldError(field: NumberField, raw: string): string | null {
  if (raw.trim() === '') return null;
  const res = anamneseFieldsSchema.shape[field].safeParse(raw);
  return res.success ? null : (res.error.issues[0]?.message ?? 'Valor inválido');
}

export function AvaliacaoFunnel() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [contact, setContact] = useState({ nome: '', email: '', whatsapp: '', consent: false });
  const [utm, setUtm] = useState<Record<string, string>>({});
  const { mutate, isPending, isSuccess, data } = useCreateAnamnese();

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const next: Record<string, string> = {};
    const src = p.get('utm_source');
    const med = p.get('utm_medium');
    const camp = p.get('utm_campaign');
    if (src) next.utmSource = src;
    if (med) next.utmMedium = med;
    if (camp) next.utmCampaign = camp;
    if (document.referrer) next.referrer = document.referrer;
    setUtm(next);
  }, []);

  const visibleQuestions = useMemo(
    () => QUESTIONS.filter((q) => !q.when || q.when(answers)),
    [answers],
  );
  const total = visibleQuestions.length;

  useEffect(() => {
    if (step > total) setStep(total);
  }, [total, step]);

  const onResult = step >= total;
  const q = onResult ? null : visibleQuestions[step];
  const progress = Math.min(step, total) / total;

  const str = (id: string) => (typeof answers[id] === 'string' ? answers[id] : '');
  const list = (id: string) => (Array.isArray(answers[id]) ? answers[id] : []);

  const imc = useMemo(() => {
    const alt = Number(str('alturaCm'));
    const peso = Number(str('pesoKg'));
    if (!alt || !peso) return null;
    return computeBmi(peso, alt);
  }, [answers.alturaCm, answers.pesoKg]);

  function go(d: number) {
    setDir(d);
    setStep((s) => Math.min(Math.max(s + d, 0), total));
  }

  function answerSingle(id: string, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
    window.setTimeout(() => go(1), 260);
  }

  function toggleMulti(id: string, value: string, noneValue?: string) {
    setAnswers((a) => {
      const cur = Array.isArray(a[id]) ? a[id] : [];
      if (noneValue && value === noneValue) {
        return { ...a, [id]: cur.includes(noneValue) ? [] : [noneValue] };
      }
      const without = noneValue ? cur.filter((v) => v !== noneValue) : cur;
      return {
        ...a,
        [id]: without.includes(value)
          ? without.filter((v) => v !== value)
          : [...without, value],
      };
    });
  }

  const numErr = q && q.kind === 'number' ? fieldError(q.field, str(q.id)) : null;
  const canContinue =
    !onResult && q
      ? q.kind === 'number'
        ? str(q.id).trim() !== '' && numErr === null
        : q.kind === 'multi'
          ? list(q.id).length > 0
          : Boolean(str(q.id))
      : false;

  const previewInput = {
    idade: Number(str('idade')),
    alturaCm: Number(str('alturaCm')),
    pesoKg: Number(str('pesoKg')),
    contraindicacoes: list('contraindicacoes'),
    gravidaOuAmamentando: str('sexo') === 'feminino' ? str('gravidez') === 'sim' : undefined,
  };
  const preview = computeEligibility(previewInput);
  const eligible = isSuccess && data ? data.eligible : preview.eligible;
  const reasons: Reason[] = isSuccess && data ? data.reasons : preview.reasons;
  const finalImc = isSuccess && data ? data.imc : (imc ?? preview.imc);

  function handleSubmit() {
    const payload = {
      objetivos: list('objetivos'),
      sexo: str('sexo'),
      idade: str('idade'),
      alturaCm: str('alturaCm'),
      pesoKg: str('pesoKg'),
      tentativas: str('tentativas'),
      comorbidades: list('comorbidades'),
      contraindicacoes: list('contraindicacoes'),
      gravidaOuAmamentando: str('sexo') === 'feminino' ? str('gravidez') === 'sim' : undefined,
      tratamentoPrevio: str('tratamentoPrevio'),
      medicacoes: str('tratamentoPrevio') === 'sim' ? list('medicacoes') : [],
      nome: contact.nome,
      email: contact.email,
      whatsapp: contact.whatsapp,
      consent: contact.consent,
      ...utm,
    };
    const parsed = anamneseSubmissionSchema.safeParse(payload);
    if (!parsed.success) {
      toast(parsed.error.issues[0]?.message ?? 'Confira os campos antes de enviar.');
      return;
    }
    mutate(parsed.data);
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{ background: 'var(--gl-accent-tint)', opacity: 0.55 }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -right-40 h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{ background: 'var(--gl-support-tint)', opacity: 0.6 }}
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <header className="relative z-10 border-b border-border/70 bg-background/60 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-6">
          <Link href="/"><Logo size="md" /></Link>
          {!onResult && (
            <motion.span
              key={step}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-ink-3"
            >
              {Math.min(step + 1, total)} <span className="opacity-50">de</span> {total}
            </motion.span>
          )}
        </div>
        <div className="h-[3px] w-full bg-border/60">
          <motion.div
            className="h-full rounded-r-full bg-primary"
            initial={false}
            animate={{ width: `${(onResult ? 1 : progress) * 100}%` }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pt-[clamp(2rem,9vh,6rem)] pb-28">
        {!onResult && q ? (
          <motion.div
            key={q.id}
            custom={dir}
            variants={stepVariants}
            initial="enter"
            animate="center"
            transition={{ duration: 0.34, ease: EASE }}
          >
            {step > 0 && (
              <button onClick={() => go(-1)} className="mb-7 inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="max-w-[20ch] text-3xl font-extrabold tracking-tight sm:text-[2.6rem] sm:leading-[1.05]"
            >
              {q.title}
            </motion.h1>
            {q.help && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="mt-3 text-[15px] leading-relaxed text-muted-foreground"
              >
                {q.help}
              </motion.p>
            )}

            {(q.kind === 'single' || q.kind === 'multi') && (
              <motion.div
                className="mt-9 grid gap-3"
                variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } } }}
                initial="hidden"
                animate="show"
              >
                {q.choices.map((c) => {
                  const sel = q.kind === 'multi' ? list(q.id).includes(c.value) : str(q.id) === c.value;
                  return (
                    <motion.button
                      key={c.value}
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                      whileHover={{ scale: 1.012 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() =>
                        q.kind === 'multi'
                          ? toggleMulti(q.id, c.value, q.noneValue)
                          : answerSingle(q.id, c.value)
                      }
                      className={`flex items-center justify-between rounded-xl border px-5 py-4 text-left text-[15px] font-medium transition-[border-color,background-color,box-shadow] duration-200 ${
                        sel
                          ? 'border-primary shadow-[0_10px_28px_-14px_rgba(31,59,76,0.32)]'
                          : 'border-border hover:border-foreground/40 hover:bg-support-tint/30'
                      }`}
                      style={{ background: sel ? 'var(--gl-support-tint)' : 'var(--gl-surface)' }}
                    >
                      {c.label}
                      <span className={`flex h-5 w-5 items-center justify-center border ${q.kind === 'multi' ? 'rounded-md' : 'rounded-full'} ${sel ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}>
                        <AnimatePresence>
                          {sel && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}>
                              <Check className="h-3 w-3" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {q.kind === 'number' && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.4, ease: EASE }}>
                <div
                  className="mt-9 flex max-w-xs items-center gap-3 rounded-xl border px-5 py-4 transition-colors focus-within:border-primary"
                  style={{ background: 'var(--gl-surface)', borderColor: numErr ? 'var(--gl-accent-strong)' : 'var(--gl-line)' }}
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    autoFocus
                    placeholder={q.placeholder}
                    value={str(q.id)}
                    onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter' && canContinue) go(1); }}
                    className="w-full bg-transparent text-3xl font-extrabold tracking-tight outline-none"
                  />
                  <span className="text-lg font-medium text-ink-3">{q.unit}</span>
                </div>
                <AnimatePresence>
                  {numErr && (
                    <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-sm font-medium text-brand">
                      {numErr}
                    </motion.p>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {q.id === 'pesoKg' && imc && !numErr && (
                    <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm text-ink-3">
                      Seu IMC fica em torno de <span className="font-semibold text-foreground">{imc}</span>.
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            <AnimatePresence>
              {(q.kind === 'number' || q.kind === 'multi') && canContinue && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => go(1)}
                  className={buttonVariants({ size: 'lg', className: 'mt-9' })}
                >
                  Continuar <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        ) : isSuccess && eligible ? (
          <Success nome={contact.nome} />
        ) : eligible ? (
          <ContactForm
            imc={finalImc}
            contact={contact}
            setContact={setContact}
            onSubmit={handleSubmit}
            isPending={isPending}
            onBack={() => go(-1)}
          />
        ) : (
          <Ineligible reasons={reasons} onBack={() => go(-1)} />
        )}
      </main>
    </div>
  );
}

const reveal = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, ease: EASE, duration: 0.45 } }),
};

function ContactForm({
  imc, contact, setContact, onSubmit, isPending, onBack,
}: {
  imc: number | null;
  contact: { nome: string; email: string; whatsapp: string; consent: boolean };
  setContact: React.Dispatch<React.SetStateAction<{ nome: string; email: string; whatsapp: string; consent: boolean }>>;
  onSubmit: () => void;
  isPending: boolean;
  onBack: () => void;
}) {
  const nomeOk = anamneseFieldsSchema.shape.nome.safeParse(contact.nome).success;
  const emailOk = anamneseFieldsSchema.shape.email.safeParse(contact.email).success;
  const whatsappOk = anamneseFieldsSchema.shape.whatsapp.safeParse(contact.whatsapp).success;
  const canSubmit = nomeOk && emailOk && whatsappOk && contact.consent && !isPending;

  return (
    <motion.div key="contact" initial={{ opacity: 0, x: 48 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.34, ease: EASE }}>
      <button onClick={onBack} className="mb-7 inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <motion.p custom={0} variants={reveal} initial="hidden" animate="show" className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Quase lá</motion.p>
      <motion.h1 custom={1} variants={reveal} initial="hidden" animate="show" className="mt-4 max-w-[20ch] text-3xl font-extrabold tracking-tight sm:text-4xl">
        Faz sentido a gente{' '}
        <span className="font-serif font-medium italic text-primary">caminhar junto.</span>
      </motion.h1>
      <motion.p custom={2} variants={reveal} initial="hidden" animate="show" className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
        Com base nas suas respostas, a Go Lev pode te acompanhar. Deixe seu contato que a nossa
        equipe fala com você para agendar a avaliação com a médica.
      </motion.p>

      {imc ? (
        <motion.div custom={3} variants={reveal} initial="hidden" animate="show" className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm" style={{ background: 'var(--gl-surface)' }}>
          <span className="text-ink-3">Seu IMC estimado:</span><span className="font-semibold">{imc}</span>
        </motion.div>
      ) : null}

      <motion.div custom={4} variants={reveal} initial="hidden" animate="show" className="mt-9 grid max-w-lg gap-4">
        <Field label="Nome completo">
          <input value={contact.nome} onChange={(e) => setContact((c) => ({ ...c, nome: e.target.value }))} placeholder="Como podemos te chamar?" className="gl-input" />
        </Field>
        <Field label="E-mail">
          <input type="email" inputMode="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} placeholder="voce@email.com" className="gl-input" />
        </Field>
        <Field label="WhatsApp">
          <input
            inputMode="tel"
            value={contact.whatsapp}
            onChange={(e) => setContact((c) => ({ ...c, whatsapp: maskPhoneBR(e.target.value) }))}
            placeholder="(11) 90000-0000"
            className="gl-input"
          />
        </Field>
        <label className="mt-1 flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-muted-foreground">
          <input type="checkbox" checked={contact.consent} onChange={(e) => setContact((c) => ({ ...c, consent: e.target.checked }))} className="mt-0.5 h-4 w-4 accent-[var(--gl-primary)]" />
          {CONSENT_TEXT}{' '}
          <Link href="/legal/privacy" className="underline hover:text-foreground">Política de Privacidade</Link>.
        </label>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={buttonVariants({ size: 'lg', className: 'mt-2 disabled:opacity-50' })}
        >
          {isPending ? (
            <>Enviando <Loader2 className="h-4 w-4 animate-spin" /></>
          ) : (
            <>Quero fazer parte <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" /></>
          )}
        </button>
        <p className="flex items-center gap-2 text-xs text-ink-3">
          <ShieldCheck className="h-4 w-4" /> Seus dados são tratados com sigilo. Avaliação sem compromisso.
        </p>
      </motion.div>
    </motion.div>
  );
}

function Ineligible({ reasons, onBack }: { reasons: Reason[]; onBack: () => void }) {
  const blocking = reasons.filter((r) => r !== EligibilityReason.IMC_SUFICIENTE);
  const lead = blocking.map((r) => REASON_COPY[r]).find(Boolean) ?? REASON_COPY[EligibilityReason.IMC_ABAIXO_MINIMO];

  return (
    <motion.div key="ineligible" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8 text-center">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: 'var(--gl-support-tint)' }}
      >
        <Info className="h-8 w-8 text-primary" />
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6 max-w-[22ch] text-3xl font-extrabold tracking-tight sm:text-4xl">
        Obrigado por compartilhar com a gente.
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        {lead} Cuidar da saúde vai muito além de medicação — e a gente segue por aqui com conteúdo
        e acompanhamento para te ajudar nessa jornada.
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className={buttonVariants({ variant: 'outline' })}>Voltar para o início</Link>
        <button onClick={onBack} className="text-sm font-semibold text-brand hover:underline">Revisar minhas respostas</button>
      </motion.div>
    </motion.div>
  );
}

function Success({ nome }: { nome: string }) {
  return (
    <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: 'var(--gl-support-tint)' }}
      >
        <Check className="h-8 w-8 text-primary" />
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Recebemos, {nome.split(' ')[0] || 'tudo certo'}!{' '}
        <span className="font-serif font-medium italic text-primary">A Go Lev te chama.</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        Nossa equipe entra em contato pelo WhatsApp para agendar sua avaliação com a médica da
        Go&nbsp;Lev — no seu tempo, sem compromisso.
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Link href="/" className="mt-8 inline-block text-sm font-semibold text-brand hover:underline">Voltar para o início</Link>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
