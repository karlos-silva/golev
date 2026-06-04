'use client';

import { useId, useState } from 'react';
import { Plus } from 'lucide-react';

export type AccordionItem = { q: string; a: string };

/**
 * Acordeão com abertura animada (altura + fade).
 *
 * Substitui o `<details>` nativo, que troca o conteúdo de forma "seca"
 * (sem transição de altura). A animação usa a técnica de
 * `grid-template-rows: 0fr → 1fr`: é puramente CSS, suave e não depende
 * de JS, então o conteúdo nunca fica preso fechado. Cada item abre/fecha
 * de forma independente (como o `<details>` que substitui). Quando
 * fechado, o painel é `inert` (fora do foco e da árvore de acessibilidade).
 */
export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openItems, setOpenItems] = useState<ReadonlySet<number>>(new Set());
  const uid = useId();

  const toggle = (i: number) =>
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openItems.has(i);
        const triggerId = `${uid}-trigger-${i}`;
        const panelId = `${uid}-panel-${i}`;

        return (
          <div key={item.q} className="border-b border-border">
            <button
              type="button"
              id={triggerId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => toggle(i)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-lg font-semibold"
            >
              {item.q}
              <Plus
                aria-hidden
                className={`h-5 w-5 shrink-0 text-brand transition-transform duration-300 ease-out ${
                  isOpen ? 'rotate-45' : ''
                }`}
              />
            </button>

            <div
              id={panelId}
              inert={!isOpen}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div
                className={`overflow-hidden transition-opacity duration-300 ease-out ${
                  isOpen ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <p className="max-w-[60ch] pb-5 text-[15px] leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
