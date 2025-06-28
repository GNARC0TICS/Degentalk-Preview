# 🚀 GitHub Codespaces Setup Guide

## ✅ **Safe Setup Process**

### **Step 1: Configure GitHub Secrets**

Go to: `https://github.com/GNARC0TICS/Degentalk-BETA/settings/secrets/codespaces`

Add these secrets with your actual values:

```bash
# Database Configuration
DATABASE_URL=postgresql://your_username:your_password@your_host/your_database

# Neon API (for database management)
NEON_API_KEY=your_neon_api_key_here

# Stripe (for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# CCPayment (crypto payments)
CCPAYMENT_APP_ID=your_ccpayment_app_id_here
CCPAYMENT_APP_SECRET=your_ccpayment_app_secret_here

# Test Database
TEST_DATABASE_URL=postgresql://your_test_db_connection_here
```

### **Step 2: Launch Codespace**

1. **Create Codespace**: Go to your repo → Code → Codespaces → "Create codespace on main"
2. **Wait for setup**: ~90 seconds for automatic environment setup
3. **Secrets are automatically loaded** from GitHub Codespaces secrets

### **Step 3: Verify Setup**

```bash
# Check environment loaded correctly
echo $DATABASE_URL  # Should show your connection (masked in logs)

# Test database connection
pnpm db:studio

# Start development
pnpm dev

# Test SuperClaude (optional)
sc /user:load --depth deep --plan
```

## 🔐 **Security Best Practices**

### ✅ **Safe Practices**

- ✅ **Store secrets in GitHub Codespaces secrets** (never in files)
- ✅ **Use environment variables** in code (`process.env.DATABASE_URL`)
- ✅ **Add sensitive files to .gitignore**
- ✅ **Never commit actual credentials**

### ❌ **Avoid These**

- ❌ **Never put real credentials in documentation**
- ❌ **Never commit .env files with real values**
- ❌ **Never put credentials in commit messages**
- ❌ **Never share credentials in chat/email**

## 🔗 **Cursor Integration**

### **Option 1: Remote SSH to Codespace (Recommended)**

```bash
# In your Codespace terminal:
gh codespace ssh

# In Cursor:
# Cmd+Shift+P → "Remote-SSH: Connect to Host"
# Use the SSH details from above
```

### **Option 2: Local Development**

```bash
# Clone repo locally
git clone https://github.com/GNARC0TICS/Degentalk-BETA.git
cd Degentalk-BETA

# Setup local environment (you provide your own secrets)
pnpm cursor:setup

# Open in Cursor
cursor .
```

## 🛠️ **Available Commands**

```bash
# Development
pnpm dev              # Full development stack
pnpm dev:quick        # Start without seeding
pnpm db:studio        # Database management

# SuperClaude shortcuts (in Codespace)
sc                    # superclaude
scload               # superclaude /user:load --depth deep
scplan               # superclaude /user:load --depth deep --plan

# Testing
pnpm test:repo       # Run repository tests
pnpm lint           # Code quality check
```

## 🔍 **Troubleshooting**

### **Environment Issues**

- **Missing secrets**: Check GitHub Codespaces secrets are configured
- **Connection issues**: Verify secret values are correct

### **Development Issues**

- **Port forwarding**: Check VS Code ports tab
- **Database errors**: Verify DATABASE_URL secret is correct

**Remember**: Never put real credentials in files that go into git! 🔐
