import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hash(pw) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

async function main() {
  console.log('--- Starting AR WALLET Database Seed ---');

  const adminPassword = await hash('admin123456');
  const userPassword = await hash('password123');
  const demoPin = await hash('123456');

  // 1. Admin Account
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    create: {
      username: 'admin',
      email: 'admin@arwallet.io',
      phone: '+919999999999',
      passwordHash: adminPassword,
      paymentPinHash: demoPin,
      nickname: 'Super Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      kycLevel: 2,
      kycStatus: 'APPROVED',
      vipLevel: 5,
      inviteCode: 'ADMIN01',
    },
    update: {},
  });
  console.log('Seeded Admin User:', admin.username);

  // 2. Cashier Account
  const cashier = await prisma.user.upsert({
    where: { username: 'cashier' },
    create: {
      username: 'cashier',
      email: 'cashier@arwallet.io',
      phone: '+918888888888',
      passwordHash: userPassword,
      paymentPinHash: demoPin,
      nickname: 'Main Liquidity Cashier',
      role: 'CASHIER',
      status: 'ACTIVE',
      kycLevel: 2,
      kycStatus: 'APPROVED',
      vipLevel: 5,
      inviteCode: 'CASHIER01',
    },
    update: {},
  });
  console.log('Seeded Cashier User:', cashier.username);

  // Cashier collection method
  await prisma.collectionMethod.upsert({
    where: { id: 'cashier_upi_1' },
    create: {
      id: 'cashier_upi_1',
      userId: cashier.id,
      type: 'UPI',
      realName: 'AR WALLET CASHIER DESK',
      upiId: 'arwallet.pay@icici',
      isDefault: true,
      status: 'ACTIVE',
    },
    update: {},
  });

  await prisma.collectionMethod.upsert({
    where: { id: 'cashier_bank_1' },
    create: {
      id: 'cashier_bank_1',
      userId: cashier.id,
      type: 'BANK_ACCOUNT',
      realName: 'AR WALLET SETTLEMENT CORP',
      bankName: 'HDFC Bank',
      accountNumber: '50200098765432',
      ifscCode: 'HDFC0001234',
      branch: 'Corporate Finance Hub',
      isDefault: false,
      status: 'ACTIVE',
    },
    update: {},
  });

  // 3. Demo User
  const demoUser = await prisma.user.upsert({
    where: { username: 'demouser' },
    create: {
      username: 'demouser',
      email: 'demo@arwallet.io',
      phone: '+919876543210',
      passwordHash: userPassword,
      paymentPinHash: demoPin,
      nickname: 'Crypto Trader',
      role: 'USER',
      status: 'ACTIVE',
      kycLevel: 2,
      kycStatus: 'APPROVED',
      vipLevel: 2,
      inviteCode: 'DEMO88',
      referredById: admin.id,
    },
    update: {},
  });
  console.log('Seeded Demo User:', demoUser.username);

  // Wallets for Demo User
  const currencies = [
    { curr: 'ARB', avail: 150.0, frozen: 10.0 },
    { curr: 'USDT', avail: 50.0, frozen: 0.0 },
    { curr: 'INR', avail: 2500.0, frozen: 0.0 },
  ];

  for (const c of currencies) {
    await prisma.wallet.upsert({
      where: { userId_currency: { userId: demoUser.id, currency: c.curr } },
      create: {
        userId: demoUser.id,
        currency: c.curr,
        availableBalance: c.avail,
        frozenBalance: c.frozen,
      },
      update: {
        availableBalance: c.avail,
        frozenBalance: c.frozen,
      },
    });
  }

  // Demo user collection methods
  await prisma.collectionMethod.upsert({
    where: { id: 'demo_upi_1' },
    create: {
      id: 'demo_upi_1',
      userId: demoUser.id,
      type: 'UPI',
      realName: 'Rohan Sharma',
      upiId: 'rohan.sharma@okaxis',
      isDefault: true,
      status: 'ACTIVE',
    },
    update: {},
  });

  await prisma.collectionMethod.upsert({
    where: { id: 'demo_bank_1' },
    create: {
      id: 'demo_bank_1',
      userId: demoUser.id,
      type: 'BANK_ACCOUNT',
      realName: 'Rohan Sharma',
      bankName: 'State Bank of India',
      accountNumber: '31234567890',
      ifscCode: 'SBIN0000456',
      branch: 'Main Market Branch',
      isDefault: false,
      status: 'ACTIVE',
    },
    update: {},
  });

  // Demo KYC record
  await prisma.kycRecord.upsert({
    where: { id: 'demo_kyc_1' },
    create: {
      id: 'demo_kyc_1',
      userId: demoUser.id,
      documentType: 'AADHAAR',
      fullName: 'Rohan Sharma',
      idNumber: '987654321098',
      dob: '1995-08-15',
      frontImageUrl: '/uploads/demo_id_front.jpg',
      backImageUrl: '/uploads/demo_id_back.jpg',
      selfieImageUrl: '/uploads/demo_selfie.jpg',
      status: 'APPROVED',
      reviewerId: admin.id,
      reviewedAt: new Date(),
    },
    update: {},
  });

  // 4. Team Members (Referees)
  const ref1 = await prisma.user.upsert({
    where: { username: 'team_member1' },
    create: {
      username: 'team_member1',
      email: 'member1@arwallet.io',
      phone: '+919123456780',
      passwordHash: userPassword,
      paymentPinHash: demoPin,
      nickname: 'Team Member 1',
      role: 'USER',
      status: 'ACTIVE',
      kycLevel: 1,
      kycStatus: 'APPROVED',
      vipLevel: 1,
      inviteCode: 'TEAM01',
      referredById: demoUser.id,
    },
    update: {},
  });

  await prisma.referral.upsert({
    where: { referrerId_refereeId: { referrerId: demoUser.id, refereeId: ref1.id } },
    create: {
      referrerId: demoUser.id,
      refereeId: ref1.id,
      tier: 1,
    },
    update: {},
  });

  // Seed sample transactions
  await prisma.ledgerEntry.createMany({
    data: [
      {
        walletId: (await prisma.wallet.findUnique({ where: { userId_currency: { userId: demoUser.id, currency: 'ARB' } } })).id,
        userId: demoUser.id,
        currency: 'ARB',
        type: 'BUY_CREDIT',
        amount: 100.0,
        fee: 0,
        balanceBefore: 0,
        balanceAfter: 100.0,
        status: 'SUCCESS',
        description: 'Buy Order #BUY26091801 settled',
        idempotencyKey: 'seed_tx_1',
      },
      {
        walletId: (await prisma.wallet.findUnique({ where: { userId_currency: { userId: demoUser.id, currency: 'ARB' } } })).id,
        userId: demoUser.id,
        currency: 'ARB',
        type: 'REFERRAL_COMMISSION',
        amount: 5.0,
        fee: 0,
        balanceBefore: 100.0,
        balanceAfter: 105.0,
        status: 'SUCCESS',
        description: 'Tier 1 Team Commission from member @team_member1',
        idempotencyKey: 'seed_tx_2',
      },
    ],
  });

  // 5. Announcements
  await prisma.announcement.upsert({
    where: { id: 'announcement_welcome' },
    create: {
      id: 'announcement_welcome',
      title: 'AR Wallet Official Version 2.0 Launch',
      content: 'Welcome to AR Wallet. Enjoy zero trading fees on your first 3 C2C transactions and 5% instant referral rebates!',
      isImportant: true,
      active: true,
    },
    update: {},
  });

  await prisma.announcement.upsert({
    where: { id: 'announcement_security' },
    create: {
      id: 'announcement_security',
      title: 'Security Advisory: Never Share Your 6-Digit Payment PIN',
      content: 'Our official staff will never ask for your Payment PIN or login password. Keep your credentials private.',
      isImportant: false,
      active: true,
    },
    update: {},
  });

  // 6. System Settings
  const settings = [
    { key: 'ARB_INR_RATE', value: '100.00', description: 'ARB to INR live settlement rate' },
    { key: 'USDT_INR_RATE', value: '90.00', description: 'USDT to INR live settlement rate' },
    { key: 'MIN_BUY_INR', value: '500', description: 'Minimum buy amount in INR' },
    { key: 'MAX_BUY_INR', value: '100000', description: 'Maximum buy amount in INR' },
    { key: 'MIN_SELL_ARB', value: '5', description: 'Minimum sell amount in ARB' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      create: s,
      update: {},
    });
  }

  console.log('--- Database Seed Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
