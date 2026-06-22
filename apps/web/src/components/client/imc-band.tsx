'use client';

/* ============================================================================
   Faixa de IMC — UMA barra contínua (gradiente de 3 zonas, sem emendas, pontas
   arredondadas) que preenche 100% da largura, com 3 pontos rotulados: onde
   começou, onde está agora (em destaque) e o objetivo (faixa saudável, IMC<25).
   Feita em HTML/CSS (não SVG) p/ a barra ocupar tudo e o texto manter tamanho
   fixo em qualquer largura. Cada ponto mostra o valor do IMC. Sem vermelho.
   ========================================================================== */

const BMI_MIN = 18.5;
const BMI_MAX = 40;
const NORMAL_MAX = 25;
const OVER_MAX = 30;
const TARGET_BMI = 24.9;

const pct = (b: number) => {
  const c = Math.min(BMI_MAX, Math.max(BMI_MIN, b));
  return ((c - BMI_MIN) / (BMI_MAX - BMI_MIN)) * 100;
};
const fmt = (b: number) => b.toFixed(1).replace('.', ',');

const zN = pct(NORMAL_MAX);
const zO = pct(OVER_MAX);

function Dot({ left, color, size, ring }: { left: number; color: string; size: number; ring?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: '50%',
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        borderRadius: '9999px',
        background: color,
        boxShadow: ring ? '0 0 0 4px rgba(63,96,118,0.22)' : undefined,
      }}
    />
  );
}

function Label({
  left,
  color,
  value,
  caption,
  place,
}: {
  left: number;
  color: string;
  value: string;
  caption: string;
  place: 'above' | 'below';
}) {
  const above = place === 'above';
  return (
    <div
      style={{
        position: 'absolute',
        left: `${left}%`,
        transform: 'translateX(-50%)',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        color,
        ...(above ? { bottom: '100%', marginBottom: 9 } : { top: '100%', marginTop: 9 }),
      }}
    >
      {above ? (
        <>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{caption}</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 11, opacity: 0.85, marginBottom: 2 }}>{caption}</div>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1 }}>{value}</div>
        </>
      )}
    </div>
  );
}

export function ImcBand({ initialBmi, currentBmi }: { initialBmi: number | null; currentBmi: number }) {
  const showTarget = currentBmi > NORMAL_MAX;

  return (
    <div role="img" aria-label="Faixa de IMC com início, agora e objetivo" style={{ margin: '46px 0 42px' }}>
      <div
        style={{
          position: 'relative',
          height: 10,
          borderRadius: 9999,
          background: `linear-gradient(to right, #CFE0D6 0 ${zN}%, #E7D9B8 ${zN}% ${zO}%, #E6C7B8 ${zO}% 100%)`,
        }}
      >
        {showTarget && (
          <Label left={pct(TARGET_BMI)} color="var(--gl-accent-strong)" value={fmt(TARGET_BMI)} caption="objetivo" place="above" />
        )}
        {initialBmi != null && (
          <Label left={pct(initialBmi)} color="var(--gl-ink-3)" value={fmt(initialBmi)} caption="início" place="above" />
        )}
        <Label left={pct(currentBmi)} color="var(--gl-primary-strong)" value={fmt(currentBmi)} caption="agora" place="below" />

        {showTarget && <Dot left={pct(TARGET_BMI)} color="var(--gl-accent-strong)" size={11} />}
        {initialBmi != null && <Dot left={pct(initialBmi)} color="var(--gl-ink-3)" size={11} />}
        <Dot left={pct(currentBmi)} color="var(--gl-primary)" size={15} ring />
      </div>
    </div>
  );
}
