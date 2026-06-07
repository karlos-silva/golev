import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { stripeProvider } from './stripe.provider';

@Module({
  controllers: [BillingController],
  providers: [BillingService, stripeProvider],
  exports: [BillingService],
})
export class BillingModule {}
