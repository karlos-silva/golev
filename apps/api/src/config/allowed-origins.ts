const DEFAULT_DEV_ORIGIN = 'http://localhost:3000';

export function parseAllowedOrigins(): string[] {
  const list = process.env.ALLOWED_ORIGINS?.trim();
  if (list) {
    return list.split(',').map((s) => s.trim()).filter(Boolean);
  }
  const legacy = process.env.CORS_ORIGIN?.trim();
  if (legacy) {
    return [legacy];
  }
  return [DEFAULT_DEV_ORIGIN];
}
