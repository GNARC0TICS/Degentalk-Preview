# DGT Token Management System

## Overview
The DegenTalk Token (DGT) is a platform token with a hard cap of 1 billion tokens. This document outlines the implementation plan for managing the token supply, treasury, and related functionality.

## Token Specifications
- **Token Name**: DegenTalk Token
- **Ticker Symbol**: DGT
- **Blockchain**: TRON or Polygon (cheap gas, fast)
- **Decimals**: 6 (like USDC)
- **Max Supply**: 1,000,000,000 DGT (One Billion)

## Supply Distribution
- **Initial Circulating Supply**: 10-15% of max (airdrop + liquidity)
- **Treasury Reserve**: 50% of total supply (500,000,000 DGT)
- **Community Rewards**: 20% (200,000,000 DGT) - for faucets, rain, XP events
- **Team and Advisors**: 15% (150,000,000 DGT) - vesting over 2-3 years
- **Liquidity Pools**: 10% (100,000,000 DGT) - for DEX listing
- **Partnerships / Growth**: 5% (50,000,000 DGT) - incentives for future collaborations

## Implementation Plan

### 1. Database Schema Updates
- Create `treasury_settings` table for treasury configuration
- Update transaction tracking with source/destination/type
- Implement 6 decimal precision for DGT balances
- Create transaction ledger for tracking all token movements

### 2. Treasury System
- Create Treasury system user
- Set up initial treasury balance (500M DGT)
- Implement transaction mechanisms:
  - All DGT awards/tips deduct from Treasury
  - Track transactions in the ledger
  - Prevent transactions if treasury balance insufficient

### 3. Admin Tools
- Treasury management dashboard
  - View treasury balance
  - Adjust treasury wallet address
  - Approve/reject manual withdrawals
  - View all transaction history
- Mass reward functionality for airdrops and promotions
- Supply management tools

### 4. Transaction Tracking
- All token movements recorded in transaction ledger
- Each transaction includes:
  - Source (treasury or user)
  - Destination (user)
  - Amount
  - Transaction type (reward, tip, withdrawal, etc.)
  - Timestamp
  - Status

### 5. Integration Points
- Connect to existing wallet UI
- Integrate with reward mechanisms
- Hook into tipping system
- Connect to XP/leveling system

## Technical Implementation Details

### Database Schema
```sql
-- Treasury Settings
CREATE TABLE IF NOT EXISTS treasury_settings (
  id SERIAL PRIMARY KEY,
  max_supply DECIMAL(16,6) NOT NULL DEFAULT 1000000000.000000,
  treasury_balance DECIMAL(16,6) NOT NULL DEFAULT 500000000.000000,
  treasury_wallet_address TEXT NOT NULL,
  withdrawal_approval_threshold DECIMAL(12,6) DEFAULT 10000.000000,
  auto_approval_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Transactions Ledger
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  source_type VARCHAR(20) NOT NULL, -- 'treasury', 'user'
  source_id INTEGER, -- NULL if treasury
  destination_type VARCHAR(20) NOT NULL, -- 'user', 'treasury', 'external'
  destination_id INTEGER, -- NULL if treasury or external
  amount DECIMAL(16,6) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'reward', 'tip', 'withdrawal', 'deposit', 'airdrop'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  blockchain_tx_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Withdrawal Requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount DECIMAL(16,6) NOT NULL,
  destination_address TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'processed'
  admin_id INTEGER REFERENCES users(id), -- Admin who approved/rejected
  transaction_id INTEGER REFERENCES transactions(id),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Mass Reward Campaigns
CREATE TABLE IF NOT EXISTS mass_reward_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  total_amount DECIMAL(16,6) NOT NULL,
  individual_amount DECIMAL(16,6) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'in_progress', 'completed', 'cancelled'
  scheduled_at TIMESTAMP,
  target_criteria JSONB, -- Criteria for selecting users
  admin_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Campaign Recipients
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES mass_reward_campaigns(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  amount DECIMAL(16,6) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  transaction_id INTEGER REFERENCES transactions(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```