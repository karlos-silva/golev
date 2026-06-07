import { ClientSidebar } from '@/components/client/client-sidebar';
import { MobileTopBar } from '@/components/client/mobile-topbar';
import { MobileTabBar } from '@/components/client/mobile-tabbar';
import { ClientAuthGate } from '@/components/client/auth-gate';

// Render dinâmico: permite que o Next aplique o nonce da CSP (middleware) aos
// scripts. Rota logada (não-SEO), então sem custo de SEO.
export const dynamic = 'force-dynamic';

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAuthGate>
      {/* h-dvh: respeita a barra dinâmica do navegador mobile (sem corte do tab bar). */}
      <div className="flex h-dvh overflow-hidden" style={{ background: 'var(--gl-paper)' }}>
        <ClientSidebar />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <MobileTopBar />
          <main className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 lg:py-8">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
              {children}
            </div>
          </main>
          <MobileTabBar />
        </div>
      </div>
    </ClientAuthGate>
  );
}
