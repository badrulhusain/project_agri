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
    },
    { timeout: 15000 },
  );
  console.log(
    'Demo seed complete: admin@example.test, farmer1-3@example.test, buyer1-3@example.test. Password: the configured DEMO_PASSWORD. Existing accounts/products were preserved.',
  );
} finally {
  await db.$disconnect();
}
