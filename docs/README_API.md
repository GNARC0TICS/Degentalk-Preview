# Wallet & Engagement API Documentation

This document provides detailed information about the wallet and engagement API endpoints available in the ForumFusion platform. Use these endpoints to interact with the wallet, tip, and rain functionality.

## Table of Contents

- [Authentication](#authentication)
- [Wallet API](#wallet-api)
  - [Get Balance](#get-balance)
  - [Get Transaction History](#get-transaction-history)
  - [Create Deposit Address](#create-deposit-address)
  - [Request DGT Purchase](#request-dgt-purchase)
  - [Transfer DGT](#transfer-dgt)
  - [Get Pending Transactions](#get-pending-transactions)
  - [Get Transaction Status](#get-transaction-status)
- [Engagement API](#engagement-api)
  - [Tip](#tip-endpoints)
    - [Send Tip](#send-tip)
    - [Get Tip History](#get-tip-history)
  - [Rain](#rain-endpoints)
    - [Send Rain](#send-rain)
    - [Get Rain History](#get-rain-history)
- [Development Utilities](#development-utilities)
  - [Import Checker](#import-checker)
  - [Mock Webhook Testing](#mock-webhook-testing)
- [Admin API](#admin-api)
  - [Wallet Management](#wallet-management)
  - [Mock Webhook Triggering](#mock-webhook-triggering)

## Development Utilities

### Import Checker

The codebase includes an Import Checker utility that helps maintain code quality during refactoring. This tool:

1. Scans TypeScript/JavaScript files for import statements
2. Validates that each import resolves to an actual file
3. Reports broken imports with line numbers and suggests fixes
4. Can automatically fix simple import issues

#### Using the Import Checker

```bash
# Check for broken imports across the codebase
npm run check:imports

# Check a specific directory
npm run check:imports -- --dir=client/src/components/economy/wallet

# Auto-fix imports where possible
npm run fix:imports
```

#### Benefits During Refactoring

- **Prevents Bugs**: Catches broken imports before they cause runtime errors
- **Improves Confidence**: Ensures the codebase stays stable during major changes
- **Speeds Up Development**: Automatically suggests or fixes import paths
- **Maintains Quality**: Integrates well into CI/CD pipelines for quality checks

Run this tool after:
- Moving files between directories
- Renaming modules
- Restructuring the codebase architecture
- Before committing changes

### Mock Webhook Testing

Administrative users can simulate CCPayment webhook events for testing through the admin panel:

1. Navigate to Admin > Wallets > CCPayment tab
2. Use the "Mock Webhook" section to trigger simulated events:
   - Deposit confirmations
   - Withdrawal status updates
   - API error conditions

This allows testing payment flow without real cryptocurrency transactions.

## Authentication

All API requests require authentication. Include a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Wallet API

### Get Balance

Get the current wallet balance for the authenticated user.

**Endpoint**: `GET /api/wallet/balance`

**Response**:
```json
{
  "dgt": 5000,
  "crypto": {
    "USDT": 25.5,
    "TRX": 100.0
  },
  "totalUsdValue": 75.5
}
```

### Get Transaction History

Get the transaction history for the authenticated user.

**Endpoint**: `GET /api/wallet/transactions`

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of transactions per page (default: 20)
- `type` (optional): Filter by transaction type (deposit, withdrawal, purchase, transfer, tip, rain)

**Response**:
```json
{
  "transactions": [
    {
      "id": "tx_123456",
      "type": "deposit",
      "status": "completed",
      "amount": 100.0,
      "currency": "USDT",
      "timestamp": "2023-05-15T10:30:00Z",
      "description": "Deposit from external wallet"
    },
    {
      "id": "tx_123457",
      "type": "tip",
      "status": "completed",
      "amount": 50,
      "currency": "DGT",
      "timestamp": "2023-05-14T15:45:00Z",
      "description": "Tip to @username",
      "to": {
        "id": 123,
        "username": "username"
      }
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

### Create Deposit Address

Create a new deposit address for receiving crypto.

**Endpoint**: `POST /api/wallet/deposit`

**Request Body**:
```json
{
  "currency": "USDT"
}
```

**Response**:
```json
{
  "address": "TRx4h8NbQJUBE9ThrMrB5MGLuYBVQnvWJV",
  "currency": "USDT",
  "network": "TRC20",
  "minDeposit": 1.0
}
```

### Request DGT Purchase

Purchase DGT using cryptocurrency.

**Endpoint**: `POST /api/wallet/purchase`

**Request Body**:
```json
{
  "cryptoAmount": 10.0,
  "cryptoCurrency": "USDT"
}
```

**Response**:
```json
{
  "transactionId": "purchase_123456",
  "status": "pending",
  "cryptoAmount": 10.0,
  "cryptoCurrency": "USDT",
  "dgtAmount": 1000,
  "exchangeRate": 100.0
}
```

### Transfer DGT

Transfer DGT to another user.

**Endpoint**: `POST /api/wallet/transfer`

**Request Body**:
```json
{
  "toUserId": 123,
  "amount": 100,
  "reason": "For helping with my question"
}
```

**Response**:
```json
{
  "transactionId": "transfer_123456",
  "status": "completed",
  "amount": 100,
  "to": {
    "id": 123,
    "username": "recipient_username"
  },
  "timestamp": "2023-05-15T10:30:00Z"
}
```

### Get Pending Transactions

Get the list of pending transactions for the authenticated user.

**Endpoint**: `GET /api/wallet/transactions/pending`

**Response**:
```json
{
  "transactions": [
    {
      "id": "tx_123456",
      "type": "deposit",
      "status": "pending",
      "amount": 100.0,
      "currency": "USDT",
      "timestamp": "2023-05-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

### Get Transaction Status

Get the current status of a specific transaction.

**Endpoint**: `GET /api/wallet/transactions/:id`

**Response**:
```json
{
  "id": "tx_123456",
  "type": "deposit",
  "status": "completed",
  "amount": 100.0,
  "currency": "USDT",
  "timestamp": "2023-05-15T10:30:00Z",
  "completedAt": "2023-05-15T10:35:00Z",
  "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

## Engagement API

### Tip Endpoints

#### Send Tip

Send a tip to another user.

**Endpoint**: `POST /api/engagement/tip`

**Request Body**:
```json
{
  "toUserId": 123,
  "amount": 50,
  "reason": "Great post!",
  "source": "forum"
}
```

**Response**:
```json
{
  "transactionId": "tip_123456",
  "status": "completed",
  "amount": 50,
  "to": {
    "id": 123,
    "username": "recipient_username"
  },
  "timestamp": "2023-05-15T10:30:00Z"
}
```

#### Get Tip History

Get the tip history for the authenticated user.

**Endpoint**: `GET /api/engagement/tip/history`

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of tips per page (default: 20)
- `type` (optional): Filter by "sent" or "received" (default: both)

**Response**:
```json
{
  "tips": [
    {
      "id": "tip_123456",
      "amount": 50,
      "currency": "DGT",
      "timestamp": "2023-05-15T10:30:00Z",
      "reason": "Great post!",
      "from": {
        "id": 456,
        "username": "sender_username"
      },
      "to": {
        "id": 123,
        "username": "recipient_username"
      }
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

### Rain Endpoints

#### Send Rain

Distribute DGT to multiple active users.

**Endpoint**: `POST /api/engagement/rain`

**Request Body**:
```json
{
  "amount": 500,
  "eligibleUserCount": 10,
  "channel": "general",
  "message": "Enjoy the rain!"
}
```

**Response**:
```json
{
  "rainId": "rain_123456",
  "amount": 500,
  "amountPerUser": 50,
  "recipientCount": 10,
  "recipients": [
    {
      "id": 123,
      "username": "user1"
    },
    {
      "id": 124,
      "username": "user2"
    }
    // Additional recipients...
  ],
  "timestamp": "2023-05-15T10:30:00Z"
}
```

#### Get Rain History

Get rain history for the authenticated user.

**Endpoint**: `GET /api/engagement/rain/history`

**Query Parameters**:
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of events per page (default: 10)

**Response**:
```json
{
  "events": [
    {
      "id": "rain_123456",
      "amount": 500,
      "amountPerUser": 50,
      "recipientCount": 10,
      "initiator": {
        "id": 456,
        "username": "initiator_username"
      },
      "received": true,
      "receivedAmount": 50,
      "timestamp": "2023-05-15T10:30:00Z",
      "message": "Enjoy the rain!"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

## Admin API

### Wallet Management

#### Get Wallet Stats

Get platform-wide wallet statistics.

**Endpoint**: `GET /api/admin/wallet/stats`

**Response**:
```json
{
  "totalDgtCirculation": 5000000,
  "activeWalletCount": 1250,
  "transactionsLast24h": 342,
  "cryptoHoldings": {
    "USDT": 25000.5,
    "TRX": 100000.0
  }
}
```

#### Get Top Wallet Users

Get users with the highest DGT balances.

**Endpoint**: `GET /api/admin/wallet/top-users`

**Response**:
```json
{
  "users": [
    {
      "id": 123,
      "username": "whale_user",
      "dgtBalance": 250000,
      "lastActive": "2023-05-15T10:30:00Z"
    }
  ]
}
```

#### Grant DGT to User

Manually grant DGT to a user.

**Endpoint**: `POST /api/admin/wallet/grant`

**Request Body**:
```json
{
  "userId": 123,
  "amount": 1000,
  "reason": "Contest winner"
}
```

**Response**:
```json
{
  "transactionId": "admin_grant_123456",
  "status": "completed",
  "userId": 123,
  "username": "recipient_username",
  "amount": 1000,
  "previousBalance": 5000,
  "newBalance": 6000,
  "timestamp": "2023-05-15T10:30:00Z"
}
```

#### Deduct DGT from User

Manually deduct DGT from a user.

**Endpoint**: `POST /api/admin/wallet/deduct`

**Request Body**:
```json
{
  "userId": 123,
  "amount": 500,
  "reason": "Refund for duplicate purchase"
}
```

**Response**:
```json
{
  "transactionId": "admin_deduct_123456",
  "status": "completed",
  "userId": 123,
  "username": "user_username",
  "amount": 500,
  "previousBalance": 5000,
  "newBalance": 4500,
  "timestamp": "2023-05-15T10:30:00Z"
}
```

### Mock Webhook Triggering

For development and testing purposes only.

#### Trigger Mock CCPayment Webhook

Simulate a CCPayment webhook event.

**Endpoint**: `POST /api/admin/webhook/mock`

**Request Body**:
```json
{
  "type": "deposit",
  "amount": 100.0,
  "currency": "USDT",
  "userId": 123,
  "txHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
}
```

**Response**:
```json
{
  "success": true,
  "transactionId": "mock_deposit_123456",
  "webhookProcessed": true
}
```

## Error Handling

All API endpoints use a consistent error format:

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "You don't have enough DGT to complete this transaction",
    "details": {
      "required": 100,
      "available": 50
    }
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `INSUFFICIENT_FUNDS`: Not enough balance to complete transaction
- `VALIDATION_ERROR`: Invalid input data
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Webhooks

The platform also supports sending webhooks for real-time updates on transactions. To receive these, register a webhook URL in your application settings. 