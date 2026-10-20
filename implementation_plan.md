# AR WALLET — Complete Production Implementation Plan

## Overview
AR WALLET is an enterprise-grade crypto-fiat settlement and C2C trading platform. It supports multi-currency accounts (ARB, USDT TRC20/ERC20, Fiat INR), C2C/Cashier fast trading engine with automated matching and dispute appeals, bank & UPI collection management, multi-tier KYC verification (Level 0-2), 3-tier team referral and commission graph, daily VIP task rewards, dual-PIN security, and a comprehensive admin operations portal.

---

## Architecture & Technology Stack
- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS, CSS Modules, Modern Mobile-First Glassmorphic/Fintech Design System matching reference application visual tokens and vant-icon aesthetics
- **Database & ORM**: PostgreSQL / SQLite via Prisma ORM with safe Decimal currency representations
- **Ledger Engine**: Server-side immutable double-entry ledger with atomic row-level locking, balance invariant enforcement, and idempotency guarantees
- **Authentication**: HTTP-Only secure cookies, server-side session store, bcrypt password & payment PIN hashing, rate-limiting
- **Validation**: Zod schema validation across all API routes and forms
- **Testing**: Vitest test suite covering ledger atomicity, double-spend prevention, race conditions, auth, RBAC, C2C state machine, referrals, and admin workflows
- **Documentation & Tracking**: Full feature parity matrix in `/docs/IMPLEMENTATION_STATUS.md`, complete architecture, database, API, security, deployment, and testing docs

---

## Key Modules & Milestones

### 1. Project Scaffolding & Design System
- Setup `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, Next.js app directory structure
- Establish mobile viewport container (320px-440px mobile frame + desktop responsive layout)
- Create UI Component Library: Header/Navbar, Custom TabBar with animations, Card, Button, Input, Modal/Drawer, Stepper, Badge, QR Code, Toast/Alerts, Stat Widgets, Copy Button

### 2. Database Schema & Prisma ORM
- User, Session, Wallet, LedgerEntry (WalletTransaction), Order, OrderAppeal, Deposit, Withdrawal, CollectionMethod, KycRecord, Referral, Commission, Task, UserTask, SupportTicket, TicketMessage, Notification, Announcement, AuditLog, WebhookEvent, SystemSetting
- Seed script with complete demo datasets (Admin, Cashier, Regular users, VIP tiers, Wallets, Orders, KYC records, Referral graph)

### 3. Financial Ledger Engine & Core Services
- `LedgerService`: Atomic transfers, credits, debits, freeze, unfreeze, release with balance invariants
- `AuthService`: Register, Login, Session verification, PIN management, RBAC middleware
- `OrderService`: Buy ARB, Cashier match, C2C Sell, Escrow lock, Confirm Payment, Confirm Arrival, Dispute appeals, Auto-timeout
- `KycService`: Document submission, tier upgrades, admin review
- `ReferralService`: Dynamic codes, 3-tier commission distribution upon trade completion
- `PaymentService` & `WebhookHandler`: Provider abstraction (UPI/IMPS, USDT gateway, idempotency, signature validation)
- `AdminService`: Metrics, user freeze/unfreeze, manual adjustments with mandatory audit trail, review queues

### 4. API Endpoints Implementation
- Standardized `{ success: true, data: ..., message: ... }` and `{ success: false, error: { code, message } }`
- Full API routes for Auth, Wallet, USDT, Orders (Buy/Sell/Cashier/Appeal), KYC, Collection Methods, Team/Referrals, Tasks/VIP, Support, Notifications, System, Admin

### 5. Frontend Routes Implementation (96 Discovered Routes + Admin Portal)
- Main Navigation: `/`, `/home`, `/task`, `/order`, `/main`, `/sell`, `/wallet`
- Buy & Cashier Flow: `/home/buy`, `/buy/arb`, `/buy/recharge`, `/order/cashier`, `/order/index`, `/order/detail`, `/order/cancel`, `/order/confirmation`, `/buy/rule/:id`, `/buyLoad`, `/grap`, `/pay`, `/tradRules`, `/activaRules`
- Sell & C2C Flow: `/sell/sellOut`, `/sell/details`, `/sell/confirmArrival`, `/sell/cancel`, `/sell/appealInfo`, `/sell/unban`, `/sell/upiBan`, `/disable`
- Order Appeals & Exceptions: `/order/appeal`, `/order/wrongAmount`, `/order/kycAppeal`
- Wallet & USDT Management: `/usdt/add`, `/usdt/recharge`, `/usdt/recharge/record`, `/usdt/recharge/success`, `/usdt/payment`, `/usdt/wthdrawal`, `/usdt/wthdrawal/audit`, `/usdt/wthdrawal/record`, `/usdt/detail`, `/buy/usdtRecord`
- Collection Methods: `/main/collection`, `/main/addCollection`, `/main/addBank`, `/upi`, `/payment`
- KYC Verification: `/main/kyc`, `/main/kyc/add`, `/main/kyc/link`, `/main/addKyc`, `/main/verified`, `/main/approve`, `/main/noapprove`
- Team & Referrals: `/main/team`, `/main/team/tutorial`, `/main/teamTutorial`, `/promotion`
- Tasks & VIP Center: `/task/details`, `/task/sell`, `/task/buy`, `/task/vip`, `/task/rule`, `/task/apply/:id`, `/task/userLevel`, `/main/vipTutorial`, `/main/rewardsCardPage`, `/main/activity`, `/main/activity/detail`
- Security & Settings: `/login`, `/register`, `/forgot`, `/userAgreement`, `/main/safety`, `/main/securityCenter`, `/main/password`, `/main/paymentPwd`, `/main/bindphone`, `/main/bindemail`, `/main/seting`, `/main/seting/avatar`, `/main/seting/nickname`, `/main/lang`, `/main/explain`
- Help & Support: `/helpCenter`, `/helpCenter/submit`, `/helpCenter/progress`, `/helpCenter/buy`, `/helpCenter/sell`, `/main/server`, `/main/notice`, `/main/announcement`, `/main/announcementD`
- Admin Operations Portal: `/admin`, `/admin/dashboard`, `/admin/users`, `/admin/users/[id]`, `/admin/transactions`, `/admin/orders`, `/admin/deposits`, `/admin/withdrawals`, `/admin/kyc`, `/admin/settings`, `/admin/audit-logs`

### 6. Automated Testing & Verification
- Vitest unit & integration tests covering critical financial invariants, double-spend race condition tests, webhook idempotency, unauthorized access, and admin controls
- Full feature parity audit against `/docs/FEATURE_INVENTORY.md`
