# TypeScript Error Report

Generated: 2025-07-31T08:02:39.863Z

## Summary
- **Total Errors**: 1455
- **Workspaces Affected**: 3
- **Error Categories**: 8

## Errors by Workspace
| Workspace | Error Count |
|-----------|-------------|
| server | 874 |
| db | 530 |
| shared | 51 |

## Errors by Type
| Error Code | Count | Description |
|------------|-------|-------------|
| TS6133 | 758 | 'params' is declared but its value is never read.... |
| TS2345 | 226 | Argument of type 'unknown' is not assignable to pa... |
| TS18046 | 69 | 'err' is of type 'unknown'.... |
| TS2322 | 61 | Type '(...args: string[]) => Promise<unknown>' is ... |
| TS7030 | 55 | Not all code paths return a value.... |
| TS2339 | 50 | Property 'deletePattern' does not exist on type 'R... |
| TS7006 | 46 | Parameter 'dbError' implicitly has an 'any' type.... |
| TS6196 | 37 | 'EventPriority' is declared but never used.... |
| TS2769 | 19 | No overload matches this call.... |
| TS18048 | 15 | 'limitRecord' is possibly 'undefined'.... |
| TS2554 | 15 | Expected 1 arguments, but got 2.... |
| TS2304 | 14 | Cannot find name 'RepositoryConfig'.... |
| TS4114 | 8 | This member must have an 'override' modifier becau... |
| TS2307 | 7 | Cannot find module '../settings/services/settings-... |
| TS6192 | 6 | All imports in import declaration are unused.... |
| TS7053 | 5 | Element implicitly has an 'any' type because expre... |
| TS2305 | 5 | Module '"@shared/types/ids"' has no exported membe... |
| TS2306 | 4 | File '/home/developer/Degentalk-BETA/shared/dist/t... |
| TS2416 | 4 | Property 'emit' in type 'EventBusMock' is not assi... |
| TS2678 | 4 | Type '"developer"' is not comparable to type 'User... |
| TS2551 | 3 | Property 'dgtTransactionId' does not exist on type... |
| TS2559 | 3 | Type 'number' has no properties in common with typ... |
| TS2484 | 3 | Export declaration conflicts with exported declara... |
| TS2576 | 3 | Property 'on' does not exist on type 'EventBus'. D... |
| TS1205 | 3 | Re-exporting a type when 'isolatedModules' is enab... |
| TS2367 | 3 | This comparison appears to be unintentional becaus... |
| TS2308 | 2 | Module './auth/sessions' has already exported a me... |
| TS2353 | 2 | Object literal may only specify known properties, ... |
| TS2300 | 2 | Duplicate identifier 'mockResponses'.... |
| TS18047 | 2 | 'supabase' is possibly 'null'.... |
| TS4053 | 2 | Return type of public method from exported class h... |
| TS2742 | 2 | The inferred type of 'router' cannot be named with... |
| TS6307 | 1 | File '/home/developer/Degentalk-BETA/server/config... |
| TS7016 | 1 | Could not find a declaration file for module 'modu... |
| TS2862 | 1 | Type 'T' is generic and can only be indexed for re... |
| TS2556 | 1 | A spread argument must either have a tuple type or... |
| TS2310 | 1 | Type 'User' recursively references itself as a bas... |
| TS2532 | 1 | Object is possibly 'undefined'.... |
| TS2420 | 1 | Class 'GoogleCloudStorageService' incorrectly impl... |
| TS2351 | 1 | This expression is not constructable.... |
| TS2430 | 1 | Interface 'AuthenticatedRequest' incorrectly exten... |
| TS2352 | 1 | Conversion of type 'UserId' to type 'AdminId' may ... |
| TS6138 | 1 | Property 'config' is declared but its value is nev... |
| TS2538 | 1 | Type 'undefined' cannot be used as an index type.... |
| TS7034 | 1 | Variable 'updatedSettings' implicitly has type 'an... |
| TS7005 | 1 | Variable 'updatedSettings' implicitly has an 'any[... |
| TS6198 | 1 | All destructured elements are unused.... |
| TS2362 | 1 | The left-hand side of an arithmetic operation must... |
| TS2363 | 1 | The right-hand side of an arithmetic operation mus... |

## Errors by Category

### Category Summary
| Category | Count | Description |
|----------|-------|-------------|
| other | 655 | Other TypeScript errors |
| unused-relations | 300 | Unused relation definitions in schema files |
| unused-declarations | 242 | Variables declared but never read |
| unused-schema-imports | 216 | Unused imports in database schema files |
| unused-imports | 25 | Imported items that are never used |
| unused-type-imports | 12 | Type imports that are never used |
| typos-wrong-property | 3 | Property name typos or incorrect references |
| duplicate-exports | 2 | Module exports conflict |

