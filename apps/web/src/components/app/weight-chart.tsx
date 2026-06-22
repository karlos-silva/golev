'use client';

import { useRef, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Point {
  t: number; // timestamp (ms)
  w: number; // peso (kg)
}

const DAY_MS = 86_400_000;
const comma = (n: number) => n.toFixed(1).replace('.', ',');
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Gráfico de evolução de peso — SVG puro (linha + área), sem dependência.
 * Modo simples (só `points`) é retrocompatível (home/portal). Modo rico
 * (`interactive`) adiciona faixas de tempo, linha-objetivo, marcadores rotulados
 * e tooltip ao TOQUE. Rótulos numéricos vão numa camada HTML sobreposta (texto
 * de tamanho fixo em qualquer largura — o SVG escala só os traços).
 */
export function WeightChart({
  points,
  goalKg,
  interactive = false,
  height = 200,
}: {
  points: Point[];
  /** Peso de referência (faixa saudável) — linha tracejada. */
  goalKg?: number;
  /** Liga faixas de tempo, tooltip ao toque, eixo de datas e rótulos. */
  interactive?: boolean;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pressing = useRef(false);
  const [rangeDays, setRangeDays] = useState<number | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl px-6 text-center" style={{ border: '1px dashed var(--gl-line)' }}>
        <p className="text-sm" style={{ color: 'var(--gl-ink-3)' }}>
          {interactive
            ? 'Registre seu peso lá em cima para ver sua linha do tempo.'
            : 'Registre ao menos duas pesagens para ver a evolução'}
        </p>
      </div>
    );
  }

  const all = [...points].sort((a, b) => a.t - b.t);

  const shown = (() => {
    if (!interactive || rangeDays == null) return all;
    const cut = Date.now() - rangeDays * DAY_MS;
    const f = all.filter((p) => p.t >= cut);
    return f.length >= 2 ? f : all;
  })();

  const W = 600;
  const H = height;
  const padX = 38;
  const padTop = 22;
  const padBottom = 22;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  const ts = shown.map((p) => p.t);
  const ws = shown.map((p) => p.w);
  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  const wPool = goalKg != null ? [...ws, goalKg] : ws;
  const wMinRaw = Math.min(...wPool);
  const wMaxRaw = Math.max(...wPool);
  const pad = Math.max((wMaxRaw - wMinRaw) * 0.12, 0.8);
  const wMin = wMinRaw - pad;
  const wMax = wMaxRaw + pad;

  const x = (t: number) => padX + (tMax === tMin ? 0.5 : (t - tMin) / (tMax - tMin)) * innerW;
  const y = (w: number) => padTop + (wMax === wMin ? 0.5 : (wMax - w) / (wMax - wMin)) * innerH;
  const xPct = (t: number) => (x(t) / W) * 100;
  const yPct = (w: number) => (y(w) / H) * 100;

  const line = shown.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.t).toFixed(1)} ${y(p.w).toFixed(1)}`).join(' ');
  const area = `${line} L ${x(tMax).toFixed(1)} ${(padTop + innerH).toFixed(1)} L ${x(tMin).toFixed(1)} ${(padTop + innerH).toFixed(1)} Z`;

  const first = shown[0]!;
  const last = shown[shown.length - 1]!;
  const lowest = shown.reduce((m, p) => (p.w < m.w ? p : m), first);
  const active = activeIdx != null ? shown[activeIdx] : null;

  function pointerToIndex(clientX: number) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = (clientX - rect.left) / rect.width;
    const tt = tMin + ((relX * W - padX) / innerW) * (tMax - tMin);
    let best = 0;
    let bestD = Infinity;
    shown.forEach((p, i) => {
      const d = Math.abs(p.t - tt);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setActiveIdx(best);
  }

  const Chips = interactive && (
    <div className="mb-3 flex gap-1.5">
      {([[30, '30 dias'], [90, '90 dias'], [null, 'Tudo']] as const).map(([d, label]) => {
        const on = rangeDays === d;
        return (
          <button
            key={label}
            onClick={() => { setRangeDays(d); setActiveIdx(null); }}
            className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
            style={{
              background: on ? 'var(--gl-support-tint)' : 'transparent',
              color: on ? 'var(--gl-primary-strong)' : 'var(--gl-ink-3)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div>
      {Chips}
      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', width: '100%', height: 'auto', touchAction: 'pan-y' }}
          role="img"
          aria-label={`Evolução do peso de ${comma(first.w)} a ${comma(last.w)} kg${goalKg != null ? `, referência ${comma(goalKg)}` : ''}`}
          onPointerDown={interactive ? (e) => { pressing.current = true; pointerToIndex(e.clientX); } : undefined}
          onPointerMove={interactive ? (e) => { if (pressing.current) pointerToIndex(e.clientX); } : undefined}
          onPointerUp={interactive ? () => { pressing.current = false; setActiveIdx(null); } : undefined}
          onPointerLeave={interactive ? () => { pressing.current = false; setActiveIdx(null); } : undefined}
          onPointerCancel={interactive ? () => { pressing.current = false; setActiveIdx(null); } : undefined}
        >
          <defs>
            <linearGradient id="gl-weight-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gl-primary)" stopOpacity="0.16" />
              <stop offset="100%" stopColor="var(--gl-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* linha do objetivo (referência) */}
          {goalKg != null && (
            <line x1={padX} y1={y(goalKg)} x2={W - padX} y2={y(goalKg)} stroke="var(--gl-accent-strong)" strokeWidth="1.25" strokeDasharray="4 4" opacity="0.5" />
          )}

          {/* guias min/max (modo simples) */}
          {!interactive && [wMaxRaw, wMinRaw].map((wv) => (
            <g key={wv}>
              <line x1={padX} y1={y(wv)} x2={W - padX} y2={y(wv)} stroke="var(--gl-line)" strokeWidth="1" strokeDasharray="3 3" />
              <text x={padX - 6} y={y(wv) + 3} textAnchor="end" fontSize="10" fill="var(--gl-ink-3)">{wv.toFixed(1)}</text>
            </g>
          ))}

          <path d={area} fill="url(#gl-weight-fill)" />
          <path d={line} fill="none" stroke="var(--gl-primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

          {/* guia vertical do ponto ativo */}
          {active && (
            <line x1={x(active.t)} y1={padTop} x2={x(active.t)} y2={padTop + innerH} stroke="var(--gl-primary)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          )}

          {/* marcadores */}
          {interactive ? (
            <>
              <circle cx={x(first.t)} cy={y(first.w)} r="4" fill="var(--gl-surface)" stroke="var(--gl-ink-3)" strokeWidth="2" />
              {lowest !== last && lowest !== first && (
                <circle cx={x(lowest.t)} cy={y(lowest.w)} r="3.5" fill="var(--gl-accent-strong)" />
              )}
              {active && active !== last && <circle cx={x(active.t)} cy={y(active.w)} r="4.5" fill="var(--gl-primary)" />}
              <circle cx={x(last.t)} cy={y(last.w)} r="6.5" fill="var(--gl-accent)" stroke="var(--gl-surface)" strokeWidth="2" />
            </>
          ) : (
            shown.map((p, i) => (
              <circle key={i} cx={x(p.t)} cy={y(p.w)} r={i === 0 || i === shown.length - 1 ? 4 : 3} fill="var(--gl-surface)" stroke="var(--gl-primary)" strokeWidth="2" />
            ))
          )}
        </svg>

        {/* camada HTML de rótulos (texto fixo) */}
        {interactive && (
          <>
            {goalKg != null && (
              <span
                style={{ position: 'absolute', left: `${xPct(tMax)}%`, top: `${yPct(goalKg)}%`, transform: 'translate(-100%, -130%)', fontSize: 11, color: 'var(--gl-accent-strong)', whiteSpace: 'nowrap', pointerEvents: 'none' }}
              >
                objetivo ~{comma(goalKg)}
              </span>
            )}
            <span
              style={{ position: 'absolute', left: `${clamp(xPct(last.t), 12, 96)}%`, top: `${yPct(last.w)}%`, transform: 'translate(-100%, -150%)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 500, fontSize: 16, color: 'var(--gl-accent-strong)', whiteSpace: 'nowrap', pointerEvents: 'none' }}
            >
              {comma(last.w)}
            </span>
            {active && (
              <span
                style={{ position: 'absolute', left: `${clamp(xPct(active.t), 14, 86)}%`, top: `${yPct(active.w)}%`, transform: 'translate(-50%, -135%)', background: 'var(--gl-ink)', color: 'var(--gl-paper)', fontSize: 11, padding: '3px 8px', borderRadius: 8, whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: '0 4px 14px -6px rgba(31,59,76,0.5)' }}
              >
                {format(new Date(active.t), "d 'de' MMM", { locale: ptBR })} · {comma(active.w)} kg
              </span>
            )}
          </>
        )}
      </div>

      {/* eixo de datas */}
      {interactive && (
        <div className="mt-1.5 flex justify-between text-[11px]" style={{ color: 'var(--gl-ink-3)' }}>
          <span>{format(new Date(first.t), "d 'de' MMM", { locale: ptBR })}</span>
          <span>hoje</span>
        </div>
      )}
    </div>
  );
}
