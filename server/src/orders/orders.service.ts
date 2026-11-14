import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { PageDto, pageMeta } from '../common/dto.js';
import type { Actor } from '../common/security.js';
import { CreateOrderDto } from './orders.dto.js';
import { authorizeTransition } from './order-policy.js';

async function reconcileStock(tx: Prisma.TransactionClient, productId: string) {
  const product = await tx.product.findUniqueOrThrow({
    where: { id: productId },
  });
  if (product.status === 'INACTIVE') return;
  const status = product.availableQuantity.isZero()
    ? 'SOLD_OUT'
    : product.availableQuantity.lessThan(product.quantity)
      ? 'PARTIALLY_SOLD'
      : 'AVAILABLE';
  await tx.product.update({ where: { id: productId }, data: { status } });
}

@Injectable()
export class OrdersService {
  constructor(private readonly db: PrismaService) {}

  async create(actor: Actor, input: CreateOrderDto) {
    if (!actor.buyerId) throw new ForbiddenException('Buyer profile required');
    const ids = input.items.map((item) => item.productId);
    if (new Set(ids).size !== ids.length)
      throw new BadRequestException('Duplicate products are not allowed');
    const sorted = [...input.items].sort((a, b) =>
      a.productId.localeCompare(b.productId),
    );
    return this.db.$transaction(
      async (tx) => {
        let farmerId: string | undefined;
        let total = new Prisma.Decimal(0);
        const items: Prisma.OrderItemCreateWithoutOrderInput[] = [];
        for (const item of sorted) {
          // Serialize reservations and farmer edits on each product. Sort locks to avoid cart deadlocks.
          await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${item.productId}::uuid FOR UPDATE`;
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            include: {
              farmer: { select: { user: { select: { isActive: true } } } },
            },
          });
          if (
            !product ||
            !product.farmer.user.isActive ||
            !['AVAILABLE', 'PARTIALLY_SOLD'].includes(product.status)
          )
            throw new ConflictException('Product is unavailable');
          if (farmerId && farmerId !== product.farmerId)
            throw new BadRequestException(
              'Each order must contain products from one farmer',
            );
          farmerId = product.farmerId;
          const quantity = new Prisma.Decimal(item.quantity);
          const changed = await tx.product.updateMany({
            where: {
              id: product.id,
              availableQuantity: { gte: quantity },
              status: { in: ['AVAILABLE', 'PARTIALLY_SOLD'] },
            },
            data: { availableQuantity: { decrement: quantity } },
          });
          if (changed.count !== 1)
            throw new ConflictException('Insufficient stock');
          await reconcileStock(tx, product.id);
          const subtotal = product.pricePerUnit
            .mul(quantity)
            .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
          if (subtotal.isZero())
            throw new BadRequestException(
              'Order item total must be at least INR 0.01',
            );
          total = total.plus(subtotal);
          items.push({
            product: { connect: { id: product.id } },
            productName: product.name,
            unit: product.unit,
            quantity,
            unitPrice: product.pricePerUnit,
            subtotal,
          });
        }
        if (total.greaterThan('9999999999999999.99'))
          throw new BadRequestException('Order total exceeds supported amount');
        return tx.order.create({
          data: {
            buyerId: actor.buyerId!,
            farmerId: farmerId!,
            totalAmount: total,
            deliveryAddress: input.deliveryAddress,
            notes: input.notes,
            items: { create: items },
          },
          include: { items: true },
        });
      },
      { maxWait: 5000, timeout: 15000 },
    );
  }

  private scope(actor: Actor): Prisma.OrderWhereInput {
    if (actor.role === 'BUYER' && actor.buyerId)
      return { buyerId: actor.buyerId };
    if (actor.role === 'FARMER' && actor.farmerId)
      return { farmerId: actor.farmerId };
    throw new ForbiddenException('Farmer or buyer profile required');
  }

  async list(actor: Actor, query: PageDto) {
    const where = this.scope(actor);
    const [data, total] = await this.db.$transaction([
      this.db.order.findMany({
        where,
        include: { items: true },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      }),
      this.db.order.count({ where }),
    ]);
    return { data, meta: pageMeta(query, total) };
  }

  async detail(actor: Actor, id: string) {
    const order = await this.db.order.findFirst({
      where: { id, ...this.scope(actor) },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async transition(actor: Actor, id: string, status: OrderStatus) {
    return this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${id}::uuid FOR UPDATE`;
        const order = await tx.order.findUnique({
          where: { id },
          include: { items: true },
        });
        if (!order) throw new NotFoundException('Order not found');
        authorizeTransition(actor, order, status);
        const changed = await tx.order.updateMany({
          where: { id, status: order.status },
          data: { status },
        });
        if (changed.count !== 1)
          throw new ConflictException('Order already changed');
        if (status === 'CANCELLED' || status === 'REJECTED') {
          for (const item of [...order.items].sort((a, b) =>
            a.productId.localeCompare(b.productId),
          )) {
            await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${item.productId}::uuid FOR UPDATE`;
            await tx.product.update({
              where: { id: item.productId },
              data: { availableQuantity: { increment: item.quantity } },
            });
            await reconcileStock(tx, item.productId);
          }
        }
        return tx.order.findUniqueOrThrow({
          where: { id },
          include: { items: true },
        });
      },
      { maxWait: 5000, timeout: 15000 },
    );
  }
}
