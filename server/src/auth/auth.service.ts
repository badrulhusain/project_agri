import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto, LoginDto } from './auth.dto.js';

export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  farmerProfile: true,
  buyerProfile: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class AuthService {
  private readonly dummyHash = bcrypt.hash('nonexistent-user-comparison', 12);

  constructor(
    private readonly db: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterDto) {
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.db.user.create({
      data: {
        name: input.name.trim(),
        email: input.email,
        phone: input.phone,
        passwordHash,
        role: input.role,
        ...(input.role === 'FARMER'
          ? { farmerProfile: { create: {} } }
          : { buyerProfile: { create: {} } }),
      },
      select: safeUserSelect,
    });
    return {
      user,
      accessToken: await this.jwt.signAsync({ sub: user.id }),
      tokenType: 'Bearer',
    };
  }

  async login(input: LoginDto) {
    const identifier = input.identifier.trim().toLowerCase();
    const user = await this.db.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    const valid = await bcrypt.compare(
      input.password,
      user?.passwordHash ?? (await this.dummyHash),
    );
    if (!user || !valid || !user.isActive)
      throw new UnauthorizedException('Invalid credentials');
    return {
      user: await this.me(user.id),
      accessToken: await this.jwt.signAsync({ sub: user.id }),
      tokenType: 'Bearer',
    };
  }

  me(id: string) {
    return this.db.user.findUniqueOrThrow({
      where: { id },
      select: safeUserSelect,
    });
  }
}
