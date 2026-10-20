# AR WALLET — Complete Feature Inventory & Discovery Specification

> **Document Status**: Complete Discovery (Phase 1)  
> **Source Reference**: https://gbqeq.payjora.com/ (AR Wallet Web/PWA Application)  
> **Target Architecture**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM, Server-side Financial Ledger  

---

## Executive Summary & Architecture Overview

AR Wallet is a high-performance, mobile-first Web/PWA crypto-fiat settlement and trading platform. It supports:
1. **Multi-Asset Ledger**: ARB Token (native trading asset), USDT (TRC20/ERC20), and Fiat (INR / UPI / IMPS Bank Transfer).
2. **C2C / P2P Flash Trading Engine**: Fast Buy (Cashier recharge with UPI/Bank payment matching) & Sell (Merchant/User sell out with payment arrival confirmation, dispute appeal, and timeout management).
3. **Multi-Tier Identity Verification (KYC)**: Level 0 (Unverified), Level 1 (Basic ID/Aadhaar/PAN/Passport verification), Level 2 (Advanced Document + Selfie verification + Admin Review Queue).
4. **Collection & Payout Management**: Managing Bank Accounts (Account Holder Name, Account Number, Bank Name, IFSC, Branch) and UPI IDs.
5. **Team & Multi-Tier Referral Commission System**: Dynamic referral link generation, QR code sharing, Tier 1/2/3 team hierarchy, commission ledger, and VIP task incentives.
6. **VIP Reward & Task System**: Daily trading tasks, VIP level progression, fee discount tiers, and reward vouchers.
7. **Security & Financial Risk Controls**: Dual password architecture (Login Password + 6-digit Payment/Fund PIN), Device tracking, session expiry, anti-tamper, and Admin audit trail.
8. **Admin Operations Management Panel**: User management (freeze/activate, KYC review, balance audit), Transaction oversight (deposit approval, withdrawal processing, C2C dispute resolution), and System metrics.

---

## Screen-by-Screen Feature Inventory

---

### 1. Authentication & Recovery

#### 1.1 Login Screen
- **URL / Route**: `/login`
- **Purpose**: Authenticate existing users via Mobile/Email or Username with password.
- **Components**: Brand Header, Login Form, Input Fields with toggle visibility, Remember Me checkbox, Submit Button, Forgot Password Link, Register CTA Link, Language Selector.
- **Forms & Inputs**:
  - `account` / `identifier` (Email or Mobile Phone with country code prefix, e.g., +91)
  - `password` (Minimum 8 chars, alphanumeric)
  - `captcha` / `turnstile` (anti-bot verification)
- **Validation**:
  - Required fields, valid email/phone format, password complexity check, rate-limiting on failed attempts (max 5 per 15 min).
- **API Requirements**:
  - `POST /api/auth/login`
- **Database Requirements**:
  - `users`, `sessions`, `audit_logs`
- **User Roles**: Unauthenticated / Public
- **States**:
  - *Success*: Issues HTTP-Only secure session cookie, redirects to `/home`.
  - *Error*: "Invalid credentials", "Account locked/suspended", "Too many attempts".
  - *Loading*: Button spinner, form disabled.
- **Mobile Behavior**: Centered responsive card on desktop, full-height native mobile layout (375px/390px viewport).

#### 1.2 Register Screen
- **URL / Route**: `/register`
- **Purpose**: Create a new user account with optional referral invitation code.
- **Components**: Brand Header, Registration Form, OTP verification module, Password and Confirm Password fields, Invitation Code field (prefilled from URL query `?ref=...`), Terms of Service checkbox.
- **Forms & Inputs**:
  - `phone` / `email` (Mobile number with country code selector e.g. +91 or Email)
  - `verificationCode` (6-digit OTP code)
  - `password` (8-20 characters, containing letters and numbers)
  - `confirmPassword` (Must match password)
  - `invitationCode` (Optional / Required depending on system configuration)
  - `agreeTerms` (Boolean checkbox)
- **Validation**:
  - Mobile/Email format check, OTP validity and expiration (5 min), Password match, Terms agreement check.
