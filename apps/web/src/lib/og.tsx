import type { ReactElement } from 'react';

/** Tokens da marca (espelham packages/shared/brand/tokens.css). */
export const OG = {
  paper: '#F8F8F5',
  accent: '#E59A72',
  support: '#A6BEC7',
  primary: '#3F6076',
  primaryStrong: '#1F3B4C',
  ink3: 'rgba(248,248,245,0.65)',
};

/** Pena (marca) — paths mestres de packages/shared/brand/mark.svg.
 * base = accent (pêssego) · lâmina = `blade` (claro sobre fundo escuro). */
const MARK_BASE =
  'M81.659 237.551C78.2552 237.126 76.2396 237.299 72.659 237.551C77.8254 234.262 81.1577 232.93 87.159 231.051L117.159 208.051C116.877 207.588 116.601 207.378 116.159 207.051C117.233 206.823 117.817 206.827 119.159 207.051C142.181 192.366 153.653 185.254 180.659 177.051C174.266 174.284 170.492 173.51 163.659 172.551C171.365 171.537 175.856 171.253 184.159 171.551C201.233 155.287 195.502 139.605 228.5 130.331C159.446 124.186 147.23 128.931 87.159 180.543C71.3519 209.092 47.0556 258.348 30.6342 298.426C33.1963 293.013 62.6775 254.035 81.659 237.551Z';
const MARK_BLADE =
  'M0.768685 356.051C-2.00099 370.156 3.12815 369.865 9.53604 357.051C17.4194 336.132 23.1761 316.628 30.6342 298.426C47.0556 258.348 71.3519 209.092 87.159 180.543C166.148 99.2141 202.823 78.3918 317.135 40.0508C335.773 31.6674 332.164 19.921 305.269 19.0547C296.092 19.02 271.977 18.0434 261.269 19.0547C250.562 20.066 272.608 6.62535 282.769 0.054714C225.417 -0.970039 198.696 12.0649 163.269 67.5547L171.269 40.0547C141.707 58.9603 129.101 74.9208 116.769 116.555C116.741 105.829 117.304 99.2905 120.769 86.5547C56.1105 205.353 31.0787 262.687 0.768685 356.051Z';

export function BrandMark({
  height,
  blade = OG.paper,
}: {
  height: number;
  blade?: string;
}): ReactElement {
  const width = Math.round((329 / 367) * height);
  return (
    <svg width={width} height={height} viewBox="0 0 329 367">
      <path fill={OG.accent} d={MARK_BASE} />
      <path fill={blade} d={MARK_BLADE} />
    </svg>
  );
}

/** Wordmark "go lev" — go (Hanken bold itálico) + lev (Newsreader itálico pêssego). */
export function Wordmark({ fontSize }: { fontSize: number }): ReactElement {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', fontSize }}>
      <span style={{ fontFamily: 'Hanken Grotesk', fontWeight: 800, fontStyle: 'italic', letterSpacing: '-0.03em' }}>
        go
      </span>
      <span style={{ fontFamily: 'Newsreader', fontWeight: 600, fontStyle: 'italic', color: OG.accent, marginLeft: Math.round(fontSize * 0.14) }}>
        lev
      </span>
    </div>
  );
}

const CHARSET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,:/-—' +
  'áàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ';

type Spec = { family: string; weight: number; italic?: boolean };

async function fetchFont({ family, weight, italic }: Spec): Promise<ArrayBuffer> {
  const api =
    `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}` +
    `:ital,wght@${italic ? 1 : 0},${weight}&text=${encodeURIComponent(CHARSET)}`;
  const css = await fetch(api, {
    headers: {
      // UA antiga → o Google devolve TTF (o next/og/Satori não suporta woff2).
      'User-Agent':
        'Mozilla/5.0 (Linux; U; Android 2.3.3; en-us) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
    },
  }).then((r) => r.text());
  const src = /src:\s*url\((https:\/\/[^)]+)\)/.exec(css)?.[1];
  if (!src) throw new Error(`OG font não encontrada: ${family} ${weight}${italic ? 'i' : ''}`);
  return fetch(src).then((r) => r.arrayBuffer());
}

export type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 600 | 800;
  style: 'normal' | 'italic';
};

/** Carrega o conjunto mínimo de fontes da marca p/ as OG images (no build). */
export async function loadBrandFonts(): Promise<OgFont[]> {
  const [h800, h800i, h600, news600i] = await Promise.all([
    fetchFont({ family: 'Hanken Grotesk', weight: 800 }),
    fetchFont({ family: 'Hanken Grotesk', weight: 800, italic: true }),
    fetchFont({ family: 'Hanken Grotesk', weight: 600 }),
    fetchFont({ family: 'Newsreader', weight: 600, italic: true }),
  ]);
  return [
    { name: 'Hanken Grotesk', data: h800, weight: 800, style: 'normal' },
    { name: 'Hanken Grotesk', data: h800i, weight: 800, style: 'italic' },
    { name: 'Hanken Grotesk', data: h600, weight: 600, style: 'normal' },
    { name: 'Newsreader', data: news600i, weight: 600, style: 'italic' },
  ];
}
