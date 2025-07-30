# Migration Consolidation Plan

## Overview
Moving all schema migrations from `server/migrations/` to proper Drizzle management in `db/`.

## Step 1: Identify Migration Status

### Already in Schema (Can Delete):
- ✅ `20250510_create_xp_adjustment_logs.ts` → `db/schema/economy/xpAdjustmentLogs.ts`
- ✅ `20250513_create_xp_action_settings.ts` → `db/schema/economy/xpActionSettings.ts`
- ✅ `20250618_create_xp_reputation_settings.ts` → `db/schema/economy/settings.ts`
- ✅ `add-dgt-packages-table.ts` → `db/schema/economy/dgtPackages.ts`
- ✅ `add-dgt-purchase-orders-table.ts` → `db/schema/economy/dgtPurchaseOrders.ts`

### Need to Add to Schema:
- ❌ `20250512_create_xp_action_logs.ts` → Creates `xp_action_logs` and `xp_action_limits` tables
- ❌ `add-daily-xp-tracking.ts` → Need to check what this creates

### Field Updates (Need to Verify):
- ⚠️ `20250618_add_reputation_achievements.ts` → Adds fields to existing tables
- ⚠️ `20250618_add_rollout_percentage_to_feature_flags.ts` → Adds field to feature_flags
- ⚠️ `20250618_add_updated_by_to_site_settings.ts` → Adds field to site_settings
- ⚠️ `20250624_add_visual_fields_to_levels.ts` → Adds fields to levels table
- ⚠️ `20250626_extend_ui_themes.ts` → Extends UI themes

### Data Migrations:
- 📊 `xp-reputation-levels-migration.ts` → Appears to be data migration, not schema

## Step 2: Action Plan

1. **Create missing schema files**:
   - Add `xpActionLogs.ts` in `db/schema/economy/`
   - Add `xpActionLimits.ts` in `db/schema/economy/`

2. **Verify field additions**:
   - Check if the field additions are already in the schema files
   - If not, add them to the appropriate schema files

3. **Move data migrations**:
   - Move `xp-reputation-levels-migration.ts` to `scripts/migrations/` or appropriate domain

4. **Clean up**:
   - Delete all schema migration files from `server/migrations/`
   - Keep the `archive/` folder for historical reference
   - Remove the `server/migrations/` directory

## Step 3: Generate Drizzle Migration

After updating schemas:
```bash
cd db && pnpm drizzle-kit generate
```

This will create proper SQL migrations in `db/migrations/postgres/`