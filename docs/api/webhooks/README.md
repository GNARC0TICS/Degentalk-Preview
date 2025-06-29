# Webhooks & Integration API

## Legend
| Symbol | Meaning | | Abbrev | Meaning |
|--------|---------|---|--------|---------|
| → | leads to | | API | application programming interface |
| 🔓 | public | | Auth | authentication |
| 🔒 | auth required | | tx | transaction |
| ⚠️ | admin only | | sig | signature |

## Overview

External integrations, webhook endpoints & real-time event system for third-party services & notifications.

**Base Path:** `/api/webhook`

## CCPayment Integration

### Deposit Webhook 🔓
```http
POST /api/webhook/ccpayment/deposit
```

**Description:** CCPayment → Degentalk callback for crypto deposit confirmations

**Headers:**
```
Content-Type: application/json
X-CC-Signature: sha256=<signature>
X-CC-Timestamp: <timestamp>
```

**Body:**
```json
{
  "event": "deposit_confirmed",
  "order_id": "cc_order_abc123",
  "transaction_hash": "0x1234567890abcdef...",
  "coin": "ETH",
  "amount": "0.025000000000000000",
  "usd_value": 87.50,
  "confirmations": 12,
  "required_confirmations": 12,
  "network": "ethereum",
  "to_address": "0x742d35Cc6634C0532925a3b8D321140A5b8fE899",
  "from_address": "0x123456789abcdef...",
  "block_height": 18500000,
  "timestamp": "2025-01-01T12:00:00Z",
  "metadata": {
    "user_id": "123",
    "internal_order_id": "dgt_deposit_def456"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "processed": true,
    "dgtCredited": 875.00,
    "conversionRate": 35000.00,
    "userId": 123,
    "internalTxId": "tx_ghi789"
  }
}
```

**Processing Flow:**
1. Verify CCPayment signature
2. Check transaction hasn't been processed
3. Convert crypto → DGT at current rate
4. Credit user account
5. Send notification
6. Return confirmation

### Withdrawal Webhook 🔓
```http
POST /api/webhook/ccpayment/withdrawal
```

**Body:**
```json
{
  "event": "withdrawal_completed",
  "withdrawal_id": "cc_wd_abc123",
  "transaction_hash": "0xabcdef1234567890...",
  "coin": "BTC",
  "amount": "0.001000000000",
  "fee": "0.000100000000",
  "status": "completed",
  "to_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "block_height": 820000,
  "confirmations": 3,
  "timestamp": "2025-01-01T13:00:00Z",
  "metadata": {
    "user_id": "123",
    "internal_withdrawal_id": "wd_def456"
  }
}
```

## WebSocket Events

### Connection Management
```javascript
// Client connection
const ws = new WebSocket('wss://degentalk.com/ws');

// Server events sent to clients
const events = {
  // Authentication
  auth_required: {},
  auth_success: { userId: 123 },
  auth_failed: { error: "Invalid token" },
  
  // Chat events
  new_message: { message: {...} },
  message_updated: { messageId, content, editedAt },
  message_deleted: { messageId, deletedBy },
  user_joined: { user: {...}, room: "general" },
  user_left: { userId: 123, room: "general" },
  user_typing: { userId: 123, room: "general", isTyping: true },
  
  // Wallet events
  balance_update: { 
    userId: 123, 
    coin: "DGT", 
    newBalance: 1500.50, 
    change: +100.00 
  },
  transaction_update: { 
    txId: "tx_abc123", 
    status: "completed" 
  },
  
  // Forum events
  thread_created: { thread: {...} },
  post_created: { post: {...}, threadId: "th_abc123" },
  like_added: { contentType: "thread", contentId: "th_abc123" },
  
  // XP & Gamification
  xp_awarded: { 
    userId: 123, 
    amount: 25, 
    reason: "thread_created" 
  },
  level_up: { 
    userId: 123, 
    newLevel: 16, 
    rewards: {...} 
  },
  achievement_unlocked: { 
    userId: 123, 
    achievement: {...} 
  },
  
  // Admin events
  user_moderated: { 
    userId: 123, 
    action: "suspended", 
    reason: "spam" 
  },
  system_announcement: { 
    message: "Maintenance in 1 hour" 
  }
};
```

### Event Subscription
```javascript
// Subscribe to specific events
ws.send(JSON.stringify({
  type: 'subscribe',
  events: ['balance_update', 'xp_awarded', 'new_message'],
  filters: {
    room: 'general',
    userId: 123
  }
}));

// Unsubscribe from events
ws.send(JSON.stringify({
  type: 'unsubscribe',
  events: ['user_typing']
}));
```

## External Notification Webhooks

### Discord Integration ⚠️
```http
POST /api/webhook/discord/send
```

