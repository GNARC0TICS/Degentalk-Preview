# Wallet System API

## Legend
| Symbol | Meaning | | Abbrev | Meaning |
|--------|---------|---|--------|---------|
| → | leads to | | DGT | Degentalk Token |
| 💰 | financial | | tx | transaction |
| 🔒 | auth required | | addr | address |
| ⚠️ | admin only | | min | minimum |

## Overview

Complete DGT token economy w/ CCPayment crypto integration, user transfers & comprehensive transaction management.

**Base Path:** `/api/wallet`

## Wallet Initialization

### Initialize User Wallet 🔒
```http
POST /api/wallet/initialize
```

**Headers:** `Cookie: connect.sid=<session>`

**Response:**
```json
{
  "success": true,
  "data": {
    "walletId": "wallet_abc123",
    "userId": 123,
    "dgtBalance": 0.00,
    "cryptoBalances": {
      "BTC": 0.00000000,
      "ETH": 0.000000000000000000,
      "USDT": 0.00
    },
    "depositAddresses": {
      "BTC": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      "ETH": "0x742d35Cc6634C0532925a3b8D321140A5b8fE899",
      "USDT": "0x742d35Cc6634C0532925a3b8D321140A5b8fE899"
    },
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### Get Wallet Status 🔒
```http
GET /api/wallet/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "initialized": true,
    "walletId": "wallet_abc123",
    "kycStatus": "verified",
    "restrictions": [],
    "lastActivity": "2025-01-01T12:00:00Z"
  }
}
```

## Balance Management

### Get Balances 🔒
```http
GET /api/wallet/balances
```

**Headers:** `Cookie: connect.sid=<session>`

**Response:**
```json
{
  "success": true,
  "data": {
    "dgt": {
      "balance": 1500.50,
      "pendingDeposits": 25.00,
      "pendingWithdrawals": 0.00,
      "lockedBalance": 100.00,
      "availableBalance": 1425.50
    },
    "crypto": {
      "BTC": {
        "balance": 0.00125000,
        "usdValue": 62.50,
        "dgtEquivalent": 625.00,
        "pendingDeposits": 0.00000000
      },
      "ETH": {
        "balance": 0.025000000000000000,
        "usdValue": 87.50,
        "dgtEquivalent": 875.00,
        "pendingDeposits": 0.000000000000000000
      },
      "USDT": {
        "balance": 250.00,
        "usdValue": 250.00,
        "dgtEquivalent": 2500.00,
        "pendingDeposits": 0.00
      }
    },
    "totals": {
      "usdValue": 1900.00,
      "dgtEquivalent": 19000.00,
      "pendingTransactions": 3
    },
    "lastUpdated": "2025-01-01T12:00:00Z"
  }
}
```

## Crypto Deposits

### Get Deposit Addresses 🔒
```http
GET /api/wallet/deposit-addresses
```

**Response:**
```json
{
  "success": true,
  "data": {
    "addresses": {
      "BTC": {
        "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        "qrCode": "data:image/png;base64,iVBOR...",
        "network": "bitcoin",
        "confirmations": 1
      },
      "ETH": {
        "address": "0x742d35Cc6634C0532925a3b8D321140A5b8fE899",
        "qrCode": "data:image/png;base64,iVBOR...",
        "network": "ethereum",
        "confirmations": 12
      },
      "USDT": {
        "address": "0x742d35Cc6634C0532925a3b8D321140A5b8fE899",
        "qrCode": "data:image/png;base64,iVBOR...",
        "network": "ethereum",
        "tokenType": "ERC20",
        "confirmations": 12
      }
    },
    "conversionRate": {
      "dgtUsdPrice": 0.10,
      "minDepositUsd": 10.00
    },
    "processingInfo": {
      "averageTime": "10-30 minutes",
      "maxTime": "2 hours",
      "supportedNetworks": ["bitcoin", "ethereum"]
    }
  }
}
```

### Deposit Status 🔒
```http
GET /api/wallet/deposits/:txHash
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deposit": {
      "txHash": "0x1234567890abcdef...",
      "status": "processing",
      "coin": "ETH",
      "amount": 0.025,
      "usdValue": 87.50,
      "dgtAmount": 875.00,
      "confirmations": 8,
      "requiredConfirmations": 12,
      "estimatedCompletion": "2025-01-01T12:30:00Z",
      "createdAt": "2025-01-01T12:15:00Z"
    }
  }
}
```

## DGT Transfers

### Transfer DGT to User 🔒
```http
POST /api/wallet/transfer-dgt
```

**Headers:** `Cookie: connect.sid=<session>`

**Body:**
```json
{
  "toUserId": 456,
  "amount": 100.50,
  "note": "Payment for analysis"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transferId": "transfer_def456",
    "fromUserId": 123,
    "toUserId": 456,
    "amount": 100.50,
    "note": "Payment for analysis",
    "fee": 0.00,
    "status": "completed",
    "balanceAfter": 1425.00,
    "recipientNotified": true,
    "createdAt": "2025-01-01T12:00:00Z"
  }
}
```

**Validation:**
- Min transfer: 1.00 DGT
- Max transfer: 10,000 DGT (configurable)
- Rate limit: 10 transfers per hour
- Note max length: 200 characters

### Transfer History 🔒
```http
GET /api/wallet/transfers
```

**Query Parameters:**
```
type=sent           # Filter: sent|received|all
limit=20           # Results per page
offset=0           # Pagination
dateFrom=2025-01-01 # Date range
dateTo=2025-01-31   # Date range
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transfers": [
      {
        "id": "transfer_def456",
        "type": "sent",
        "counterparty": {
          "id": 456,
          "username": "trader99",
          "avatar": "https://cdn.degentalk.com/avatars/456.jpg"
        },
        "amount": 100.50,
        "note": "Payment for analysis",
        "status": "completed",
        "createdAt": "2025-01-01T12:00:00Z"
      }
    ]
  },
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0
  }
}
```

## Crypto Withdrawals

### Request Withdrawal 🔒
```http
POST /api/wallet/withdraw
```

**Body:**
```json
{
  "coin": "BTC",
  "amount": 0.001,
  "toAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "note": "Withdrawal to cold storage"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "withdrawalId": "withdrawal_ghi789",
    "coin": "BTC",
    "amount": 0.001,
    "fee": 0.0001,
    "netAmount": 0.0009,
    "toAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "status": "pending_approval",
    "estimatedProcessing": "1-24 hours",
    "requiresApproval": true,
    "createdAt": "2025-01-01T12:00:00Z"
  }
}
```

**Admin Approval Required**

### Withdrawal Status 🔒
```http
GET /api/wallet/withdrawals/:withdrawalId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "withdrawal": {
      "id": "withdrawal_ghi789",
      "status": "approved",
      "coin": "BTC",
      "amount": 0.001,
      "fee": 0.0001,
      "txHash": "abc123def456...",
      "approvedBy": "admin",
      "approvedAt": "2025-01-01T13:00:00Z",
      "processedAt": "2025-01-01T13:30:00Z"
    }
  }
}
```

## Transaction History

### Get Transactions 🔒
```http
GET /api/wallet/transactions
```

**Query Parameters:**
```
type=all              # Filter: all|deposit|withdrawal|transfer|tip|rain|shop
status=all            # Filter: all|pending|completed|failed
coin=all              # Filter: all|DGT|BTC|ETH|USDT
limit=50              # Results per page (max 100)
offset=0              # Pagination
dateFrom=2025-01-01   # Date range
dateTo=2025-01-31     # Date range
sort=newest           # Sort: newest|oldest|amount
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "tx_abc123",
        "type": "DEPOSIT_CREDIT",
        "status": "completed",
        "amount": 875.00,
        "coin": "DGT",
        "fee": 0.00,
        "description": "Crypto deposit conversion (ETH → DGT)",
        "metadata": {
          "originalCoin": "ETH",
          "originalAmount": 0.025,
          "conversionRate": 35000.00,
          "txHash": "0x1234567890abcdef..."
        },
        "balanceAfter": 2300.50,
        "createdAt": "2025-01-01T12:00:00Z",
        "completedAt": "2025-01-01T12:15:00Z"
      },
      {
        "id": "tx_def456",
        "type": "TRANSFER",
        "status": "completed",
        "amount": -100.50,
        "coin": "DGT",
        "counterparty": {
          "id": 456,
          "username": "trader99"
        },
        "description": "Transfer to trader99",
        "note": "Payment for analysis",
        "balanceAfter": 2200.00,
        "createdAt": "2025-01-01T11:00:00Z"
      },
      {
        "id": "tx_ghi789",
        "type": "TIP",
        "status": "completed",
        "amount": -25.00,
        "coin": "DGT",
        "metadata": {
          "threadId": "th_abc123",
          "threadTitle": "Bitcoin Analysis",
          "recipientId": 789,
          "recipientUsername": "cryptoking"
        },
        "description": "Tip on thread: Bitcoin Analysis",
        "balanceAfter": 2175.00,
        "createdAt": "2025-01-01T10:30:00Z"
      }
    ]
  },
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0
  },
  "summary": {
    "totalDeposits": 5000.00,
    "totalWithdrawals": 500.00,
    "totalTransfers": 1200.00,
    "totalTips": 300.00,
    "netBalance": 1500.50
  }
}
```

### Transaction Details 🔒
```http
GET /api/wallet/transactions/:txId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "tx_abc123",
      "type": "DEPOSIT_CREDIT",
      "status": "completed",
      "amount": 875.00,
      "coin": "DGT",
      "fee": 0.00,
      "description": "Crypto deposit conversion (ETH → DGT)",
      "metadata": {
        "originalCoin": "ETH",
        "originalAmount": 0.025,
        "conversionRate": 35000.00,
        "txHash": "0x1234567890abcdef...",
        "blockHeight": 18500000,
        "confirmations": 15,
        "networkFee": 0.001234
      },
      "balanceBefore": 1425.50,
      "balanceAfter": 2300.50,
      "createdAt": "2025-01-01T12:00:00Z",
      "completedAt": "2025-01-01T12:15:00Z",
      "auditLog": [
        {
          "timestamp": "2025-01-01T12:00:00Z",
          "status": "pending",
          "note": "Deposit detected on blockchain"
        },
        {
          "timestamp": "2025-01-01T12:15:00Z",
          "status": "completed",
          "note": "DGT credited to account"
        }
      ]
    }
  }
}
```

## Wallet Configuration

### Get Wallet Config 🔒
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
      "allowInternalTransfers": true,
      "allowCryptoDeposits": true
    },
    "dgt": {
      "usdPrice": 0.10,
      "minDepositUSD": 10.00,
      "maxDGTBalance": 1000000.00,
      "conversionEnabled": true
    },
    "limits": {
      "maxDGTTransfer": 10000.00,
      "maxDailyTransfers": 50000.00,
      "withdrawalMinimums": {
        "BTC": 0.0001,
        "ETH": 0.001,
        "USDT": 10.00
      },
      "withdrawalFees": {
        "BTC": 0.0001,
        "ETH": 0.002,
        "USDT": 5.00
      }
    },
    "supportedCoins": [
      {
        "symbol": "BTC",
        "name": "Bitcoin",
        "network": "bitcoin",
        "decimals": 8,
        "enabled": true
      },
      {
        "symbol": "ETH",
        "name": "Ethereum",
        "network": "ethereum",
        "decimals": 18,
        "enabled": true
      },
      {
        "symbol": "USDT",
        "name": "Tether USD",
        "network": "ethereum",
        "tokenType": "ERC20",
        "decimals": 6,
        "enabled": true
      }
    ]
  }
}
```

