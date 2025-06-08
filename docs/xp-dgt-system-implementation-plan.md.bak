# XP & DGT System Implementation Plan

## Overview

This document outlines the implementation plan for the XP and DGT token economy system in Degentalk™™. The system is designed to be modular, with clear separation of concerns and well-defined interfaces between components.

## Implementation Phases

### Phase 1: Database Schema (Completed)

- Created comprehensive migration scripts:
  - `scripts/apply-xp-system-migration.ts` - Core XP system tables and functions
  - `scripts/xp-dgt-migration.ts` - DGT rewards and path specialization system

- Database tables added:
  - `xp_actions` - Configurable actions that earn XP
  - `user_xp` - User XP balances and tracking
  - `xp_levels` - Level thresholds and rank names
  - `xp_log` - Log of XP awards
  - `dgt_unlocks` - DGT-purchasable items and boosts
  - `user_wallet` - User wallet stats (separate from crypto wallet)
  - `dgt_unlock_log` - History of DGT unlocks
  - `level_dgt_rewards` - DGT rewards for level-ups
  - `xp_paths` - Specialization paths
  - `user_paths` - User progress in each path
  - `level_dgt_rewards_log` - History of DGT level-up rewards
  - `dgt_transactions` - Internal DGT transaction ledger
  - `stripe_dgt_sessions` - Stripe payment records for DGT
  - `usdt_dgt_transactions` - USDT payment records for DGT

- Database functions:
  - `calculate_user_level()` - Calculates user level from XP
  - `update_user_level()` - Trigger to update user level when XP changes
  - `award_level_up_dgt()` - Trigger to award DGT on level-up
  - `get_path_xp_multiplier()` - Gets XP multiplier for a user's path

- Database views:
  - `xp_leaderboard` - Global XP leaderboard
  - `path_leaderboard` - Path-specific leaderboards
  - `user_xp_summary` - User XP, level, and DGT statistics

### Phase 2: Backend Services (Completed)

- Core service modules:
  - `server/services/xp-service.ts` - XP management service
  - `server/services/path-service.ts` - Path specialization service
  - `server/utils/xpProcessor.ts` - Business logic for XP awards
  - `server/utils/walletEngine.ts` - DGT wallet operations
  - `server/utils/dgt-wallet-integration.ts` - Bridge to USDT and Stripe

- API endpoints to be added (next step):
  - `/api/xp` - XP system endpoints
  - `/api/xp/leaderboard` - XP leaderboards
  - `/api/paths` - Path specialization endpoints
  - `/api/wallet` - DGT wallet endpoints
  - `/api/shop` - DGT shop endpoints
  - `/api/admin/xp` - XP admin endpoints

### Phase 3: Admin Backend (To Do)

- Admin endpoints to implement:
  - `POST /api/admin/xp/actions` - Manage XP actions
  - `POST /api/admin/xp/levels` - Manage level thresholds
  - `POST /api/admin/xp/paths` - Manage XP paths
  - `POST /api/admin/dgt/rewards` - Manage level-up rewards
  - `POST /api/admin/dgt/unlocks` - Manage shop items
  - `POST /api/admin/user/xp` - Manually adjust user XP
  - `POST /api/admin/user/dgt` - Manually adjust user DGT

- Additional admin utilities:
  - XP action analytics (most triggered actions)
  - User level distribution stats
  - DGT economy monitoring (inflation/deflation)
  - Path specialization popularity metrics

### Phase 4: API Routes (To Do)

#### XP Routes
- `GET /api/xp/actions` - Get all XP actions
- `GET /api/xp/levels` - Get all XP levels
- `GET /api/xp/me` - Get my XP info
- `GET /api/xp/me/log` - Get my XP history
- `GET /api/xp/leaderboard` - Get XP leaderboard
- `GET /api/xp/users/:userId` - Get user's XP info
- `POST /api/xp/award` - Trigger XP award (authenticated actions)

#### Path Routes
- `GET /api/paths` - Get all paths
- `GET /api/paths/:pathId` - Get specific path
- `GET /api/paths/user/me` - Get my paths
- `GET /api/paths/user/me/primary` - Get my primary path
- `POST /api/paths/user/me/primary/:pathId` - Set my primary path
- `GET /api/paths/:pathId/leaderboard` - Get path leaderboard
- `GET /api/paths/user/:userId/:pathId` - Get user's path
- `GET /api/paths/user/:userId/summary` - Get user's XP summary

