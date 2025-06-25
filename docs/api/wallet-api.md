# Wallet & DGT API

The Wallet system manages cryptocurrency deposits, DGT (DegenTalk Token) transactions, and user-to-user transfers through CCPayment integration.

## Base URLs

```
/api/wallet        # Cryptocurrency wallet operations
/api/wallet/dgt    # DGT token operations  
/api/wallet/config # Wallet configuration
```

## Authentication

All wallet endpoints require authentication. Users can only access their own wallet data unless they have admin privileges.

## DGT Token System

DGT (DegenTalk Token) is the platform's native token with a fixed value of **$0.10 USD** per token.

### DGT Sources
- **Crypto Deposits**: Automatic conversion from ETH, BTC, USDT, etc.
- **Admin Credits**: Manual distribution by administrators
- **Tips**: Received from other users
- **Rain Events**: Community reward distributions
- **Shop Purchases**: DGT token packages

### DGT Uses
- **Tipping**: Send DGT to other users
- **Shop Credits**: Convert to purchasable store credits
- **Rain Events**: Distribute to community members
- **Internal Transfers**: Send between platform users

## Data Models

### DGT Balance

```typescript
interface DGTBalance {
  userId: string;
  balance: number;          // Current DGT balance
  lastTransactionAt: Date | null;
  walletId: number;
}
```

### DGT Transaction

```typescript
interface DGTTransaction {
  id: number;
  userId: string;
  amount: number;           // DGT amount (positive = credit, negative = debit)
  type: string;            // Transaction type
  balanceAfter: number;    // Balance after transaction
  metadata: {
    source: 'crypto_deposit' | 'tip_send' | 'tip_receive' | 'rain_send' | 
            'rain_receive' | 'admin_credit' | 'internal_transfer_send' | 
            'internal_transfer_receive' | 'shop_purchase';
    originalToken?: string;     // For crypto deposits (ETH, BTC, etc.)
    usdtAmount?: string;       // Original USDT value
    depositRecordId?: string;  // CCPayment deposit ID
    transferId?: string;       // Internal transfer ID
    reason?: string;           // Human-readable reason
  };
  createdAt: Date;
}
```

### Crypto Balance

```typescript
interface CryptoBalance {
  coinId: number;
  symbol: string;          // BTC, ETH, USDT, etc.
  name: string;
  balance: string;         // String to preserve precision
  availableBalance: string;
  frozenBalance: string;
  depositAddress: string;
  icon?: string;
  networkName?: string;
}
```

### Wallet Configuration

```typescript
interface WalletConfig {
  features: {
    allowCryptoWithdrawals: boolean;
    allowDGTSpending: boolean;
    allowInternalTransfers: boolean;
  };
  dgt: {
    usdPrice: number;        // Current DGT price ($0.10)
    minDepositUSD: number;   // Minimum deposit amount
    maxDGTBalance: number;   // Maximum DGT per user
  };
  limits: {
    maxDGTTransfer: number;  // Maximum DGT per transfer
  };
}
```

## DGT Endpoints

### Get DGT Balance

```http
GET /api/wallet/balances
```

**Response:**

```json
{
  "success": true,
  "data": {
    "dgt": {
      "balance": 1250.50,
      "lastTransactionAt": "2024-01-15T14:30:00Z",
      "walletId": 123
    },
    "crypto": [
      {
        "coinId": 1,
        "symbol": "BTC",
        "name": "Bitcoin",
        "balance": "0.00234567",
        "availableBalance": "0.00234567",
        "frozenBalance": "0.00000000",
        "depositAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
      }
    ]
  }
}
```

### Transfer DGT Between Users

```http
POST /api/wallet/transfer-dgt
```

**Request Body:**

```json
{
  "toUserId": "456",
  "amount": 100.50,
  "note": "Payment for services"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "transactionId": 789,
    "fromBalance": 1150.00,
    "toBalance": 100.50,
    "transferId": "transfer_abc123"
  }
}
```

### Get DGT Transaction History

```http
GET /api/wallet/transactions
```

