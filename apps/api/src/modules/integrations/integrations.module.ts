import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { GoogleCalendarService } from './google-calendar.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [IntegrationsController],
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class IntegrationsModule {}
