import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from '../common/security.js';
import type { Actor } from '../common/security.js';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto } from './auth.dto.js';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Public()
  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }
  @Public()
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }
  @ApiBearerAuth()
  @Get('me')
  me(@CurrentUser() actor: Actor) {
    return this.auth.me(actor.id);
  }
}
