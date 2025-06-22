# 🔌 Wallet API Service

## Overview

The Wallet API Service (`wallet-api.service.ts`) provides a centralized interface for all wallet-related API operations in the DegenTalk frontend. It handles communication with the backend DGT wallet system, CCPayment integration, and provides type-safe methods for all wallet operations.

## 🏗️ Architecture

### Service Structure

```typescript
class WalletApiService {
	// Balance Operations
	async getBalance(): Promise<WalletBalance>;

	// Transaction Operations
	async getTransactionHistory(
		page?,
		limit?
	): Promise<{ transactions: Transaction[]; total: number }>;

	// Deposit Operations
	async getDepositAddresses(): Promise<DepositAddress[]>;
	async createDgtPurchase(dgtAmount, cryptoCurrency): Promise<PurchaseOrder>;

	// Transfer Operations
	async transferDgt(recipientId, amount, note?): Promise<TransferResult>;

	// Withdrawal Operations
	async requestWithdrawal(amount, currency, address): Promise<WithdrawalRequest>;

	// Configuration
	async getWalletConfig(): Promise<WalletConfig>;
	async getSupportedCurrencies(): Promise<SupportedCurrency[]>;
}
```

## 📊 Data Structures

### Core Interfaces

```typescript
export interface WalletBalance {
	dgt: {
		balance: number;
		lastTransactionAt: Date | null;
	};
	crypto: CryptoBalance[];
}

export interface CryptoBalance {
	coinId: number;
	coinSymbol: string; // 'ETH', 'BTC', 'USDT'
	chain: string; // 'ethereum', 'bitcoin', 'tron'
	balance: string; // Decimal string for precision
	frozenBalance: string; // Reserved/locked amount
	address: string; // User's deposit address
}

export interface Transaction {
	id: number;
	userId: number;
	fromUserId?: number; // For transfers
	toUserId?: number; // For transfers
	amount: number;
	type: string; // Transaction type (see below)
	status: string; // 'pending', 'completed', 'failed', 'cancelled'
	description: string;
	currency: string; // 'DGT', 'USDT', 'ETH', etc.
	createdAt: string;
	updatedAt: string;
	metadata?: Record<string, any>; // Additional transaction data
}

export interface DepositAddress {
	coinId: number;
	coinSymbol: string; // 'ETH', 'BTC', 'USDT'
	chain: string; // 'ethereum', 'bitcoin', 'tron'
	address: string; // Live CCPayment deposit address
	memo?: string; // Required for some currencies (XRP, EOS)
}

export interface WalletConfig {
	features: {
		allowCryptoWithdrawals: boolean; // Admin-controlled feature gate
		allowCryptoSwaps: boolean; // Future feature
		allowDGTSpending: boolean; // DGT conversion to shop credits
		allowInternalTransfers: boolean; // User-to-user transfers
	};
	dgt: {
		usdPrice: number; // Current DGT price ($0.10)
		minDepositUSD: number; // Minimum deposit amount
		maxDGTBalance: number; // Maximum DGT balance per user
	};
	limits: {
		maxDGTTransfer: number; // Maximum DGT per transfer
	};
}
```

## 🔗 API Endpoints

### Balance & Configuration

#### `GET /api/wallet/balances`

Retrieves current user's DGT and crypto balances.

**Response**:

```typescript
{
  dgt: {
    balance: 1250.75,
    lastTransactionAt: "2024-01-15T10:30:00Z"
  },
  crypto: [
    {
      coinId: 1,
      coinSymbol: "ETH",
      chain: "ethereum",
      balance: "0.5000000",
      frozenBalance: "0.0000000",
      address: "0x742d35Cc..."
    }
  ]
}
```

#### `GET /api/wallet/config`

Retrieves wallet configuration and feature gates.

**Response**:

```typescript
{
  features: {
    allowCryptoWithdrawals: true,
    allowDGTSpending: true,
    allowInternalTransfers: true
  },
  dgt: {
    usdPrice: 0.10,
    minDepositUSD: 1.00,
    maxDGTBalance: 1000000
  },
  limits: {
    maxDGTTransfer: 10000
  }
}
```

