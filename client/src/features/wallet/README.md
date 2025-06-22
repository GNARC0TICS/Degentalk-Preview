# 💳 DegenTalk Wallet System - Frontend Integration

## Overview

The DegenTalk Wallet System provides a complete DGT token economy with cryptocurrency deposit integration, user-to-user transfers, and comprehensive transaction management. This frontend implementation connects to the backend DGT wallet system with real-time updates and feature gate integration.

## 🏗️ Architecture

### Core Components

```
client/src/features/wallet/
├── services/
│   └── wallet-api.service.ts     # Central API service for all wallet operations
├── hooks/
│   └── use-wallet.ts             # Main wallet hook with React Query integration
└── components/                   # UI components (located in client/src/components/economy/wallet/)
    ├── wallet-balance-display.tsx    # DGT balance with pending transaction indicators
    ├── deposit-button.tsx            # Crypto deposit with CCPayment integration
    ├── withdraw-button.tsx           # Feature-gated crypto withdrawals
    ├── dgt-transfer.tsx             # User-to-user DGT transfers
    ├── transaction-history.tsx      # Transaction history with DGT-specific types
    └── animated-balance.tsx         # Animated balance changes with visual feedback
```

### Pages Integration

```
client/src/pages/
└── wallet.tsx                   # Main wallet page with tab-based interface
```

## 🔧 Key Features

### 1. **Real-time Balance Display**

- Primary DGT balance with animated changes
- Secondary crypto balances (auto-converted to DGT)
- Pending transaction indicators with live counts
- Feature gate integration for disabled functions

### 2. **Crypto Deposits (CCPayment Integration)**

- Live deposit addresses from CCPayment v2 API
- Multi-cryptocurrency support (ETH, BTC, USDT, etc.)
- Automatic conversion to DGT at $0.10 per token
- Real-time deposit tracking and notifications
- Minimum deposit validation

### 3. **DGT Transfers**

- User-to-user DGT transfers with username validation
- Configurable transfer limits and minimum amounts
- Optional notes and transfer history
- Feature gate integration (allowInternalTransfers)

### 4. **Transaction History**

- DGT-specific transaction types (DEPOSIT_CREDIT, ADMIN_CREDIT, TRANSFER, etc.)
- Enhanced filtering (DGT, Crypto, Transfers, Pending)
- Visual indicators for pending transactions
- Detailed transaction metadata and descriptions

### 5. **Feature Gates & Configuration**

- Admin-configurable wallet features
- Dynamic UI based on feature availability
- Visual disabled states with explanatory messaging
- Configurable limits and pricing

### 6. **Withdrawals (Feature-Gated)**

- Crypto withdrawal requests with address validation
- DGT to shop credit conversion
- Feature gates for crypto withdrawals and DGT spending
- Configurable minimum amounts and limits

## 🔗 API Integration

### Core Endpoints

| Endpoint                        | Method | Purpose                                    |
| ------------------------------- | ------ | ------------------------------------------ |
| `/api/wallet/balances`          | GET    | Get DGT and crypto balances                |
| `/api/wallet/deposit-addresses` | GET    | Get live CCPayment deposit addresses       |
| `/api/wallet/transactions`      | GET    | Get transaction history with pagination    |
| `/api/wallet/transfer-dgt`      | POST   | Transfer DGT between users                 |
| `/api/wallet/config`            | GET    | Get wallet configuration and feature gates |
| `/api/wallet/withdraw`          | POST   | Request crypto withdrawal                  |

### Data Structures

```typescript
interface WalletBalance {
	dgt: {
		balance: number;
		lastTransactionAt: Date | null;
	};
	crypto: CryptoBalance[];
}

interface Transaction {
	id: number;
	userId: number;
	amount: number;
	type: string; // DEPOSIT_CREDIT, ADMIN_CREDIT, TRANSFER, etc.
	status: string; // pending, completed, failed
	currency: string;
	description: string;
	metadata?: Record<string, any>;
	createdAt: string;
}

interface WalletConfig {
	features: {
		allowCryptoWithdrawals: boolean;
		allowDGTSpending: boolean;
		allowInternalTransfers: boolean;
	};
	dgt: {
		usdPrice: number; // $0.10
		minDepositUSD: number;
		maxDGTBalance: number;
	};
	limits: {
		maxDGTTransfer: number;
	};
}
```

## 🎯 Usage Guide

### Basic Wallet Hook Usage

