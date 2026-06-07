'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type {
  MeOverview,
  MeWeightLog,
  MeAppointment,
  MeDietPlan,
  MeConsultationRequest,
  SelfWeightLogInput,
  ConsultationRequestCreateInput,
} from '@golev/shared';

const meKeys = {
  overview: ['me', 'overview'] as const,
  weightLogs: ['me', 'weight-logs'] as const,
  appointments: ['me', 'appointments'] as const,
  dietPlan: ['me', 'diet-plan'] as const,
  consultationRequests: ['me', 'consultation-requests'] as const,
};

export function useMeOverview() {
  return useQuery<MeOverview>({
    queryKey: meKeys.overview,
    queryFn: () => api('/me'),
  });
}

export function useMeWeightLogs() {
  return useQuery<MeWeightLog[]>({
    queryKey: meKeys.weightLogs,
    queryFn: () => api('/me/weight-logs'),
  });
}

export function useMeAppointments() {
  return useQuery<MeAppointment[]>({
    queryKey: meKeys.appointments,
    queryFn: () => api('/me/appointments'),
  });
}

export function useMeDietPlan() {
  return useQuery<MeDietPlan | null>({
    queryKey: meKeys.dietPlan,
    queryFn: () => api('/me/diet-plan'),
  });
}

export function useMeConsultationRequests() {
  return useQuery<MeConsultationRequest[]>({
    queryKey: meKeys.consultationRequests,
    queryFn: () => api('/me/consultation-requests'),
  });
}

export function useAddWeightLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SelfWeightLogInput) =>
      api<MeWeightLog>('/me/weight-logs', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: meKeys.weightLogs });
      void qc.invalidateQueries({ queryKey: meKeys.overview });
      toast.success('Pesagem registrada. Cada passo conta.');
    },
    onError: (e: Error) => toast.error(e.message || 'Não foi possível registrar'),
  });
}

export function useCreateConsultationRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ConsultationRequestCreateInput) =>
      api<MeConsultationRequest>('/me/consultation-requests', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: meKeys.consultationRequests });
      void qc.invalidateQueries({ queryKey: meKeys.overview });
      toast.success('Pedido enviado. A gente entra em contato em breve.');
    },
    onError: (e: Error) => toast.error(e.message || 'Não foi possível enviar'),
  });
}
