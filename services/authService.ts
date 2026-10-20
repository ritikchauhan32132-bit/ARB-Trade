import prisma from '@/lib/prisma';
import {
  hashPassword,
  verifyPassword,
  hashPaymentPin,
  verifyPaymentPin,
  generateToken,
  SessionPayload,
} from '@/lib/auth';
import { generateInviteCode } from '@/lib/utils';
import LedgerService from './ledgerService';
import { cookies } from 'next/headers';
import { CONSTANTS } from '@/lib/constants';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: {
    username: string;
    email?: string;
    phone?: string;
    password: string;
    inviteCode?: string;
  }) {
    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: data.username },
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
    });

    if (existing) {
      if (existing.username === data.username) throw new Error('Username is already taken');
      if (data.email && existing.email === data.email) throw new Error('Email is already registered');
      if (data.phone && existing.phone === data.phone) throw new Error('Phone number is already registered');
    }

    // Resolve referrer if invite code is supplied
    let referrer = null;
    if (data.inviteCode) {
      referrer = await prisma.user.findUnique({
        where: { inviteCode: data.inviteCode },
      });
      if (!referrer) {
        throw new Error('Invalid invitation code');
      }
    }

    const passwordHash = await hashPassword(data.password);
    const newInviteCode = generateInviteCode();

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username: data.username,
          email: data.email || null,
          phone: data.phone || null,
          passwordHash,
          inviteCode: newInviteCode,
          referredById: referrer ? referrer.id : null,
          nickname: data.username,
          role: 'USER',
          status: 'ACTIVE',
        },
      });

      // Provision ARB, USDT, INR wallets
      await LedgerService.ensureWallets(newUser.id, tx);

      // If referrer exists, create Tier 1, 2, and 3 referral relations
      if (referrer) {
        // Tier 1: direct referrer
        await tx.referral.create({
          data: {
            referrerId: referrer.id,
            refereeId: newUser.id,
            tier: 1,
          },
        });

        // Tier 2: referrer's referrer
        if (referrer.referredById) {
          await tx.referral.create({
            data: {
              referrerId: referrer.referredById,
              refereeId: newUser.id,
              tier: 2,
            },
          });

          // Tier 3
          const tier2User = await tx.user.findUnique({
            where: { id: referrer.referredById },
          });
          if (tier2User?.referredById) {
            await tx.referral.create({
              data: {
                referrerId: tier2User.referredById,
                refereeId: newUser.id,
                tier: 3,
              },
            });
          }
        }
      }

      // Create welcome notification
      await tx.notification.create({
        data: {
          userId: newUser.id,
          title: 'Welcome to AR Wallet!',
          content: 'Your secure crypto-fiat settlement account has been created. Bind your collection method and explore C2C flash trading.',
          type: 'SYSTEM',
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          actorId: newUser.id,
          actorRole: 'USER',
          action: 'USER_REGISTERED',
          resource: 'USER',
          resourceId: newUser.id,
          reason: 'Self registration',
        },
      });

      return newUser;
    });

    return user;
  }

  /**
   * Authenticate user and issue session token
   */
  static async login(identifier: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      throw new Error('Invalid account or password');
    }

    if (user.status === 'FROZEN' || user.status === 'SUSPENDED') {
      throw new Error('Your account has been suspended or frozen. Please contact support.');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid account or password');
    }

    const payload: SessionPayload = {
      userId: user.id,
      role: user.role,
      username: user.username,
      vipLevel: user.vipLevel,
    };

    const token = generateToken(payload);

    // Save session in database
    const expiresAt = new Date(Date.now() + CONSTANTS.AUTH.SESSION_MAX_AGE * 1000);
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        expiresAt,
      },
    });

    // Record login audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: 'USER_LOGIN',
        resource: 'SESSION',
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    return { user, token };
  }

  /**
   * Set or update 6-digit Payment / Fund PIN
   */
  static async setPaymentPin(userId: string, pin: string, loginPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const isPasswordValid = await verifyPassword(loginPassword, user.passwordHash);
    if (!isPasswordValid) throw new Error('Incorrect login password');

    const pinHash = await hashPaymentPin(pin);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { paymentPinHash: pinHash },
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        actorRole: user.role,
        action: 'PAYMENT_PIN_SET',
        resource: 'USER',
        resourceId: userId,
      },
    });

    return updated;
  }

  /**
   * Verify Payment PIN
   */
  static async verifyPaymentPin(userId: string, pin: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.paymentPinHash) {
      throw new Error('Payment PIN has not been set. Please set your 6-digit Payment PIN in Security Center.');
    }
    return verifyPaymentPin(pin, user.paymentPinHash);
  }
}
export default AuthService;
