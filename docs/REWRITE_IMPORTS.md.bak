# Wallet & Engagement Import Rewrite Plan

This document outlines the plan for updating client-side imports to use the new wallet and engagement API structure. This is part of Phase 3 of the wallet refactoring project.

## Import Rewrite Strategy

The main import changes will involve:

1. Replacing old API paths with new domain-based API paths
2. Consolidating wallet functionality into the new structure
3. Updating any components or hooks that directly use wallet-related functionality

## Using the Import Checker Utility

To help with the import rewriting process, a new utility script has been created to detect and fix broken imports. This is especially useful when refactoring code and moving files between directories.

### Running the Import Checker

```bash
# Check for broken imports in the codebase
npm run check:imports

# Check a specific directory
npm run check:imports -- --dir=client/src/features/wallet

# Automatically fix broken imports where possible
npm run fix:imports
```

### What the Utility Does

1. **Scans** TypeScript/JavaScript files for import statements
2. **Validates** that each import can be resolved to an actual file
3. **Reports** any broken imports with line numbers and file paths
4. **Suggests** fixes for broken imports where possible
5. **Applies** fixes automatically when run with the `--fix` flag

### Tips for Using the Import Checker

- Run it after moving files or refactoring code
- Run it before committing changes to catch import issues early
- Use the `--fix` flag to automatically resolve simple cases
- For complex cases, manually update imports based on suggestions

## Client API File Changes

**Old structure:**
```typescript
// client/src/lib/api.ts
export const walletApi = {
  getBalance: () => { ... },
  getTransactions: () => { ... },
  requestDgtPurchase: () => { ... },
  // ...etc
}
```

**New structure:**
```typescript
// client/src/lib/api.ts
export const api = {
  wallet: {
    getBalance: () => { ... },
    getTransactions: () => { ... },
    // ...etc
  },
  engagement: {
    sendTip: () => { ... },
    sendRain: () => { ... },
    // ...etc
  }
}
```

## Component Updates

1. Client components should use the new hooks:
   - `useWallet()` instead of direct API calls
   - `useTip()` for tip functionality
   - `useRain()` for rain functionality

2. Admin components should use the updated admin wallet API endpoints.

## Progress Tracking

As files are updated, mark them in this document:

- [x] client/src/lib/api.ts
- [x] client/src/hooks/use-wallet.ts
- [x] client/src/hooks/use-tip.ts
- [x] client/src/hooks/use-rain.ts
- [x] client/src/components/economy/wallet/wallet-balance.tsx
- [x] client/src/components/economy/wallet/transaction-history.tsx
- [x] client/src/components/economy/wallet/tip-button.tsx
- [x] client/src/components/economy/wallet/rain-button.tsx
- [x] client/src/pages/admin/wallets/index.tsx
- [ ] client/src/pages/wallet.tsx
- [ ] client/src/hooks/use-shop-items.ts
- [ ] ...add more files as needed

## Files to Update

### High Priority

These files directly import and use wallet-related functionality:

| File Path | Current Import | New Import |
|-----------|----------------|------------|
| `client/src/hooks/use-wallet.ts` | `import { walletApi } from '@/lib/api';` | `import { api } from '@/lib/api';` |
| `client/src/hooks/use-wallet-balance.ts` | `import { walletApi } from '@/lib/api';` | `import { api } from '@/lib/api';` |
| `client/src/components/economy/wallet/wallet-balance.tsx` | `import { walletApi } from '@/lib/api';` | `import { api } from '@/lib/api';` |
| `client/src/components/economy/wallet/transaction-history.tsx` | `import { walletApi } from '@/lib/api';` | `import { api } from '@/lib/api';` |
| `client/src/components/economy/wallet/deposit-form.tsx` | `import { walletApi } from '@/lib/api';` | `import { api } from '@/lib/api';` |
| `client/src/pages/wallet.tsx` | `import { walletApi } from '@/lib/api';` | `import { api } from '@/lib/api';` |

### Medium Priority

These files use tip and rain functionality:

| File Path | Current Import | New Import |
|-----------|----------------|------------|
| `client/src/components/economy/wallet/tip-button.tsx` | `import { walletApi } from '@/lib/api';` | `import { api } from '@/lib/api';` |
| `client/src/components/economy/wallet/rain-button.tsx` | `import { walletApi } from '@/lib/api';` | `import { api } from '@/lib/api';` |
| `client/src/hooks/use-tip.ts` | `import { walletApi } from '@/lib/api';` | `import { api } from '@/lib/api';` |
| `client/src/hooks/use-rain.ts` | `import { walletApi } from '@/lib/api';` | `import { api } from '@/lib/api';` |

### Low Priority

These files may have references to wallet-related functionality:

| File Path | Current Import | New Import |
|-----------|----------------|------------|
| `client/src/components/shop/product-card.tsx` | `import { walletApi } from '@/lib/api';` | `import { api } from '@/lib/api';` |
| `client/src/components/layout/wallet-modal.tsx` | `import { walletApi } from '@/lib/api';` | `import { api } from '@/lib/api';` |
| `client/src/components/profile/wallet-widget.tsx` | `import { walletApi } from '@/lib/api';` | `import { api } from '@/lib/api';` |

## Implementation Steps

1. Update `client/src/lib/api.ts` to use the new structure (completed)
2. Update high-priority files first, testing each change to ensure functionality is maintained
3. Update medium-priority files next, focusing on engagement features
4. Update low-priority files last
5. Run comprehensive tests to verify all functionality works as expected

## Method Name Changes

Here are the specific method name changes to be aware of:

| Old Method | New Method |
|------------|------------|
| `walletApi.getBalance()` | `api.wallet.getBalance()` |
| `walletApi.getTransactions()` | `api.wallet.getTransactionHistory()` |
| `walletApi.requestDgtPurchase()` | `api.wallet.requestDgtPurchase()` |
| `walletApi.checkTransactionStatus()` | `api.wallet.checkPurchaseStatus()` |
| `walletApi.getTreasuryAddress()` | `api.wallet.createDepositAddress()` |
| n/a | `api.wallet.transferDGT()` |
| n/a | `api.engagement.sendTip()` |
| n/a | `api.engagement.getTipHistory()` |
| n/a | `api.engagement.sendRain()` |
| n/a | `api.engagement.getRecentRainEvents()` |

## Testing Plan

After each file update:

1. Verify the component renders without errors
2. Test any wallet-related functionality
3. Verify data is correctly retrieved from the API
4. Verify any forms submit data correctly

## Fallback Strategy

If issues arise during the migration:

1. Temporarily maintain backward compatibility in `client/src/lib/api.ts`
2. Address each issue before proceeding with additional updates
3. Only remove backward compatibility once all updates are complete and tested 