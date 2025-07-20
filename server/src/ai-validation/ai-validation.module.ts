import { Module } from '@nestjs/common';
import { AiValidationService } from './ai-validation.service';

@Module({
  providers: [AiValidationService],
  exports: [AiValidationService]
})
export class AiValidationModule { }
