'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { AnamneseInput, AnamneseResponse } from '@golev/shared';

export function useCreateAnamnese() {
  return useMutation({
    mutationFn: (data: AnamneseInput) =>
      api<AnamneseResponse>('/anamnese', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onError: (error: Error) => {
      toast.error(error.message || 'Não foi possível enviar. Tente novamente.');
    },
  });
}
