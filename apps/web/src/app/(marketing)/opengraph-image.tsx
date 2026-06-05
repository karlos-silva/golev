import { ImageResponse } from 'next/og';
import { OG, BrandMark, Wordmark, loadBrandFonts } from '@/lib/og';

export const runtime = 'nodejs';
export const alt = 'Go Lev — emagrecimento com acompanhamento médico';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  const fonts = await loadBrandFonts();
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          background: `linear-gradient(135deg, ${OG.primaryStrong} 0%, ${OG.primary} 100%)`,
          color: OG.paper,
          fontFamily: 'Hanken Grotesk',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BrandMark height={56} />
          <div style={{ display: 'flex', marginLeft: 22 }}>
            <Wordmark fontSize={48} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 600, color: OG.accent, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 22 }}>
            Emagrecimento com acompanhamento médico
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 66, fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.02em' }}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span>Cuidado que&nbsp;</span>
              <span style={{ fontFamily: 'Newsreader', fontWeight: 600, fontStyle: 'italic', color: OG.accent }}>eleva</span>
            </div>
            <div style={{ display: 'flex' }}>quem decide mudar.</div>
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, fontWeight: 600, color: OG.ink3 }}>golev.app.br</div>
      </div>
    ),
    { ...size, fonts },
  );
}