## Top 10 Files with Most Errors
| File | Error Count |
|------|-------------|
| db/schema/economy/relations.ts | 60 |
| server/src/domains/advertising/ad-admin.controller.ts | 57 |
| db/schema/forum/relations.ts | 40 |
| db/schema/admin/relations.ts | 36 |
| server/src/domains/admin/sub-domains/backup-restore/backup-restore.controller.ts | 36 |
| db/schema/user/relations.ts | 34 |
| server/src/domains/admin/sub-domains/settings/ui-config.controller.ts | 34 |
| server/src/domains/admin/sub-domains/users/users.service.ts | 31 |
| db/schema/advertising/relations.ts | 30 |
| server/src/domains/admin/sub-domains/users/bulk-operations.service.ts | 30 |

## Detailed Analysis by Category

### other (655 errors)

**server/index.ts**
- Line 23: File '/home/developer/Degentalk-BETA/server/config/loadEnv.ts' is not listed within the file list of project '/home/developer/Degentalk-BETA/server/tsconfig.json'. Projects must list all files or use an 'include' pattern.

**server/lib/report-error.ts**
- Line 27: Object literal may only specify known properties, and 'service' does not exist in type 'ErrorContext'.

**server/register-path-aliases.ts**
- Line 3: Could not find a declaration file for module 'module-alias'. '/home/developer/Degentalk-BETA/node_modules/.pnpm/module-alias@2.2.3/node_modules/module-alias/index.js' implicitly has an 'any' type.

**server/routes.ts**
- Line 48: All imports in import declaration are unused.
- Line 112: Not all code paths return a value.
- Line 207: Not all code paths return a value.
- ... and 1 more

**server/src/core/background-processor.ts**
- Line 37: Parameter 'dbError' implicitly has an 'any' type.

_... and 82 more files_

### unused-relations (300 errors)

**db/schema/admin/relations.ts**
- Line 14: 'contentModerationActions' is declared but its value is never read.
- Line 15: 'moderatorNotes' is declared but its value is never read.
- Line 17: 'scheduledTasks' is declared but its value is never read.
- ... and 33 more

**db/schema/advertising/relations.ts**
- Line 8: 'adGovernanceVotes' is declared but its value is never read.
- Line 9: 'campaignMetrics' is declared but its value is never read.
- Line 10: 'adPlacements' is declared but its value is never read.
- ... and 27 more

**db/schema/collectibles/relations.ts**
- Line 37: 'many' is declared but its value is never read.
- Line 48: 'many' is declared but its value is never read.
- Line 59: 'many' is declared but its value is never read.
- ... and 3 more

**db/schema/dictionary/relations.ts**
- Line 8: 'dictionaryUpvotes' is declared but its value is never read.
- Line 10: 'many' is declared but its value is never read.
- Line 8: 'dictionaryUpvotes' is declared but its value is never read.
- ... and 1 more

**db/schema/economy/relations.ts**
- Line 8: 'airdropSettings' is declared but its value is never read.
- Line 11: 'dgtPackages' is declared but its value is never read.
- Line 12: 'dgtPurchaseOrders' is declared but its value is never read.
- ... and 57 more

_... and 8 more files_

### unused-declarations (242 errors)

**shared/lib/emoji/unlockEmojiPack.ts**
- Line 18: 'params' is declared but its value is never read.
- Line 18: 'params' is declared but its value is never read.
- Line 18: 'params' is declared but its value is never read.

**shared/lib/forum/getAvailablePrefixes.ts**
- Line 4: 'forumSlug' is declared but its value is never read.
- Line 4: 'forumSlug' is declared but its value is never read.
- Line 4: 'forumSlug' is declared but its value is never read.

**shared/lib/forum/prefixEngine.ts**
- Line 9: 'forumSlug' is declared but its value is never read.
- Line 9: 'stats' is declared but its value is never read.
- Line 9: 'forumSlug' is declared but its value is never read.
- ... and 3 more

**shared/lib/forum/shouldAwardXP.ts**
- Line 4: 'forumSlug' is declared but its value is never read.
- Line 4: 'forumSlug' is declared but its value is never read.
- Line 4: 'forumSlug' is declared but its value is never read.

**shared/lib/mentions/createMentionsIndex.ts**
- Line 18: 'params' is declared but its value is never read.
- Line 18: 'params' is declared but its value is never read.
- Line 18: 'params' is declared but its value is never read.

_... and 69 more files_

### unused-schema-imports (216 errors)

**db/schema/admin/announcements.ts**
- Line 14: 'createInsertSchema' is declared but its value is never read.
- Line 14: 'createInsertSchema' is declared but its value is never read.

**db/schema/admin/brandConfig.ts**
- Line 9: 'index' is declared but its value is never read.
- Line 9: 'index' is declared but its value is never read.

**db/schema/admin/emailTemplates.ts**
- Line 10: 'index' is declared but its value is never read.
- Line 12: 'sql' is declared but its value is never read.
- Line 10: 'index' is declared but its value is never read.
- ... and 1 more

**db/schema/admin/featureFlags.ts**
- Line 11: 'index' is declared but its value is never read.
- Line 11: 'index' is declared but its value is never read.

