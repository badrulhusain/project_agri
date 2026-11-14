import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const password = process.env.DEMO_PASSWORD;
if (
  !process.env.DATABASE_URL ||
  !password ||
  password.length < 10 ||
  password.length > 72 ||
  !/^[\x20-\x7E]+$/.test(password)
) {
  throw new Error(
    'Set DATABASE_URL and a 10-72 character printable ASCII DEMO_PASSWORD before seeding.',
  );
}
const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  }),
});
try {
  const passwordHash = await bcrypt.hash(password, 12);
  await db.$transaction(
    async (tx) => {
      await tx.user.upsert({
        where: { email: 'admin@example.test' },
        update: {},
        create: {
          name: 'Demo Admin',
          email: 'admin@example.test',
          phone: '+919999900000',
          passwordHash,
          role: 'ADMIN',
        },
      });
      for (let i = 1; i <= 3; i++) {
        await tx.user.upsert({
          where: { email: `farmer${i}@example.test` },
          update: {},
          create: {
            name: `Demo Farmer ${i}`,
            email: `farmer${i}@example.test`,
            phone: `+91999990000${i}`,
            passwordHash,
            role: 'FARMER',
            farmerProfile: {
              create: {
                state: 'Tamil Nadu',
                district: 'Coimbatore',
                primaryCrops: ['Vegetables', 'Grains'],
              },
            },
          },
        });
        await tx.user.upsert({
          where: { email: `buyer${i}@example.test` },
          update: {},
          create: {
            name: `Demo Buyer ${i}`,
            email: `buyer${i}@example.test`,
            phone: `+91999990001${i}`,
            passwordHash,
            role: 'BUYER',
            buyerProfile: {
              create: {
                businessName: `Demo Market ${i}`,
                state: 'Tamil Nadu',
                district: 'Coimbatore',
              },
            },
          },
        });
      }
      const farmer = await tx.user.findUniqueOrThrow({
        where: { email: 'farmer1@example.test' },
        include: { farmerProfile: true },
      });
      if (!farmer.farmerProfile)
        throw new Error(
          'Existing demo farmer account has an incompatible role/profile',
        );
      const products = [
        ['Tomatoes', 'Vegetables', '25.00'],
        ['Bananas', 'Fruits', '40.00'],
        ['Coconuts', 'Fruits', '30.00'],
        ['Rice', 'Grains', '55.00'],
        ['Carrots', 'Vegetables', '35.00'],
        ['Turmeric', 'Spices', '120.00'],
      ];
      for (const [
        index,
        [name, category, pricePerUnit],
      ] of products.entries()) {
        await tx.product.upsert({
          where: {
            id: `a0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
          },
          update: {},
          create: {
            id: `a0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
            farmerId: farmer.farmerProfile.id,
            name,
            category,
            pricePerUnit,
            description: `Demo ${name.toLowerCase()} listing`,
            quantity: '500',
            availableQuantity: '500',
            unit: name === 'Coconuts' ? 'piece' : 'kg',
            location: 'Coimbatore, Tamil Nadu',
          },
        });
      }

      const schemes = [
        {
          id: 'b0000000-0000-4000-8000-000000000001',
          name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
          description:
            'Central sector scheme providing income support of ₹6,000 per year to all landholding farmers families across India.',
          department: 'Department of Agriculture & Farmers Welfare',
          benefits: '₹6,000 per year in 3 equal installments credited directly into Aadhaar-seeded bank accounts.',
          eligibilityCriteria: 'All landholding farmer families with cultivable land in their names.',
          requiredDocuments: ['Aadhaar Card', 'Land Ownership Records (Khata/Khasra)', 'Active Bank Passbook'],
          applicationProcess: 'Register online at pmkisan.gov.in or through Common Service Centres (CSCs).',
          officialUrl: 'https://pmkisan.gov.in',
          state: 'All India',
          status: 'PUBLISHED' as const,
        },
        {
          id: 'b0000000-0000-4000-8000-000000000002',
          name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
          description:
            'Crop insurance scheme providing comprehensive financial support to farmers suffering crop loss or damage arising out of unforeseen events.',
          department: 'Ministry of Agriculture and Farmers Welfare',
          benefits: 'Lowest premium rates: 2% for Kharif crops, 1.5% for Rabi, and 5% for commercial/horticulture crops.',
          eligibilityCriteria: 'All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.',
          requiredDocuments: ['Aadhaar Card', 'Land Record (ROR) / Sowing Certificate', 'Bank Account Details'],
          applicationProcess: 'Enroll via the National Crop Insurance Portal (pmfby.gov.in) or banks/CSCs.',
          officialUrl: 'https://pmfby.gov.in',
          state: 'All India',
          status: 'PUBLISHED' as const,
        },
        {
          id: 'b0000000-0000-4000-8000-000000000003',
          name: 'Soil Health Card Scheme',
          description:
            'Government scheme providing farmers with customized soil nutrient status cards and fertilizer recommendations.',
          department: 'Department of Agriculture, Cooperation & Farmers Welfare',
          benefits: 'Free soil testing report every 2 years with crop-wise nutrient and fertilizer dosage recommendations.',
          eligibilityCriteria: 'All agricultural landowners and active farmers across all states.',
          requiredDocuments: ['Aadhaar Card', 'Farm Location Details'],
          applicationProcess: 'Apply at the local Block Agriculture Office or Krishi Vigyan Kendra (KVK).',
          officialUrl: 'https://soilhealth.dac.gov.in',
          state: 'All India',
          status: 'PUBLISHED' as const,
        },
      ];

      for (const scheme of schemes) {
        await tx.scheme.upsert({
          where: { id: scheme.id },
          update: {},
          create: scheme,
        });
      }

      await tx.surplusAlert.upsert({
        where: { id: 'c0000000-0000-4000-8000-000000000001' },
        update: {},
        create: {
          id: 'c0000000-0000-4000-8000-000000000001',
          farmerId: farmer.farmerProfile.id,
          productId: 'a0000000-0000-4000-8000-000000000001',
          surplusQuantity: '200.000',
          reason: 'Bumper harvest nearing peak freshness. Discounted bulk purchase recommended.',
          status: 'OPEN',
        },
      });
    },
    { timeout: 15000 },
  );
  console.log(
    'Demo seed complete: admin@example.test, farmer1-3@example.test, buyer1-3@example.test. Password: the configured DEMO_PASSWORD. Existing accounts/products were preserved.',
  );
} finally {
  await db.$disconnect();
}
