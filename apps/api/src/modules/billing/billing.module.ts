import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { stripeProvider } from './stripe.provider';
import { WebhookRetentionService } from './webhook-retention.service';
import { PatientsModule } from '../patients/patients.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PatientsModule, AuthModule],
  controllers: [BillingController],
  providers: [BillingService, stripeProvider, WebhookRetentionService],
  exports: [BillingService],
})
export class BillingModule {}
