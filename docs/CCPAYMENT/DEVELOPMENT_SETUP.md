---
title: DEVELOPMENT_SETUP
status: STABLE
updated: 2025-06-28
---

# CCPayment Development Setup Guide

## 🎯 Quick Development Setup

This guide gets you up and running with the CCPayment wallet integration in under 10 minutes.

## 📋 Prerequisites

```bash
# Required software
- Node.js 18+
- PostgreSQL
- Git

# Degentalk setup
git clone https://github.com/your-org/degentalk
cd degentalk
npm install
```

## ⚡ Environment Configuration

### 1. Copy Environment Template

```bash
# Copy the environment template
cp env.example env.local
```

### 2. Configure Environment Variables

Edit `env.local`:

```env
# Database (required)
DATABASE_URL=postgresql://user:password@localhost:5432/degentalk_dev

# CCPayment Configuration
CCPAYMENT_APP_ID=isloZpLGWgTHrdY1
CCPAYMENT_APP_SECRET=f3bb9be4cc138840bb806cdbe7797b9d

# Development Mode Settings
NODE_ENV=development
WALLET_ENABLED=true
MOCK_CCPAYMENT=true
ALLOW_DEV_TOPUP=true
BYPASS_WALLET_LIMITS=false

# Server URLs
API_URL=http://localhost:5001
FRONTEND_URL=http://localhost:5173

# Optional: Ngrok for webhook testing
NGROK_AUTH_TOKEN=your_ngrok_token_here
```

### 3. Database Setup

```bash
# Apply migrations
npm run db:migrate:apply

# Seed development data
npm run seed:all

# Verify database
npm run db:studio
```

## 🚀 Starting Development

### 1. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend  # Port 5173
npm run dev:backend   # Port 5001
```

### 2. Verify Setup

Open your browser and check:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/api/wallet/balance
- **Database Studio**: http://localhost:4983 (after `npm run db:studio`)

### 3. Initialize Your Wallet

```bash
# Login to your dev account first, then:
curl -X POST http://localhost:5001/api/wallet/dev/init \
  -H "Cookie: connect.sid=your-session-cookie"
  
# Or use the browser dev tools console:
fetch('/api/wallet/dev/init', { method: 'POST' })
```

### 4. Add Test Funds

```bash
# Add 1000 DGT for testing
curl -X POST http://localhost:5001/api/wallet/dev/topup \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=your-session-cookie" \
  -d '{"amount": 1000, "token": "DGT"}'

# Or use browser console:
fetch('/api/wallet/dev/topup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 1000, token: 'DGT' })
})
```

## 🧪 Testing Your Setup

### 1. Check Wallet Balance

Visit: http://localhost:5173/wallet

You should see:
- Your DGT balance
- Wallet overview
- Quick action buttons
- Dev tools (if in development mode)

### 2. Test Shop Purchase

```bash
# Buy a shop item with DGT
curl -X POST http://localhost:5001/api/shop/purchase \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=your-session-cookie" \
  -d '{
    "itemId": "username_color_gold",
    "paymentMethod": "DGT"
  }'
```

### 3. Test Deposit Flow

```bash
# Create deposit address
curl -X POST http://localhost:5001/api/wallet/deposit-address \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=your-session-cookie" \
  -d '{"currency": "USDT"}'

# Simulate successful deposit
curl -X POST http://localhost:5001/api/wallet/dev/simulate-webhook \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=your-session-cookie" \
  -d '{
    "orderId": "test_deposit_123",
    "status": "completed",
    "amount": "100.00"
  }'
```

## 🛠️ Development Tools

### Available Dev Endpoints

| Endpoint | Purpose | Example Usage |
|----------|---------|---------------|
| `POST /api/wallet/dev/init` | Initialize wallet | One-time setup |
| `POST /api/wallet/dev/topup` | Add test funds | `{"amount": 100, "token": "DGT"}` |
| `POST /api/wallet/dev/simulate-webhook` | Test webhook | `{"orderId": "test", "status": "completed"}` |
| `GET /api/wallet/dev/info` | Debug info | Shows mock status, balances |

### Browser Dev Tools

Open browser console and try:

```javascript
// Check wallet status
fetch('/api/wallet/balance').then(r => r.json()).then(console.log);

// Add test DGT
fetch('/api/wallet/dev/topup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 500, token: 'DGT' })
}).then(r => r.json()).then(console.log);

// Check transaction history
fetch('/api/wallet/transactions').then(r => r.json()).then(console.log);
```

### Database Inspection

```bash
# Open database studio
npm run db:studio

# Or direct SQL queries
npm run db:query "SELECT * FROM wallets LIMIT 10;"
npm run db:query "SELECT * FROM transactions ORDER BY created_at DESC LIMIT 20;"
```

## 🔧 Common Development Tasks

### Reset Wallet for Testing

```bash
# Clear transaction history (careful!)
npm run db:query "DELETE FROM transactions WHERE user_id = YOUR_USER_ID;"