**Query Parameters:**

- `limit` - Number of transactions (default: 20, max: 100)
- `offset` - Pagination offset
- `type` - Filter by transaction type
- `startDate` - Filter from date (ISO 8601)
- `endDate` - Filter to date (ISO 8601)

**Response:**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": 789,
        "userId": "123",
        "amount": 50.00,
        "type": "DEPOSIT_CREDIT",
        "status": "completed",
        "balanceAfter": 1200.50,
        "metadata": {
          "source": "crypto_deposit",
          "originalToken": "USDT",
          "usdtAmount": "50.00",
          "depositRecordId": "dep_abc123"
        },
        "createdAt": "2024-01-15T14:30:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

## Cryptocurrency Endpoints

### Get Deposit Addresses

Retrieves deposit addresses for all supported cryptocurrencies.

```http
GET /api/wallet/deposit-addresses
```

**Response:**

```json
{
  "success": true,
  "data": {
    "addresses": [
      {
        "coinId": 1,
        "symbol": "BTC",
        "name": "Bitcoin",
        "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        "networkName": "Bitcoin",
        "minDeposit": "0.0001"
      },
      {
        "coinId": 6,
        "symbol": "USDT",
        "name": "Tether USD",
        "address": "0x742d35Cc6C5e5a1e8f1e4e4e4e4e4e4e4e4e4e4e",
        "networkName": "Ethereum",
        "minDeposit": "1.0"
      }
    ]
  }
}
```

### Request Crypto Withdrawal

Initiates a withdrawal to an external blockchain address.

```http
POST /api/wallet/withdraw
```

**Request Body:**

```json
{
  "coinId": 6,
  "amount": "100.00",
  "toAddress": "0x742d35Cc6C5e5a1e8f1e4e4e4e4e4e4e4e4e4e4e",
  "memo": "Withdrawal to external wallet"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "recordId": "withdraw_xyz789",
    "status": "pending",
    "estimatedFee": "2.50",
    "processedAmount": "97.50"
  }
}
```

### Get Supported Cryptocurrencies

```http
GET /api/wallet/supported-coins
```

**Response:**

```json
{
  "success": true,
  "data": {
    "coins": [
      {
        "coinId": 1,
        "symbol": "BTC",
        "name": "Bitcoin",
        "network": "Bitcoin",
        "withdrawalEnabled": true,
        "depositEnabled": true,
        "minWithdrawal": "0.001",
        "maxWithdrawal": "10.0",
        "withdrawalFee": "0.0005"
      }
    ]
  }
}
```

## Wallet Management Endpoints

### Initialize User Wallet

Creates a new wallet for a user with CCPayment integration.

```http
POST /api/wallet/initialize
```

**Response:**

```json
{
  "success": true,
  "data": {
    "ccpaymentUserId": "user_abc123",
    "walletCreated": true,
    "initialBalance": 0
  }
}
```

### Get Wallet Status

```http
GET /api/wallet/status
```

**Response:**

```json
{
  "success": true,
  "data": {
    "hasWallet": true,
    "ccpaymentUserId": "user_abc123",
    "isInitialized": true,
    "features": {
      "withdrawalsEnabled": true,
      "transfersEnabled": true,
      "depositsEnabled": true
    }
  }
}
```

### Get Wallet Configuration

```http
GET /api/wallet/config
```

**Response:**

```json
{
  "success": true,
  "data": {
    "features": {
      "allowCryptoWithdrawals": true,
      "allowDGTSpending": true,
      "allowInternalTransfers": true
    },
    "dgt": {
      "usdPrice": 0.10,
      "minDepositUSD": 5.00,
      "maxDGTBalance": 1000000
    },
    "limits": {
      "maxDGTTransfer": 10000
    }
  }
}
```

## Transaction Types

### DGT Transaction Types

