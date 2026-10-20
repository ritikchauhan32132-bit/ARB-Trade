import { z } from 'zod';

export const LoginSchema = z.object({
  identifier: z.string().min(3, 'Username, email, or phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Alphanumeric and underscores only'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6),
  inviteCode: z.string().optional().or(z.literal('')),
  agreeTerms: z.boolean().refine((v) => v === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => Boolean(data.email || data.phone), {
  message: 'Either email or phone is required',
  path: ['identifier'],
});

export const ForgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Username, email or phone is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const SetPaymentPinSchema = z.object({
  pin: z.string().length(6, 'PIN must be exactly 6 digits').regex(/^[0-9]+$/, 'Digits only'),
  confirmPin: z.string().length(6),
  password: z.string().min(6, 'Current login password is required to verify identity'),
}).refine((data) => data.pin === data.confirmPin, {
  message: "PINs don't match",
  path: ['confirmPin'],
});

export const BuyOrderCreateSchema = z.object({
  fiatAmount: z.number().min(500, 'Minimum buy amount is ₹500').max(100000, 'Maximum buy amount is ₹100,000'),
  paymentMethod: z.enum(['PHONEPE', 'PAYTM', 'GPAY', 'BANK', 'UPI']),
});

export const ConfirmPaymentSchema = z.object({
  utrNumber: z.string().min(6, 'Valid UTR or Reference Number is required').max(50),
  proofImageUrl: z.string().optional(),
});

export const SellOrderCreateSchema = z.object({
  tokenAmount: z.number().min(5, 'Minimum sell amount is 5 ARB').max(2000, 'Maximum sell amount is 2,000 ARB'),
  collectionMethodId: z.string().min(1, 'Collection method is required'),
  paymentPin: z.string().length(6, 'Payment PIN must be 6 digits'),
});

export const ConfirmArrivalSchema = z.object({
  paymentPin: z.string().length(6, 'Payment PIN must be 6 digits'),
});

export const OrderAppealSchema = z.object({
  type: z.enum(['WRONG_AMOUNT', 'PAYMENT_NOT_RECEIVED', 'FRAUD_CLAIM', 'KYC_APPEAL', 'OTHER']),
  reason: z.string().min(10, 'Please provide detailed reason (at least 10 characters)'),
  proofImageUrl: z.string().optional(),
});

export const USDTRechargeSubmitSchema = z.object({
  network: z.enum(['TRC20', 'ERC20']),
  amount: z.number().min(10, 'Minimum deposit is 10 USDT'),
  txHash: z.string().min(10, 'Valid transaction hash is required'),
  proofImageUrl: z.string().optional(),
});

export const USDTWithdrawalSchema = z.object({
  network: z.enum(['TRC20', 'ERC20']),
  address: z.string().min(20, 'Valid wallet address is required'),
  amount: z.number().min(10, 'Minimum withdrawal is 10 USDT'),
  paymentPin: z.string().length(6, 'Payment PIN must be 6 digits'),
});

export const BankCollectionSchema = z.object({
  realName: z.string().min(2, 'Full name matching bank account is required'),
  bankName: z.string().min(2, 'Bank name is required'),
  accountNumber: z.string().min(8, 'Account number must be 8-20 digits').max(20),
  confirmAccountNumber: z.string().min(8).max(20),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code (e.g. SBIN0001234)'),
  branch: z.string().optional(),
  paymentPin: z.string().length(6, 'Payment PIN is required'),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers don't match",
  path: ['confirmAccountNumber'],
});

export const UPICollectionSchema = z.object({
  realName: z.string().min(2, 'Account holder name is required'),
  upiId: z.string().regex(/^[\w.-]+@[\w.-]+$/, 'Invalid UPI ID format (e.g., name@okaxis)'),
  paymentPin: z.string().length(6, 'Payment PIN is required'),
});

export const KYCSubmitSchema = z.object({
  documentType: z.enum(['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE']),
  fullName: z.string().min(2, 'Full legal name is required'),
  idNumber: z.string().min(4, 'Valid document number is required'),
  dob: z.string().optional(),
  frontImageUrl: z.string().min(1, 'Front document image is required'),
  backImageUrl: z.string().optional(),
  selfieImageUrl: z.string().min(1, 'Selfie with ID is required'),
});

export const SupportTicketCreateSchema = z.object({
  category: z.enum(['DEPOSIT', 'WITHDRAWAL', 'KYC', 'ORDER', 'SECURITY', 'OTHER']),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  orderId: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

export const TicketMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  attachmentUrl: z.string().optional(),
});

export const AdminManualAdjustmentSchema = z.object({
  userId: z.string().min(1, 'Target user ID is required'),
  currency: z.enum(['ARB', 'USDT', 'INR']),
  amount: z.number().refine((val) => val !== 0, 'Amount cannot be zero'),
  reason: z.string().min(10, 'Mandatory audit reason must be at least 10 characters'),
});
