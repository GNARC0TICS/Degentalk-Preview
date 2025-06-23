# 🔐 Codespaces Secrets Configuration

## Required GitHub Codespaces Secrets

**IMPORTANT:** Add these secrets in your GitHub repository settings under:
`Settings → Secrets and variables → Codespaces`

### Essential Secrets

```bash
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_eZTUNmt3h5YE@ep-steep-field-a4mgmi29-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# Neon API (for database management)
NEON_API_KEY=napi_64010heeqqly1w5t5eg1dpjposfjcqpdg0lu4bc7yvnci0vh7qyivoo04i3j036x

# Stripe (for payments)
STRIPE_SECRET_KEY=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

# CCPayment (crypto payments)
CCPAYMENT_APP_ID=isoZpLGWgTHrdY1
CCPAYMENT_APP_SECRET=f3bb9be4cc138840bb806cdbe7797b9d

# Test Database
TEST_DATABASE_URL=postgresql://walletdb_owner:npg_F4rahqG6tpNd@ep-dawn-math-a83x4bti-pooler.eastus2.azure.neon.tech/walletdb?sslmode=require
```

### Public Environment Variables

These will be set automatically in Codespaces via env.local:

```bash
DATABASE_PROVIDER=postgresql
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_FEATURE_WALLET=true
NODE_ENV=development
FORCE_COLOR=1
```

## Setup Instructions

### 1. Add Secrets to GitHub

1. Go to your DegenTalk repository on GitHub
2. Navigate to `Settings → Secrets and variables → Codespaces`
3. Click "New repository secret" for each secret above
4. Copy the exact name and value for each

### 2. Launch Codespace

1. Click the "Open in GitHub Codespaces" badge in README
2. Wait for automatic setup (< 90 seconds)
3. Environment will be ready with all secrets loaded

### 3. Verify Setup

```bash
# Check database connection
pnpm db:studio

# Start development
pnpm dev

# Test SuperClaude
sc /user:load --depth deep --plan
```
