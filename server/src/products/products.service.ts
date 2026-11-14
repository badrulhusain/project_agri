import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Actor } from '../common/security.js';
import { pageMeta } from '../common/dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from './products.dto.js';

@Injectable()
export class ProductsService {
  constructor(private readonly db: PrismaService) {}

  async list(query: ProductQueryDto) {
    const where: Prisma.ProductWhereInput = {
      status: { in: ['AVAILABLE', 'PARTIALLY_SOLD'] },
      availableQuantity: { gt: 0 },
      farmer: { user: { isActive: true } },
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.category
        ? { category: { equals: query.category, mode: 'insensitive' } }
        : {}),
      ...(query.location
        ? { location: { contains: query.location, mode: 'insensitive' } }
        : {}),
    };
    const [data, total] = await this.db.$transaction([
      this.db.product.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      }),
      this.db.product.count({ where }),
    ]);
    return { data, meta: pageMeta(query, total) };
  }

  async detail(id: string) {
    const product = await this.db.product.findFirst({
      where: {
        id,
        status: { in: ['AVAILABLE', 'PARTIALLY_SOLD'] },
        availableQuantity: { gt: 0 },
        farmer: { user: { isActive: true } },
      },
    });
    if (!product) throw new NotFoundException('Available product not found');
    return product;
  }

  create(actor: Actor, input: CreateProductDto) {
    if (!actor.farmerId)
      throw new ForbiddenException('Farmer profile required');
    return this.db.product.create({
      data: {
        name: input.name,
        category: input.category,
        description: input.description,
        unit: input.unit,
        location: input.location,
        images: input.images,
        farmerId: actor.farmerId,
        quantity: new Prisma.Decimal(input.quantity),
        availableQuantity: new Prisma.Decimal(input.quantity),
        pricePerUnit: new Prisma.Decimal(input.pricePerUnit),
      },
    });
  }

  async update(actor: Actor, id: string, input: UpdateProductDto) {
    return this.db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${id}::uuid FOR UPDATE`;
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) throw new NotFoundException('Product not found');
      if (product.farmerId !== actor.farmerId)
        throw new ForbiddenException('You do not own this product');
      // Reject null for optional update fields, including images.
      if (Object.values(input).some((value) => value === null))
        throw new ForbiddenException('Product fields cannot be null');
      return tx.product.update({ where: { id }, data: input });
    });
  }

  async deactivate(actor: Actor, id: string) {
    return this.db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${id}::uuid FOR UPDATE`;
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) throw new NotFoundException('Product not found');
      if (product.farmerId !== actor.farmerId)
        throw new ForbiddenException('You do not own this product');
      return tx.product.update({ where: { id }, data: { status: 'INACTIVE' } });
    });
  }
}