### Deposits & Addresses

#### `GET /api/wallet/deposit-addresses`

Retrieves live deposit addresses from CCPayment for all supported cryptocurrencies.

**Response**:

```typescript
[
	{
		coinId: 1,
		coinSymbol: 'ETH',
		chain: 'ethereum',
		address: '0x742d35Cc6aF5002B8eaC57b6b8D25fF32B4D2C9f',
		memo: null
	},
	{
		coinId: 60,
		coinSymbol: 'USDT',
		chain: 'tron',
		address: 'TLPx8gqzxhUPPCj2QGGxLQGQMN6J9T8VhJ',
		memo: '12345678'
	}
];
```

### Transactions

#### `GET /api/wallet/transactions`

Retrieves paginated transaction history with DGT-specific types.

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response**:

```typescript
{
  transactions: [
    {
      id: 123,
      userId: 1,
      amount: 150.50,
      type: "DEPOSIT_CREDIT",
      status: "completed",
      currency: "DGT",
      description: "ETH deposit converted to DGT",
      metadata: {
        originalToken: "ETH",
        originalAmount: "0.1",
        usdtAmount: "150.50",
        conversionRate: 0.10
      },
      createdAt: "2024-01-15T10:30:00Z"
    }
  ],
  total: 45
}
```

### Transfers

#### `POST /api/wallet/transfer-dgt`

Transfers DGT between users with validation.

**Request Body**:

```typescript
{
  toUserId: "user123",    // Recipient user ID
  amount: 100.50,         // DGT amount to transfer
  note?: "Payment for services"  // Optional note (max 200 chars)
}
```

**Response**:

```typescript
{
  transactionId: 124,
  fromBalance: 900.50,     // Sender's new balance
  toBalance: 1100.50,      // Recipient's new balance
  transferId: "tf_abc123"  // Unique transfer identifier
}
```

### Withdrawals

#### `POST /api/wallet/withdraw`

Requests cryptocurrency withdrawal (feature-gated).

**Request Body**:

```typescript
{
  amount: 50.00,          // Amount to withdraw
  currency: "USDT",       // Currency code
  address: "TLPx8gqz..."  // Destination address
}
```

**Response**:

```typescript
{
  withdrawalId: "wd_xyz789",
  status: "pending"       // Will be processed by admin
}
```

## 🎯 Transaction Types

### DGT-Specific Types

The wallet system supports various DGT-specific transaction types:

| Type             | Description                     | Metadata Fields                                                   |
| ---------------- | ------------------------------- | ----------------------------------------------------------------- |
| `DEPOSIT_CREDIT` | Crypto deposit converted to DGT | `originalToken`, `originalAmount`, `usdtAmount`, `conversionRate` |
| `ADMIN_CREDIT`   | Admin manual credit             | `reason`, `adminId`                                               |
| `ADMIN_DEBIT`    | Admin manual debit              | `reason`, `adminId`                                               |
| `TRANSFER`       | User-to-user transfer           | `fromUserId`, `toUserId`, `note`                                  |
| `TIP`            | Forum tipping                   | `threadId`, `postId`, `recipientId`                               |
| `RAIN`           | Airdrop/rain event              | `eventId`, `participantCount`                                     |
| `SHOP`           | Marketplace purchase            | `productId`, `orderId`                                            |
| `XP_BOOST`       | XP boost purchase               | `boostType`, `duration`                                           |

## 🛡️ Error Handling

### API Error Responses

The service handles various error scenarios:

```typescript
// Network errors
{
  error: "NETWORK_ERROR",
  message: "Connection failed",
  retryable: true
}

// Validation errors
{
  error: "VALIDATION_ERROR",
  message: "Invalid transfer amount",
  details: {
    field: "amount",
    reason: "Amount must be positive"
  }
}

// Feature gate errors
{
  error: "FEATURE_DISABLED",
  message: "Crypto withdrawals are currently disabled",
  feature: "allowCryptoWithdrawals"
}

// Insufficient balance
{
  error: "INSUFFICIENT_BALANCE",
  message: "Not enough DGT balance",
  available: 50.25,
  requested: 100.00
}
```

