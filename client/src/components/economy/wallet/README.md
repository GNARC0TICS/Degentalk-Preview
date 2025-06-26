# 💼 Wallet UI Components

## Overview

This directory contains all user interface components for the Degentalk wallet system. These components provide a complete, feature-rich wallet experience with real-time updates, pending state management, and admin-configurable feature gates.

## 📁 Component Structure

```
client/src/components/economy/wallet/
├── README.md                           # This file
├── wallet-balance-display.tsx          # Primary balance display with pending indicators
├── deposit-button.tsx                  # Crypto deposits with CCPayment integration
├── withdraw-button.tsx                 # Feature-gated crypto withdrawals
├── dgt-transfer.tsx                    # User-to-user DGT transfers
├── transaction-history.tsx             # Enhanced transaction history
├── animated-balance.tsx                # Animated balance changes
├── buy-dgt-button.tsx                  # DGT purchase packages
└── PackagesGrid.tsx                    # DGT package selection UI
```

## 🧩 Component Documentation

### 🏦 WalletBalanceDisplay

**Purpose**: Primary wallet balance display with real-time DGT balance, crypto balances, and pending transaction indicators.

**Features**:

- Animated DGT balance changes with visual feedback
- Secondary crypto balance display with conversion notes
- Pending transaction count with pulsing indicator
- Loading and error states with retry functionality
- Live status indicator

**Props**:

```typescript
interface WalletBalanceDisplayProps {
	balance?: WalletBalance;
	isLoading?: boolean;
	error?: any;
	onRefresh?: () => void;
	className?: string;
	pendingTransactions?: number; // Number of pending transactions
}
```

**Usage**:

```typescript
<WalletBalanceDisplay
  balance={balance}
  isLoading={isLoadingBalance}
  error={balanceError}
  onRefresh={refreshBalance}
  pendingTransactions={pendingCount}
/>
```

---

### 📥 DepositButton

**Purpose**: Cryptocurrency deposit interface with live CCPayment address generation and automatic DGT conversion.

**Features**:

- Real-time deposit address generation from CCPayment
- Multi-cryptocurrency support (ETH, BTC, USDT, etc.)
- Automatic DGT conversion rate display
- Deposit amount tracking and memo fields
- Feature gate integration with disabled states
- QR code support for mobile deposits

**Props**:

```typescript
interface DepositButtonProps {
	variant?: 'default' | 'small';
	className?: string;
	onClick?: () => void;
}
```

**Key Features**:

- Live address refresh from CCPayment API
- Crypto selection with chain information
- Address validation and copy functionality
- Deposit tracking with expected amounts
- Visual feedback for disabled states

---

### 📤 WithdrawButton

**Purpose**: Feature-gated cryptocurrency withdrawal and DGT conversion interface.

**Features**:

- Crypto withdrawal with address validation
- DGT to shop credit conversion
- Feature gate enforcement (allowCryptoWithdrawals, allowDGTSpending)
- Configurable minimum amounts and limits
- Two-tab interface (Crypto/DGT)

**Props**:

```typescript
interface WithdrawButtonProps {
	variant?: 'default' | 'small';
	className?: string;
	onClick?: () => void;
}
```

**Feature Gates**:

- **allowCryptoWithdrawals**: Controls crypto withdrawal availability
- **allowDGTSpending**: Controls DGT conversion to shop credits
- Visual disabled states with explanatory messaging

---

### 💸 DgtTransfer

**Purpose**: User-to-user DGT transfer interface with validation and note support.

**Features**:

- Username validation and user lookup
- Transfer amount validation with limits
- Optional transfer notes (up to 200 characters)
- Real-time balance checking
- Feature gate integration (allowInternalTransfers)
- Comprehensive error handling

**Props**:

```typescript
interface DgtTransferProps {
	className?: string;
}
```

**Validation Rules**:

- Minimum transfer: 1 DGT
- Maximum transfer: Configurable via walletConfig.limits.maxDGTTransfer
- Balance verification before transfer
- Username existence validation

---

### 📋 TransactionHistory

**Purpose**: Enhanced transaction history with DGT-specific types, filtering, and pending state management.

**Features**:

- DGT-specific transaction types (DEPOSIT_CREDIT, ADMIN_CREDIT, TRANSFER, etc.)
- Advanced filtering (All, DGT, Crypto, Transfers, Pending)
- Pending transaction highlighting with animations
- Detailed transaction metadata display
- Refresh functionality with loading states

**Props**:

```typescript
interface TransactionHistoryProps {
	history: Transaction[];
	isLoading: boolean;
	error?: any;
	onRefresh?: () => void;
}
```

**Transaction Types Supported**:

- `DEPOSIT_CREDIT`: Crypto deposits converted to DGT
- `ADMIN_CREDIT/DEBIT`: Admin adjustments
- `TRANSFER`: User-to-user transfers
- `TIP`: Tipping transactions
- `RAIN`: Rain/airdrop events
- `SHOP`: Marketplace purchases

