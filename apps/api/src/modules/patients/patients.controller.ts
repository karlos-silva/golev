import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { dietPlanUpsertSchema, EXAMS_STATUS_VALUES, type ExamsStatus } from '@golev/shared';
import { PatientsService, type PatientStatus } from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { STAFF_ROLES } from '../auth/roles.constants';

const convertSchema = z.object({
  anamneseId: z.string().uuid(),
});

const updatePatientSchema = z.object({
  status: z.enum(['active', 'paused', 'discharged']).optional(),
  notes: z.string().max(5000).optional(),
  examsStatus: z.enum(EXAMS_STATUS_VALUES).optional(),
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
    return this.patientsService.provisionPatientAccount(anamneseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() body: unknown) {
    const data = updatePatientSchema.parse(body);
    return this.patientsService.updatePatient(
      id,
      data as { status?: PatientStatus; notes?: string; examsStatus?: ExamsStatus },
    );
  }

  // O peso é registrado SÓ pelo paciente no app (source patient_app) — a equipe
  // não lança peso pelo portal. Aqui só LÊ a série.
  @Get(':id/weight-logs')
  findWeightLogs(@Param('id') id: string) {
    return this.patientsService.findWeightLogs(id);
  }

  @Get(':id/diet-plan')
  getDietPlan(@Param('id') id: string) {
    return this.patientsService.getDietPlan(id);
  }

  @Put(':id/diet-plan')
  @HttpCode(HttpStatus.OK)
  upsertDietPlan(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() body: unknown,
  ) {
    const data = dietPlanUpsertSchema.parse(body);
    return this.patientsService.upsertDietPlan(id, userId, data);
  }
}