- **API Requirements**:
  - `POST /api/auth/send-otp`
  - `POST /api/auth/register`
- **Database Requirements**:
  - `users`, `wallets`, `referrals`, `audit_logs`
- **User Roles**: Public
- **States**:
  - *Success*: Creates user account, generates default wallets (ARB, USDT, INR), awards initial registration bonus if active, auto logs in or prompts login.
  - *Error*: "User already exists", "Invalid OTP", "Invalid referral code".
- **Mobile Behavior**: Clean single-column layout with fixed bottom action bar.

#### 1.3 Forgot / Reset Password Screen
- **URL / Route**: `/forgot`
- **Purpose**: Allow users to safely reset their login password via verified phone/email OTP.
- **Components**: Step 1: Identifier input + Send OTP; Step 2: Enter OTP + New Password.
- **Forms & Inputs**:
  - `identifier` (Email or Mobile)
  - `otp` (6-digit code)
  - `newPassword`
  - `confirmNewPassword`
- **Validation**: Strict OTP verification, password strength rules.
- **API Requirements**:
  - `POST /api/auth/forgot-password/request-otp`
  - `POST /api/auth/forgot-password/reset`
- **Database Requirements**: `users`, `sessions` (invalidates all existing sessions).
- **User Roles**: Public

---

### 2. Main Navigation & Dashboard

#### 2.1 Home / Dashboard Screen
- **URL / Route**: `/home`
- **Purpose**: Main user dashboard displaying asset summary, quick Buy/Sell actions, live market rates, promotional banners, VIP progress, and announcements.
- **Components**:
  - **Top Bar**: User avatar, VIP level badge (VIP 0 to VIP 5), Notification Bell (with unread badge), Customer Service icon, Language switch.
  - **Balance Card**: Total Asset Valuation (in INR and USDT equivalent), ARB Balance, Available Balance, Frozen Balance, Eye toggle to hide/show balance.
  - **Quick Action Bar**: "Buy ARB", "Sell ARB", "Deposit USDT", "Withdraw", "Task Rewards".
  - **Market Ticker**: Real-time ARB/INR price (e.g. 1 ARB = ₹100.00), 24h volume, 24h change %.
  - **Announcement Marquee / Slider**: Urgent platform notices and system updates.
  - **Recent Activity / Quick Order Widget**: Current active P2P/Cashier orders with countdown timers.
  - **Bottom Navigation Bar**: 5 Tabs: [Home, Task, Order, Sell, My Profile (Main)].
- **API Requirements**:
  - `GET /api/user/dashboard-summary`
  - `GET /api/market/ticker`
  - `GET /api/announcements/active`
- **Database Requirements**: `users`, `wallets`, `announcements`, `orders`.
- **User Roles**: `USER`, `ADMIN`.
- **States**: Skeleton loader on mount; auto-refreshes balance on polling/websocket.

---

### 3. Wallet & Ledger Engine

#### 3.1 Wallet Overview Screen
- **URL / Route**: `/wallet`
- **Purpose**: Complete financial overview of all user balances (ARB, USDT, INR) with deposit/withdrawal shortcuts and ledger statement.
- **Components**:
  - Total Assets Summary Card (with currency switcher: INR / USDT).
  - Asset Breakdown list:
    - **ARB Wallet**: Available, Frozen (in active orders), Staked/Reward balance.
    - **USDT Wallet**: Available, Frozen, TRC20/ERC20 addresses.
    - **Fiat (INR) Balance**: Available, Total deposited, Total withdrawn.
  - Quick action buttons: Recharge, Withdraw, Transfer, History.
  - Filterable Transaction Stream.
- **API Requirements**:
  - `GET /api/wallet/balances`
  - `GET /api/wallet/transactions?page=1&limit=20&type=ALL`
- **Database Requirements**: `wallets`, `wallet_transactions`, `ledger_entries`.

