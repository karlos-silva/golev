'use client';

import { Search } from 'lucide-react';

/**
 * Barra de filtros reutilizável — busca (com a cara da marca) + os selects
 * passados como children. Usada em Avaliações e Clientes.
 */
export function FilterBar({
  search,
  onSearch,
  searchPlaceholder = 'Buscar…',
  children,
}: {
  search: string;
  onSearch: (v: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="gl-in flex flex-col sm:flex-row gap-3 flex-shrink-0" style={{ animationDelay: '40ms' }}>
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
          style={{ color: 'var(--gl-ink-3)' }}
        />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg pl-9 pr-3 py-2 text-sm outline-none transition-all"
          style={{ border: '1px solid var(--gl-line)', background: 'var(--gl-surface)', color: 'var(--gl-ink)' }}
        />
      </div>
      {children}
    </div>
  );
}

/** Wrapper de largura fixa para um Select dentro da FilterBar. */
export function FilterSlot({ children, className = 'w-full sm:w-52' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