### Get Supported Coins
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
        "symbol": "BTC",
        "name": "Bitcoin",
        "network": "bitcoin",
        "decimals": 8,
        "minDeposit": 0.0001,
        "withdrawalFee": 0.0001,
        "currentPrice": 50000.00,
        "enabled": true
      }
    ]
  }
}
```

## Admin Features ⚠️

### Get All Wallets
```http
GET /api/wallet/admin/wallets
```

**Permissions:** Admin only

**Query Parameters:**
```
userId=123          # Filter by user
status=active       # Filter by status
limit=50           # Results per page
```

### Manual Balance Adjustment
```http
POST /api/wallet/admin/adjust-balance
```

**Body:**
```json
{
  "userId": 123,
  "coin": "DGT",
  "amount": 100.00,
  "type": "credit",
  "reason": "Compensation for system error",
  "notifyUser": true
}
```

### Approve Withdrawal
```http
PATCH /api/wallet/admin/withdrawals/:withdrawalId/approve
```

**Body:**
```json
{
  "approved": true,
  "note": "Verified withdrawal request"
}
```

## Rate Limiting & Security

### Rate Limits
- **Balance checks:** 100 per minute per user
- **Transfers:** 10 per hour per user
- **Withdrawals:** 5 per day per user
- **Deposit address requests:** 10 per hour per user

### Security Features
- **Multi-signature** withdrawal approvals
- **IP whitelisting** for withdrawals
- **2FA verification** (future)
- **Audit logging** for all transactions
- **Real-time monitoring** for suspicious activity

### Validation Rules
- **DGT amounts:** 2 decimal places max
- **Crypto amounts:** Network-specific precision
- **Address validation:** Network-specific format
- **Transfer limits:** Configurable per user level

## Webhook Integration

### Deposit Notifications
```http
POST /api/webhook/ccpayment/deposit
```

**CCPayment → Degentalk webhook**

### Balance Updates
Real-time balance updates via WebSocket:

```javascript
ws.on('balance_update', (data) => {
  console.log('Balance updated:', data);
  // {
  //   userId: 123,
  //   coin: 'DGT',
  //   newBalance: 1500.50,
  //   change: +100.00,
  //   reason: 'transfer_received'
  // }
});
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `WALLET_001` | Wallet not initialized | User wallet not created |
| `WALLET_002` | Insufficient balance | Not enough funds |
| `WALLET_003` | Invalid amount | Amount validation failed |
| `WALLET_004` | Transfer limit exceeded | Daily/per-transfer limit |
| `WALLET_005` | Invalid address | Crypto address invalid |
| `WALLET_006` | Withdrawal disabled | Feature disabled by admin |
| `WALLET_007` | Pending transaction | Operation blocked by pending tx |
| `WALLET_008` | User not found | Invalid recipient user |

