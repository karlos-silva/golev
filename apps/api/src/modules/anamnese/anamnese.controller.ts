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
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { anamneseSubmissionSchema } from '@golev/shared';
import { AnamneseService, type LeadStatus } from './anamnese.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { STAFF_ROLES } from '../auth/roles.constants';

const leadStatusSchema = z.object({
  status: z.enum([
    'novo',
    'contatado',
    'consulta_agendada',
    'consulta_realizada',
    'exames_enviados',
    'aprovado',
    'convertido',
    'descartado',
  ]),
});

@Controller('anamnese')
export class AnamneseController {
  constructor(private readonly anamneseService: AnamneseService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @Get()
  findAll() {
    return this.anamneseService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...STAFF_ROLES)
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  updateStatus(@Param('id') id: string, @Body() body: unknown) {
    const { status } = leadStatusSchema.parse(body);
    return this.anamneseService.updateLeadStatus(id, status as LeadStatus);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: unknown) {
    const data = anamneseSubmissionSchema.parse(body);
    return this.anamneseService.create(data);
  }
}
