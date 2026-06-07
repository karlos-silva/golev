'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { useAddWeightLog } from '@/hooks/use-me';

/** Registro rápido de pesagem pelo paciente (grava com source=patient_app). */
export function WeighInForm({ onSaved }: { onSaved?: () => void }) {
  const [weight, setWeight] = useState('');
  const add = useAddWeightLog();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseFloat(weight.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) {
      toast.error('Informe um peso válido');
      return;
    }
    add.mutate(
      { weightKg: n },
      {
        onSuccess: () => {
          setWeight('');
          onSaved?.();
        },
      },
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        inputMode="decimal"
        placeholder="Seu peso hoje, em kg"
        aria-label="Peso em quilos"
        className="gl-input flex-1"
      />
      <button
        type="submit"
        disabled={add.isPending}
        className="flex items-center gap-1.5 rounded-lg px-4 py-3 text-sm font-semibold whitespace-nowrap transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
      >
        {add.isPending ? <Spinner className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        Registrar
      </button>
    </form>
  );
}
