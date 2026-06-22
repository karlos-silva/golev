import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  selfWeightLogSchema,
  consultationRequestCreateSchema,
  meProfileUpdateSchema,
  meAvatarUpdateSchema,
} from '@golev/shared';
import { MeService } from './me.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MustChangePasswordGuard } from '../auth/guards/must-change-password.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AppRole } from '../auth/roles.constants';

/**
 * Área do paciente (self-service). Todas as rotas resolvem o paciente pelo
 * userId do JWT — o cliente nunca passa um id, então só acessa os próprios dados.
 * Gate por role 'patient' (deny-by-default p/ staff e qualquer outro role).
 */
@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard, MustChangePasswordGuard)
@Roles(AppRole.PATIENT)
export class MeController {
  constructor(private readonly me: MeService) {}

  @Get()
  getOverview(@CurrentUser('userId') userId: string) {
    return this.me.getOverview(userId);
  }

  @Patch('profile')
  updateProfile(@CurrentUser('userId') userId: string, @Body() body: unknown) {
    const data = meProfileUpdateSchema.parse(body);
    return this.me.updateProfile(userId, data);
  }

  @Put('avatar')
  updateAvatar(@CurrentUser('userId') userId: string, @Body() body: unknown) {
    const data = meAvatarUpdateSchema.parse(body);
    return this.me.updateAvatar(userId, data);
  }

  @Get('weight-logs')
  listWeightLogs(@CurrentUser('userId') userId: string) {
    return this.me.listWeightLogs(userId);
  }

  @Post('weight-logs')
  @HttpCode(HttpStatus.CREATED)
  addWeightLog(@CurrentUser('userId') userId: string, @Body() body: unknown) {
    const data = selfWeightLogSchema.parse(body);
    return this.me.addWeightLog(userId, data);
  }

  @Get('appointments')
  listAppointments(@CurrentUser('userId') userId: string) {
    return this.me.listAppointments(userId);
  }

  @Get('diet-plan')
  getDietPlan(@CurrentUser('userId') userId: string) {
    return this.me.getDietPlan(userId);
  }

  @Get('consultation-requests')
  listConsultationRequests(@CurrentUser('userId') userId: string) {
    return this.me.listConsultationRequests(userId);
  }

  @Post('consultation-requests')
  @HttpCode(HttpStatus.CREATED)
  createConsultationRequest(
    @CurrentUser('userId') userId: string,
    @Body() body: unknown,
  ) {
    const data = consultationRequestCreateSchema.parse(body);
    return this.me.createConsultationRequest(userId, data);
  }
}