#### 3.2 USDT Deposit / Recharge Screen
- **URL / Route**: `/usdt/recharge`
- **Purpose**: Generate blockchain deposit address (TRC20 / ERC20) with QR code for USDT deposits.
- **Components**: Network selector (TRC20 / ERC20), QR Code display, Copy Address button, Minimum deposit warning (e.g. 10 USDT), Hash (TxID) submission form for manual/semi-automatic verification.
- **Forms & Inputs**:
  - `network` (TRC20 / ERC20)
  - `amount` (USDT amount transferred)
  - `txHash` / `proofImage` (Blockchain transaction hash or screenshot proof)
- **Validation**: Non-empty TxID, valid regex hash format, min amount check.
- **API Requirements**:
  - `GET /api/usdt/deposit-address`
  - `POST /api/usdt/submit-deposit`
  - `GET /api/usdt/recharge-history`
- **Database Requirements**: `deposits`, `wallet_transactions`, `wallets`.

#### 3.3 USDT Withdrawal Screen
- **URL / Route**: `/usdt/wthdrawal`
- **Purpose**: Request on-chain USDT payout to an external wallet address.
- **Components**: Network selector, Destination Address input, Available balance display, Amount input with "MAX" button, Network Fee calculation, Actual amount received preview, 6-digit Payment PIN input, SMS/Email 2FA verification.
- **Forms & Inputs**:
  - `network` (TRC20 / ERC20)
  - `address` (Valid TRC20 'T...' or ERC20 '0x...' address)
  - `amount` (Positive float, >= min_withdrawal, <= available_balance)
  - `fundPassword` (6-digit Payment PIN)
- **Validation**:
  - Address checksum validation
  - Balance check (server-side atomic lock)
  - Rate limiting (e.g., max 3 withdrawals/day)
  - Fund password verification (max 3 invalid attempts before 2h lock)
- **API Requirements**:
  - `POST /api/withdrawals/usdt/request`
  - `GET /api/withdrawals/limits`
- **Database Requirements**: `withdrawals`, `wallets`, `wallet_transactions`, `audit_logs`.

---

### 4. C2C & Cashier Trading Engine (Buy & Sell)

#### 4.1 Buy ARB / Cashier Recharge Screen
- **URL / Route**: `/buy/arb` & `/order/cashier` & `/order/index`
- **Purpose**: Instant buy of ARB tokens using UPI / NetBanking / IMPS.
- **Flow**:
  1. User enters purchase amount in INR (e.g. ₹500, ₹1000, ₹5000, ₹10000 or custom).
  2. System calculates ARB tokens to be received based on locked exchange rate.
  3. System matches with available cashier/liquidity pool or generates dynamic UPI QR / VPA / Bank account.
  4. User pays via UPI app (PhonePe, Google Pay, Paytm) and submits 12-digit UPI UTR / Ref Number.
  5. System verifies payment via webhook / automated matching / admin cashier audit, and credits ARB tokens to the user's wallet ledger atomically.
- **Components**: Amount presets, Payment Method selector (PhonePe, Paytm, GooglePay, Bank Transfer), Order Countdown Timer (15 minutes), Matched Payee UPI ID/QR with "Copy UPI ID" and "Open UPI App" deep-links, 12-digit UTR input field, Upload Payment Screenshot button, "I Have Paid" submit button, "Cancel Order" button.
- **API Requirements**:
  - `POST /api/orders/buy/create`
  - `GET /api/orders/:orderId`
  - `POST /api/orders/:orderId/confirm-payment`
  - `POST /api/orders/:orderId/cancel`
  - `POST /api/orders/:orderId/appeal`
- **Database Requirements**: `orders`, `order_appeals`, `wallets`, `wallet_transactions`.

#### 4.2 Sell ARB / C2C Sell Out Screen
- **URL / Route**: `/sell` & `/sell/sellOut` & `/sell/details`
- **Purpose**: Users sell ARB tokens and receive INR directly into their bound Bank Account or UPI ID.
- **Flow**:
  1. User selects amount of ARB to sell.
  2. Selects bound collection method (Bank Account or UPI).
  3. Enters 6-digit Payment Password.
  4. System freezes ARB tokens in user's wallet.
  5. Order is published to C2C matching engine / assigned to verified buyer.
  6. Buyer transfers fiat to seller's UPI/Bank.
  7. Seller receives bank SMS/notification, checks account, and clicks "Confirm Arrival" with Payment Password to release frozen ARB to buyer.
  8. If payment not received after timer, Seller can open an Dispute Appeal (`/order/appeal`) with bank statement proof.
