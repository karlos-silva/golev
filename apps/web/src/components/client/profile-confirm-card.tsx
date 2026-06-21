'use client';

import { useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { Field } from '@/components/client/primitives';
import { useUpdateMeProfile } from '@/hooks/use-me';
import { maskPhoneBR, unmaskPhone } from '@/lib/format';
import type { MeProfile } from '@golev/shared';

/**
 * Pedido de confirmação do perfil — aparece no /inicio enquanto o paciente não
 * revisou os próprios dados. A data de nascimento dos pacientes antigos foi
 * estimada (só o ano) no backfill; aqui ele confirma a data real.
 */
export function ProfileConfirmCard({ profile }: { profile: MeProfile }) {
  const [birthDate, setBirthDate] = useState(profile.birthDate ?? '');
  const [heightCm, setHeightCm] = useState(
    profile.alturaCm != null ? String(profile.alturaCm) : '',
  );
  const [phone, setPhone] = useState(maskPhoneBR(profile.phone ?? ''));
  const update = useUpdateMeProfile();

  const today = new Date().toISOString().slice(0, 10);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      toast.error('Confirme sua data de nascimento');
      return;
    }
    update.mutate({
      birthDate,
      heightCm: heightCm ? Number(heightCm) : undefined,
      phone: unmaskPhone(phone) || undefined,
    });
  }

  return (
    <section
      className="gl-in overflow-hidden rounded-2xl"
      style={{
        background: 'var(--gl-accent-tint)',
        border: '1px solid var(--gl-accent)',
      }}
    >
      <div className="flex items-start gap-3 px-5 pt-5">
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: 'var(--gl-surface)', color: 'var(--gl-accent-strong)' }}
        >
          <CalendarCheck className="h-5 w-5" />
        </span>
        <div>
          <h2
            className="text-base font-bold tracking-tight"
            style={{ color: 'var(--gl-on-accent)' }}
          >
            Confirme seu perfil
          </h2>
          <p
            className="mt-1 text-sm leading-relaxed"
            style={{ color: 'var(--gl-on-accent)' }}
          >
            Pra cuidar de você com precisão, confirme sua data de nascimento. Leva
            10 segundos.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-4 px-5 py-5 sm:grid-cols-3">
        <Field label="Data de nascimento" htmlFor="pc-birth">
          <input
            id="pc-birth"
            type="date"
            value={birthDate}
            max={today}
            onChange={(e) => setBirthDate(e.target.value)}
            className="gl-input w-full"
          />
        </Field>
        <Field label="Altura (cm)" htmlFor="pc-height">
          <input
            id="pc-height"
            inputMode="numeric"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            placeholder="ex.: 168"
            className="gl-input w-full"
          />
        </Field>
        <Field label="WhatsApp" htmlFor="pc-phone">
          <input
            id="pc-phone"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(maskPhoneBR(e.target.value))}
            placeholder="(11) 99999-0000"
            maxLength={15}
            className="gl-input w-full"
          />
        </Field>
        <div className="flex justify-end sm:col-span-3">
          <button
            type="submit"
            disabled={update.isPending}
            className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--gl-primary)', color: 'var(--gl-paper)' }}
          >
            {update.isPending ? <Spinner className="h-4 w-4" /> : null}
            Confirmar
          </button>
        </div>
      </form>
    </section>
  );
}
