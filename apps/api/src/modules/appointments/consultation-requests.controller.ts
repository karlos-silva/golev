import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { CONSULTATION_REQUEST_STATUS_VALUES } from '@golev/shared';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { STAFF_ROLES } from '../auth/roles.constants';

const confirmSchema = z.object({
  scheduledAt: z.string().datetime(),
  doctorId: z.string().uuid().optional(),
  durationMin: z.number().int().positive().max(480).optional(),
  notes: z.string().max(2000).optional(),
});

/**
 * Caixa de solicitações de consulta dos pacientes (visão da equipe). Confirmar
 * cria a consulta; recusar encerra a solicitação. Staff-only.
 */
@Controller('consultation-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF_ROLES)
export class ConsultationRequestsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  list(@Query('status') status?: string) {
    const parsed = z
      .enum(CONSULTATION_REQUEST_STATUS_VALUES)
      .optional()
      .parse(status || undefined);
    return this.appointmentsService.listConsultationRequests(parsed);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.CREATED)
  confirm(@Param('id') id: string, @Body() body: unknown) {
    const data = confirmSchema.parse(body);
    return this.appointmentsService.confirmConsultationRequest(id, {
      scheduledAt: new Date(data.scheduledAt),
      doctorId: data.doctorId,
      durationMin: data.durationMin,
      notes: data.notes,
    });
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(@Param('id') id: string) {
    return this.appointmentsService.rejectConsultationRequest(id);
  }
}