- **Components**: Sell amount input, Collection method picker, Frozen balance calculator, Order state tracker (Pending Payment -> Paid by Buyer -> Awaiting Seller Release -> Completed / Appealed), "Confirm Release" modal with 6-digit PIN, Appeal submit drawer.
- **API Requirements**:
  - `POST /api/orders/sell/create`
  - `POST /api/orders/sell/:orderId/confirm-arrival`
  - `POST /api/orders/sell/:orderId/appeal`
- **Database Requirements**: `orders`, `collection_methods`, `wallets`, `wallet_transactions`.

---

### 5. Collection Methods (Bank & UPI Binding)

#### 5.1 Collection List & Add Screen
- **URL / Route**: `/main/collection`, `/main/addCollection`, `/main/addBank`, `/upi`
- **Purpose**: Manage receiving accounts for fiat withdrawals and sell orders.
- **Forms & Inputs**:
  - **Bank Account**:
    - `realName` (Account holder name, must match KYC name)
    - `bankName` (Select from bank list or input)
    - `accountNumber` (10-18 digits)
    - `confirmAccountNumber`
    - `ifscCode` (11 alphanumeric chars, validated via bank IFSC lookup)
    - `branch` (Optional / Auto-filled)
    - `fundPassword` (6-digit PIN)
  - **UPI Account**:
    - `upiId` / `vpa` (e.g., `user@okaxis`, `user@paytm`)
    - `realName`
    - `fundPassword`
- **API Requirements**:
  - `GET /api/user/collection-methods`
  - `POST /api/user/collection-methods/bank`
  - `POST /api/user/collection-methods/upi`
  - `DELETE /api/user/collection-methods/:id`
- **Database Requirements**: `collection_methods`, `users`.

---

### 6. KYC & Identity Verification

#### 6.1 KYC Submission Screen
- **URL / Route**: `/main/kyc`, `/main/kyc/add`, `/main/addKyc`
- **Purpose**: Submit government identity documents for Tier 1 / Tier 2 verification.
- **Forms & Inputs**:
  - `documentType` (Aadhaar Card, PAN Card, Passport, Driving License)
  - `fullName` (Legal name matching document)
  - `idNumber` (Document ID number)
  - `dob` (Date of birth)
  - `frontImage` (Encrypted / Protected upload)
  - `backImage` (Encrypted / Protected upload)
  - `selfieImage` (Holding ID document)
- **Validation**: File size <= 5MB, format (JPEG/PNG/WebP), valid ID format.
- **API Requirements**:
  - `GET /api/kyc/status`
  - `POST /api/kyc/submit`
- **Database Requirements**: `kyc_records`, `kyc_documents`, `users`.
- **States**: `UNSUBMITTED`, `PENDING`, `APPROVED`, `REJECTED` (with rejection reason & re-submit button).

---

### 7. Team, Referral & Commission System

#### 7.1 Referral Dashboard
- **URL / Route**: `/main/team`, `/main/team/tutorial`, `/promotion`
- **Purpose**: View invitation link, QR code, Tier 1/2/3 team members, and real-time commission earnings.
- **Components**:
  - My Invitation Code & Copy Button.
  - Shareable Referral Link with one-click copy and social share (WhatsApp, Telegram, Facebook).
  - Share Banner with dynamic QR Code generator.
  - Team Statistics:
    - Total Commission Earned (in ARB & INR)
    - Today's Commission
    - Tier 1 Team Members count & total volume
    - Tier 2 Team Members count & total volume
    - Tier 3 Team Members count & total volume
  - Member breakdown table with registration date, trading volume, and commission generated.
  - Commission Rules & Tutorial explanation modal.
- **API Requirements**:
  - `GET /api/referrals/summary`
  - `GET /api/referrals/members?tier=1&page=1`
  - `GET /api/referrals/commissions?page=1`
- **Database Requirements**: `referrals`, `commissions`, `users`, `wallet_transactions`.

---

### 8. Tasks, VIP Levels & Rewards

