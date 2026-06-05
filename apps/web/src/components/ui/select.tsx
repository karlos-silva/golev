'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Select com a identidade Go Lev — substitui o <select> nativo do browser.
 * Trigger no padrão dos inputs da marca + painel custom com animação e check.
 */
export function Select({
  value,
  onChange,
  options,
  placeholder = 'Selecione…',
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-all disabled:opacity-50"
        style={{
          border: `1px solid ${open ? 'var(--gl-primary)' : 'var(--gl-line)'}`,
          background: 'var(--gl-surface)',
          color: selected ? 'var(--gl-ink)' : 'var(--gl-ink-3)',
          boxShadow: open ? '0 0 0 3px var(--gl-support-tint)' : 'none',
        }}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className="h-4 w-4 flex-shrink-0 transition-transform"
          style={{ color: 'var(--gl-ink-3)', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {open && (
        <div
          className="gl-modal absolute left-0 right-0 top-full mt-1 z-30 rounded-xl shadow-lg overflow-hidden"
          style={{ background: 'var(--gl-surface)', border: '1px solid var(--gl-line)' }}
        >
          <div className="max-h-56 overflow-y-auto py-1">
            {options.length === 0 ? (
              <p className="px-3 py-2.5 text-xs" style={{ color: 'var(--gl-ink-3)' }}>
                Nenhuma opção
              </p>
            ) : (
              options.map((o) => {
                const sel = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors"
                    style={{
                      color: sel ? 'var(--gl-primary)' : 'var(--gl-ink)',
                      fontWeight: sel ? 600 : 400,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gl-support-tint)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="truncate">{o.label}</span>
                    {sel && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
