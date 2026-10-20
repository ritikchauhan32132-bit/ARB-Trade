import prisma from '@/lib/prisma';

export class KycService {
  /**
   * Submit KYC verification
   */
  static async submitKyc(
    userId: string,
    data: {
      documentType: string;
      fullName: string;
      idNumber: string;
      dob?: string;
      frontImageUrl: string;
      backImageUrl?: string;
      selfieImageUrl: string;
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const kycRecord = await prisma.kycRecord.create({
      data: {
        userId,
        documentType: data.documentType,
        fullName: data.fullName,
        idNumber: data.idNumber,
        dob: data.dob || null,
        frontImageUrl: data.frontImageUrl,
        backImageUrl: data.backImageUrl || null,
        selfieImageUrl: data.selfieImageUrl,
        status: 'PENDING',
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'PENDING' },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: 'KYC Submitted',
        content: 'Your identity documents have been submitted and are under review by compliance.',
        type: 'SECURITY',
      },
    });

    return kycRecord;
  }

  /**
   * Get KYC status
   */
  static async getKycStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        kycRecords: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) throw new Error('User not found');

    const latest = user.kycRecords[0] || null;
    return {
      kycLevel: user.kycLevel,
      kycStatus: user.kycStatus,
      record: latest,
    };
  }
}
export default KycService;
