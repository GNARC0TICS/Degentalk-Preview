---
title: PRODUCTION_DEPLOYMENT
status: STABLE
updated: 2025-06-28
---

# CCPayment Production Deployment Guide

## 🎯 Overview

This guide covers the complete process of deploying the CCPayment wallet integration to production, from pre-deployment checks to post-deployment monitoring.

## 📋 Pre-Deployment Checklist

### Environment Preparation

#### 1. Production Environment Variables

Create production `env.local`:

```env
# Production Mode
NODE_ENV=production
WALLET_ENABLED=true

# CCPayment Production Credentials
CCPAYMENT_APP_ID=your_production_app_id
CCPAYMENT_APP_SECRET=your_production_app_secret
MOCK_CCPAYMENT=false

# Security Settings
ALLOW_DEV_TOPUP=false
BYPASS_WALLET_LIMITS=false
ALLOW_WALLET_RESET=false

# Production URLs
API_URL=https://api.degentalk.com
FRONTEND_URL=https://degentalk.com

# Database
DATABASE_URL=postgresql://prod_user:secure_password@prod-db:5432/degentalk_prod

# Monitoring & Logging
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn_here
DATADOG_API_KEY=your_datadog_key_here

# Rate Limiting
REDIS_URL=redis://prod-redis:6379
RATE_LIMIT_ENABLED=true
```

#### 2. Database Migration

```bash
# Backup existing database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Apply migrations
npm run db:migrate:apply

# Verify schema
npm run db:validate

# Seed production data if needed
npm run seed:production
```

#### 3. SSL Certificate

```bash
# Ensure SSL is configured for webhook security
certbot --nginx -d api.degentalk.com

# Verify SSL
curl -I https://api.degentalk.com/api/wallet/balance
```

#### 4. Security Audit

```bash
# Run security checks
npm audit
npm run security:check

# Verify no dev credentials in production
grep -r "localhost" --exclude-dir=node_modules .
grep -r "development" --exclude-dir=node_modules .
```

## 🚀 Deployment Process

### Phase 1: Infrastructure Deployment

#### 1. Deploy Backend Services

```bash
# Build production backend
npm run build:server

# Deploy to production server
docker build -t degentalk-api:latest .
docker push your-registry/degentalk-api:latest

# Update production deployment
kubectl apply -f k8s/production/
# OR
docker-compose -f docker-compose.prod.yml up -d
```

#### 2. Deploy Frontend

```bash
# Build production frontend
npm run build:client

# Deploy to CDN/hosting
aws s3 sync dist/ s3://degentalk-frontend-prod/
# OR
rsync -av dist/ user@prod-server:/var/www/degentalk/
```

#### 3. Verify Deployment

```bash
# Test API health
curl https://api.degentalk.com/health

# Test wallet endpoints
curl https://api.degentalk.com/api/wallet/currencies

# Check frontend
curl -I https://degentalk.com
```

### Phase 2: CCPayment Configuration

#### 1. Update CCPayment Dashboard

