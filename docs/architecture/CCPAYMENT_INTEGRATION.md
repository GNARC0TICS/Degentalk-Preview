# CCPayment Integration — Platform-Level Overview

## 🔒 What CCPayment Actually Does

CCPayment acts as our crypto deposit and withdrawal processor.
It handles multi-chain address generation, deposit monitoring, and conversion confirmation.
Think of it like our crypto gateway, but not a wallet custodian — we still manage balances off-chain.

---

## 🧩 Key Logic Components

### 1. Deposit Flow (User Sends Crypto → Gets DGT)

1. User selects a coin (e.g. USDT, TRX, ETH) and requests a deposit.
2. Backend calls CCPayment API:

```http
POST /v1/wallet/address/create
```

➜ Returns a deposit address tied to the user's CCPayment UID.

3. CCPayment monitors that address.
4. When a deposit arrives, CCPayment calls our webhook:

```http
POST /api/wallet/webhook
```

Payload includes:
- `userId`
- `coin`
- `amount`
- `recordId`
- `txHash`

5. We validate the webhook, then:
   - Convert amount → USDT equivalent
   - Credit user with DGT = USDT * 10
   - Log it as a `crypto_deposit` transaction

✅ User now has DGT in their internal wallet.

---

### 2. Withdrawal Flow (User Withdraws Crypto)

1. User requests withdrawal:
   - Chooses coin + amount
   - Inputs destination address
2. Backend calls:

```http
POST /v1/wallet/withdraw
```

With:
- `userId`
- `coin`
- `amount`
- `toAddress`

3. CCPayment processes the blockchain withdrawal
4. Status updates arrive via webhook:

```http
POST /api/wallet/webhook
```

➜ Updates transaction state in our DB (pending → completed → failed)

---

## 🛠️ Integration Strategy (Agent Checklist)

- All CCPayment calls are made from `ccpayment.adapter.ts`
- No controller or service should contain raw fetch/axios calls to the API
- Webhook handler is a single endpoint → `wallet.controller.ts` handles and routes it
- Internal DGT logic never touches blockchain — it's all driven by CCPayment callbacks

---

## 💡 Notes

- CCPayment handles currency conversions, so we don't need to track exchange rates
- We rely on their webhook to confirm events — not polling
- Webhook must always validate HMAC signature or shared secret (if available)
- All crypto actions resolve into internal DGT transactions for consistency

---

## 🔧 Implementation References

**New Wallet Domain:**
- `server/src/domains/_new-wallet/adapters/ccpayment.adapter.ts` - CCPayment API integration
- `server/src/domains/_new-wallet/controllers/wallet.controller.ts` - Webhook handling
- `server/src/domains/_new-wallet/services/wallet.service.ts` - DGT conversion logic
- `shared/types/wallet/` - Type definitions aligned with CCPayment responses

**Existing Services (Referenced):**
- `server/src/domains/wallet/services/ccpayment-api.service.ts` - Core API client with MD5 auth
- `server/src/domains/wallet/services/ccpayment-balance.service.ts` - Balance queries
- `server/src/domains/wallet/services/ccpayment-deposit.service.ts` - Deposit address creation
- `server/src/domains/wallet/ccpayment.service.ts` - Main orchestration service