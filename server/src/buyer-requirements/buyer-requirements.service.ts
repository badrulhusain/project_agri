import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Actor } from '../common/security.js';
import { pageMeta, PageDto } from '../common/dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  BuyerRequirementQueryDto,
  CreateBuyerRequirementDto,
  UpdateBuyerRequirementDto,
} from './buyer-requirements.dto.js';

export const requirementBuyerSelect = {
  id: true,
  businessName: true,
  state: true,
  district: true,
  address: true,
  user: {
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
    },
  },
} satisfies Prisma.BuyerProfileSelect;

export function formatRequirement(req: {
  id: string;
  buyerId: string;
  productName: string;
  category: string;
  quantity: Prisma.Decimal | string | number;
  unit: string;
  targetPrice: Prisma.Decimal | string | number | null;
  neededBy: string | null;
  urgency: string;
  location: string;
  deliveryAddress: string | null;
  description: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  buyer?: {
    id: string;
    businessName: string | null;
    state?: string | null;
    district?: string | null;
    address?: string | null;
    user?: {
      id: string;
      name: string;
      phone: string;
      email: string | null;
    } | null;
  } | null;
}) {
  return {
    id: req.id,
    buyerId: req.buyerId,
    productName: req.productName,
    category: req.category,
    quantity: req.quantity?.toString?.() ?? String(req.quantity),
    unit: req.unit,
    targetPrice:
      req.targetPrice !== null && req.targetPrice !== undefined
        ? req.targetPrice?.toString?.() ?? String(req.targetPrice)
        : null,
    neededBy: req.neededBy,
    urgency: req.urgency,
    location: req.location,
    deliveryAddress: req.deliveryAddress,
    description: req.description,
    status: req.status,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt,
    buyer: req.buyer,
    buyerName: req.buyer?.user?.name ?? '',
    businessName: req.buyer?.businessName ?? null,
    phone: req.buyer?.user?.phone ?? null,
    email: req.buyer?.user?.email ?? null,
  };
}

@Injectable()
export class BuyerRequirementsService {
  constructor(private readonly db: PrismaService) {}

  private async resolveBuyerId(actor: Actor): Promise<string> {
    if (actor.buyerId) return actor.buyerId;
    const existing = await this.db.buyerProfile.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (existing) return existing.id;
    if (actor.role === 'BUYER') {
      const created = await this.db.buyerProfile.create({
        data: { userId: actor.id },
        select: { id: true },
      });
      return created.id;
    }
    throw new ForbiddenException('Buyer profile required');
  }

  async create(actor: Actor, input: CreateBuyerRequirementDto) {
    const buyerId = await this.resolveBuyerId(actor);
    const req = await this.db.buyerRequirement.create({
      data: {
        buyerId,
        productName: input.productName.trim(),
        category: input.category.trim(),
        quantity: new Prisma.Decimal(input.quantity),
        unit: input.unit.trim(),
        targetPrice: input.targetPrice
          ? new Prisma.Decimal(input.targetPrice)
          : null,
        neededBy: input.neededBy?.trim() || null,
        urgency: input.urgency ?? 'NORMAL',
        location: input.location.trim(),
        deliveryAddress: input.deliveryAddress?.trim() || null,
        description: input.description.trim(),
        status: 'OPEN',
      },
      include: {
        buyer: {
          select: requirementBuyerSelect,
        },
      },
    });
    return formatRequirement(req);
  }

  async list(query: BuyerRequirementQueryDto) {
    const where: Record<string, any> = {
      status: query.status ?? 'OPEN',
      ...(query.category
        ? { category: { equals: query.category, mode: 'insensitive' } }
        : {}),
      ...(query.urgency ? { urgency: query.urgency } : {}),
      ...(query.search
        ? {
            OR: [
              { productName: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
              { location: { contains: query.search, mode: 'insensitive' } },
              {
                buyer: {
                  OR: [
                    {
                      businessName: {
                        contains: query.search,
                        mode: 'insensitive',
                      },
                    },
                    {
                      user: {
                        name: { contains: query.search, mode: 'insensitive' },
                      },
                    },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await this.db.$transaction([
      this.db.buyerRequirement.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        include: {
          buyer: {
            select: requirementBuyerSelect,
          },
        },
      }),
      this.db.buyerRequirement.count({ where }),
    ]);

    return {
      data: data.map(formatRequirement),
      meta: pageMeta(query, total),
    };
  }

  async listMy(actor: Actor, query: PageDto) {
    const buyerId = await this.resolveBuyerId(actor);
    const where: Record<string, any> = {
      buyerId,
    };

    const [data, total] = await this.db.$transaction([
      this.db.buyerRequirement.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        include: {
          buyer: {
            select: requirementBuyerSelect,
          },
        },
      }),
      this.db.buyerRequirement.count({ where }),
    ]);

    return {
      data: data.map(formatRequirement),
      meta: pageMeta(query, total),
    };
  }

  async detail(id: string) {
    const req = await this.db.buyerRequirement.findUnique({
      where: { id },
      include: {
        buyer: {
          select: requirementBuyerSelect,
        },
      },
    });
    if (!req) {
      throw new NotFoundException('Buyer requirement not found');
    }
    return formatRequirement(req);
  }

  async update(actor: Actor, id: string, input: UpdateBuyerRequirementDto) {
    const buyerId = await this.resolveBuyerId(actor);
    const existing = await this.db.buyerRequirement.findUnique({
      where: { id },
      select: { id: true, buyerId: true },
    });
    if (!existing) {
      throw new NotFoundException('Buyer requirement not found');
    }
    if (existing.buyerId !== buyerId) {
      throw new ForbiddenException('You do not own this requirement');
    }

    const data: Record<string, any> = {
      ...(input.status ? { status: input.status } : {}),
      ...(input.productName ? { productName: input.productName.trim() } : {}),
      ...(input.category ? { category: input.category.trim() } : {}),
      ...(input.quantity
        ? { quantity: new Prisma.Decimal(input.quantity) }
        : {}),
      ...(input.unit ? { unit: input.unit.trim() } : {}),
      ...(input.targetPrice !== undefined
        ? {
            targetPrice: input.targetPrice
              ? new Prisma.Decimal(input.targetPrice)
              : null,
          }
        : {}),
      ...(input.neededBy !== undefined
        ? { neededBy: input.neededBy?.trim() || null }
        : {}),
      ...(input.urgency ? { urgency: input.urgency } : {}),
      ...(input.location ? { location: input.location.trim() } : {}),
      ...(input.deliveryAddress !== undefined
        ? { deliveryAddress: input.deliveryAddress?.trim() || null }
        : {}),
      ...(input.description ? { description: input.description.trim() } : {}),
    };

    const updated = await this.db.buyerRequirement.update({
      where: { id },
      data,
      include: {
        buyer: {
          select: requirementBuyerSelect,
        },
      },
    });

    return formatRequirement(updated);
  }

  async delete(actor: Actor, id: string) {
    const buyerId = await this.resolveBuyerId(actor);
    const existing = await this.db.buyerRequirement.findUnique({
      where: { id },
      select: { id: true, buyerId: true },
    });
    if (!existing) {
      throw new NotFoundException('Buyer requirement not found');
    }
    if (existing.buyerId !== buyerId) {
      throw new ForbiddenException('You do not own this requirement');
    }

    await this.db.buyerRequirement.delete({
      where: { id },
    });

    return { message: 'Buyer requirement deleted successfully' };
  }
}
