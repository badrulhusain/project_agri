import { Module } from '@nestjs/common';
import { BuyerRequirementsController } from './buyer-requirements.controller.js';
import { BuyerRequirementsService } from './buyer-requirements.service.js';

@Module({
  controllers: [BuyerRequirementsController],
  providers: [BuyerRequirementsService],
  exports: [BuyerRequirementsService],
})
export class BuyerRequirementsModule {}