Login to [CCPayment Dashboard](https://dashboard.ccpayment.com):

1. **Navigate to Settings > Webhooks**
2. **Update Webhook URLs**:
   ```
   Deposit Webhook: https://api.degentalk.com/api/webhook/ccpayment
   Withdrawal Webhook: https://api.degentalk.com/api/webhook/ccpayment
   ```
3. **Configure Events**:
   - ✅ deposit_completed
   - ✅ deposit_failed  
   - ✅ withdrawal_completed
   - ✅ withdrawal_failed
4. **Test Webhook Connection**:
   - Use dashboard test function
   - Verify in server logs

#### 2. Verify Webhook Security

```bash
# Test webhook endpoint
curl -X POST https://api.degentalk.com/api/webhook/ccpayment \
  -H "Content-Type: application/json" \
  -H "X-Signature: test_signature" \
  -H "X-Timestamp: $(date +%s)" \
  -H "X-App-Id: your_production_app_id" \
  -d '{"test": true}'

# Should return 401 (invalid signature) - this is correct!
```

#### 3. Update API Credentials

Ensure production CCPayment credentials are active:
- App ID matches dashboard
- App Secret is secure and not logged
- IP address is whitelisted (if required)

### Phase 3: Feature Rollout

#### 1. Gradual Feature Activation

Start with limited access:

```typescript
// server/src/domains/wallet/wallet.middleware.ts
export const checkWalletAccess = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  
  // Phase 1: Admin only
  if (user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Wallet features in beta - admin access only' 
    });
  }
  
  next();
};
```

#### 2. Beta User Rollout

```typescript
// Phase 2: Level 10+ users
if (user.level < 10) {
  return res.status(403).json({ 
    error: 'Level 10 required for wallet beta access' 
  });
}
```

#### 3. Percentage Rollout

```typescript
// Phase 3: 25% of eligible users
const rolloutPercent = 25;
if (user.id % 100 >= rolloutPercent) {
  return res.status(403).json({ 
    error: 'Wallet access rolling out gradually' 
  });
}
```

#### 4. Full Release

```typescript
// Phase 4: All users
// Remove all restrictions
```

## 📊 Monitoring & Observability

### 1. Application Monitoring

#### Metrics to Track

```typescript
// Key metrics for wallet system
const WALLET_METRICS = {
  // Transaction metrics
  'wallet.transactions.total': 'counter',
  'wallet.transactions.volume': 'gauge',
  'wallet.transactions.success_rate': 'gauge',
  
  // Balance metrics  
  'wallet.balances.total_dgt': 'gauge',
  'wallet.balances.total_usd_value': 'gauge',
  'wallet.balances.active_wallets': 'gauge',
  
  // Webhook metrics
  'webhook.requests.total': 'counter',
  'webhook.requests.success_rate': 'gauge',
  'webhook.processing_time': 'histogram',
  
  // Error metrics
  'wallet.errors.total': 'counter',
  'wallet.errors.by_type': 'counter',
};
```

#### Alerts Configuration

```yaml
# alerts.yml
alerts:
  - name: wallet_transaction_failure_rate
    condition: wallet.transactions.success_rate < 0.95
    severity: critical
    
  - name: webhook_processing_delays
    condition: webhook.processing_time.p95 > 5000ms
    severity: warning
    
  - name: wallet_balance_inconsistency  
    condition: wallet.balances.total_dgt < 0
    severity: critical
```

### 2. Logging Configuration

```javascript
// logger.config.js
module.exports = {
  level: 'info',
  format: 'json',
  defaultMeta: { 
    service: 'degentalk-wallet',
    environment: process.env.NODE_ENV 
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/wallet-error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/wallet-combined.log' 
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
};
```

### 3. Database Monitoring

```sql
-- Key database queries to monitor
-- Transaction volume by day
SELECT 
  DATE(created_at) as date,
  COUNT(*) as transaction_count,
  SUM(amount) / 100000000.0 as total_dgt
FROM transactions 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at);

-- Active wallet count
SELECT COUNT(DISTINCT user_id) as active_wallets
FROM transactions 
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Balance consistency check
SELECT 
  user_id,
  SUM(amount) as calculated_balance
FROM transactions 
GROUP BY user_id
HAVING SUM(amount) < 0; -- Should be empty!
```

## 🔒 Security Hardening

### 1. API Security

```typescript
// Rate limiting configuration
const RATE_LIMITS = {
  wallet: {
    balance: '100 per hour per user',
    transactions: '50 per hour per user',
    deposit: '5 per hour per user',
    withdraw: '3 per hour per user',
    transfer: '20 per hour per user'
  },
  webhook: {
    ccpayment: '1000 per hour per IP'
  }
};
```

### 2. Webhook Security

```typescript
// Enhanced webhook verification
export const verifyWebhookSecurity = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.header('X-Signature');
  const timestamp = req.header('X-Timestamp');
  const appId = req.header('X-App-Id');
  
  // Check required headers
  if (!signature || !timestamp || !appId) {
    return res.status(400).json({ error: 'Missing security headers' });
  }
  
  // Check timestamp freshness (prevent replay attacks)
  const requestTime = parseInt(timestamp);
  const currentTime = Math.floor(Date.now() / 1000);
  if (currentTime - requestTime > 300) { // 5 minutes
    return res.status(400).json({ error: 'Request too old' });
  }
  
  // Verify signature
  const isValid = ccpaymentService.verifyWebhookSignature(req.body, signature, timestamp);
  if (!isValid) {
    logger.warn('Invalid webhook signature', { ip: req.ip, timestamp });
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
};
```

### 3. Database Security

```sql
-- Create read-only user for monitoring
CREATE USER wallet_readonly WITH PASSWORD 'secure_readonly_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO wallet_readonly;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_transactions_user_date 
ON transactions(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_webhook_events_timestamp 
ON webhook_events(created_at) WHERE processed = true;
```

## 📈 Performance Optimization

### 1. Database Optimization

```sql
-- Partition large tables
CREATE TABLE transactions_2024_01 PARTITION OF transactions 
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Optimize queries
EXPLAIN ANALYZE SELECT * FROM transactions WHERE user_id = 123 ORDER BY created_at DESC LIMIT 10;
```

### 2. Caching Strategy

```typescript
// Redis caching for wallet balances
const CACHE_CONFIG = {
  wallet_balance: { ttl: 300 }, // 5 minutes
  user_transactions: { ttl: 60 }, // 1 minute
  exchange_rates: { ttl: 3600 }, // 1 hour
};

// Implementation
export const getCachedBalance = async (userId: number): Promise<number | null> => {
  const cached = await redis.get(`wallet:balance:${userId}`);
  if (cached) {
    return parseFloat(cached);
  }
  
  const balance = await dgtService.getUserBalance(userId);
  await redis.setex(`wallet:balance:${userId}`, CACHE_CONFIG.wallet_balance.ttl, balance.toString());
  
  return balance;
};
```

### 3. Background Job Processing

```typescript
// Queue for heavy operations
export const walletQueue = new Queue('wallet-operations', {
  redis: { host: 'redis-server', port: 6379 },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: 'exponential'
  }
});

// Process webhook events asynchronously
walletQueue.process('process-webhook', async (job) => {
  const { webhookEvent } = job.data;
  return await ccpaymentWebhookService.processWebhookEvent(webhookEvent);
});
```

## 🔄 Backup & Recovery

### 1. Database Backups

```bash
#!/bin/bash
# backup-wallet-data.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/wallet"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup critical tables
pg_dump $DATABASE_URL \
  --table=wallets \
  --table=transactions \
  --table=dgt_purchase_orders \
  --table=withdrawal_requests \
  --file="$BACKUP_DIR/wallet_backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/wallet_backup_$DATE.sql"

# Upload to S3
aws s3 cp "$BACKUP_DIR/wallet_backup_$DATE.sql.gz" s3://degentalk-backups/wallet/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### 2. Recovery Procedures

```bash
# Recovery from backup
gunzip wallet_backup_YYYYMMDD_HHMMSS.sql.gz
psql $DATABASE_URL < wallet_backup_YYYYMMDD_HHMMSS.sql

# Verify data integrity
npm run wallet:verify-balances
npm run wallet:reconcile-transactions
```

## 📊 Success Metrics

### Launch Success Criteria

#### Week 1 Targets
- [ ] 0 critical errors
- [ ] 95%+ webhook success rate  
- [ ] 100 wallet initializations
- [ ] 50 successful transactions
- [ ] < 500ms average API response time

#### Month 1 Targets
- [ ] 500 active wallets
- [ ] $10K transaction volume
- [ ] 99.9% uptime
- [ ] 95%+ user satisfaction
- [ ] 0 security incidents

#### Month 3 Targets  
- [ ] 2000 active wallets
- [ ] $50K transaction volume
- [ ] Integration with all shop features
- [ ] Mobile app wallet support
- [ ] Advanced analytics dashboard

### Key Performance Indicators

```sql
-- KPI tracking queries
-- Daily active wallets
SELECT COUNT(DISTINCT user_id) as daily_active_wallets
FROM transactions 
WHERE DATE(created_at) = CURRENT_DATE;

-- Transaction volume trend
SELECT 
  DATE(created_at) as date,
  COUNT(*) as tx_count,
  SUM(ABS(amount)) / 100000000.0 as volume_dgt,
  AVG(ABS(amount)) / 100000000.0 as avg_tx_size
FROM transactions 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- Conversion funnel
SELECT 
  COUNT(CASE WHEN step = 'wallet_created' THEN 1 END) as wallets_created,
  COUNT(CASE WHEN step = 'first_deposit' THEN 1 END) as first_deposits,
  COUNT(CASE WHEN step = 'first_purchase' THEN 1 END) as first_purchases,
  COUNT(CASE WHEN step = 'repeat_user' THEN 1 END) as repeat_users
FROM user_journey_events 
WHERE created_at >= NOW() - INTERVAL '30 days';
```

## 🎯 Next Steps After Deployment

### Immediate (Week 1)
1. **Monitor Systems**: Watch dashboards 24/7
2. **User Support**: Respond to wallet-related issues quickly
3. **Bug Fixes**: Address any critical issues immediately
4. **Performance Tuning**: Optimize based on real usage

### Short Term (Month 1)
1. **Feature Expansion**: Add requested features
2. **Mobile Optimization**: Ensure mobile wallet works well
3. **User Education**: Create tutorials and guides
4. **Analytics Setup**: Implement detailed tracking

### Medium Term (Month 3)
1. **Advanced Features**: Portfolio tracking, price alerts
2. **API Expansion**: Third-party integrations
3. **Scaling**: Handle increased load
4. **Security Audit**: Professional security review

### Long Term (Month 6+)
1. **CCPayment Listing**: Apply for token listing
2. **External Partnerships**: Integrate with other platforms
3. **Advanced Trading**: Order books, limit orders
4. **Regulatory Compliance**: Meet evolving requirements

---

## 🆘 Emergency Procedures

### Wallet System Down

```bash
# 1. Check system status
curl https://api.degentalk.com/health

# 2. Check database connectivity
npm run db:test

# 3. Disable wallet features temporarily
kubectl set env deployment/api WALLET_ENABLED=false

# 4. Notify users via status page
echo "Wallet maintenance in progress" > /var/www/status/message.txt
```

### Data Inconsistency

```bash
# 1. Stop wallet operations
kubectl scale deployment/api --replicas=0

# 2. Backup current state
pg_dump $DATABASE_URL > emergency_backup_$(date +%s).sql

# 3. Run reconciliation
npm run wallet:reconcile-all

# 4. Verify integrity
npm run wallet:verify-balances

# 5. Resume operations
kubectl scale deployment/api --replicas=3
```

### Security Incident

```bash
# 1. Immediately disable affected features
kubectl set env deployment/api WALLET_ENABLED=false

# 2. Preserve evidence
cp -r logs/ /secure/incident-$(date +%s)/

# 3. Notify security team
# 4. Follow incident response procedures
# 5. Patch vulnerability
# 6. Resume operations after verification
```

---

*Production deployment is a critical process. Test thoroughly and monitor closely. When in doubt, roll back and investigate.*

**Good luck with your production launch! 🚀**