```typescript
import { useWallet } from '@/hooks/use-wallet';

function MyComponent() {
  const {
    // Data
    balance,
    transactions,
    depositAddresses,
    walletConfig,

    // Loading States
    isLoadingBalance,
    isLoadingTransactions,

    // Actions
    transferDgt,
    refreshBalance,
    refreshTransactions
  } = useWallet();

  // Transfer DGT example
  const handleTransfer = async () => {
    await transferDgt({
      toUserId: 'user123',
      amount: 100,
      note: 'Payment for services'
    });
  };

  return (
    <div>
      <h2>DGT Balance: {balance?.dgt?.balance || 0}</h2>
      {/* Your UI here */}
    </div>
  );
}
```

### Component Integration

```typescript
import { WalletBalanceDisplay } from '@/components/economy/wallet/wallet-balance-display';
import { DgtTransfer } from '@/components/economy/wallet/dgt-transfer';

function WalletPage() {
  const { balance, transactions } = useWallet();

  const pendingCount = transactions.filter(tx =>
    tx.status === 'pending' || tx.status === 'processing'
  ).length;

  return (
    <div>
      <WalletBalanceDisplay
        balance={balance}
        pendingTransactions={pendingCount}
      />
      <DgtTransfer />
    </div>
  );
}
```

## 🎨 Styling & Animations

### CSS Animations

Located in `client/src/styles/wallet-animations.css`:

- **Balance Changes**: Animated balance updates with color-coded feedback
- **Pending States**: Floating animations for pending transactions
- **Loading Effects**: Shimmer loading for data fetching
- **Button Feedback**: Click animations and hover effects

### Key Animation Classes

- `.balance-increase` / `.balance-decrease` - Balance change animations
- `.animate-float` - Floating animation for pending transactions
- `.fade-in-up` - Smooth component loading
- `.shimmer` - Loading skeleton effect

## 🛡️ Security & Validation

### Input Validation

- Amount validation (positive numbers, decimal places)
- Address validation for withdrawals
- Username validation for transfers
- Feature gate enforcement

### Error Handling

- Network error recovery with retry mechanisms
- User-friendly error messages
- Toast notifications for all actions
- Graceful degradation when features are disabled

## 🔧 Configuration

### Environment Variables

```bash
# CCPayment Integration (if using)
CCPAYMENT_APP_ID=your_app_id
CCPAYMENT_APP_SECRET=your_app_secret

# DGT Configuration
DGT_USD_PRICE=0.10
MIN_DEPOSIT_USD=1.00
```

### Feature Gates

Controlled via admin panel and wallet configuration:

```typescript
// Example configuration
{
  features: {
    allowCryptoWithdrawals: true,    // Enable crypto withdrawals
    allowDGTSpending: true,          // Enable DGT spending/conversion
    allowInternalTransfers: true     // Enable user-to-user transfers
  },
  limits: {
    maxDGTTransfer: 10000           // Maximum DGT per transfer
  }
}
```

## 🧪 Development & Testing

### Local Development

1. Ensure backend wallet system is running
2. Configure CCPayment credentials (or use sandbox)
3. Seed test data with `npm run seed:all`
4. Navigate to `/wallet` to test all features

### Testing Features

- **Deposits**: Use CCPayment sandbox for testing
- **Transfers**: Create test users and transfer between them
- **Feature Gates**: Toggle features in admin panel
- **Pending States**: Simulate pending transactions for UI testing

## 📝 Common Tasks

### Adding New Transaction Types

1. Update transaction type detection in `getTransactionIcon()`
2. Add new transaction descriptions in `formatTransactionDescription()`
3. Update filtering logic if needed
4. Add corresponding backend transaction creation

### Extending Wallet Features

1. Add new API endpoint in `wallet-api.service.ts`
2. Create React Query mutation/query in `use-wallet.ts`
3. Build UI component with feature gate integration
4. Add to wallet page tabs if needed

### Customizing Animations

1. Add new CSS animations to `wallet-animations.css`
2. Import and apply classes in components
3. Consider performance impact of complex animations
4. Test across different devices and browsers

## 🐛 Troubleshooting

### Common Issues

1. **Balance not updating**: Check React Query cache invalidation
2. **Deposit addresses not loading**: Verify CCPayment configuration
3. **Feature gates not working**: Check admin configuration sync
4. **Transaction history empty**: Verify API endpoint and data structure

### Debug Tools

- React Query DevTools for cache inspection
- Browser network tab for API debugging
- Console logs for wallet state changes
- Admin panel for feature gate configuration

---

This wallet system provides a complete DGT token economy with real-time updates, comprehensive transaction management, and seamless user experience. For backend integration details, see the server-side wallet documentation.