#### 8.1 Task & VIP Center
- **URL / Route**: `/task`, `/task/details`, `/task/vip`, `/task/rule`, `/main/vipTutorial`
- **Purpose**: Daily trading tasks, VIP tier progression, and claiming rewards.
- **Components**:
  - VIP Level Status Card (VIP 0 -> VIP 5) with progress bar to next tier.
  - Daily Tasks list (e.g. "Complete 1 Buy order >= ₹500", "Invite 1 active friend", "Daily Check-in").
  - "Claim Reward" interactive buttons with claim animation.
  - Privilege table (fee discount %, higher withdrawal limit, priority customer support).
- **API Requirements**:
  - `GET /api/tasks/list`
  - `POST /api/tasks/:taskId/claim`
  - `GET /api/vip/levels`
- **Database Requirements**: `tasks`, `user_tasks`, `vip_levels`, `wallets`.

---

### 9. Help Center & Support

#### 9.1 Support Ticket & Live Chat
- **URL / Route**: `/helpCenter`, `/helpCenter/submit`, `/helpCenter/progress`, `/main/server`
- **Purpose**: In-app FAQ knowledge base, submit support tickets with attachments, and track resolution status.
- **Forms & Inputs**:
  - `category` (Deposit Issue, Withdrawal Delay, KYC Verification, Order Dispute, Other)
  - `orderId` (Optional link to transaction)
  - `subject`
  - `description`
  - `attachments` (Screenshots / PDF)
- **API Requirements**:
  - `GET /api/support/faq`
  - `POST /api/support/tickets`
  - `GET /api/support/tickets`
  - `POST /api/support/tickets/:id/reply`
- **Database Requirements**: `support_tickets`, `ticket_messages`.

---

### 10. Security & Profile Settings

#### 10.1 Security Center
- **URL / Route**: `/main/safety`, `/main/securityCenter`, `/main/password`, `/main/paymentPwd`, `/main/bindphone`, `/main/bindemail`, `/main/seting`
- **Purpose**: Manage login password, set 6-digit payment PIN, bind phone/email, change avatar/nickname, view active login sessions.
- **Forms & Inputs**:
  - **Login Password**: `oldPassword`, `newPassword`, `confirmPassword`.
  - **Payment Password (PIN)**: 6 numeric digits with secure keypad input, `confirmPin`, SMS OTP authorization.
  - **Bind Phone / Email**: Phone/Email input, send OTP, verify OTP.
  - **Profile**: Nickname edit, Avatar selection.
- **API Requirements**:
  - `POST /api/user/change-password`
  - `POST /api/user/set-payment-pin`
  - `POST /api/user/bind-phone`
  - `POST /api/user/bind-email`
  - `POST /api/user/update-profile`
  - `GET /api/user/sessions`
  - `POST /api/user/sessions/revoke-all`
- **Database Requirements**: `users`, `sessions`, `audit_logs`.

---

### 11. Admin Management Panel

#### 11.1 Admin Overview & Metrics
- **URL / Route**: `/admin` / `/admin/dashboard`
- **Purpose**: Real-time administrative dashboard of system solvency, pending queues, and business KPIs.
- **Components**:
  - Metrics Cards: Total Users, Active Users (24h), Total System Balances (ARB & USDT), Pending Deposits, Pending Withdrawals, Pending KYC Reviews, Active C2C Disputes.
  - Real-time Transaction Chart.
  - Recent Alerts and Audit Logs.

#### 11.2 Admin User Management
- **URL / Route**: `/admin/users` & `/admin/users/:id`
- **Purpose**: Search users by email/phone/ID, inspect wallet ledger, freeze/activate accounts, view KYC and team tree, adjust balances with strict audit reasons.
- **Actions**: Freeze Account, Unfreeze Account, Reset Password, View Audit History, Manual Ledger Adjustment (with mandatory reason, dual-entry logging, and before/after verification).

