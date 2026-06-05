import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { PatientsService, type PatientStatus } from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { STAFF_ROLES } from '../auth/roles.constants';

const convertSchema = z.object({
  anamneseId: z.string().uuid(),
});

const updatePatientSchema = z.object({
  status: z.enum(['active', 'paused', 'discharged']).optional(),
  notes: z.string().max(5000).optional(),
});

const weightLogSchema = z.object({
  weightKg: z.number().positive().max(500),
  measuredAt: z.string().datetime().optional(),
  notes: z.string().max(1000).optional(),
});

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF_ROLES)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  findAll() {
    return this.patientsService.findAll();
  }

  @Post('convert')
  @HttpCode(HttpStatus.CREATED)
  async convert(@Body() body: unknown) {
    const { anamneseId } = convertSchema.parse(body);
    return this.patientsService.convertFromAnamnese(anamneseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() body: unknown) {
    const data = updatePatientSchema.parse(body);
    return this.patientsService.updatePatient(id, data as { status?: PatientStatus; notes?: string });
  }

  @Get(':id/weight-logs')
  findWeightLogs(@Param('id') id: string) {
    return this.patientsService.findWeightLogs(id);
  }

  @Post(':id/weight-logs')
  @HttpCode(HttpStatus.CREATED)
  addWeightLog(@Param('id') id: string, @Body() body: unknown) {
    const data = weightLogSchema.parse(body);
    return this.patientsService.addWeightLog(id, {
      weightKg: data.weightKg,
      measuredAt: data.measuredAt ? new Date(data.measuredAt) : new Date(),
      notes: data.notes,
    });
  }
}
