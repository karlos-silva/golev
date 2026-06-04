import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { anamneseSubmissionSchema } from '@golev/shared';
import { AnamneseService } from './anamnese.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('anamnese')
export class AnamneseController {
  constructor(private readonly anamneseService: AnamneseService) {}

  // Público: não anexamos JwtAuthGuard (não há APP_GUARD global). `@Public()` é
  // marcador de intenção. ThrottlerGuard precisa ser explícito p/ `@Throttle` valer.
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
