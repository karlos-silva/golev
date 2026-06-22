import { describe, it, expect } from 'vitest';
import type { MeOverview, MeJourney, MeAppointment } from '@golev/shared';
import { buildTasks } from './build-tasks';

const NOW = new Date('2026-06-22T12:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();
const daysAhead = (n: number) => new Date(NOW.getTime() + n * 86_400_000).toISOString();

function journey(over: Partial<MeJourney> = {}): MeJourney {
  return {
    startedAt: daysAgo(85),
    daysInProgram: 85,
    alturaCm: 168,
    initialWeightKg: 92,
    currentWeightKg: 84,
    deltaKg: -8,
    deltaPct: -8.7,
    initialBmi: 32.6,
    currentBmi: 29.8,
    weighInCount: 6,
    lastWeighInAt: daysAgo(2),
    nextAppointment: null,
    chart: [],
    ...over,
  };
}

function overview(over: Partial<MeOverview> = {}, jOver: Partial<MeJourney> = {}): MeOverview {
  return {
    profile: {
      patientId: 'p1', name: 'Ana Souza', email: 'a@x.com', status: 'active',
      startedAt: daysAgo(85), doctor: null, sexo: 'feminino', idade: 38, alturaCm: 168,
      birthDate: '1988-01-01', phone: null, objetivos: [], avatarUrl: null, examsStatus: 'nao_solicitado', profileConfirmed: true,
    },
    journey: journey(jOver),
    hasDietPlan: false,
    pendingConsultationRequest: false,
    ...over,
  };
}

const appt = (at: string): MeAppointment => ({
  id: 'a1', scheduledAt: at, durationMin: 30, type: 'retorno', status: 'agendada',
  doctor: { id: 'd1', name: 'Dra. Helena' },
});

describe('buildTasks', () => {
  it('não pede pesagem quando pesou há 2 dias', () => {
    const tasks = buildTasks(overview(), { now: NOW });
    expect(tasks.find((t) => t.kind === 'weigh-in')).toBeUndefined();
  });

  it('pede pesagem quando faz mais de 6 dias', () => {
    const tasks = buildTasks(overview({}, { lastWeighInAt: daysAgo(8) }), { now: NOW });
    expect(tasks[0]?.kind).toBe('weigh-in');
  });

  it('pede pesagem quando nunca pesou', () => {
    const tasks = buildTasks(overview({}, { lastWeighInAt: null, weighInCount: 0 }), { now: NOW });
    expect(tasks.some((t) => t.kind === 'weigh-in')).toBe(true);
  });

  it('mostra consulta nos próximos 7 dias com a data', () => {
    const tasks = buildTasks(overview({}, { nextAppointment: appt(daysAhead(3)) }), { now: NOW });
    const a = tasks.find((t) => t.kind === 'appointment');
    expect(a).toBeDefined();
    expect(a?.doctorName).toBe('Dra. Helena');
    expect(a?.at).toBe(daysAhead(3));
  });

  it('ignora consulta a mais de 7 dias', () => {
    const tasks = buildTasks(overview({}, { nextAppointment: appt(daysAhead(20)) }), { now: NOW });
    expect(tasks.some((t) => t.kind === 'appointment')).toBe(false);
  });

  it('mostra solicitação pendente como passo informativo', () => {
    const tasks = buildTasks(overview({ pendingConsultationRequest: true }), { now: NOW });
    expect(tasks.some((t) => t.kind === 'request-pending')).toBe(true);
  });

  it('mostra ler o plano até ser dispensado', () => {
    expect(buildTasks(overview({ hasDietPlan: true }), { now: NOW }).some((t) => t.kind === 'read-plan')).toBe(true);
    expect(
      buildTasks(overview({ hasDietPlan: true }), { now: NOW, readPlanDismissed: true }).some((t) => t.kind === 'read-plan'),
    ).toBe(false);
  });

  it('limita a no máximo 3 passos, na ordem de prioridade', () => {
    const tasks = buildTasks(
      overview(
        { hasDietPlan: true, pendingConsultationRequest: true },
        { lastWeighInAt: daysAgo(10), nextAppointment: appt(daysAhead(1)) },
      ),
      { now: NOW },
    );
    expect(tasks).toHaveLength(3);
    expect(tasks.map((t) => t.kind)).toEqual(['weigh-in', 'appointment', 'request-pending']);
  });

  it('estado sereno: nenhum passo quando tudo em dia', () => {
    const tasks = buildTasks(overview(), { now: NOW });
    expect(tasks).toHaveLength(0);
  });

  it('mostra "enviar exames" no topo quando a médica solicitou', () => {
    const o = overview();
    o.profile.examsStatus = 'solicitado';
    const tasks = buildTasks(o, { now: NOW });
    expect(tasks[0]?.kind).toBe('send-exams');
  });

  it('não mostra "enviar exames" quando já recebido/revisado', () => {
    const o = overview();
    o.profile.examsStatus = 'recebido';
    expect(buildTasks(o, { now: NOW }).some((t) => t.kind === 'send-exams')).toBe(false);
  });
});