# Re-initialize wallet
curl -X POST http://localhost:5001/api/wallet/dev/init
```

### Test Different User Levels

```bash
# Update user level in database
npm run db:query "UPDATE users SET level = 15 WHERE id = YOUR_USER_ID;"

# Or use the role switcher in bottom-right corner (dev mode)
```

### Simulate Network Issues

```bash
# Test webhook retry logic
curl -X POST http://localhost:5001/api/webhook/ccpayment \
  -H "Content-Type: application/json" \
  -d '{"invalid": "webhook_data"}'
```

## 🌐 Webhook Testing with Ngrok

### 1. Install and Setup Ngrok

```bash
# Install ngrok
npm install -g ngrok

# Authenticate (get token from https://ngrok.com)
ngrok authtoken YOUR_NGROK_TOKEN

# Expose local server
ngrok http 5001
```

### 2. Update Webhook URL

Copy the ngrok HTTPS URL and update CCPayment dashboard:

```
Old: http://localhost:5001/api/webhook/ccpayment
New: https://abc123.ngrok.io/api/webhook/ccpayment
```

### 3. Test External Webhooks

```bash
# Test from external service
curl -X POST https://abc123.ngrok.io/api/webhook/ccpayment \
  -H "Content-Type: application/json" \
  -H "X-Signature: test_signature" \
  -H "X-Timestamp: $(date +%s)" \
  -H "X-App-Id: isloZpLGWgTHrdY1" \
  -d '{
    "eventType": "deposit_completed",
    "orderId": "external_test_123",
    "merchantOrderId": "dgt_123",
    "status": "completed",
    "amount": "50.00",
    "currency": "USDT"
  }'
```

## 📊 Monitoring Development

### Log Files

```bash
# Watch server logs
tail -f logs/app.log

# Filter wallet-related logs
tail -f logs/app.log | grep -i wallet

# Filter webhook logs
tail -f logs/app.log | grep -i webhook
```

### Performance Monitoring

```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5001/api/wallet/balance

# Monitor database connections
npm run db:stats
```

### Error Tracking

```bash
# Check for wallet errors
npm run logs:wallet-errors

# Check webhook processing errors
npm run logs:webhook-errors
```

## 🧰 Useful Scripts

Add these to your `package.json` for development:

```json
{
  "scripts": {
    "wallet:init": "curl -X POST http://localhost:5001/api/wallet/dev/init",
    "wallet:topup": "curl -X POST http://localhost:5001/api/wallet/dev/topup -H 'Content-Type: application/json' -d '{\"amount\": 1000, \"token\": \"DGT\"}'",
    "wallet:balance": "curl http://localhost:5001/api/wallet/balance",
    "wallet:reset": "npm run db:query \"DELETE FROM transactions WHERE user_id = 2\"",
    "wallet:simulate-deposit": "curl -X POST http://localhost:5001/api/wallet/dev/simulate-webhook -H 'Content-Type: application/json' -d '{\"orderId\": \"test_$(date +%s)\", \"status\": \"completed\", \"amount\": \"100.00\"}'",
    "logs:wallet": "tail -f logs/app.log | grep -i wallet",
    "logs:webhook": "tail -f logs/app.log | grep -i webhook"
  }
}
```

Then use:

```bash
npm run wallet:init
npm run wallet:topup
npm run wallet:balance
npm run logs:wallet
```

## 🚨 Troubleshooting

### Wallet Not Initializing

```bash
# Check user is logged in
curl http://localhost:5001/api/auth/me

# Check database connection
npm run db:test

# Check logs for errors
npm run logs:wallet
```

### Mock Data Not Appearing

```bash
# Verify mock mode is enabled
grep MOCK_CCPAYMENT env.local

# Check feature flags
curl http://localhost:5001/api/wallet/dev/info
```

### Database Issues

```bash
# Reset database
npm run db:drop
npm run db:migrate:apply
npm run seed:all

# Or migrate incrementally
npm run db:migrate
```

### Port Conflicts

```bash
# Kill existing processes
npm run kill-ports

# Or check what's using ports
lsof -i :5001
lsof -i :5173
```

## 🎓 Next Steps

Once your development environment is working:

1. **Read the Integration Guide**: `docs/CCPAYMENT/WALLET_INTEGRATION_GUIDE.md`
2. **Check API Documentation**: `docs/CCPAYMENT/apimethods-4.md`  
3. **Set up Webhooks**: Follow webhook configuration section
4. **Test Production Flow**: Use ngrok for external testing
5. **Review Scaling Strategy**: Plan for production deployment

## 💡 Pro Tips

- **Use Browser DevTools**: Network tab shows API calls
- **Database Studio**: Visual interface for data inspection  
- **Mock Mode**: Faster development without API delays
- **Feature Flags**: Test different user permission levels
- **Transaction Logs**: Monitor all wallet operations

---

Happy coding! 🚀