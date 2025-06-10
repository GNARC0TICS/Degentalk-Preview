# CCPayment Integration Module

This module provides a self-contained integration with the CCPayment API for cryptocurrency payments.

## Module Structure

- **ccpayment-client.ts** - Core client for interacting with CCPayment API
- **deposit.ts** - Handling deposit functionality
- **withdraw.ts** - Handling withdrawal functionality
- **types.ts** - Type definitions and interfaces
- **utils.ts** - Helper functions for signatures, formatting, etc.

## Usage

### Setting Up

Make sure environment variables are properly set:

```
CCPAYMENT_API_URL=https://api.ccpayment.com
CCPAYMENT_APP_ID=your_app_id
CCPAYMENT_APP_SECRET=your_app_secret
CCPAYMENT_WHITELISTED_IP=your_server_ip
```

### Creating a Deposit

```typescript
import { createDeposit } from '@payments/ccpayment';

// Create a deposit payment link
const deposit = await createDeposit({
	userId: 123,
	amount: 100,
	currency: 'USDT',
	productName: 'DGT Tokens'
});

// Redirect user to the payment link
window.location.href = deposit.paymentLink;
```

### Creating a Withdrawal

```typescript
import { createWithdrawal, validateWithdrawal } from '@payments/ccpayment';

// Validate withdrawal before processing
const validation = await validateWithdrawal(userId, amount, 'USDT');
if (!validation.isValid) {
	// Show error to user
	console.error(validation.reason);
	return;
}

// Process withdrawal
const withdrawal = await createWithdrawal({
	userId,
	amount,
	currency: 'USDT',
	address: walletAddress
});

// Show confirmation to user
console.log(`Withdrawal ${withdrawal.withdrawalId} created`);
```

### Checking Transaction Status

```typescript
import { checkDepositStatus, checkWithdrawalStatus } from '@payments/ccpayment';

// Check deposit status
const depositStatus = await checkDepositStatus(orderId);
if (depositStatus.isComplete) {
	console.log('Deposit completed!');
}

// Check withdrawal status
const withdrawalStatus = await checkWithdrawalStatus(orderId);
if (withdrawalStatus.isComplete) {
	console.log('Withdrawal completed!');
}
```

## Integration Points

Areas marked with `// TODO: CCPayment logic` indicate places that need to be implemented or updated during the final integration.

## Schema Changes

The schema doesn't require immediate changes since it already has the necessary structure for handling transactions, including:

- `blockchain_tx_id` for storing transaction hashes
- `status` for tracking transaction states (pending, confirmed, failed, etc.)
- `metadata` for storing additional information like CCPayment-specific data

## Next Steps

1. Configure your CCPayment account in the admin panel
2. Set up the API credentials in your environment variables
3. Test deposits with small amounts
4. Deploy and monitor the integration