#### 11.3 Admin Transaction & Order Management
- **URL / Route**: `/admin/transactions`, `/admin/orders`, `/admin/deposits`, `/admin/withdrawals`
- **Purpose**: Review and process pending deposits, approve/reject withdrawals, and mediate C2C order disputes.
- **Actions**:
  - Approve USDT Deposit / Match UTR
  - Approve / Reject Withdrawal (reject automatically refunds balance to user ledger)
  - Mediate Dispute: Release ARB to Buyer OR Cancel & Return ARB to Seller

#### 11.4 Admin KYC Review Queue
- **URL / Route**: `/admin/kyc`
- **Purpose**: Review submitted identity documents with zoomable viewer.
- **Actions**: Approve KYC (upgrades user tier), Reject KYC (with predefined or custom rejection reason).

#### 11.5 Admin System Settings & Audit Logs
- **URL / Route**: `/admin/settings`, `/admin/audit-logs`
- **Purpose**: Configure exchange rates (ARB/INR, USDT/INR), deposit/withdrawal minimums & fees, referral commission rates, and review immutable audit logs.

---

## Complete Database Entity Model (PostgreSQL + Prisma)

1. `User` (id, email, phone, username, passwordHash, paymentPinHash, kycLevel, status, role, avatar, nickname, inviteCode, referredById, createdAt, updatedAt)
2. `Wallet` (id, userId, currency [ARB, USDT, INR], availableBalance, frozenBalance, createdAt, updatedAt)
3. `WalletTransaction` / `LedgerEntry` (id, walletId, userId, type [DEPOSIT, WITHDRAWAL, BUY_CREDIT, SELL_DEBIT, SELL_FROZEN, SELL_RELEASE, REFERRAL_COMMISSION, TASK_REWARD, SYSTEM_ADJUSTMENT], amount, fee, balanceBefore, balanceAfter, status [PENDING, SUCCESS, FAILED, CANCELLED, REVERSED], referenceId, referenceType, description, metadata, idempotencyKey, createdAt)
4. `Order` (id, orderNumber, userId, peerId, type [BUY, SELL], status [PENDING_PAYMENT, PAID_BY_BUYER, COMPLETED, CANCELLED, APPEALED, REFUNDED], fiatCurrency, fiatAmount, tokenCurrency, tokenAmount, unitPrice, paymentMethodId, utrNumber, proofImageUrl, appealReason, expiresAt, completedAt, createdAt, updatedAt)
5. `Deposit` (id, userId, currency, amount, fee, network [TRC20, ERC20, UPI, BANK], toAddress, txHash, proofImageUrl, status [PENDING, APPROVED, REJECTED], reviewedById, reviewedAt, createdAt)
6. `Withdrawal` (id, userId, currency, amount, fee, netAmount, network, destinationAddress, bankDetails, status [PENDING, PROCESSING, APPROVED, REJECTED, CANCELLED], rejectionReason, reviewedById, reviewedAt, createdAt)
7. `CollectionMethod` (id, userId, type [BANK_ACCOUNT, UPI], realName, bankName, accountNumber, ifscCode, branch, upiId, isDefault, status, createdAt)
8. `KycRecord` (id, userId, documentType, fullName, idNumber, dob, frontImageUrl, backImageUrl, selfieImageUrl, status [PENDING, APPROVED, REJECTED], rejectionReason, reviewerId, reviewedAt, createdAt)
9. `Referral` (id, referrerId, refereeId, tier [1, 2, 3], createdAt)
10. `Commission` (id, referrerId, refereeId, orderId, tier, amount, currency, rate, status, createdAt)
11. `Task` & `UserTask` (id, title, description, rewardAmount, rewardCurrency, targetCount, type, isDaily, active)
12. `SupportTicket` & `TicketMessage` (id, ticketNumber, userId, subject, category, priority, status, orderId, createdAt)
13. `Notification` (id, userId, title, content, type, isRead, linkUrl, createdAt)
14. `Announcement` (id, title, content, isImportant, active, publishedAt)
15. `AuditLog` (id, actorId, actorRole, action, resource, resourceId, ipAddress, userAgent, beforeState, afterState, reason, createdAt)
16. `WebhookEvent` (id, provider, eventId, eventType, payload, signature, processed, processedAt, createdAt)
17. `SystemSetting` (id, key, value, description, updatedAt)
