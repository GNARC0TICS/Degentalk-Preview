# New Wallet Domain - Developer Guide

## 🎯 Overview

This is the new consolidated wallet implementation using the strangler fig pattern. It provides a unified interface for wallet operations while leveraging existing CCPayment services.

## 📁 Architecture

```
server/src/domains/_new-wallet/
├── adapters/           # Payment provider adapters
│   ├── ccpayment.adapter.ts    # CCPayment API integration
│   └── cache.adapter.ts        # Caching layer
├── controllers/        # HTTP request handlers
│   └── wallet.controller.ts    # Wallet API endpoints
├── services/          # Business logic layer
│   └── wallet.service.ts       # Core wallet service
├── routes/            # Express route definitions
│   └── wallet.routes.ts        # API route configuration
├── validation/        # Request validation schemas
│   └── wallet.validation.ts    # Zod validation schemas
├── __tests__/         # Test files
│   └── ccpayment.adapter.test.ts
└── index.ts          # Domain exports
```

## 🔧 CCPayment Integration Flow

### Deposit Flow (User Sends Crypto → Gets DGT)

1. **User Request**: User selects coin and requests deposit address
   ```typescript
   POST /api/wallet/deposit-address
   { "coinSymbol": "USDT", "chain": "Ethereum" }
   ```

2. **Address Generation**: `ccpaymentAdapter.createDepositAddress()`
   - Calls existing `ccpaymentDepositService.createDepositAddress()`
   - Returns deposit address tied to user's CCPayment UID

3. **Deposit Monitoring**: CCPayment monitors the generated address

4. **Webhook Callback**: When deposit arrives, CCPayment calls:
   ```typescript
   POST /api/wallet/webhook/ccpayment
   {
     "userId": "user_123",
     "coin": "USDT",
     "amount": "100.00",
     "recordId": "dep_456",
     "txHash": "0x..."
   }
   ```

5. **DGT Credit**: `walletController.processWebhook()`
   - Validates webhook signature
   - Converts amount → USDT equivalent
   - Credits user: DGT = USDT * 10
   - Creates `crypto_deposit` transaction record

### Withdrawal Flow (User Withdraws Crypto)

1. **User Request**: User submits withdrawal request
   ```typescript
   POST /api/wallet/withdraw
   {
     "currency": "USDT",
     "amount": 50.00,
     "address": "0x...",
     "memo": "optional"
   }
   ```

2. **Validation**: Request validated against:
   - Currency support
   - Amount limits (min/max)
   - Address format patterns
   - User balance sufficiency

3. **CCPayment Processing**: `ccpaymentAdapter.requestWithdrawal()`
   - Calls CCPayment withdraw API
   - Returns transaction ID and estimated completion time

4. **Status Updates**: Webhook notifications update transaction state:
   ```
   pending → completed | failed | cancelled
   ```

## 🛠️ Development Guidelines

### Integration Strategy

- ✅ **All CCPayment calls isolated** in `ccpayment.adapter.ts`
- ✅ **No raw API calls** in controllers/services
- ✅ **Single webhook endpoint** handles all provider callbacks
- ✅ **DGT logic separate** from blockchain operations

### Error Handling

```typescript
// All adapters throw WalletError instances
throw new WalletError(
  'Failed to create deposit address',
  ErrorCodes.PAYMENT_PROVIDER_ERROR,
  500,
  { userId, coinSymbol, originalError: error }
);
```

### Type Safety

```typescript
// Use branded IDs from @shared/types/ids
import type { UserId, TransactionId } from '@shared/types/ids';

// Use shared wallet types
import type { WalletBalance, DepositAddress } from '@shared/types/wallet/wallet.types';

// Transform responses with public DTOs
import { toPublicWalletBalance } from '@shared/types/wallet/wallet.transformer';
```

### Validation

```typescript
// All endpoints use Zod validation
import { walletValidation } from './validation/wallet.validation';

router.post('/withdraw',
  validateRequest(walletValidation.withdrawal),
  walletController.requestWithdrawal
);
```

## 🔒 Security Considerations

### Authentication & Authorization
- All user endpoints require `requireAuth` middleware
- Uses `getAuthenticatedUser(req)` instead of `req.user`
- Validates user ownership of wallet data

### Input Validation
- **Address Validation**: Crypto address format checking per currency
- **Amount Limits**: Min/max withdrawal amounts enforced
- **Rate Limiting**: Endpoint-specific rate limits (5-100 req/min)

### Response Security
- **Public DTOs**: All responses use transformer functions
- **No PII Exposure**: Sensitive data stripped from responses
- **Error Sanitization**: Generic error messages to external users

## 🚀 Testing

### Unit Tests
```bash
# Run wallet domain tests
pnpm test server/src/domains/_new-wallet/

# Run specific adapter tests
pnpm test ccpayment.adapter.test.ts
```

### Integration Testing
```bash
# Test CCPayment webhook flow
curl -X POST http://localhost:3000/api/wallet/webhook/ccpayment \
  -H "Content-Type: application/json" \
  -H "X-Signature: <hmac_signature>" \
  -d '{"userId":"user_123","coin":"USDT","amount":"100.00"}'
```

## 📊 Monitoring & Logging

### Structured Logging
```typescript
logger.info('WalletService', 'Processing withdrawal request', {
  userId,
  amount: request.amount,
  currency: request.currency
});
```

### Key Metrics to Monitor
- Deposit success rate
- Withdrawal processing time
- Webhook delivery success
- Cache hit rates
- API error rates

## 🔄 Migration Strategy

### Current Status: **Week 1 Foundation Complete**

**Completed:**
- ✅ Shared types and transformers
- ✅ CCPayment adapter implementation
- ✅ Cache adapter for performance
- ✅ Wallet service orchestration
- ✅ HTTP controller with validation
- ✅ Express routes with rate limiting

**Next Steps:**
1. **Week 2**: Integration testing and database layer
2. **Week 3**: Gradual traffic migration using feature flags
3. **Week 4**: Legacy wallet deprecation

### Usage

```typescript
// Import new wallet functionality
import { walletService, walletRoutes } from '@new-wallet';

// Add routes to Express app
app.use('/api/wallet', walletRoutes);

// Use service directly
const balance = await walletService.getUserBalance(userId);
```

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# CCPayment API credentials (existing)
CCPAYMENT_APP_ID=your_app_id
CCPAYMENT_APP_SECRET=your_app_secret
CCPAYMENT_WEBHOOK_URL=https://yourdomain.com/api/wallet/webhook/ccpayment

# Wallet configuration
WALLET_DEFAULT_CURRENCY=USDT
WALLET_ENABLE_CACHING=true
```

## 📞 Support

For questions about the new wallet implementation:
1. Check existing CCPayment services in `server/src/domains/wallet/`
2. Review shared types in `shared/types/wallet/`
3. Consult the architecture documentation in `docs/architecture/`