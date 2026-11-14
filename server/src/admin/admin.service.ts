import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { ProductStatus } from '@prisma/client';
import type { SurplusStatus } from './admin.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PageDto, pageMeta } from '../common/dto.js';
import {
  AdminUserQueryDto,
  CreateSchemeDto,
  UpdateSchemeDto,
} from './admin.dto.js';

@Injectable()
export class AdminService {
  constructor(private readonly db: PrismaService) {}

  async getOverview() {
    const [
      totalUsers,
      farmers,
      buyers,
      activeProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      publishedSchemes,
      openSurplus,
      recentOrders,
      recentProducts,
      recentUsers,
      recentSchemes,
    ] = await this.db.$transaction([
      this.db.user.count(),
      this.db.user.count({ where: { role: 'FARMER' } }),
      this.db.user.count({ where: { role: 'BUYER' } }),
      this.db.product.count({
        where: {
          status: { in: ['AVAILABLE', 'PARTIALLY_SOLD'] },
          availableQuantity: { gt: 0 },
        },
      }),
      this.db.order.count(),
      this.db.order.count({ where: { status: 'PENDING' } }),
      this.db.order.count({ where: { status: 'COMPLETED' } }),
      this.db.scheme.count({ where: { status: 'PUBLISHED' } }),
      this.db.surplusAlert.count({ where: { status: 'OPEN' } }),
      this.db.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      }),
      this.db.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          category: true,
          pricePerUnit: true,
          unit: true,
          createdAt: true,
        },
      }),
      this.db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      this.db.scheme.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    const recentActivity = [
      ...recentOrders.map((o: any) => ({
        id: o.id,
        type: 'ORDER_PLACED' as const,
        description: `Order #${o.orderNumber.slice(0, 8)} placed for ₹${o.totalAmount.toString()} (${o.status})`,
        timestamp: o.createdAt,
      })),
      ...recentProducts.map((p: any) => ({
        id: p.id,
        type: 'PRODUCT_CREATED' as const,
        description: `Product "${p.name}" (${p.category}) listed at ₹${p.pricePerUnit.toString()}/${p.unit}`,
        timestamp: p.createdAt,
      })),
      ...recentUsers.map((u: any) => ({
        id: u.id,
        type: 'USER_REGISTERED' as const,
        description: `User "${u.name}" registered as ${u.role}`,
        timestamp: u.createdAt,
      })),
      ...recentSchemes.map((s: any) => ({
        id: s.id,
        type: 'SCHEME_PUBLISHED' as const,
        description: `Scheme "${s.name}" is ${String(s.status).toLowerCase()}`,
        timestamp: s.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 10);

    return {
      totalUsers,
      farmers,
      buyers,
      activeProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      publishedSchemes,
      openSurplus,
      recentActivity,
    };
  }

  async getUsers(query: AdminUserQueryDto) {
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.db.$transaction([
      this.db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      }),
      this.db.user.count({ where }),
    ]);

    return {
      items,
      meta: pageMeta(query, total),
    };
  }

  async updateUserStatus(id: string, isActive: boolean) {
    const existing = await this.db.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('User not found');

    return this.db.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getProducts(query: PageDto) {
    const [items, total] = await this.db.$transaction([
      this.db.product.findMany({
        include: {
          farmer: {
            select: {
              id: true,
              state: true,
              district: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  isActive: true,
                },
              },
            },
          },
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      }),
      this.db.product.count(),
    ]);

    return {
      items,
      meta: pageMeta(query, total),
    };
  }

  async updateProductStatus(id: string, status: ProductStatus) {
    const existing = await this.db.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Product not found');

    return this.db.product.update({
      where: { id },
      data: { status },
      include: {
        farmer: {
          select: {
            id: true,
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });
  }

  async getOrders(query: PageDto) {
    const [items, total] = await this.db.$transaction([
      this.db.order.findMany({
        include: {
          buyer: {
            select: {
              id: true,
              businessName: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          farmer: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          items: true,
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      }),
      this.db.order.count(),
    ]);

    return {
      items,
      meta: pageMeta(query, total),
    };
  }

  async getSchemes(query: PageDto) {
    const [items, total] = await this.db.$transaction([
      this.db.scheme.findMany({
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      }),
      this.db.scheme.count(),
    ]);

    return {
      items,
      meta: pageMeta(query, total),
    };
  }

  async createScheme(input: CreateSchemeDto) {
    return this.db.scheme.create({
      data: {
        name: input.name,
        description: input.description,
        department: input.department ?? 'Department of Agriculture',
        benefits: input.benefits,
        eligibilityCriteria: input.eligibilityCriteria,
        requiredDocuments: input.requiredDocuments ?? [],
        applicationProcess: input.applicationProcess,
        officialUrl: input.officialUrl,
        state: input.state,
        deadline: input.deadline ? new Date(input.deadline) : null,
        status: input.status ?? 'PUBLISHED',
      },
    });
  }

  async updateScheme(id: string, input: UpdateSchemeDto) {
    const existing = await this.db.scheme.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Scheme not found');

    return this.db.scheme.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.department !== undefined
          ? { department: input.department }
          : {}),
        ...(input.benefits !== undefined ? { benefits: input.benefits } : {}),
        ...(input.eligibilityCriteria !== undefined
          ? { eligibilityCriteria: input.eligibilityCriteria }
          : {}),
        ...(input.requiredDocuments !== undefined
          ? { requiredDocuments: input.requiredDocuments }
          : {}),
        ...(input.applicationProcess !== undefined
          ? { applicationProcess: input.applicationProcess }
          : {}),
        ...(input.officialUrl !== undefined
          ? { officialUrl: input.officialUrl }
          : {}),
        ...(input.state !== undefined ? { state: input.state } : {}),
        ...(input.deadline !== undefined
          ? { deadline: input.deadline ? new Date(input.deadline) : null }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });
  }

  async getSurplus(query: PageDto) {
    const [items, total] = await this.db.$transaction([
      this.db.surplusAlert.findMany({
        include: {
          product: true,
          farmer: {
            select: {
              id: true,
              state: true,
              district: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      }),
      this.db.surplusAlert.count(),
    ]);

    return {
      items,
      meta: pageMeta(query, total),
    };
  }

  async updateSurplusStatus(id: string, status: SurplusStatus) {
    const existing = await this.db.surplusAlert.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('Surplus record not found');

    return this.db.surplusAlert.update({
      where: { id },
      data: { status },
      include: {
        product: true,
      },
    });
  }

  getSettings() {
    return {
      platformName: 'KrishiSetu National Agricultural Marketplace',
      portalType: 'GOVERNMENT_ADMIN',
      agencyRoleStatus: 'DEPRECATED_REPLACED_BY_ADMIN',
      currency: 'INR',
      supportEmail: 'admin@krishisetu.gov.in',
      supportPhone: '+91 1800-180-1551',
      commissionRatePercent: 0,
      moderationEnabled: true,
      surplusAlertThresholdDays: 5,
      defaultPageSize: 10,
      maxPageSize: 100,
      allowedCategories: [
        'Vegetables',
        'Fruits',
        'Grains',
        'Spices',
        'Pulses',
        'Oilseeds',
        'Dairy',
        'Flowers',
        'Organic Produce',
      ],
      features: {
        schemes: true,
        surplusManagement: true,
        directOrdering: true,
        farmerDirectSales: true,
        governmentOversight: true,
        automatedEligibilityCheck: true,
      },
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
