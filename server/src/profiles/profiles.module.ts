import { Controller, Get, Module } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthModule } from '../auth/auth.module.js';
import { AuthService } from '../auth/auth.service.js';
import { CurrentUser, Roles } from '../common/security.js';
import type { Actor } from '../common/security.js';
import { PrismaService } from '../prisma/prisma.service.js';

@ApiBearerAuth()
@ApiTags('Profiles')
@Controller('users')
class UsersController {
  constructor(private readonly auth: AuthService) {}
  @Get('me') me(@CurrentUser() actor: Actor) {
    return this.auth.me(actor.id);
  }
}

@ApiBearerAuth()
@ApiTags('Profiles')
@Roles('FARMER')
@Controller('farmers')
class FarmersController {
  constructor(private readonly db: PrismaService) {}
  @Get('me') me(@CurrentUser() actor: Actor) {
    return this.db.farmerProfile.findUniqueOrThrow({
      where: { userId: actor.id },
    });
  }
}

@ApiBearerAuth()
@ApiTags('Profiles')
@Roles('BUYER')
@Controller('buyers')
class BuyersController {
  constructor(private readonly db: PrismaService) {}
  @Get('me') me(@CurrentUser() actor: Actor) {
    return this.db.buyerProfile.findUniqueOrThrow({
      where: { userId: actor.id },
    });
  }
}

@Module({
  imports: [AuthModule],
  controllers: [UsersController, FarmersController, BuyersController],
})
export class ProfilesModule {}
