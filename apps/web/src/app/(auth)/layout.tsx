import Link from 'next/link';
import { Logo } from '@/components/app/logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Painel de marca — visível apenas em lg+ */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col p-16 relative overflow-hidden"
        style={{ background: 'var(--gl-primary-strong)' }}
      >
        <Link href="/" className="relative z-10 transition-opacity hover:opacity-80">
          <Logo size="md" className="gl-wordmark--on-dark" />
        </Link>

        <div className="mt-auto relative z-10">
          <p
            className="text-2xl leading-snug mb-3 font-serif italic"
            style={{ color: 'var(--gl-paper)' }}
          >
            Cuide de quem<br />confia em você.
          </p>
          <p className="text-sm" style={{ color: 'var(--gl-support)' }}>
            Portal interno · Go Lev
          </p>
        </div>

        {/* Pena decorativa */}
        <svg
          viewBox="0 0 329 367"
          fill="none"
          aria-hidden="true"
          className="absolute -bottom-16 -right-16 w-72 opacity-[0.07] pointer-events-none"
        >
          <path
            d="M81.659 237.551C78.2552 237.126 76.2396 237.299 72.659 237.551C77.8254 234.262 81.1577 232.93 87.159 231.051L117.159 208.051C116.877 207.588 116.601 207.378 116.159 207.051C117.233 206.823 117.817 206.827 119.159 207.051C142.181 192.366 153.653 185.254 180.659 177.051C174.266 174.284 170.492 173.51 163.659 172.551C171.365 171.537 175.856 171.253 184.159 171.551C201.233 155.287 195.502 139.605 228.5 130.331C159.446 124.186 147.23 128.931 87.159 180.543C71.3519 209.092 47.0556 258.348 30.6342 298.426C33.1963 293.013 62.6775 254.035 81.659 237.551Z"
            fill="white"
          />
          <path
            d="M0.768685 356.051C-2.00099 370.156 3.12815 369.865 9.53604 357.051C17.4194 336.132 23.1761 316.628 30.6342 298.426C47.0556 258.348 71.3519 209.092 87.159 180.543C166.148 99.2141 202.823 78.3918 317.135 40.0508C335.773 31.6674 332.164 19.921 305.269 19.0547C296.092 19.02 271.977 18.0434 261.269 19.0547C250.562 20.066 272.608 6.62535 282.769 0.054714C225.417 -0.970039 198.696 12.0649 163.269 67.5547L171.269 40.0547C141.707 58.9603 129.101 74.9208 116.769 116.555C116.741 105.829 117.304 99.2905 120.769 86.5547C56.1105 205.353 31.0787 262.687 0.768685 356.051Z"
            fill="white"
          />
        </svg>

        {/* Grade de pontos */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Painel do formulário */}
      <div
        className="flex flex-1 flex-col items-center justify-center overflow-auto px-6 py-12 lg:py-0 lg:px-16"
        style={{ background: 'var(--gl-paper)' }}
      >
        {/* Logo visível apenas no mobile */}
        <Link href="/" className="mb-10 lg:hidden transition-opacity hover:opacity-80">
          <Logo size="md" />
        </Link>

        <div className="w-full max-w-[400px] lg:max-w-[480px]">
          {children}
        </div>
      </div>
    </div>
  );
}