#### DGT Wallet Routes
- `GET /api/wallet/me` - Get my wallet
- `GET /api/wallet/me/transactions` - Get my transactions
- `GET /api/wallet/leaderboard` - Get DGT leaderboard
- `GET /api/wallet/users/:userId` - Get user's wallet
- `POST /api/wallet/transfer` - Transfer DGT to another user

#### DGT Shop Routes
- `GET /api/shop/unlocks` - Get available unlocks
- `GET /api/shop/unlocks/:unlockId` - Get specific unlock
- `GET /api/shop/me/unlocks` - Get my unlocks
- `POST /api/shop/purchase/:unlockId` - Purchase an unlock

#### DGT Purchase Routes
- `GET /api/dgt/packages` - Get available DGT packages
- `POST /api/dgt/purchase/stripe` - Create Stripe checkout
- `POST /api/dgt/purchase/usdt` - Process USDT purchase
- `GET /api/dgt/purchase/history` - Get purchase history
- `POST /api/webhook/stripe` - Stripe webhook handler

### Phase 5: Frontend Components (To Do)

#### XP Components
- `<XPProgressBar userId={id} />` - Display XP progress
- `<RankBadge level={num} />` - Display rank badge
- `<XPHistory userId={id} />` - Display XP history
- `<XPLeaderboard />` - Display XP leaderboard

#### Path Components
- `<PathSelector />` - Path selection widget
- `<PathProgress pathId={id} userId={id} />` - Path progress
- `<PathLeaderboard pathId={id} />` - Path leaderboard
- `<UserPathSummary userId={id} />` - User path summary

#### DGT Wallet Components
- `<WalletBalance userId={id} />` - Display DGT balance
- `<WalletHistory userId={id} />` - Display transaction history
- `<DGTTransfer />` - Transfer DGT form
- `<DGTLeaderboard type="balance|earned|spent" />` - Leaderboard

#### DGT Shop Components
- `<DGTShop />` - Shop main view
- `<UnlockCard unlock={obj} />` - Unlock display card
- `<PurchaseButton unlockId={id} />` - Purchase button
- `<UserUnlocks userId={id} />` - User's unlocks

#### DGT Purchase Components
- `<DGTPackages />` - Package selection
- `<StripePurchaseButton packageId={id} />` - Stripe button
- `<USDTPurchaseForm packageId={id} />` - USDT form
- `<PurchaseHistory userId={id} />` - Purchase history

#### Admin Components
- `<AdminXPActions />` - Manage XP actions
- `<AdminXPLevels />` - Manage XP levels
- `<AdminXPPaths />` - Manage XP paths
- `<AdminDGTRewards />` - Manage DGT rewards
- `<AdminDGTUnlocks />` - Manage shop items
- `<AdminUserXP />` - Adjust user XP
- `<AdminUserDGT />` - Adjust user DGT
- `<XPCurveGraph />` - XP curve visualization

### Phase 6: Page Integration (To Do)

- `/profile/:user` - XP bar, rank badge, DGT balance
- `/me` - XP history, wallet, unlocks
- `/thread` - Mini rank badges on posts
- `/shop` - DGT shop
- `/leaderboards` - XP and DGT leaderboards
- `/admin` - XP, DGT admin panels
- `/` (home) - XP & DGT widgets

### Phase 7: XP Triggers (To Do)

Wire up XP triggers to specific actions:
- Thread creation
- Post creation
- Receiving likes
- Giving tips
- Receiving tips
- Daily login
- Profile completion
- Streak maintenance
- Special event participation

### Phase 8: Testing & Balancing (To Do)

- Test XP gain rates
- Balance DGT rewards
- Test level progression curve
- Test shop item costs
- Test purchase flows (USDT, Stripe)
- Audit security and prevent exploits
- Test admin controls

## Database Schema Details

### XP Tables

