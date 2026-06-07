import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { stripeProvider } from './stripe.provider';
import { PatientsModule } from '../patients/patients.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PatientsModule, AuthModule],
  controllers: [BillingController],
  providers: [BillingService, stripeProvider],
  exports: [BillingService],
})
export class BillingModule {}
