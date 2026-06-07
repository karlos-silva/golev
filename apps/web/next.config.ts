import type { NextConfig } from 'next';

// Headers de segurança aplicados a todas as rotas. Mantidos "não-quebra":
// não restringimos script/style-src (exigiria nonce/CSP completa — fica como
// follow-up junto com tokens httpOnly). Estes aqui são ganhos puros.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // A CSP (híbrida: nonce nas rotas logadas, estática-friendly no marketing) é
  // setada pelo middleware (src/middleware.ts), pois precisa ser por-requisição.
];

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  transpilePackages: ['@golev/shared'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