## Integration Examples

### React Hook
```typescript
import { useWallet } from '@/hooks/use-wallet';

function WalletComponent() {
  const {
    balance,
    transactions,
    transferDgt,
    isLoading
  } = useWallet();

  const handleTransfer = async (toUserId: number, amount: number) => {
    try {
      await transferDgt({
        toUserId,
        amount,
        note: 'Payment'
      });
      toast.success('Transfer successful!');
    } catch (error) {
      toast.error('Transfer failed');
    }
  };

  return (
    <div>
      <p>DGT Balance: {balance?.dgt?.availableBalance}</p>
      <TransferForm onSubmit={handleTransfer} />
    </div>
  );
}
```

### Balance Display Component
```typescript
function BalanceDisplay({ balance, pendingCount }: Props) {
  return (
    <div className="wallet-balance">
      <div className="primary-balance">
        {balance.dgt.balance.toFixed(2)} DGT
      </div>
      {pendingCount > 0 && (
        <div className="pending-indicator">
          {pendingCount} pending
        </div>
      )}
    </div>
  );
}
```

---

**📚 Documentation:** `/docs/api/wallet/README.md`

**Related:**
- [CCPayment Integration](../webhooks/ccpayment.md)
- [Admin Wallet Management](../admin/wallet.md)
- [Transaction Monitoring](../admin/transactions.md)