**Body:**
```json
{
  "type": "user_level_up",
  "data": {
    "userId": 123,
    "username": "cryptoking",
    "newLevel": 16,
    "xp": 9000
  },
  "channels": ["general", "achievements"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messagesSent": 2,
    "channels": ["general", "achievements"],
    "messageIds": ["msg_123", "msg_456"]
  }
}
```

### Email Notifications ⚠️
```http
POST /api/webhook/email/send
```

**Body:**
```json
{
  "template": "deposit_confirmed",
  "to": "user@example.com",
  "data": {
    "username": "cryptoking",
    "amount": 875.00,
    "coin": "DGT",
    "txHash": "0x1234567890abcdef..."
  }
}
```

**Email Templates:**
- `deposit_confirmed` - Crypto deposit processed
- `withdrawal_approved` - Withdrawal request approved
- `level_up` - User reached new level
- `achievement_unlocked` - New achievement earned
- `security_alert` - Account security event
- `suspension_notice` - Account suspended

### Telegram Bot Integration ⚠️
```http
POST /api/webhook/telegram/send
```

**Body:**
```json
{
  "chatId": "@degentalk_announcements",
  "message": "🎉 User @cryptoking just reached Level 16! Congratulations!",
  "parseMode": "Markdown",
  "disableNotification": false
}
```

## Third-Party API Endpoints

### Price Feed Integration 🔓
```http
POST /api/webhook/price-update
```

**Description:** External price feed → Degentalk for DGT rate updates

**Headers:**
```
X-API-Key: <api_key>
X-Signature: <hmac_signature>
```

**Body:**
```json
{
  "source": "coingecko",
  "timestamp": "2025-01-01T12:00:00Z",
  "prices": {
    "DGT": {
      "usd": 0.12,
      "btc": 0.0000024,
      "change_24h": 0.05
    },
    "BTC": {
      "usd": 50000.00
    },
    "ETH": {
      "usd": 3500.00
    }
  }
}
```

### Analytics Integration 🔓
```http
POST /api/webhook/analytics/event
```

**Description:** External analytics service → Degentalk for user tracking

**Body:**
```json
{
  "event": "page_view",
  "userId": 123,
  "properties": {
    "page": "/zones/primary/bitcoin-discussion",
    "referrer": "google.com",
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2025-01-01T12:00:00Z"
  },
  "context": {
    "ip": "192.168.1.100",
    "country": "US",
    "device": "desktop"
  }
}
```

## Outgoing Webhooks

### Configure Webhook Endpoints ⚠️
```http
POST /api/admin/webhooks
```

**Body:**
```json
{
  "name": "User Activity Webhook",
  "url": "https://external-service.com/webhook",
  "events": ["user_registered", "thread_created", "level_up"],
  "secret": "webhook_secret_key",
  "active": true,
  "retryConfig": {
    "maxRetries": 3,
    "retryDelay": 5000,
    "backoffMultiplier": 2
  },
  "filters": {
    "userLevel": {
      "min": 5
    },
    "forums": ["bitcoin-discussion", "altcoin-discussion"]
  }
}
```

### List Configured Webhooks ⚠️
```http
GET /api/admin/webhooks
```

**Response:**
```json
{
  "success": true,
  "data": {
    "webhooks": [
      {
        "id": "webhook_abc123",
        "name": "User Activity Webhook",
        "url": "https://external-service.com/webhook",
        "events": ["user_registered", "thread_created", "level_up"],
        "active": true,
        "lastTriggered": "2025-01-01T11:30:00Z",
        "statistics": {
          "totalSent": 1250,
          "successRate": 0.98,
          "averageResponseTime": 150
        },
        "createdAt": "2024-12-01T00:00:00Z"
      }
    ]
  }
}
```

### Webhook Event Payload Format
```json
{
  "event": "user_registered",
  "timestamp": "2025-01-01T12:00:00Z",
  "data": {
    "user": {
      "id": 123,
      "username": "newuser",
      "email": "newuser@example.com",
      "level": 1,
      "createdAt": "2025-01-01T12:00:00Z"
    }
  },
  "metadata": {
    "source": "degentalk",
    "version": "2.0",
    "webhookId": "webhook_abc123"
  }
}
```

## Security & Verification

### Signature Verification
All incoming webhooks include HMAC signatures for verification:

```javascript
// Verify CCPayment webhook
const crypto = require('crypto');

function verifyCCPaymentSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return `sha256=${expectedSignature}` === signature;
}

// Verify timestamp to prevent replay attacks
function verifyTimestamp(timestamp, maxAge = 300) {
  const now = Math.floor(Date.now() / 1000);
  return Math.abs(now - timestamp) <= maxAge;
}
```