### Error Handling Patterns

```typescript
// Service usage with error handling
try {
	const result = await walletApiService.transferDgt('user123', 100, 'Payment');
	// Handle success
} catch (error) {
	if (error.code === 'INSUFFICIENT_BALANCE') {
		// Show balance error
	} else if (error.code === 'FEATURE_DISABLED') {
		// Show feature disabled message
	} else {
		// Generic error handling
	}
}
```

## 🔧 Configuration

### Environment Variables

```bash
# CCPayment Integration
CCPAYMENT_APP_ID=your_app_id
CCPAYMENT_APP_SECRET=your_secret
CCPAYMENT_BASE_URL=https://api.ccpayment.com

# DGT Configuration
DGT_USD_PRICE=0.10
MIN_DEPOSIT_USD=1.00
MAX_DGT_BALANCE=1000000
MAX_DGT_TRANSFER=10000
```

### API Client Configuration

The service uses the centralized `apiRequest` function from `@/lib/queryClient`:

```typescript
import { apiRequest } from '@/lib/queryClient';

// Example API call
async getBalance(): Promise<WalletBalance> {
  return apiRequest<WalletBalance>({
    url: '/api/wallet/balances',
    method: 'GET'
  });
}
```

## 🔄 Real-time Updates

### React Query Integration

The service integrates with React Query for caching and real-time updates:

```typescript
// Query keys for cache management
const QUERY_KEYS = {
	balance: ['/api/wallet/balances'],
	transactions: ['/api/wallet/transactions'],
	depositAddresses: ['/api/wallet/deposit-addresses'],
	config: ['/api/wallet/config']
};

// Automatic cache invalidation after mutations
queryClient.invalidateQueries({ queryKey: QUERY_KEYS.balance });
```

### Cache Strategy

- **Balance**: 30-second stale time, invalidated on mutations
- **Transactions**: 30-second stale time, invalidated on new transactions
- **Deposit Addresses**: 5-minute stale time (addresses change infrequently)
- **Configuration**: 1-minute stale time (admin changes are rare)

## 🚀 Usage Examples

### Basic Service Usage

```typescript
import { walletApiService } from '@/features/wallet/services/wallet-api.service';

// Get current balance
const balance = await walletApiService.getBalance();
console.log(`DGT Balance: ${balance.dgt.balance}`);

// Transfer DGT
const transfer = await walletApiService.transferDgt('user123', 100.5, 'Payment for services');

// Get transaction history
const history = await walletApiService.getTransactionHistory(1, 20);
```

### Integration with React Hook

```typescript
// In use-wallet.ts
const balanceQuery = useQuery({
	queryKey: ['/api/wallet/balances'],
	queryFn: () => walletApiService.getBalance(),
	staleTime: 30 * 1000
});

const transferMutation = useMutation({
	mutationFn: (params) => walletApiService.transferDgt(params.toUserId, params.amount, params.note),
	onSuccess: () => {
		queryClient.invalidateQueries({ queryKey: ['/api/wallet/balances'] });
		queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
	}
});
```

## 🧪 Testing

### Mock Service

For testing, create a mock implementation:

```typescript
export const mockWalletApiService = {
	async getBalance() {
		return {
			dgt: { balance: 1500.5, lastTransactionAt: new Date() },
			crypto: []
		};
	},

	async transferDgt(toUserId: string, amount: number, note?: string) {
		return {
			transactionId: 123,
			fromBalance: 1400.5,
			toBalance: 100.5,
			transferId: 'test_transfer'
		};
	}

	// ... other mock methods
};
```

### Test Scenarios

1. **Successful operations** - All API calls return expected data
2. **Network failures** - Test retry mechanisms and error handling
3. **Feature gates** - Test disabled state handling
4. **Validation errors** - Test form validation and error messaging
5. **Rate limiting** - Test API rate limit handling

---

This API service provides a robust, type-safe interface to the DegenTalk wallet system with comprehensive error handling, real-time updates, and feature gate integration. It serves as the foundation for all wallet-related frontend operations.
