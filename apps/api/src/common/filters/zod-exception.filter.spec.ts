import { describe, expect, it } from 'vitest';
import type { ZodError } from 'zod';
import type { ArgumentsHost } from '@nestjs/common';
import { loginSchema } from '@golev/shared';
import { ZodExceptionFilter } from './zod-exception.filter';

interface SentResponse {
  code?: number;
  body?: {
    statusCode: number;
    error: string;
    code: string;
    message: string;
    issues: Array<{ path: string; message: string; code: string }>;
  };
}

/** Mocka o FastifyReply e o ArgumentsHost capturando status/body enviados. */
function mockReplyAndHost(): { sent: SentResponse; host: ArgumentsHost } {
  const sent: SentResponse = {};
  const reply = {
    status(code: number) {
      sent.code = code;
      return {
        send(body: SentResponse['body']) {
          sent.body = body;
        },
      };
    },
  };
  const host = {
    switchToHttp: () => ({
      getResponse: () => reply,
      getRequest: () => ({}),
      getNext: () => ({}),
    }),
  } as unknown as ArgumentsHost;
  return { sent, host };
}

describe('ZodExceptionFilter', () => {
  const filter = new ZodExceptionFilter();

  it('mapeia ZodError de payload inválido para 400 com issues', () => {
    // simula o que o controller faz: parse de um payload inválido (password < 8)
    const parsed = loginSchema.safeParse({ email: 'x', password: 'short' });
    expect(parsed.success).toBe(false);
    const error = (parsed as { success: false; error: ZodError }).error;

    const { sent, host } = mockReplyAndHost();
    filter.catch(error, host);

    expect(sent.code).toBe(400);
    expect(sent.body?.statusCode).toBe(400);
    expect(sent.body?.code).toBe('VALIDATION_ERROR');
    expect(sent.body?.issues.length).toBeGreaterThan(0);
    expect(sent.body?.issues.some((issue) => issue.path === 'password')).toBe(
      true,
    );
  });

  it('mapeia ZodError de corpo ausente para 400', () => {
    const parsed = loginSchema.safeParse(undefined);
    const error = (parsed as { success: false; error: ZodError }).error;

    const { sent, host } = mockReplyAndHost();
    filter.catch(error, host);

    expect(sent.code).toBe(400);
    expect(sent.body?.code).toBe('VALIDATION_ERROR');
  });
});
