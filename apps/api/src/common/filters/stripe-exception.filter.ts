import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ErrorCode } from '@golev/shared';
import Stripe from 'stripe';

/**
 * Rede de segurança: qualquer StripeError que escape de um service vira uma
 * resposta genérica — nunca vazamos detalhe interno/PII da Stripe ao cliente.
 * Erros tratados explicitamente (ex.: assinatura de webhook) já são convertidos
 * em HttpException no service e não chegam aqui.
 */
interface ReplyLike {
  status(code: number): { send(payload: unknown): unknown };
}

@Catch(Stripe.errors.StripeError)
export class StripeExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Stripe');

  catch(
    exception: InstanceType<typeof Stripe.errors.StripeError>,
    host: ArgumentsHost,
  ): void {
    // Loga só o essencial (sem o objeto Stripe inteiro).
    this.logger.error(`StripeError ${exception.type ?? 'unknown'}`);

    const reply = host.switchToHttp().getResponse<ReplyLike>();
    reply.status(HttpStatus.BAD_GATEWAY).send({
      statusCode: HttpStatus.BAD_GATEWAY,
      error: 'Payment Error',
      code: ErrorCode.PAYMENT_ERROR,
      message: 'Não foi possível processar o pagamento. Tente novamente.',
    });
  }
}
