import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../common/security.js';
import type { Actor } from '../common/security.js';
import { WishlistService } from './wishlist.service.js';

@ApiBearerAuth()
@ApiTags('Wishlist')
@Roles('BUYER')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly service: WishlistService) {}

  @Get()
  list(@CurrentUser() actor: Actor) {
    return this.service.list(actor);
  }

  @Post(':productId')
  add(
    @CurrentUser() actor: Actor,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.service.add(actor, productId);
  }

  @Delete(':productId')
  remove(
    @CurrentUser() actor: Actor,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.service.remove(actor, productId);
  }
}