| Type | Description | Direction |
|------|-------------|-----------|
| `DEPOSIT_CREDIT` | Crypto converted to DGT | Credit (+) |
| `TRANSFER_SEND` | DGT sent to another user | Debit (-) |
| `TRANSFER_RECEIVE` | DGT received from user | Credit (+) |
| `TIP_SEND` | DGT tipped to user | Debit (-) |
| `TIP_RECEIVE` | DGT tip received | Credit (+) |
| `RAIN_SEND` | DGT distributed in rain | Debit (-) |
| `RAIN_RECEIVE` | DGT from rain event | Credit (+) |
| `ADMIN_CREDIT` | Admin manual credit | Credit (+) |
| `ADMIN_DEBIT` | Admin manual debit | Debit (-) |
| `SHOP_PURCHASE` | DGT spent in shop | Debit (-) |

### Crypto Transaction Types

| Type | Description |
|------|-------------|
| `deposit` | Incoming blockchain deposit |
| `withdrawal` | Outgoing blockchain withdrawal |
| `swap` | Exchange between cryptocurrencies |
| `transfer` | Internal user-to-user transfer |

## Webhooks

The wallet system supports webhooks for real-time notifications:

### Deposit Webhook

```json
{
  "event": "deposit.completed",
  "userId": "123",
  "data": {
    "recordId": "dep_abc123",
    "coinSymbol": "USDT",
    "amount": "50.00",
    "dgtAwarded": 500.0,
    "conversionRate": 0.10,
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

### Transfer Webhook

```json
{
  "event": "transfer.completed",
  "data": {
    "transferId": "transfer_xyz789",
    "fromUserId": "123",
    "toUserId": "456",
    "amount": 100.0,
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

## Rate Limiting

Wallet endpoints have specific rate limits:

- **Balance queries**: 60 requests/minute
- **Transfer operations**: 10 requests/minute
- **Withdrawal requests**: 5 requests/minute
- **Address generation**: 20 requests/minute

## Security Features

### Transaction Validation

- **Balance checks**: Insufficient funds prevented
- **Limit enforcement**: Daily/per-transaction limits
- **Address validation**: Blockchain address format verification
- **Double-spend prevention**: Atomic database transactions

### Feature Gates

Admins can enable/disable wallet features:

- **Crypto withdrawals**: Block external withdrawals
- **DGT spending**: Disable shop purchases
- **Internal transfers**: Block user-to-user transfers

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `WALLET_NOT_FOUND` | 404 | User wallet not initialized |
| `INSUFFICIENT_BALANCE` | 400 | Not enough DGT/crypto balance |
| `TRANSFER_LIMIT_EXCEEDED` | 400 | Amount exceeds transfer limits |
| `FEATURE_DISABLED` | 403 | Wallet feature disabled by admin |
| `INVALID_ADDRESS` | 400 | Invalid blockchain address |
| `WITHDRAWAL_SUSPENDED` | 403 | User withdrawals suspended |
| `DAILY_LIMIT_REACHED` | 429 | User hit daily limits |

## Integration Examples

### Frontend DGT Transfer

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface TransferDGTRequest {
  toUserId: string;
  amount: number;
  note?: string;
}

function useTransferDGT() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: TransferDGTRequest) => {
      const response = await fetch('/api/wallet/transfer-dgt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Transfer failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refresh balances after successful transfer
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balances'] });
    }
  });
}
```

### Backend Crypto Deposit Handler

```typescript
// Webhook handler for crypto deposits
export async function handleCryptoDeposit(depositData: {
  recordId: string;
  userId: string;
  coinSymbol: string;
  amount: string;
}) {
  // Convert crypto to USDT value
  const usdtValue = await ccpaymentService.convertToUSDT(
    depositData.coinSymbol, 
    depositData.amount
  );
  
  // Convert USDT to DGT (1 USDT = 10 DGT)
  const dgtAmount = parseFloat(usdtValue) * 10;
  
  // Credit user's DGT balance
  await dgtService.creditDGT(depositData.userId, dgtAmount, {
    source: 'crypto_deposit',
    originalToken: depositData.coinSymbol,
    usdtAmount: usdtValue,
    depositRecordId: depositData.recordId
  });
}
```