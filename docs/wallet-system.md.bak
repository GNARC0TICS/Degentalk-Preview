# Wallet System Documentation

## Overview
The Degentalk™™ wallet system provides cryptocurrency functionality for the platform, enabling users to manage DGT points and USDT balances, make transactions, and interact with the platform's economy.

## Components Structure

### Core Components
- **WalletModal** (`client/src/components/economy/wallet-modal-v2.tsx`)
  - Main wallet interface for users with consolidated functionality
  - Provides access to all wallet features through a modular component architecture
  - Supports tab-based navigation for different wallet operations
  - Implements smooth balance animations and transaction feedback

### Wallet Modal Subcomponents
Located in `client/src/components/economy/wallet/`:

- `wallet-balance-display.tsx` - Shows user's current DGT and USDT balances with animations
- `wallet-address-display.tsx` - Displays user's wallet address with copy functionality
- `deposit-button.tsx` - Handles USDT deposits to the wallet
- `withdraw-button.tsx` - Processes withdrawals from the wallet
- `tip-button.tsx` - Allows users to send tips to other users
- `rain-button.tsx` - Enables "making it rain" feature (distributing rewards to active users)
- `buy-dgt-button.tsx` - Facilitates buying DGT with USDT
- `transaction-history.tsx` - Shows a log of user's transaction history

### State Management
- `client/src/hooks/use-wallet-modal.tsx` - Controls wallet modal open/close state
- WalletModalProvider - Context provider for wallet modal state
- useWalletModal - Hook for consuming wallet modal state

### API Integration
- `client/src/lib/api.ts` - Contains all wallet API endpoints:
  - `walletApi.getBalance()` - Fetches user's current balance
  - `walletApi.getTransactions()` - Retrieves transaction history
  - `walletApi.requestDgtPurchase()` - Initiates DGT purchase with USDT
  - `walletApi.checkTransactionStatus()` - Checks status of pending transactions
  - `walletApi.getTreasuryAddress()` - Gets treasury wallet address for deposits

## Transaction Types
```typescript
export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'tip' | 'rain' | 'receive_tip' | 'receive_rain';
  amount: number;
  currency: 'USDT' | 'DGT';
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  from?: string;
  to?: string;
  txHash?: string;
}
```

## Integration Points for External Payment Systems

The wallet system is designed to be easily integrated with external payment processors:

1. **Treasury Address API** - Currently returns mock data but designed to integrate with systems like TronGrid
2. **Buy DGT Functionality** - Prepared for direct integration with ccPayment or similar services
3. **Transaction Status Checking** - Built to handle asynchronous payment processing workflows

## Usage Example
```tsx
// Opening the wallet modal from any component
import { useWalletModal } from '@/hooks/use-wallet-modal';

function MyComponent() {
  const { openWalletModal } = useWalletModal();
  
  return (
    <Button onClick={openWalletModal}>
      Open Wallet
    </Button>
  );
}
```

## Future Integration Plans
The wallet system is prepared for future integration with TronGrid or ccPayment API, with placeholder endpoints and UI components already in place. The integration pathway will involve replacing mock responses with actual API calls to these external services.

For detailed integration plans and timeline, see the comprehensive [Wallet API Integration Plan](./wallet-api-integration-plan.md) which outlines the 5-step approach to integrating with external payment processors:

1. API Provider Selection
2. Secure Key Management
3. Transaction Handling & Verification
4. Error Handling & Recovery
5. Testing & Deployment Strategy