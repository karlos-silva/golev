import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { checkoutRequestSchema, sessionFromPaymentSchema } from '@golev/shared';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  @Get('subscription')
  getSubscription(@CurrentUser('userId') userId: string) {
    return this.billingService.getSubscription(userId);
  }

  // Público: checkout parte de uma anamnese elegível (a conta nasce no pagamento).
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async checkout(@Body() body: unknown) {
    const { anamneseId } = checkoutRequestSchema.parse(body);
    return this.billingService.createCheckoutSession(anamneseId);
  }

  // Público: troca a sessão paga por tokens (auto-login "pagou → entra direto").
  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('session-from-payment')
  @HttpCode(HttpStatus.OK)
  async sessionFromPayment(@Body() body: unknown) {
    const { sessionId } = sessionFromPaymentSchema.parse(body);
    return this.billingService.sessionFromPayment(sessionId);
  }

  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('portal')
  @HttpCode(HttpStatus.OK)
  async portal(@CurrentUser('userId') userId: string) {
    return this.billingService.createPortalSession(userId);
  }

  // Público (Stripe não envia JWT) e SEM throttle (Stripe faz bursts/retries).
  // A autenticação é a assinatura do webhook.
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: RawBodyRequest<FastifyRequest>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(req.rawBody, signature);
  }
}
