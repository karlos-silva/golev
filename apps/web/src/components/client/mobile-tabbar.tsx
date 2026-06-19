'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CLIENT_NAV, isNavActive } from './nav';

/**
 * Tab bar inferior estilo app nativo (mobile). Pílula de destaque no item ativo
 * (Material 3), ícones de linha, respeita a safe-area do iPhone. Só aparece em
 * <lg; no desktop a navegação é a sidebar.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden flex-shrink-0"
      aria-label="Navegação principal"
      style={{
        background: 'var(--gl-surface)',
        borderTop: '1px solid var(--gl-line)',
        boxShadow: '0 -8px 24px -16px rgba(31,59,76,0.25)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <ul className="flex items-stretch">
        {CLIENT_NAV.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className="flex select-none flex-col items-center gap-1 pt-2 pb-1.5 transition-transform active:scale-95"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                <span
                  className="flex h-8 items-center justify-center rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: active ? '3.25rem' : '2rem',
                    background: active ? 'var(--gl-support-tint)' : 'transparent',
                  }}
                >
                  <item.icon
                    className="h-[21px] w-[21px] transition-colors duration-200"
                    strokeWidth={active ? 2.4 : 2}
                    style={{ color: active ? 'var(--gl-primary)' : 'var(--gl-ink-3)' }}
                  />
                </span>
                <span
                  className="text-[10.5px] leading-none transition-colors duration-200"
                  style={{
                    color: active ? 'var(--gl-primary)' : 'var(--gl-ink-3)',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {item.short}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
