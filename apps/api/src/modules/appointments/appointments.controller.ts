import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import {
  AppointmentsService,
  type AppointmentStatus,
} from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { STAFF_ROLES } from '../auth/roles.constants';

const createSchema = z
  .object({
    anamneseId: z.string().uuid().optional(),
    patientId: z.string().uuid().optional(),
    doctorId: z.string().uuid().optional(),
    scheduledAt: z.string().datetime(),
    durationMin: z.number().int().positive().max(480).optional(),
    type: z.enum(['primeira', 'retorno']).optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((d) => d.anamneseId || d.patientId, {
    message: 'Informe o lead ou o paciente',
  });

const updateSchema = z.object({
  status: z.enum(['agendada', 'realizada', 'cancelada', 'falta']).optional(),
  scheduledAt: z.string().datetime().optional(),
  doctorId: z.string().uuid().optional(),
  notes: z.string().max(2000).optional(),
});

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF_ROLES)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAll(@Query('from') from?: string, @Query('to') to?: string) {
    return this.appointmentsService.findAll({
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Get('assignees')
  assignees() {
    return this.appointmentsService.assignees();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: unknown) {
    const data = createSchema.parse(body);
    return this.appointmentsService.create({
      ...data,
      scheduledAt: new Date(data.scheduledAt),
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() body: unknown) {
    const data = updateSchema.parse(body);
    return this.appointmentsService.update(id, {
      status: data.status as AppointmentStatus | undefined,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      doctorId: data.doctorId,
      notes: data.notes,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
