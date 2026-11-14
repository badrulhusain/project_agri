import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public, Roles } from '../common/security.js';
import type { Actor } from '../common/security.js';
import { PageDto } from '../common/dto.js';
import { BuyerRequirementsService } from './buyer-requirements.service.js';
import {
  BuyerRequirementQueryDto,
  CreateBuyerRequirementDto,
  UpdateBuyerRequirementDto,
} from './buyer-requirements.dto.js';

@ApiTags('Buyer Requirements')
@Controller('buyer-requirements')
export class BuyerRequirementsController {
  constructor(private readonly service: BuyerRequirementsService) {}

  @ApiBearerAuth()
  @Roles('BUYER')
  @Post()
  create(
    @CurrentUser() actor: Actor,
    @Body() input: CreateBuyerRequirementDto,
  ) {
    return this.service.create(actor, input);
  }

  @Public()
  @Get()
  list(@Query() query: BuyerRequirementQueryDto) {
    return this.service.list(query);
  }

  @ApiBearerAuth()
  @Roles('BUYER')
  @Get('my')
  listMy(@CurrentUser() actor: Actor, @Query() query: PageDto) {
    return this.service.listMy(actor, query);
  }

  @Public()
  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.detail(id);
  }

  @ApiBearerAuth()
  @Roles('BUYER')
  @Patch(':id')
  update(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: UpdateBuyerRequirementDto,
  ) {
    return this.service.update(actor, id, input);
  }

  @ApiBearerAuth()
  @Roles('BUYER')
  @Delete(':id')
  remove(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.delete(actor, id);
  }
}
