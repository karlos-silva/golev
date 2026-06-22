import { describe, it, expect } from 'vitest';
import { goalKgFromHeight, lowestWeight, avgPaceKgPerWeek } from './journey-insights';

const day = (n: number) => new Date(2026, 0, 1 + n).toISOString();

describe('goalKgFromHeight', () => {
  it('deriva o peso da faixa saudável (IMC 24,9)', () => {
    expect(goalKgFromHeight(168)).toBe(70.3);
    expect(goalKgFromHeight(180)).toBe(80.7);
  });
  it('retorna null sem altura', () => {
    expect(goalKgFromHeight(null)).toBeNull();
    expect(goalKgFromHeight(0)).toBeNull();
  });
});

describe('lowestWeight', () => {
  it('acha o menor peso da série', () => {
    expect(lowestWeight([{ weightKg: 92 }, { weightKg: 84 }, { weightKg: 86 }])).toBe(84);
  });
  it('retorna null se vazia', () => {
    expect(lowestWeight([])).toBeNull();
  });
});

describe('avgPaceKgPerWeek', () => {
  it('calcula kg/semana entre 1º e último ponto (negativo = perda)', () => {
    const chart = [
      { measuredAt: day(0), weightKg: 92 },
      { measuredAt: day(7), weightKg: 91 },
      { measuredAt: day(14), weightKg: 90 },
    ];
    expect(avgPaceKgPerWeek(chart)).toBe(-1);
  });
  it('retorna null com menos de 3 pontos', () => {
    expect(avgPaceKgPerWeek([{ measuredAt: day(0), weightKg: 92 }, { measuredAt: day(7), weightKg: 90 }])).toBeNull();
  });
  it('retorna null se abrange menos de 1 semana', () => {
    const chart = [
      { measuredAt: day(0), weightKg: 92 },
      { measuredAt: day(1), weightKg: 91 },
      { measuredAt: day(2), weightKg: 90 },
    ];
    expect(avgPaceKgPerWeek(chart)).toBeNull();
  });
});