**db/schema/admin/mediaLibrary.ts**
- Line 9: 'unique' is declared but its value is never read.
- Line 9: 'unique' is declared but its value is never read.

_... and 81 more files_

### unused-imports (25 errors)

**shared/events/domain-event-catalog.ts**
- Line 17: 'EventPriority' is declared but never used.
- Line 17: 'EventPriority' is declared but never used.
- Line 17: 'EventPriority' is declared but never used.

**shared/lib/moderation/types.ts**
- Line 1: 'AdminId' is declared but never used.
- Line 1: 'AdminId' is declared but never used.
- Line 1: 'AdminId' is declared but never used.

**shared/utils/id-conversions.ts**
- Line 8: 'UserId' is declared but never used.
- Line 8: 'UserId' is declared but never used.
- Line 8: 'UserId' is declared but never used.

**shared/utils/title-utils.ts**
- Line 6: 'UnlockRequirements' is declared but never used.
- Line 6: 'UnlockRequirements' is declared but never used.
- Line 6: 'UnlockRequirements' is declared but never used.

**server/src/core/base-controller.ts**
- Line 10: 'ApiResponse' is declared but never used.
- Line 12: 'ApiError' is declared but never used.
- Line 13: 'ApiErrorCode' is declared but never used.

_... and 8 more files_

### unused-type-imports (12 errors)

**shared/types/entities/title.types.ts**
- Line 6: 'RoleId' is declared but never used.
- Line 6: 'RoleId' is declared but never used.
- Line 6: 'RoleId' is declared but never used.

**shared/types/wallet.transformer.ts**
- Line 12: 'DgtTransfer' is declared but never used.
- Line 12: 'DgtTransfer' is declared but never used.
- Line 12: 'DgtTransfer' is declared but never used.

**shared/types/wallet.types.ts**
- Line 17: 'WithdrawalAmount' is declared but never used.
- Line 20: 'WithdrawalStatus' is declared but never used.
- Line 17: 'WithdrawalAmount' is declared but never used.
- ... and 3 more

### typos-wrong-property (3 errors)

**db/schema/shop/relations.ts**
- Line 73: Property 'dgtTransactionId' does not exist on type 'PgTableWithColumns<{ name: "user_inventory"; schema: undefined; columns: { id: PgColumn<{ name: "id"; tableName: "user_inventory"; dataType: "string"; columnType: "PgUUID"; data: string; driverParam: string; notNull: true; ... 7 more ...; generated: undefined; }, {}, {}>; ... 7 more ...; metadata: PgColumn<...>; }; ...'. Did you mean 'transactionId'?
- Line 73: Property 'dgtTransactionId' does not exist on type 'PgTableWithColumns<{ name: "user_inventory"; schema: undefined; columns: { id: PgColumn<{ name: "id"; tableName: "user_inventory"; dataType: "string"; columnType: "PgUUID"; data: string; driverParam: string; notNull: true; ... 7 more ...; generated: undefined; }, {}, {}>; ... 7 more ...; metadata: PgColumn<...>; }; ...'. Did you mean 'transactionId'?

**server/src/core/repository/repositories/user-repository.ts**
- Line 162: Property 'lastLoginAt' does not exist on type 'PgTableWithColumns<{ name: "users"; schema: undefined; columns: { id: PgColumn<{ name: "user_id"; tableName: "users"; dataType: "string"; columnType: "PgUUID"; data: string; driverParam: string; notNull: true; hasDefault: true; ... 6 more ...; generated: undefined; }, {}, {}>; ... 71 more ...; groupId: PgColumn<...>...'. Did you mean 'lastLogin'?

### duplicate-exports (2 errors)

**db/schema/index.ts**
- Line 28: Module './auth/sessions' has already exported a member named 'userSessions'. Consider explicitly re-exporting to resolve the ambiguity.
- Line 28: Module './auth/sessions' has already exported a member named 'userSessions'. Consider explicitly re-exporting to resolve the ambiguity.

## Recommendations

Based on the analysis:

1. **Unused Relations (300 errors)**
   - These are mostly in `relations.ts` files where relationships are defined but not actively used
   - **Action**: Keep these - they document the database relationships even if not used in queries

2. **Unused Schema Imports (216 errors)**
   - Drizzle ORM imports like `index`, `integer`, `sql` that aren't used
   - **Action**: Safe to remove if truly unused, but verify they're not used in migrations

3. **Unused Declarations (242 errors)**
   - Function parameters and variables declared but not used
   - **Action**: Review case-by-case - some might be intentional for API compatibility

4. **Unused Type Imports (12 errors)**
   - Type imports that aren't referenced
   - **Action**: Generally safe to remove, but check if used in type assertions

5. **Other Issues**
   - Duplicate exports: Need manual resolution
   - Property typos: Should be fixed immediately

## Next Steps

1. Fix critical errors first (duplicate exports, typos)
2. Review and clean up truly unused imports
3. Keep relationship definitions even if unused
4. Add TypeScript ignore comments for intentionally unused items
