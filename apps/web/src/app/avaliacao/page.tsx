'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from '@/components/app/logo';
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from 'lucide-react';

/* ============================================================
   Avaliação de elegibilidade — experiência animada.
   Fluxo inspirado no questionário da Voy (saúde/emagrecimento):
   não cria conta, coleta respostas, estima e captura contato.
   ============================================================ */

type Choice = { value: string; label: string };
type Question =
  | { id: string; kind: 'single'; title: string; help?: string; choices: Choice[] }
  | { id: string; kind: 'multi'; title: string; help?: string; choices: Choice[] }
  | { id: string; kind: 'number'; title: string; help?: string; unit: string; placeholder?: string };

const NONE = 'nenhuma';

const QUESTIONS: Question[] = [
  {
    id: 'objetivo', kind: 'single', title: 'Qual é o seu principal objetivo?',
    help: 'Não existe resposta certa. A gente quer entender você.',
    choices: [
      { value: 'emagrecer', label: 'Emagrecer com saúde' },
      { value: 'manter', label: 'Controlar o peso que já perdi' },
      { value: 'saude', label: 'Melhorar minha saúde no geral' },
      { value: 'autoestima', label: 'Me sentir melhor comigo' },
    ],
  },
  {
    id: 'sexo', kind: 'single', title: 'Qual seu sexo biológico?',
    help: 'Usamos isso só para a avaliação clínica.',
    choices: [
      { value: 'feminino', label: 'Feminino' },
      { value: 'masculino', label: 'Masculino' },
      { value: 'na', label: 'Prefiro não dizer' },
    ],
  },
  { id: 'idade', kind: 'number', title: 'Quantos anos você tem?', unit: 'anos', placeholder: '32' },
  { id: 'altura', kind: 'number', title: 'Qual a sua altura?', unit: 'cm', placeholder: '168' },
  { id: 'peso', kind: 'number', title: 'E o seu peso atual?', help: 'Sem julgamento — é só um ponto de partida.', unit: 'kg', placeholder: '82' },
  {
    id: 'tentativas', kind: 'single', title: 'Você já tentou emagrecer antes?',
    choices: [
      { value: 'muitas', label: 'Sim, várias vezes' },
      { value: 'algumas', label: 'Sim, algumas vezes' },
      { value: 'primeira', label: 'É a primeira vez' },
    ],
  },
  {
    id: 'condicoes', kind: 'multi', title: 'Você convive com alguma destas condições?',
    help: 'Pode marcar mais de uma. Se nenhuma, marque a última.',
    choices: [
      { value: 'diabetes', label: 'Diabetes tipo 2' },
      { value: 'pre_diabetes', label: 'Pré-diabetes' },
      { value: 'hipertensao', label: 'Pressão alta' },
      { value: 'colesterol', label: 'Colesterol alto' },
      { value: NONE, label: 'Nenhuma dessas' },
    ],
  },
  {
    id: 'contraindicacoes', kind: 'multi', title: 'Alguma destas situações se aplica a você?',
    help: 'Importante para a segurança da avaliação médica.',
    choices: [
      { value: 'gravidez', label: 'Gravidez ou amamentação' },
      { value: 'pancreatite', label: 'Histórico de pancreatite' },
      { value: 'tireoide', label: 'Histórico de câncer de tireoide' },
      { value: 'alimentar', label: 'Transtorno alimentar' },
      { value: NONE, label: 'Nenhuma dessas' },
    ],
  },
];

const TOTAL = QUESTIONS.length;
type Answers = Record<string, string | string[]>;

const EASE = [0.22, 1, 0.36, 1] as const;
const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -48 : 48 }),
};

