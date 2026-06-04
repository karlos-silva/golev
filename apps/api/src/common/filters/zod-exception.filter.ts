import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { ErrorCode } from '@golev/shared';
import { ZodError } from 'zod';

/**
 * Captura ZodError lançado por `schema.parse(...)` nos controllers e responde
 * 400 (em vez de 500), com as issues formatadas. Registrado globalmente no
 * main.ts, então vale para todos os controllers automaticamente.
 */

// Tipo estrutural mínimo do FastifyReply (evita acoplar ao pacote fastify).
interface ReplyLike {
  status(code: number): { send(payload: unknown): unknown };
}

@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: ZodError, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<ReplyLike>();

    const issues = exception.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    reply.status(HttpStatus.BAD_REQUEST).send({
      statusCode: HttpStatus.BAD_REQUEST,
      error: 'Bad Request',
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      issues,
    });
  }
}