---

### 🎯 AnimatedBalance

**Purpose**: Smooth balance animation component with change highlighting.

**Features**:

- Smooth number transitions with easing
- Color-coded change indicators (green up, red down)
- Configurable decimal places and formatting
- Scale animation on value changes
- Locale-aware number formatting

**Props**:

```typescript
interface AnimatedBalanceProps {
	value: number;
	prefix?: string;
	suffix?: string;
	decimalPlaces?: number;
	className?: string;
	highlightChange?: boolean;
}
```

---

### 🛒 BuyDgtButton & PackagesGrid

**Purpose**: DGT purchase interface with package selection and payment processing.

**Features**:

- Pre-configured DGT packages with pricing
- Payment method selection
- Package benefits display
- Integration with payment processors

## 🎨 Styling & Theming

### CSS Classes

All components use consistent styling with these key patterns:

```css
/* Component containers */
.bg-black/30 rounded-lg border border-zinc-800 shadow-lg

/* Primary actions */
.bg-gradient-to-r from-emerald-500 to-cyan-500

/* Feature-gated disabled states */
.text-red-400 opacity-50 cursor-not-allowed

/* Pending transaction indicators */
.animate-pulse border-amber-600/50 bg-amber-900/20
```

### Animation Classes

Located in `client/src/styles/wallet-animations.css`:

- `.balance-increase` / `.balance-decrease` - Balance change feedback
- `.animate-float` - Pending transaction floating effect
- `.fade-in-up` - Component entrance animations
- `.shimmer` - Loading skeleton effect
- `.transfer-pulse` - Transfer action feedback

## 🔒 Feature Gates Integration

All components respect admin-configured feature gates:

```typescript
// Example feature gate usage
const { walletConfig } = useWallet();
const canWithdraw = walletConfig?.features?.allowCryptoWithdrawals ?? false;

// UI adaptation
{canWithdraw ? (
  <WithdrawButton />
) : (
  <div className="text-red-400">
    <Lock className="h-4 w-4 mr-1" />
    Withdrawals are currently disabled
  </div>
)}
```

### Available Feature Gates

- `allowCryptoWithdrawals` - Controls crypto withdrawal functionality
- `allowCryptoSwaps` - Controls crypto-to-crypto swapping (future)
- `allowDGTSpending` - Controls DGT spending/conversion
- `allowInternalTransfers` - Controls user-to-user DGT transfers

## 🚨 Error Handling

### Error States

All components implement consistent error handling:

1. **Network Errors**: Automatic retry with user feedback
2. **Validation Errors**: Inline form validation with helpful messages
3. **Feature Disabled**: Clear messaging when features are disabled
4. **Loading States**: Skeleton loading and spinner indicators

### Toast Notifications

Components use the toast system for user feedback:

```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

toast({
	title: 'Transfer Complete',
	description: 'Your DGT transfer was successful',
	variant: 'success'
});
```

## 🧪 Testing Considerations

### Component Testing

Each component should be tested for:

- **Feature gate states** (enabled/disabled)
- **Loading and error states**
- **Form validation and submission**
- **Real-time data updates**
- **Animation and visual feedback**

### Mock Data

Use these patterns for testing:

```typescript
// Mock wallet balance
const mockBalance = {
	dgt: { balance: 1500.5, lastTransactionAt: new Date() },
	crypto: [{ coinSymbol: 'ETH', chain: 'ethereum', balance: '0.5', address: '0x...' }]
};

// Mock transactions
const mockTransactions = [
	{
		id: 1,
		type: 'DEPOSIT_CREDIT',
		amount: 100,
		status: 'completed',
		currency: 'DGT',
		createdAt: new Date().toISOString()
	}
];
```

## 🔄 Real-time Updates

### React Query Integration

Components automatically receive real-time updates via React Query:

```typescript
// Automatic cache invalidation on mutations
queryClient.invalidateQueries({ queryKey: ['/api/wallet/balances'] });
queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
```

### WebSocket Integration (Future)

Components are structured to easily integrate WebSocket updates for:

- Real-time balance changes
- Instant transaction notifications
- Live deposit confirmations

---

## 🚀 Development Guidelines

### Adding New Components

1. Follow the established component structure and naming conventions
2. Implement feature gate integration from the start
3. Include proper TypeScript interfaces
4. Add loading, error, and disabled states
5. Include comprehensive error handling
6. Add animations for better user experience

### Component Communication

- Use the `useWallet` hook for all wallet data
- Emit events via React Query mutations
- Use toast notifications for user feedback
- Maintain component isolation and reusability

### Performance Considerations

- Lazy load complex components when needed
- Optimize re-renders with React.memo where appropriate
- Use skeleton loading for better perceived performance
- Implement proper cleanup for subscriptions and timers

This component library provides a complete, production-ready wallet interface that adapts to admin configuration and provides excellent user experience with real-time updates and comprehensive error handling.
