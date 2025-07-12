# Database Schema Architecture Audit Report

**Generated:** July 11, 2025  
**Project:** DegenTalk  
**Scope:** /Users/gnarcotic/Degentalk/db/schema/  

## Executive Summary

🚨 **CRITICAL ISSUES FOUND:** The database schema has extensive import/export mismatches that are blocking database setup and server startup. Relations files are importing tables using incorrect names that don't match the actual exported table names.

---

## 1. Complete Schema Inventory

### Core Schemas (Essential)
- **user/**: 20 table files - User management, roles, permissions, sessions
- **forum/**: 22 table files - Forum structure, threads, posts, reactions
- **economy/**: 24 table files - Wallets, transactions, XP, levels, DGT system
- **messaging/**: 9 table files - Chat, direct messages, shoutbox

### Auxiliary Schemas (Secondary)
- **admin/**: 19 table files - Admin tools, moderation, site settings
- **shop/**: 14 table files - Digital marketplace, inventory
- **system/**: 14 table files - Analytics, notifications, rate limits
- **wallet/**: 9 table files - CCPayment integration, crypto wallets
- **gamification/**: 8 table files - Achievements, missions, leaderboards
- **social/**: 4 table files - Friends, follows, mentions
- **advertising/**: 7 table files - Ad campaigns, promotions
- **collectibles/**: 2 table files - Sticker system
- **dictionary/**: 3 table files - Term definitions
- **core/**: 2 table files - Global enums

**Total:** 157 schema files across 14 domains

---

## 2. Import/Export Mismatches (CRITICAL)

### Pattern: Relations files import tables using incorrect names

#### Advertising Domain
**Files exist:** `campaigns.ts`, `payments.ts`, `performance.ts`, `placements.ts`, `targeting.ts`, `user-promotions.ts`

**Relations imports (WRONG):**
```typescript
import { cryptoPayments } from './cryptoPayments';  // Should be './payments'
import { adImpressions } from './adImpressions';    // Should be './performance' 
import { adPlacements } from './adPlacements';      // Should be './placements'
import { campaignRules } from './campaignRules';   // Should be './targeting'
import { userPromotions } from './userPromotions'; // Should be './user-promotions'
```

**Actual exports:**
- `payments.ts` exports: `cryptoPayments`, `adGovernanceProposals`, `adGovernanceVotes`
- `performance.ts` exports: `adImpressions`, `campaignMetrics`
- `placements.ts` exports: `adPlacements`
- `targeting.ts` exports: `campaignRules`
- `user-promotions.ts` exports: `userPromotions`, `announcementSlots`, `shoutboxPins`, etc.

#### Dictionary Domain
**Files exist:** `entries.ts`, `upvotes.ts`

**Relations imports (WRONG):**
```typescript
import { dictionaryEntries } from './dictionaryEntries';  // Should be './entries'
import { dictionaryUpvotes } from './dictionaryUpvotes';  // Should be './upvotes'
```

#### Collectibles Domain
**File exists:** `stickers.ts`

**Relations imports (WRONG):**
```typescript
import { stickerPacks } from './stickerPacks';              // All exported from './stickers'
import { userStickerInventory } from './userStickerInventory';
import { userStickerPacks } from './userStickerPacks';
import { stickerUsage } from './stickerUsage';
```

**Actual exports from `stickers.ts`:**
- `stickerPacks`
- `stickers` 
- `userStickerInventory`
- `userStickerPacks`
- `stickerUsage`

### Similar Pattern Throughout All Domains
This same mismatch pattern exists across **ALL** domains where relations files import from non-existent files instead of the actual files.

---

## 3. Duplicate Exports (CRITICAL)

### In Relations Files
Multiple relations files export the same relation names:

#### Economy Domain
```typescript
// Multiple exports of same relation
export const walletsRelations = relations(wallets, ({ one, many }) => ({
export const transactionsRelations = relations(transactions, ({ one, many }) => ({
// Appears multiple times in same file
```

#### User Domain
```typescript
// Duplicate exports
export const usersRelations = relations(users, ({ one, many }) => ({
export const avatarFramesRelations = relations(avatarFrames, ({ one, many }) => ({
// Both appear twice
```

#### Collectibles Domain
```typescript
// Duplicate function names
export const stickerPacksRelations = relations(stickerPacks, ({ one, many }) => ({
// Appears twice with different logic
```

#### System Domain
```typescript
// Duplicate relation exports
export const referralSourcesRelations = relations(referralSources, ({ one, many }) => ({
// Appears multiple times
```

---

## 4. Missing Files That Are Imported

Based on relations imports, these files should exist but don't:

### Economy Domain (Multiple missing files)
Relations file imports from `settings.ts` expecting `xpCloutSettings`, but actual file structure is different.

### Forum Domain  
Relations imports expect files like `forumRules.ts`, `forumStructure.ts` but actual files are `rules.ts`, `structure.ts`.

### User Domain
Relations imports expect individual files but actual structure uses consolidated files like `preferences.ts` containing multiple tables.

---

## 5. Project Structure Analysis

### Core Architecture Issues

1. **Inconsistent naming convention**: File names don't match export names
2. **Relations files are auto-generated** but based on incorrect assumptions
3. **Multiple tables per file**: Some files export multiple tables (good) but relations expect one-to-one mapping
4. **Hyphenated vs camelCase**: Files use `user-promotions.ts` but imports expect `userPromotions.ts`

### Well-Structured Domains
- **user/**: Good organization, clear table exports
- **economy/**: Comprehensive, well-documented
- **forum/**: Logical grouping

### Problematic Domains
- **advertising/**: Major import/export mismatches
- **collectibles/**: Everything in one file but relations expect multiple
- **dictionary/**: Wrong import paths
- **system/**: Duplicate relations exports

---

## 6. Files Not Imported Anywhere (Unused)

### Main Index Missing Exports
These files exist but aren't exported in `/db/schema/index.ts`:

- `migrations/performance-indices.ts` - Database performance optimizations
- All `relations.ts` files - None are exported in main index
- `core/enums/index.ts` - Secondary enum file

### Potentially Obsolete
- `.js`, `.d.ts`, `.js.map` files in root - Build artifacts

---

## 7. Recommended Fixes (PRIORITY ORDER)

### Phase 1: Emergency Fixes (CRITICAL - Do First)

1. **Fix Advertising Relations** (`advertising/relations.ts`):
```typescript
// Change these imports:
import { cryptoPayments } from './payments';
import { adImpressions, campaignMetrics } from './performance';
import { adPlacements } from './placements';
import { campaignRules } from './targeting';
import { userPromotions, announcementSlots, shoutboxPins, promotionPricingConfig, threadBoosts, profileSpotlights, userPromotionAnalytics } from './user-promotions';
```

2. **Fix Dictionary Relations** (`dictionary/relations.ts`):
```typescript
// Change these imports:
import { dictionaryEntries } from './entries';
import { dictionaryUpvotes } from './upvotes';
```

3. **Fix Collectibles Relations** (`collectibles/relations.ts`):
```typescript
// Change all imports to single file:
import { stickerPacks, stickers, userStickerInventory, userStickerPacks, stickerUsage } from './stickers';
```

### Phase 2: Relations File Cleanup

1. **Remove duplicate exports** in all relations files
2. **Standardize relation naming** to avoid conflicts
3. **Add missing many-to-one relationships**

### Phase 3: Index File Updates

1. **Export all relations** in main index.ts:
```typescript
// Add these exports
export * from './admin/relations';
export * from './advertising/relations';
export * from './collectibles/relations';
export * from './dictionary/relations';
export * from './economy/relations';
export * from './forum/relations';
export * from './gamification/relations';
export * from './messaging/relations';
export * from './shop/relations';
export * from './social/relations';
export * from './system/relations';
export * from './user/relations';
export * from './wallet/relations';
```

### Phase 4: Consistency Improvements

1. **Standardize file naming**: Either all camelCase or all hyphenated
2. **Consolidate multi-table files** where logical
3. **Update documentation** to reflect actual structure

---

## 8. Impact Assessment

### Current Blocking Issues
- ❌ Database cannot initialize due to import errors
- ❌ Server startup fails on schema compilation
- ❌ Relations are not properly typed
- ❌ Development workflow is broken

### After Phase 1 Fixes
- ✅ Database will initialize successfully
- ✅ Server can start
- ✅ Basic relations work
- ⚠️ Some duplicate exports remain

### After All Phases
- ✅ Clean, maintainable schema architecture
- ✅ Proper type safety throughout
- ✅ Consistent naming conventions
- ✅ Documentation matches reality

---

## 9. Files Requiring Immediate Attention

**CRITICAL (Fix first):**
1. `/db/schema/advertising/relations.ts` - 15 wrong imports
2. `/db/schema/collectibles/relations.ts` - 4 wrong imports  
3. `/db/schema/dictionary/relations.ts` - 2 wrong imports

**HIGH:**
4. `/db/schema/economy/relations.ts` - Multiple duplicate exports
5. `/db/schema/user/relations.ts` - Duplicate relation exports
6. `/db/schema/system/relations.ts` - Duplicate exports

**MEDIUM:**
7. `/db/schema/index.ts` - Missing relations exports
8. All domain relations files - Standardization needed

---

## 10. Next Steps

1. **IMMEDIATE**: Fix the 3 critical relations files to unblock development
2. **SHORT-TERM**: Remove duplicate exports in relations files
3. **MEDIUM-TERM**: Add relations exports to main index
4. **LONG-TERM**: Standardize naming conventions across the codebase

**Estimated fix time for emergency issues: 2-3 hours**  
**Estimated time for complete cleanup: 1-2 days**

---

*This audit reveals a critical mismatch between file organization and import statements that must be resolved immediately to restore database functionality.*