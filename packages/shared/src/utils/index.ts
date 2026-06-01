export function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
