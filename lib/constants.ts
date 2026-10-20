export const CONSTANTS = {
  RATES: {
    ARB_TO_INR: 100.0,
    USDT_TO_INR: 90.0,
    ARB_TO_USDT: 1.1111,
  },
  TRADING_LIMITS: {
    MIN_BUY_INR: 500,
    MAX_BUY_INR: 100000,
    MIN_SELL_ARB: 5,
    MAX_SELL_ARB: 2000,
    MIN_WITHDRAW_USDT: 10,
    WITHDRAW_FEE_USDT: 1.0,
    BUY_ORDER_TIMEOUT_MINUTES: 15,
    SELL_ORDER_TIMEOUT_MINUTES: 30,
  },
  VIP_TIERS: [
    { level: 0, name: 'VIP 0 (Novice)', minTradeVol: 0, feeDiscountPct: 0, maxDailyWithdraw: 100 },
    { level: 1, name: 'VIP 1 (Bronze)', minTradeVol: 1000, feeDiscountPct: 10, maxDailyWithdraw: 500 },
    { level: 2, name: 'VIP 2 (Silver)', minTradeVol: 5000, feeDiscountPct: 20, maxDailyWithdraw: 2000 },
    { level: 3, name: 'VIP 3 (Gold)', minTradeVol: 20000, feeDiscountPct: 35, maxDailyWithdraw: 10000 },
    { level: 4, name: 'VIP 4 (Platinum)', minTradeVol: 50000, feeDiscountPct: 50, maxDailyWithdraw: 30000 },
    { level: 5, name: 'VIP 5 (Diamond)', minTradeVol: 100000, feeDiscountPct: 70, maxDailyWithdraw: 100000 },
  ],
  REFERRAL_COMMISSION_RATES: {
    TIER_1_PCT: 5.0, // 5% of trading fee / volume incentive
    TIER_2_PCT: 2.0, // 2%
    TIER_3_PCT: 1.0, // 1%
  },
  PAYMENT_METHODS: {
    PHONEPE: { id: 'PHONEPE', name: 'PhonePe UPI', color: '#5f259f' },
    PAYTM: { id: 'PAYTM', name: 'Paytm UPI / Wallet', color: '#00baf2' },
    GPAY: { id: 'GPAY', name: 'Google Pay (UPI)', color: '#4285f4' },
    BANK: { id: 'BANK', name: 'IMPS / Bank Transfer', color: '#10b981' },
    UPI: { id: 'UPI', name: 'Generic UPI ID', color: '#f59e0b' },
  },
  CURRENCIES: ['ARB', 'USDT', 'INR'] as const,
  AUTH: {
    SESSION_COOKIE_NAME: 'ar_wallet_session',
    SESSION_MAX_AGE: 60 * 60 * 24 * 7, // 7 days
    MAX_FAILED_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,
  },
};
