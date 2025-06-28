# CCPayment Wallet Integration Guide

## 🎯 Overview

This comprehensive guide covers the full CCPayment wallet integration for Degentalk, from development setup to production deployment and scaling strategies.

## 📚 Table of Contents

1. [Quick Start (Development)](#quick-start-development)
2. [Development Mode Setup](#development-mode-setup)
3. [Webhook Configuration](#webhook-configuration)
4. [Testing Guide](#testing-guide)
5. [Production Deployment](#production-deployment)
6. [Scaling Strategy](#scaling-strategy)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start (Development)

### Prerequisites

```bash
# Ensure you have the latest code
git pull origin main

# Install dependencies
npm install

# Start development servers
npm run dev
```

### Environment Setup

Your `env.local` should contain:

```env
# Database
DATABASE_URL=postgresql://...

# CCPayment Configuration
CCPAYMENT_APP_ID=isloZpLGWgTHrugY1
CCPAYMENT_APP_SECRET=f3bb9be438840bb806cdbyue7797b9d

# Development Settings
NODE_ENV=development
WALLET_ENABLED=true
MOCK_CCPAYMENT=true
ALLOW_DEV_TOPUP=true

# URLs (for webhook callbacks)
API_URL=http://localhost:5001
FRONTEND_URL=http://localhost:5173
```

### First Steps

1. **Start the servers**:
   ```bash
   npm run dev
   ```

2. **Login to your dev account** (or register a new one)

3. **Initialize wallet** (automatic on login, or manually):
   ```bash
   curl -X POST http://localhost:5001/api/wallet/dev/init \
     -H "Cookie: your-session-cookie"
   ```

4. **Add test DGT**:
   ```bash
   curl -X POST http://localhost:5001/api/wallet/dev/topup \
     -H "Content-Type: application/json" \
     -H "Cookie: your-session-cookie" \
     -d '{"amount": 100, "token": "DGT"}'
   ```

5. **Visit wallet page**: `http://localhost:5173/wallet`

---

## 🛠️ Development Mode Setup

### Feature Flags

The wallet system uses feature flags for gradual rollout:

```typescript
// shared/wallet.config.ts
export const walletConfig = {
  WALLET_ENABLED: true,
  DEPOSITS_ENABLED: true,
  WITHDRAWALS_ENABLED: true,
  
  DEV_MODE: {
    MOCK_CCPAYMENT: true,          // Use mock responses
    ALLOW_DEV_TOPUP: true,         // Enable dev top-up endpoints
    BYPASS_LIMITS: false,          // Keep limits for realistic testing
  }
}
```

### Development Endpoints

| Endpoint | Purpose | Example |
|----------|---------|---------|
| `POST /api/wallet/dev/init` | Initialize user wallet | Auto-called on login |
| `POST /api/wallet/dev/topup` | Add test funds | `{"amount": 100, "token": "DGT"}` |
| `POST /api/wallet/dev/simulate-webhook` | Test webhook flow | `{"orderId": "test_123", "status": "completed"}` |
| `GET /api/wallet/dev/info` | Detailed wallet debug info | Shows mock status, balances |
| `POST /api/wallet/dev/reset` | Reset wallet (disabled by default) | Dangerous operation |

### Mock vs Real CCPayment

In development, `MOCK_CCPAYMENT=true` provides:

- ✅ Instant responses (no API delays)
- ✅ Predictable test data
- ✅ No real money involved
- ✅ Webhook simulation capabilities

---

## 🔗 Webhook Configuration

### Finding Your Server URL

#### Local Development
```
Webhook URL: http://localhost:5001/api/webhook/ccpayment
```

#### Ngrok (for external testing)
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 5001

# Use the https URL provided
Webhook URL: https://abc123.ngrok.io/api/webhook/ccpayment
```

#### Production Server
```
Webhook URL: https://api.degentalk.com/api/webhook/ccpayment
```

### CCPayment Dashboard Setup

1. **Login to CCPayment Dashboard**
   - URL: https://dashboard.ccpayment.com
   - Use your merchant account credentials

2. **Navigate to Webhook Settings**
   - Go to "Settings" → "Webhooks"
   - Or "API" → "Webhook Configuration"

3. **Add Webhook URLs**:
   ```
   Deposit Webhook URL: https://your-domain.com/api/webhook/ccpayment
   Withdrawal Webhook URL: https://your-domain.com/api/webhook/ccpayment
   ```

4. **Configure Events**:
   - ✅ deposit_completed
   - ✅ deposit_failed
   - ✅ withdrawal_completed
   - ✅ withdrawal_failed

5. **Test Webhook**:
   - Use the "Test" button in CCPayment dashboard
   - Check your server logs for incoming webhook

### Webhook Security

Our webhook endpoint automatically:
- ✅ Verifies HMAC signatures
- ✅ Validates timestamps
- ✅ Processes events idempotently
- ✅ Logs all webhook attempts

---

## 🧪 Testing Guide

### Manual Testing Flow

#### 1. Wallet Initialization
```bash
# Check if wallet exists
curl http://localhost:5001/api/wallet/balance

# Initialize if needed
curl -X POST http://localhost:5001/api/wallet/dev/init
```

#### 2. Test Deposits
```bash
# Create deposit address
curl -X POST http://localhost:5001/api/wallet/deposit-address \
  -H "Content-Type: application/json" \
  -d '{"currency": "USDT"}'

# Simulate successful deposit
curl -X POST http://localhost:5001/api/wallet/dev/simulate-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test_deposit_123",
    "status": "completed",
    "amount": "100.00",
    "txHash": "0xabc123..."
  }'
```

#### 3. Test Shop Purchases
```bash
# Buy item with DGT
curl -X POST http://localhost:5001/api/shop/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "username_color_gold",
    "paymentMethod": "DGT"
  }'
```

#### 4. Test Withdrawals
```bash
# Create withdrawal request
curl -X POST http://localhost:5001/api/wallet/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "currency": "USDT",
    "address": "TRX_ADDRESS_HERE",
    "notes": "Test withdrawal"
  }'

# Admin approve withdrawal (requires admin role)
curl -X PUT http://localhost:5001/api/wallet/admin/withdrawals/1 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "adminNotes": "Approved for testing"
  }'
```

### Automated Testing

```bash
# Run wallet-specific tests
npm run test:wallet

# Run full test suite
npm run test

# Test XP system integration
npm run test:xp
```

### Frontend Testing

1. **Visit Wallet Page**: `http://localhost:5173/wallet`
2. **Test Dev Tools** (bottom-right corner in dev mode)
3. **Check Feature Gates** (different user levels)
4. **Test Shop Integration**: `http://localhost:5173/shop`

---

## 🚀 Production Deployment

### Environment Configuration

```env
# Production Environment
NODE_ENV=production
WALLET_ENABLED=true

# CCPayment Production
CCPAYMENT_APP_ID=your_production_app_id
CCPAYMENT_APP_SECRET=your_production_secret
MOCK_CCPAYMENT=false

# Security
ALLOW_DEV_TOPUP=false
BYPASS_WALLET_LIMITS=false

# URLs
API_URL=https://api.degentalk.com
FRONTEND_URL=https://degentalk.com

# Database
DATABASE_URL=postgresql://production_db_url
```

### Deployment Checklist

#### Pre-Deployment

- [ ] **Environment Variables**: All production vars set
- [ ] **Database Migration**: Run latest migrations
- [ ] **CCPayment Account**: Production account configured
- [ ] **Webhook URL**: Updated in CCPayment dashboard
- [ ] **SSL Certificate**: HTTPS enabled for webhook security
- [ ] **Rate Limits**: Production rate limits configured
- [ ] **Monitoring**: Error tracking and logging setup

#### Deployment Steps

```bash
# 1. Deploy backend
npm run build
npm run start

# 2. Update CCPayment webhook URL
# Dashboard: https://dashboard.ccpayment.com
# Set: https://api.degentalk.com/api/webhook/ccpayment

# 3. Test webhook connectivity
curl -X POST https://api.degentalk.com/api/webhook/ccpayment \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 4. Enable features gradually
# Start with WALLET_ENABLED=true for admin users only
```

#### Post-Deployment Verification

```bash
# Test production endpoints
curl https://api.degentalk.com/api/wallet/balance
curl https://api.degentalk.com/api/wallet/currencies

# Check logs for errors
tail -f logs/app.log | grep -i wallet

# Monitor database
npm run db:studio
```

### Feature Rollout Strategy

1. **Phase 1**: Admin/Staff Only
   ```typescript
   // Limit to admin users initially
   if (user.role !== 'admin') {
     return { error: 'Feature not available yet' };
   }
   ```

2. **Phase 2**: Beta Users (Level 10+)
   ```typescript
   // Enable for high-level users
   if (user.level < 10) {
     return { error: 'Level 10 required for beta access' };
   }
   ```

3. **Phase 3**: Gradual Rollout
   ```typescript
   // Use rollout percentage
   const rolloutPercent = 25; // 25% of users
   if (user.id % 100 >= rolloutPercent) {
     return { error: 'Not in rollout group yet' };
   }
   ```

4. **Phase 4**: Full Release
   ```typescript
   // Remove all restrictions
   WALLET_ENABLED=true for all users
   ```

---

## 📈 Scaling Strategy

### DGT Token Economy Vision

#### Phase 1: Internal Circulation (Current)
- **Goal**: Build internal DGT economy
- **Features**: Tipping, shop purchases, rewards
- **Metrics**: Transaction volume, user adoption
- **Timeline**: 3-6 months

#### Phase 2: Real Value Creation
- **Goal**: DGT-crypto exchange functionality
- **Features**: Deposits, withdrawals, arbitrage opportunities
- **Metrics**: Deposit/withdrawal volume, price stability
- **Timeline**: 6-12 months

#### Phase 3: External Listing
- **Goal**: List DGT on CCPayment platform
- **Requirements**: 
  - Minimum $100K monthly volume
  - 1000+ active DGT holders
  - Stable price discovery
  - Regulatory compliance
- **Timeline**: 12+ months

### Volume Targets for CCPayment Listing

| Metric | Phase 1 Target | Phase 2 Target | Listing Requirement |
|--------|---------------|---------------|-------------------|
| Monthly Volume | $10K | $50K | $100K+ |
| Active Users | 500 | 2000 | 5000+ |
| DGT Holders | 100 | 1000 | 2000+ |
| Daily Transactions | 50 | 500 | 1000+ |
| Average Transaction | $20 | $25 | $30+ |

### Growth Strategies

#### 1. Gamification
```typescript
// Implement DGT earning opportunities
const xpToDgtRatio = 1000; // 1000 XP = 1 DGT
const dailyLoginBonus = 5; // 5 DGT per day
const referralBonus = 50; // 50 DGT per referral
```

#### 2. Utility Expansion
- **Forum Features**: Premium subscriptions, ad-free experience
- **Social Features**: Custom emojis, username colors, avatar frames
- **Trading Features**: Portfolio tracking, price alerts
- **Community Features**: Private groups, exclusive content

#### 3. External Partnerships
- **Influencer Programs**: DGT rewards for content creation
- **Business Partnerships**: Accept DGT for services
- **Cross-Platform Integration**: DGT usage on partner sites

#### 4. Market Making
- **Liquidity Provision**: Maintain DGT/USDT order books
- **Price Stability**: Algorithmic market making
- **Arbitrage Opportunities**: Cross-platform price differences

### Technical Scaling

#### Database Optimization
```sql
-- Index optimization for high-volume transactions
CREATE INDEX CONCURRENTLY idx_transactions_user_date 
ON transactions(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_wallet_balances_user 
ON wallet_balances(user_id) WHERE is_active = true;
```

#### Caching Strategy
```typescript
// Redis caching for wallet balances
const CACHE_TTL = 300; // 5 minutes
await redis.setex(`wallet:${userId}`, CACHE_TTL, JSON.stringify(balance));
```

#### Rate Limiting
```typescript
// Production rate limits
const RATE_LIMITS = {
  deposits: '5 per hour',
  withdrawals: '3 per hour', 
  transfers: '20 per hour',
  api_calls: '1000 per hour'
};
```

---

## 📋 API Reference

### Core Wallet Endpoints

#### Get Balance
```http
GET /api/wallet/balance
Authorization: Session cookie required

Response:
{
  "dgt": 123.45678900,
  "crypto": [
    {
      "currency": "USDT",
      "balance": 100.00,
      "network": "TRC20",
      "usdValue": 100.00
    }
  ]
}
```

#### Create Deposit Address
```http
POST /api/wallet/deposit-address
Content-Type: application/json

{
  "currency": "USDT"
}

Response:
{
  "address": "TRX_ADDRESS_HERE",
  "currency": "USDT", 
  "network": "TRC20",
  "qrCodeUrl": "https://chart.googleapis.com/...",
  "expireAt": "2024-01-31T23:59:59Z"
}
```

#### Create Purchase Order
```http
POST /api/wallet/purchase-orders
Content-Type: application/json

{
  "packageId": "dgt_100",
  "cryptoCurrency": "USDT"
}

Response:
{
  "orderId": 123,
  "depositUrl": "https://pay.ccpayment.com/...",
  "dgtAmount": 100,
  "cryptoAmount": 10.00,
  "status": "pending"
}
```

### Development Endpoints

#### Initialize Wallet
```http
POST /api/wallet/dev/init
Authorization: Session cookie required

Response:
{
  "success": true,
  "message": "Wallets initialized successfully",
  "ccpaymentId": "ccpay-123-1234567890"
}
```

#### Dev Top-Up
```http
POST /api/wallet/dev/topup
Content-Type: application/json

{
  "amount": 100,
  "token": "DGT"
}

Response:
{
  "success": true,
  "message": "Added 100 DGT to your wallet",
  "newBalance": 123.45678900
}
```

#### Simulate Webhook
```http
POST /api/wallet/dev/simulate-webhook
Content-Type: application/json

{
  "orderId": "test_123",
  "status": "completed",
  "amount": "100.00",
  "txHash": "0xabc123..."
}

Response:
{
  "success": true,
  "message": "Webhook simulation processed",
  "result": { "success": true, "message": "..." }
}
```

### Admin Endpoints

#### Treasury Overview
```http
GET /api/wallet/admin/treasury
Authorization: Admin role required

Response:
{
  "treasury": {
    "totalMinted": 1000000.00,
    "totalUserBalances": 950000.00,
    "circulatingSupply": 950000.00,
    "reserveBalance": 50000.00
  },
  "topHolders": [...],
  "dailyStats": {...},
  "pendingOperations": {...}
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Wallet Not Initializing
```bash
# Check user exists
curl http://localhost:5001/api/auth/me

# Manual initialization
curl -X POST http://localhost:5001/api/wallet/dev/init

# Check logs
tail -f logs/app.log | grep -i wallet
```

#### 2. Webhook Not Receiving
```bash
# Check webhook endpoint
curl -X POST http://localhost:5001/api/webhook/ccpayment \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check CCPayment dashboard webhook logs
# Verify webhook URL is correct
# Ensure server is publicly accessible
```

#### 3. Balance Not Updating
```bash
# Check transaction was recorded
curl http://localhost:5001/api/wallet/transactions

# Manual balance recalculation
npm run wallet:recalculate-balances

# Check database directly
npm run db:studio
```

#### 4. Feature Flags Not Working
```typescript
// Check feature gate configuration
import { WalletFeatureChecker } from '@shared/wallet-features.config';

const hasAccess = WalletFeatureChecker.hasAccess(
  'wallet_deposits', 
  userLevel, 
  isDev, 
  userId
);
```

### Debug Tools

#### Enable Debug Logging
```env
# Add to env.local
DEBUG_WALLET=true
LOG_LEVEL=debug
```

#### Database Inspection
```bash
# Check wallet tables
npm run db:studio

# Or direct SQL
psql $DATABASE_URL -c "SELECT * FROM wallets WHERE user_id = 123;"
```

#### API Testing
```bash
# Test all wallet endpoints
npm run test:wallet-endpoints

# Manual API testing
curl -v http://localhost:5001/api/wallet/balance
```

### Support Contacts

- **Technical Issues**: Development team
- **CCPayment Issues**: CCPayment support
- **Production Incidents**: On-call engineer
- **Documentation**: Update this guide

---

## 📝 Contributing

### Adding New Features

1. **Update Feature Flags**:
   ```typescript
   // Add to shared/wallet-features.config.ts
   {
     id: 'new_feature',
     name: 'New Feature',
     description: 'Description here',
     enabled: false, // Start disabled
     minLevel: 5
   }
   ```

2. **Implement Backend**:
   ```typescript
   // Add to wallet controller
   async newFeature(req: Request, res: Response) {
     // Check feature access
     const hasAccess = WalletFeatureChecker.hasAccess(
       'new_feature', 
       user.level, 
       isDev, 
       user.id
     );
     
     if (!hasAccess.hasAccess) {
       return res.status(403).json({ error: hasAccess.reason });
     }
     
     // Implementation here
   }
   ```

3. **Add Frontend Component**:
   ```typescript
   // Use feature gate in UI
   {features.new_feature && (
     <Button onClick={handleNewFeature}>
       New Feature
     </Button>
   )}
   ```

4. **Update Documentation**: Add to this guide

### Testing New Features

1. **Unit Tests**: Add to `tests/wallet/`
2. **Integration Tests**: Add to `tests/e2e/`
3. **Manual Testing**: Update testing section
4. **Production Testing**: Use feature flags for gradual rollout

---

*This documentation is maintained by the Degentalk development team. Last updated: 2025-01-20*