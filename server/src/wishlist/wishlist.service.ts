import { Injectable, NotFoundException } from '@nestjs/common';
import type { Actor } from '../common/security.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WishlistService {
  constructor(private readonly db: PrismaService) {}

  async list(actor: Actor) {
    const items = await this.db.wishlistItem.findMany({
      where: { userId: actor.id },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            farmer: {
              select: {
                id: true,
                state: true,
                district: true,
                user: {
                  select: {
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return items.map((item) => {
      const quantityStr = item.product.quantity.toString();
      const availQuantityStr = item.product.availableQuantity.toString();
      const priceStr = item.product.pricePerUnit.toString();

      const formattedProduct = {
        ...item.product,
        quantity: quantityStr,
        availableQuantity: availQuantityStr,
        pricePerUnit: priceStr,
      };

      return {
        ...formattedProduct,
        wishlistItemId: item.id,
        productId: item.productId,
        wishlistedAt: item.createdAt,
        product: formattedProduct,
      };
    });
  }

  async add(actor: Actor, productId: string) {
    const product = await this.db.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const item = await this.db.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: actor.id,
          productId,
        },
      },
      create: {
        userId: actor.id,
        productId,
      },
      update: {},
      include: {
        product: {
          include: {
            farmer: {
              select: {
                id: true,
                state: true,
                district: true,
                user: {
                  select: {
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      ...item,
      message: 'Product added to wishlist',
    };
  }

  async remove(actor: Actor, productId: string) {
    const existing = await this.db.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: actor.id,
          productId,
        },
      },
    });
    if (!existing) {
      throw new NotFoundException('Product not found in wishlist');
    }

    await this.db.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: actor.id,
          productId,
        },
      },
    });

    return { message: 'Product removed from wishlist' };
  }
}
