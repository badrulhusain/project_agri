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
import { ProductsService } from './products.service.js';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from './products.dto.js';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}
  @Public()
  @Get()
  list(@Query() query: ProductQueryDto) {
    return this.products.list(query);
  }
  @Public()
  @Get(':id')
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.products.detail(id);
  }
  @ApiBearerAuth()
  @Roles('FARMER')
  @Post()
  create(@CurrentUser() actor: Actor, @Body() input: CreateProductDto) {
    return this.products.create(actor, input);
  }
  @ApiBearerAuth()
  @Roles('FARMER')
  @Patch(':id')
  update(
    @CurrentUser() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: UpdateProductDto,
  ) {
    return this.products.update(actor, id, input);
  }
  @ApiBearerAuth()
  @Roles('FARMER')
  @Delete(':id')
  remove(@CurrentUser() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.products.deactivate(actor, id);
  }
}