export default function AvaliacaoPage() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const [contact, setContact] = useState({ nome: '', email: '', whatsapp: '', consent: false });

  const onResult = step >= TOTAL;
  const progress = Math.min(step, TOTAL) / TOTAL;

  const imc = useMemo(() => {
    const alt = Number(answers.altura);
    const peso = Number(answers.peso);
    if (!alt || !peso) return null;
    const m = alt / 100;
    return +(peso / (m * m)).toFixed(1);
  }, [answers.altura, answers.peso]);

  function go(d: number) {
    setDir(d);
    setStep((s) => Math.min(Math.max(s + d, 0), TOTAL));
  }

  function answerSingle(id: string, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
    window.setTimeout(() => go(1), 260);
  }
  function toggleMulti(id: string, value: string) {
    setAnswers((a) => {
      const cur = Array.isArray(a[id]) ? (a[id]) : [];
      if (value === NONE) return { ...a, [id]: cur.includes(NONE) ? [] : [NONE] };
      const without = cur.filter((v) => v !== NONE);
      return { ...a, [id]: without.includes(value) ? without.filter((v) => v !== value) : [...without, value] };
    });
  }

  const q = onResult ? null : QUESTIONS[step]!;
  const canContinue = !onResult && (
    q!.kind === 'number' ? Number(answers[q!.id]) > 0
      : q!.kind === 'multi' ? Array.isArray(answers[q!.id]) && (answers[q!.id] as string[]).length > 0
        : Boolean(answers[q!.id])
  );

  const emailOk = /.+@.+\..+/.test(contact.email);
  const contactOk = contact.nome.trim().length > 1 && emailOk && contact.whatsapp.trim().length >= 8 && contact.consent;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* fundo suave em movimento */}
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

      {/* topo + progresso */}
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
              {step + 1} <span className="opacity-50">de</span> {TOTAL}
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
                    const arr = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
                    const sel = q.kind === 'multi' ? arr.includes(c.value) : answers[q.id] === c.value;
                    return (
                      <motion.button
                        key={c.value}
                        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                        whileHover={{ scale: 1.012 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => (q.kind === 'multi' ? toggleMulti(q.id, c.value) : answerSingle(q.id, c.value))}
                        className={`flex items-center justify-between rounded-xl border px-5 py-4 text-left text-[15px] font-medium transition-colors ${
                          sel ? 'border-primary' : 'border-border hover:border-foreground/40'
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
                  <div className="mt-9 flex max-w-xs items-center gap-3 rounded-xl border border-border px-5 py-4 transition-colors focus-within:border-primary" style={{ background: 'var(--gl-surface)' }}>
                    <input
                      type="number" inputMode="numeric" autoFocus placeholder={q.placeholder}
                      value={(answers[q.id] as string) ?? ''}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter' && canContinue) go(1); }}
                      className="w-full bg-transparent text-3xl font-extrabold tracking-tight outline-none"
                    />
                    <span className="text-lg font-medium text-ink-3">{q.unit}</span>
                  </div>
                  <AnimatePresence>
                    {q.id === 'peso' && imc && (
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
                    className="mt-9 inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong"
                  >
                    Continuar <ArrowRight className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <Result
              key="result"
              imc={imc}
              answers={answers}
              contact={contact}
              setContact={setContact}
              submitted={submitted}
              onSubmit={() => setSubmitted(true)}
              canSubmit={contactOk}
              onBack={() => go(-1)}
            />
          )}
      </main>
    </div>
  );
}

function Result({
  imc, answers, contact, setContact, submitted, onSubmit, canSubmit, onBack,
}: {
  imc: number | null;
  answers: Answers;
  contact: { nome: string; email: string; whatsapp: string; consent: boolean };
  setContact: React.Dispatch<React.SetStateAction<{ nome: string; email: string; whatsapp: string; consent: boolean }>>;
  submitted: boolean;
  onSubmit: () => void;
  canSubmit: boolean;
  onBack: () => void;
}) {
  const contra = Array.isArray(answers.contraindicacoes) ? (answers.contraindicacoes) : [];
  const hasContra = contra.some((v) => v !== NONE);

  if (submitted) {
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
          Recebemos, {contact.nome.split(' ')[0] || 'tudo certo'}!{' '}
          <span className="font-serif font-medium italic text-primary">A gente te chama.</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Em breve um especialista da Go&nbsp;Lev entra em contato pelo WhatsApp para o próximo passo —
          no seu tempo, sem compromisso.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Link href="/" className="mt-8 inline-block text-sm font-semibold text-brand hover:underline">Voltar para o início</Link>
        </motion.div>
      </motion.div>
    );
  }

  const reveal = {
    hidden: { opacity: 0, y: 14 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.08 * i, ease: EASE, duration: 0.45 } }),
  };

  return (
    <motion.div key="result" initial={{ opacity: 0, x: 48 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.34, ease: EASE }}>
      <button onClick={onBack} className="mb-7 inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <motion.p custom={0} variants={reveal} initial="hidden" animate="show" className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Quase lá</motion.p>
      <motion.h1 custom={1} variants={reveal} initial="hidden" animate="show" className="mt-4 max-w-[20ch] text-3xl font-extrabold tracking-tight sm:text-4xl">
        Faz sentido a gente{' '}
        <span className="font-serif font-medium italic text-primary">caminhar junto.</span>
      </motion.h1>
      <motion.p custom={2} variants={reveal} initial="hidden" animate="show" className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
        {hasContra
          ? 'Com base nas suas respostas, um médico vai avaliar seu caso com atenção especial antes de qualquer recomendação. Deixe seu contato que a gente cuida do resto.'
          : 'Com base nas suas respostas, a Go Lev pode te acompanhar. Deixe seu contato e um especialista fala com você para os próximos passos.'}
      </motion.p>

      {imc && (
        <motion.div custom={3} variants={reveal} initial="hidden" animate="show" className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm" style={{ background: 'var(--gl-surface)' }}>
          <span className="text-ink-3">Seu IMC estimado:</span><span className="font-semibold">{imc}</span>
        </motion.div>
      )}

      <motion.div custom={4} variants={reveal} initial="hidden" animate="show" className="mt-9 grid max-w-lg gap-4">
        <Field label="Nome completo">
          <input value={contact.nome} onChange={(e) => setContact((c) => ({ ...c, nome: e.target.value }))} placeholder="Como podemos te chamar?" className="gl-input" />
        </Field>
        <Field label="E-mail">
          <input type="email" value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} placeholder="voce@email.com" className="gl-input" />
        </Field>
        <Field label="WhatsApp">
          <input value={contact.whatsapp} onChange={(e) => setContact((c) => ({ ...c, whatsapp: e.target.value }))} placeholder="(11) 90000-0000" className="gl-input" />
        </Field>
        <label className="mt-1 flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-muted-foreground">
          <input type="checkbox" checked={contact.consent} onChange={(e) => setContact((c) => ({ ...c, consent: e.target.checked }))} className="mt-0.5 h-4 w-4 accent-[var(--gl-primary)]" />
          Concordo em ser contatado pela Go&nbsp;Lev e com o tratamento dos meus dados conforme a Política de Privacidade.
        </label>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onSubmit}
          disabled={!canSubmit}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          Quero fazer parte <ArrowRight className="h-4 w-4" />
        </motion.button>
        <p className="flex items-center gap-2 text-xs text-ink-3">
          <ShieldCheck className="h-4 w-4" /> Seus dados são tratados com sigilo. Avaliação sem compromisso.
        </p>
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