### API Key Authentication
Some webhooks require API key authentication:

```javascript
// Include in request headers
{
  "X-API-Key": "your_api_key_here",
  "X-Signature": "hmac_signature"
}
```

### IP Whitelisting
Configure trusted IP addresses for webhook sources:

```json
{
  "ccpayment": ["52.74.223.119", "13.229.135.131"],
  "analytics": ["198.51.100.0/24"],
  "monitoring": ["203.0.113.0/24"]
}
```

## Rate Limiting & Reliability

### Rate Limits
- **CCPayment webhooks:** 1000 per hour
- **Price updates:** 60 per minute
- **Analytics events:** 10000 per hour
- **Admin webhooks:** 100 per minute

### Retry Logic
Failed webhook deliveries are retried with exponential backoff:

```javascript
const retryConfig = {
  maxRetries: 3,
  initialDelay: 1000,    // 1 second
  maxDelay: 30000,       // 30 seconds
  backoffMultiplier: 2,
  timeoutMs: 5000
};
```

### Error Handling
```json
{
  "success": false,
  "error": "WEBHOOK_TIMEOUT",
  "message": "Request timed out after 5 seconds",
  "retryAfter": 60,
  "requestId": "req_abc123"
}
```

## Monitoring & Logs

### Webhook Delivery Status ⚠️
```http
GET /api/admin/webhooks/:webhookId/deliveries
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deliveries": [
      {
        "id": "delivery_abc123",
        "event": "user_registered",
        "status": "success",
        "responseCode": 200,
        "responseTime": 150,
        "attempts": 1,
        "timestamp": "2025-01-01T12:00:00Z"
      },
      {
        "id": "delivery_def456",
        "event": "thread_created",
        "status": "failed",
        "responseCode": 500,
        "error": "Internal Server Error",
        "attempts": 3,
        "nextRetry": "2025-01-01T12:15:00Z",
        "timestamp": "2025-01-01T12:10:00Z"
      }
    ]
  }
}
```

### Test Webhook ⚠️
```http
POST /api/admin/webhooks/:webhookId/test
```

**Body:**
```json
{
  "event": "test_event",
  "testData": {
    "message": "This is a test webhook delivery"
  }
}
```

## Integration Examples

### CCPayment Webhook Handler
```javascript
app.post('/api/webhook/ccpayment/deposit', (req, res) => {
  const signature = req.headers['x-cc-signature'];
  const timestamp = req.headers['x-cc-timestamp'];
  
  // Verify signature
  if (!verifyCCPaymentSignature(req.body, signature, process.env.CC_WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Verify timestamp
  if (!verifyTimestamp(timestamp)) {
    return res.status(401).json({ error: 'Request too old' });
  }
  
  // Process deposit
  const { order_id, amount, coin, user_id } = req.body.metadata;
  
  await processDeposit({
    orderId: order_id,
    userId: user_id,
    amount: parseFloat(amount),
    coin: coin
  });
  
  res.json({ success: true });
});
```

### WebSocket Event Broadcasting
```javascript
// Broadcast event to connected clients
function broadcastEvent(event, data, filters = {}) {
  const payload = {
    type: event,
    data: data,
    timestamp: new Date().toISOString()
  };
  
  // Filter clients based on criteria
  const targetClients = clients.filter(client => {
    if (filters.userId && client.userId !== filters.userId) return false;
    if (filters.room && !client.rooms.includes(filters.room)) return false;
    return true;
  });
  
  // Send to target clients
  targetClients.forEach(client => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(payload));
    }
  });
}

// Usage examples
broadcastEvent('balance_update', {
  userId: 123,
  coin: 'DGT',
  newBalance: 1500.50,
  change: +100.00
}, { userId: 123 });

broadcastEvent('new_message', {
  message: messageData
}, { room: 'general' });
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `WEBHOOK_001` | Invalid signature | Webhook signature verification failed |
| `WEBHOOK_002` | Request too old | Timestamp outside acceptable range |
| `WEBHOOK_003` | Unknown event | Event type not recognized |
| `WEBHOOK_004` | Processing failed | Error processing webhook data |
| `WEBHOOK_005` | Rate limit exceeded | Too many webhook requests |
| `WEBHOOK_006` | Timeout error | Webhook processing timed out |
| `WEBHOOK_007` | Invalid payload | Webhook data validation failed |
| `WEBHOOK_008` | Unauthorized source | IP not whitelisted |

---

**📚 Documentation:** `/docs/api/webhooks/README.md`

**Related:**
- [CCPayment Integration Guide](./ccpayment.md)
- [WebSocket Events Reference](./websocket.md)
- [Discord Bot Setup](./discord.md)
- [Email Templates](./email.md)