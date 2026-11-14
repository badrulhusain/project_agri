import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../common/security.js';
import type { Actor } from '../common/security.js';
import { PageDto } from '../common/dto.js';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto, UpdateOrderStatusDto } from './orders.dto.js';

@ApiBearerAuth()
@ApiTags('Orders')
@Roles('FARMER', 'BUYER')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  @Roles('BUYER')
  @Post()
  create(@CurrentUser() actor: Actor, @Body() input: CreateOrderDto) {
    return this.orders.create(actor, input);
  }
  @Get('my')
  list(@CurrentUser() actor: Actor, @Query() query: PageDto) {
    return this.orders.list(actor, query);
  }
  @Get(':id')
  detail(@CurrentUser() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.orders.detail(actor, id);
  }
  @Roles('FARMER')
  @Patch(':id/status')
  transition(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: UpdateOrderStatusDto,
  ) {
    return this.orders.transition(actor, id, input.status);
  }
  @Roles('BUYER')
  @Post(':id/cancel')
  @HttpCode(200)
  cancel(@CurrentUser() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.orders.transition(actor, id, 'CANCELLED');
  }
}
