import { TriangleAlert } from 'lucide-react';

export function LegalDocumentNotice() {
  return (
    <aside className="mb-8 flex items-start gap-3 rounded-lg border border-brand-soft/45 bg-brand-tint px-4 py-3 text-sm text-on-accent">
      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden />
      <p>
        <strong className="font-semibold text-brand">Documento modelo (template):</strong>{' '}
        Personalize o texto, o nome do produto e os contatos; revise com assessoria jurídica antes
        de produção.
      </p>
    </aside>
  );
}
