import { ImageResponse } from 'next/og';
import { BrandMark, OG } from '@/lib/og';

export const runtime = 'nodejs';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${OG.primaryStrong} 0%, ${OG.primary} 100%)`,
        }}
      >
        <BrandMark height={106} />
      </div>
    ),
    { ...size },
  );
}
