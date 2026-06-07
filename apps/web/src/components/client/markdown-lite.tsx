import { Fragment, type ReactNode } from 'react';

/**
 * Renderizador de markdown leve e SEGURO para o plano alimentar escrito pela
 * equipe. Suporta: ## título, ### subtítulo, listas (- / *), citação (>),
 * **negrito** e parágrafos. Renderiza apenas nós de texto — nunca HTML cru.
 */

function renderInline(text: string): ReactNode[] {
  // Negrito **assim** — split preservando os delimitadores.
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ fontWeight: 700, color: 'var(--gl-ink)' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function MarkdownLite({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  const flushList = (key: string) => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={key} className="my-2 space-y-1.5 pl-1">
        {list.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-[15px] leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
            <span
              aria-hidden
              className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{ background: 'var(--gl-accent)' }}
            />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const key = `b-${idx}`;

    if (/^\s*[-*]\s+/.test(line)) {
      list.push(line.replace(/^\s*[-*]\s+/, ''));
      return;
    }
    flushList(`l-${idx}`);

    if (line.startsWith('### ')) {
      blocks.push(
        <h4
          key={key}
          className="mt-4 mb-1 text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--gl-ink-3)' }}
        >
          {renderInline(line.slice(4))}
        </h4>,
      );
    } else if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={key} className="mt-5 mb-1.5 text-lg font-bold tracking-tight" style={{ color: 'var(--gl-ink)' }}>
          {renderInline(line.slice(3))}
        </h3>,
      );
    } else if (line.startsWith('> ')) {
      blocks.push(
        <blockquote
          key={key}
          className="my-3 rounded-r-lg px-4 py-3 text-[15px] leading-relaxed"
          style={{
            background: 'var(--gl-accent-tint)',
            borderLeft: '3px solid var(--gl-accent)',
            color: 'var(--gl-ink-2)',
          }}
        >
          {renderInline(line.slice(2))}
        </blockquote>,
      );
    } else if (line.trim() === '') {
      // espaço — ignorado (o gap entre blocos cuida do respiro)
    } else {
      blocks.push(
        <p key={key} className="my-1.5 text-[15px] leading-relaxed" style={{ color: 'var(--gl-ink-2)' }}>
          {renderInline(line)}
        </p>,
      );
    }
  });

  flushList('l-end');

  return <div>{blocks}</div>;
}
