import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/security.js';
import { PageDto } from '../common/dto.js';
import { AdminService } from './admin.service.js';
import {
  AdminUserQueryDto,
  CreateSchemeDto,
  UpdateProductStatusDto,
  UpdateSchemeDto,
  UpdateSurplusStatusDto,
  UpdateUserStatusDto,
} from './admin.dto.js';

@ApiBearerAuth()
@ApiTags('Admin')
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Roles('ADMIN')
  @Get('overview')
  overview() {
    return this.admin.getOverview();
  }

  @Roles('ADMIN')
  @Get('users')
  users(@Query() query: AdminUserQueryDto) {
    return this.admin.getUsers(query);
  }

  @Roles('ADMIN')
  @Patch('users/:id/status')
  updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserStatusDto,
  ) {
    return this.admin.updateUserStatus(id, body.isActive);
  }

  @Roles('ADMIN')
  @Get('products')
  products(@Query() query: PageDto) {
    return this.admin.getProducts(query);
  }

  @Roles('ADMIN')
  @Patch('products/:id/status')
  updateProductStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateProductStatusDto,
  ) {
    return this.admin.updateProductStatus(id, body.status);
  }

  @Roles('ADMIN')
  @Get('orders')
  orders(@Query() query: PageDto) {
    return this.admin.getOrders(query);
  }

  @Roles('ADMIN')
  @Get('schemes')
  schemes(@Query() query: PageDto) {
    return this.admin.getSchemes(query);
  }

  @Roles('ADMIN')
  @Post('schemes')
  createScheme(@Body() body: CreateSchemeDto) {
    return this.admin.createScheme(body);
  }

  @Roles('ADMIN')
  @Patch('schemes/:id')
  updateScheme(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateSchemeDto,
  ) {
    return this.admin.updateScheme(id, body);
  }

  @Roles('ADMIN')
  @Get('surplus')
  surplus(@Query() query: PageDto) {
    return this.admin.getSurplus(query);
  }

  @Roles('ADMIN')
  @Patch('surplus/:id/status')
  updateSurplusStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateSurplusStatusDto,
  ) {
    return this.admin.updateSurplusStatus(id, body.status);
  }

  @Roles('ADMIN')
  @Get('settings')
  settings() {
    return this.admin.getSettings();
  }
}
