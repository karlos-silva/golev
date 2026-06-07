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
import { checkoutRequestSchema } from '@golev/shared';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // Throttle generoso: a tela de processamento faz polling (~20/min), mas
  // impede abuso de polling indefinido.
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 40, ttl: 60_000 } })
  @Get('subscription')
  getSubscription(@CurrentUser('userId') userId: string) {
    return this.billingService.getSubscription(userId);
  }

  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  async checkout(@CurrentUser('userId') userId: string, @Body() body: unknown) {
    // Cliente nunca envia preço/customer; o body só carrega a chave do plano.
    checkoutRequestSchema.parse(body ?? {});
    return this.billingService.createCheckoutSession(userId);
  }

  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('portal')
  @HttpCode(HttpStatus.OK)
  async portal(@CurrentUser('userId') userId: string) {
    return this.billingService.createPortalSession(userId);
  }

  // Público (Stripe não envia JWT) e SEM throttle (Stripe faz bursts/retries;
  // um 429 desativaria o endpoint). A autenticação é a assinatura do webhook.
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
