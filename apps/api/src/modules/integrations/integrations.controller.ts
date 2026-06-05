import {
  Controller,
  Delete,
  Get,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleCalendarService } from './google-calendar.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { STAFF_ROLES } from '../auth/roles.constants';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('integrations/google')
export class IntegrationsController {
  constructor(
    private readonly google: GoogleCalendarService,
    private readonly config: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @Get('status')
  status(@CurrentUser('userId') userId: string) {
    return this.google.getStatus(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @Get('connect')
  connect(@CurrentUser('userId') userId: string) {
    return { url: this.google.getAuthUrl(userId) };
  }

  // Disponibilidade do médico (freebusy) — a secretária consulta antes de agendar.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @Get('freebusy')
  freebusy(
    @Query('doctorId') doctorId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.google.freeBusy(doctorId, from, to);
  }

  // Callback do Google (redirect do browser — sem header de auth). O `state`
  // assinado identifica o usuário. @Redirect é agnóstico ao adapter (Fastify).
  @Public()
  @Get('callback')
  @Redirect()
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const webUrl =
      this.config.get<string>('APP_WEB_URL') ?? 'http://localhost:3001';
    try {
      await this.google.handleCallback(code, state);
      return { url: `${webUrl}/settings?google=connected`, statusCode: 302 };
    } catch {
      return { url: `${webUrl}/settings?google=error`, statusCode: 302 };
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @Delete()
  async disconnect(@CurrentUser('userId') userId: string) {
    await this.google.disconnect(userId);
    return { disconnected: true };
  }
}
