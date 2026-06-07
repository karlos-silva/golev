import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { resolve } from 'path';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { BillingModule } from './modules/billing/billing.module';
import { AnamneseModule } from './modules/anamnese/anamnese.module';
import { PatientsModule } from './modules/patients/patients.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { MeModule } from './modules/me/me.module';
import { MailModule } from './modules/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), '..', '..', '.env'),
      ],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),
    DatabaseModule,
    MailModule,
    AuthModule,
    BillingModule,
    AnamneseModule,
    PatientsModule,
    DashboardModule,
    AppointmentsModule,
    IntegrationsModule,
    MeModule,
  ],
})
export class AppModule {}
