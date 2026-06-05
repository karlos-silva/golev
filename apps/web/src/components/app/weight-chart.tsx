'use client';

interface Point {
  t: number; // timestamp (ms)
  w: number; // peso (kg)
}

/**
 * Gráfico de evolução de peso — SVG puro, sem dependência. Linha + área sutil,
 * eixo Y com min/max, marcadores nos pontos. Cores da marca.
 */
export function WeightChart({ points }: { points: Point[] }) {
  if (points.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg" style={{ border: '1px dashed var(--gl-line)' }}>
        <p className="text-sm" style={{ color: 'var(--gl-ink-3)' }}>
          Registre ao menos duas pesagens para ver a evolução
        </p>
      </div>
    );
  }

  const W = 600;
  const H = 200;
  const padX = 36;
  const padY = 20;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const ts = points.map((p) => p.t);
  const ws = points.map((p) => p.w);
  const tMin = Math.min(...ts);
  const tMax = Math.max(...ts);
  const wMinRaw = Math.min(...ws);
  const wMaxRaw = Math.max(...ws);
  const pad = Math.max((wMaxRaw - wMinRaw) * 0.15, 1);
  const wMin = wMinRaw - pad;
  const wMax = wMaxRaw + pad;

  const x = (t: number) => padX + (tMax === tMin ? 0.5 : (t - tMin) / (tMax - tMin)) * innerW;
  const y = (w: number) => padY + (wMax === wMin ? 0.5 : (wMax - w) / (wMax - wMin)) * innerH;

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.t).toFixed(1)} ${y(p.w).toFixed(1)}`).join(' ');
  const area = `${line} L ${x(tMax).toFixed(1)} ${padY + innerH} L ${x(tMin).toFixed(1)} ${padY + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 'auto' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="gl-weight-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gl-primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--gl-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* linhas-guia Y (min/max) */}
      {[wMaxRaw, wMinRaw].map((wv) => (
        <g key={wv}>
          <line x1={padX} y1={y(wv)} x2={W - padX} y2={y(wv)} stroke="var(--gl-line)" strokeWidth="1" strokeDasharray="3 3" />
          <text x={padX - 6} y={y(wv) + 3} textAnchor="end" fontSize="10" fill="var(--gl-ink-3)">
            {wv.toFixed(1)}
          </text>
        </g>
      ))}

      <path d={area} fill="url(#gl-weight-fill)" />
      <path d={line} fill="none" stroke="var(--gl-primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <circle
          key={i}
          cx={x(p.t)}
          cy={y(p.w)}
          r={i === 0 || i === points.length - 1 ? 4 : 3}
          fill="var(--gl-surface)"
          stroke="var(--gl-primary)"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}