```sql
-- XP Actions
CREATE TABLE xp_actions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  default_value INTEGER NOT NULL DEFAULT 10,
  is_enabled BOOLEAN DEFAULT TRUE,
  cooldown_seconds INTEGER DEFAULT 0
);

-- User XP
CREATE TABLE user_xp (
  user_id INTEGER PRIMARY KEY REFERENCES users(user_id),
  xp INTEGER DEFAULT 0,
  last_xp_event_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- XP Levels
CREATE TABLE xp_levels (
  level INTEGER PRIMARY KEY,
  xp_required INTEGER NOT NULL,
  rank_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  color_code VARCHAR(20)
);

-- XP Log
CREATE TABLE xp_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  action_id INTEGER REFERENCES xp_actions(id),
  xp_awarded INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);
```

### DGT Tables

```sql
-- DGT Unlocks
CREATE TABLE dgt_unlocks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  cost_dgt INTEGER NOT NULL,
  description TEXT,
  unlock_data JSONB
);

-- User Wallet
CREATE TABLE user_wallet (
  user_id INTEGER PRIMARY KEY REFERENCES users(user_id),
  dgt_balance INTEGER DEFAULT 0,
  lifetime_earned INTEGER DEFAULT 0,
  lifetime_spent INTEGER DEFAULT 0
);

-- DGT Unlock Log
CREATE TABLE dgt_unlock_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  unlock_id INTEGER REFERENCES dgt_unlocks(id),
  dgt_spent INTEGER,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Level DGT Rewards
CREATE TABLE level_dgt_rewards (
  level INTEGER PRIMARY KEY REFERENCES xp_levels(level),
  dgt_reward BIGINT NOT NULL,
  description TEXT
);

-- DGT Transactions
CREATE TABLE dgt_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  amount BIGINT NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  reference_id INTEGER,
  reference_type VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);
```

### Path Tables

```sql
-- XP Paths
CREATE TABLE xp_paths (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  xp_multipliers JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE
);

-- User Paths
CREATE TABLE user_paths (
  user_id INTEGER REFERENCES users(user_id),
  path_id VARCHAR(50) REFERENCES xp_paths(id),
  primary_path BOOLEAN DEFAULT FALSE,
  path_level INTEGER DEFAULT 1,
  path_xp INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, path_id)
);
```

### DGT Purchase Tables

```sql
-- Stripe DGT Sessions
CREATE TABLE stripe_dgt_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  package_id VARCHAR(50) NOT NULL,
  dgt_amount BIGINT NOT NULL,
  usd_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
);

-- USDT DGT Transactions
CREATE TABLE usdt_dgt_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  package_id VARCHAR(50) NOT NULL,
  dgt_amount BIGINT NOT NULL,
  usdt_amount DECIMAL(10, 6) NOT NULL,
  tx_hash VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
);
```

## Service Architecture

### XP Service
- Award XP for actions
- Handle cooldowns
- Track level progression
- Query XP leaderboards
- Manage XP history

### Path Service
- Manage path specializations
- Handle path XP progression
- Track path leaderboards
- Select primary paths

### Wallet Engine
- Manage DGT balances
- Process DGT transfers
- Handle unlock purchases
- Track DGT economy

### DGT Wallet Integration
- Connect to existing wallet system
- Process Stripe payments
- Process USDT payments
- Track payment history

## Admin Controls

### XP Admin
- Create/edit/disable XP actions
- Adjust XP values for actions
- Set level thresholds and ranks
- View XP analytics

### DGT Admin
- Manage level-up rewards
- Create shop items/unlocks
- Adjust DGT economy
- Monitor usage metrics

### User Admin
- Adjust individual user XP
- Adjust user DGT balances
- Grant special unlocks
- View user history

## Next Steps

1. **Implement API Routes**: Create the API route files for XP, paths, wallet, and shop.
2. **Add Admin Backend**: Implement admin control endpoints.
3. **Create Frontend Components**: Build UI components for the XP and DGT systems.
4. **Integrate with Existing Pages**: Add components to relevant pages.
5. **Connect XP Triggers**: Wire up XP triggers to user actions.
6. **Test and Balance**: Ensure the system is balanced and functioning correctly.
7. **Launch**: Deploy the full system.

## Additional Considerations

- **Security**: Protect against XP/DGT exploits
- **Performance**: Optimize database queries for large leaderboards
- **Monitoring**: Add metrics to track system health
- **Analytics**: Create dashboards for user engagement
- **Backup**: Ensure regular backups of XP/DGT data