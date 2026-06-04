import { Module } from '@nestjs/common';
import { AnamneseController } from './anamnese.controller';
import { AnamneseService } from './anamnese.service';

@Module({
  controllers: [AnamneseController],
  providers: [AnamneseService],
})
export class AnamneseModule {}
