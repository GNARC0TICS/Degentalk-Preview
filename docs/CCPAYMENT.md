# CCPayment Migration Guide

## Overview

This document outlines the migration from our Tron-based wallet system (TronWeb/TronGrid API) to CCPayment. The migration is necessary to simplify our payment processing, reduce maintenance overhead, and provide a more reliable payment experience for users.

## Analysis of Current System

### Current Architecture

The current system uses TronWeb and TronGrid API to interact with the Tron blockchain for:

1. **User wallets**: Creating and managing on-chain wallets for users
2. **Deposits**: Processing USDT deposits to our treasury wallet
3. **Withdrawals**: Processing USDT withdrawals from our treasury wallet to user wallets
4. **Tipping**: Direct user-to-user transfers of tokens

### Key Issues with Current System

1. **Security Risks**: Managing private keys server-side increases attack surface
2. **Complex Infrastructure**: Maintaining blockchain nodes and handling chain reorganizations
3. **API Rate Limiting**: TronGrid API has rate limits that can affect service availability
4. **High Maintenance**: Requires ongoing updates to handle blockchain protocol changes
5. **Technical Overhead**: Developers need blockchain expertise to maintain the system

## CCPayment Integration

### CCPayment Benefits

1. **Simplified Integration**: No need to manage blockchain directly
2. **Reduced Security Risk**: No private key management on our servers
3. **Multiple Payment Options**: Support for multiple cryptocurrencies
4. **Built-in Compliance**: CCPayment handles regulatory requirements
5. **Webhooks & Notifications**: Real-time payment updates

### Migration Strategy

#### Phase 1: Initial Cleanup (Current Sprint)

- [x] Remove all TronWeb dependencies and code
- [x] Archive Tron-related files
- [x] Create CCPayment client service
- [x] Set up placeholder API endpoints for CCPayment
- [x] Document integration points and migration plan

#### Phase 2: CCPayment Integration (Next Sprint)

- [ ] Set up CCPayment account and get credentials
- [ ] Configure webhooks and notification endpoints
- [ ] Implement deposit flow with CCPayment
- [ ] Implement withdrawal flow with CCPayment
- [ ] Update user interfaces for new payment flow
- [ ] Test integration in staging environment

#### Phase 3: Tipping System Migration (Future Sprint)

- [ ] Evaluate CCPayment's support for direct user-to-user transfers
- [ ] If supported, integrate with CCPayment's transfer API
- [ ] If not supported, implement internal ledger for tipping with periodic settlement
- [ ] Update frontend to use new tipping system

## Integration Points

### Core Components to Update

1. **Wallet Service**: 
   - Replace TronWeb with CCPayment client
   - Update balance checking to use CCPayment API
   - Remove private key management

2. **Deposit Flow**:
   - Replace TronGrid deposit detection with CCPayment webhook handling
   - Update frontend to use CCPayment checkout page

3. **Withdrawal Flow**:
   - Replace TronWeb withdrawal with CCPayment API
   - Update balance handling to reflect CCPayment status

4. **Tipping System**:
   - Either integrate with CCPayment's transfer API or implement internal ledger

### API Endpoints

New endpoints have been created:

- **POST /api/ccpayment/deposit**: Create a deposit link for users
- **POST /api/ccpayment/withdraw**: Process withdrawal requests
- **GET /api/ccpayment/transaction/:orderId**: Check transaction status
- **POST /api/ccpayment/webhook**: Handle CCPayment status updates

### Environment Variables

Add to your `.env` file:

```
# CCPayment Configuration
CCPAYMENT_API_URL=https://api.ccpayment.com
CCPAYMENT_APP_ID=your_app_id
CCPAYMENT_APP_SECRET=your_app_secret
CCPAYMENT_WHITELISTED_IP=your_server_ip
```

Remove old Tron variables:

```
TRONGRID_API_KEY=
TRON_FULL_HOST=
TRON_USDT_CONTRACT=
TREASURY_PRIVATE_KEY=
TREASURY_ADDRESS=
```

## Migration Checklist

### Preparation

- [ ] Set up CCPayment account and obtain credentials
- [ ] Whitelist server IP in CCPayment dashboard
- [ ] Update environment variables in all environments
- [ ] Run package cleanup to remove Tron dependencies:
  ```bash
  npm uninstall tronweb elliptic js-sha256
  ```

### Implementation

- [x] Create CCPayment client service
- [x] Set up API routes for CCPayment
- [ ] Implement deposit flow
- [ ] Implement withdrawal flow
- [ ] Update user wallet service
- [ ] Update tipping service

### Testing

- [ ] Test deposit flow with test credentials
- [ ] Test withdrawal flow with test credentials
- [ ] Test webhook functionality
- [ ] Verify transaction status checks
- [ ] Perform load testing on webhook endpoint

### Deployment

- [ ] Deploy to staging environment
- [ ] Verify all functions in staging
- [ ] Schedule production deployment
- [ ] Announce migration to users
- [ ] Deploy to production with monitoring
- [ ] Verify production functionality

## Rollback Plan

In case of issues with CCPayment integration:

1. Revert code changes to Tron integration
2. Restore environment variables
3. Reinstall Tron dependencies
4. Notify users of temporary payment system issues

## Support Documentation

- [CCPayment API Documentation](https://docs.ccpayment.com/)
- [CCPayment Dashboard](https://dashboard.ccpayment.com/)
- [CCPayment Support](https://support.ccpayment.com/)

## FAQ

**Q: Will users need to create new wallets?**
A: No, users will use CCPayment's interface for payments, which doesn't require them to have blockchain wallets.

**Q: How will this affect existing balances?**
A: User balances in our system will be preserved. The migration only affects how deposits and withdrawals are processed.

**Q: Is CCPayment more expensive than direct blockchain integration?**
A: While CCPayment charges processing fees, the reduced development and maintenance costs should offset these fees in the long run.

**Q: How do we handle failed payments?**
A: CCPayment provides detailed status updates through webhooks, allowing us to handle failed payments more reliably than with direct blockchain integration. 