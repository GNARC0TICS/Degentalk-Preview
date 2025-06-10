# CONFIG_MIGRATION_LOG.md

| File                                      | Lines Changed | Original Value / Description                | New Config Path / Note                                 |
|-------------------------------------------|---------------|---------------------------------------------|--------------------------------------------------------|
| shared/path-config.ts                     | 13-22         | Hardcoded xpRewards object                  | economyConfig.xp (imported) [CONFIG-REFAC]             |
| client/src/constants/zoneRegistry.ts      | ALL           | Hardcoded zoneRegistry object               | forumRulesConfig.forums (imported) [CONFIG-REFAC]      |
| client/src/pages/admin/xp/settings.tsx    | 24-38         | Hardcoded defaultXpSettings object          | economyConfig.xp (imported) [CONFIG-REFAC]             |
| client/src/pages/admin/tip-rain-settings.tsx | 19-36, 39-46 | Hardcoded tipFormData, rainFormData         | economyConfig.tipRain.tip/rain (imported) [CONFIG-REFAC]|
| client/src/lib/utils/applyPluginRewards.ts | 4-8           | SYSTEM_ROLE_COLORS object                   | cosmeticsConfig.systemRoleColors (imported) [CONFIG-REFAC]|
| db/schema/user/roles.ts                   | 3             | Role definitions in DB schema               | rolesConfig.roles (imported) [CONFIG-REFAC]            |
| client/src/pages/admin/shop/edit.tsx      | 13-38         | getCosmeticTemplate hardcoded templates     | cosmeticsConfig.shopTemplates (imported) [CONFIG-REFAC]|
| lib/config-utils.ts                       | ALL           | N/A (new file)                             | Helper accessors for config-driven lookups              |
| `client/src/config/cosmetics.config.ts`    | 14-15, 79-85                                    | Added `tailwindClass` to `RaritySchema` & `rarities` data. Added `uncommon` rarity. | N/A (schema/data update) [CONFIG-REFAC]                                                |
| `client/src/pages/admin/badges.tsx`        | 42, 45, 80, 237-240, 302-309, 366-373, 488-491 | Hardcoded rarity CSS classes & dropdown options.             | `cosmeticsConfig.rarities` for dynamic options & `tailwindClass`. [CONFIG-REFAC]     |
| `client/src/config/cosmetics.config.ts`    | Various (schema & data additions)                  | Added `EmojiCategorySchema`, `EmojiUnlockMethodSchema` & corresponding data. | N/A (schema/data update) [CONFIG-REFAC]                                                |
| `client/src/pages/admin/emojis.tsx`        | 51, 53, 78, 80, 241, 243, 638-645, 708-715        | Hardcoded emoji categories & unlock methods in form.           | `cosmeticsConfig.emojiCategories` & `emojiUnlockMethods` for dynamic options. [CONFIG-REFAC] |
| `client/src/pages/admin/dgt-packages.tsx`    | 47            | Missing `.ts` in `economyConfig` import | Corrected import to `economy.config.ts` [CONFIG-REFAC] |
| `client/src/config/economy.config.ts`    | Various (schema & data additions)         | Added `AirdroppableTokenSchema` & data.       | N/A (schema/data update) [CONFIG-REFAC]                            |
| `client/src/pages/admin/airdrop.tsx`     | 13, 23, 33, 35, 56, 119-126                | Hardcoded airdrop token types in state & form.    | `economyConfig.airdroppableTokens` for dynamic options. [CONFIG-REFAC] |
| `client/src/config/economy.config.ts`             | 162                                       | Updated `tipRain.tip.cooldownSeconds` to match component default.   | Value changed from 60 to 10. [CONFIG-REFAC]                                         |
| `client/src/config/roles.config.ts`               | 26-27, 58, 65                             | Added `bypassCooldowns` to `RoleSchema` and `admin`, `mod` roles.       | N/A (schema/data update) [CONFIG-REFAC]                                             |
| `client/src/components/admin/cooldown-settings.tsx` | 13-14, 40-43                              | Hardcoded default cooldowns and role bypass settings.               | Initial state now uses `economyConfig.tipRain` and `rolesConfig.roles`. [CONFIG-REFAC] |
| `client/src/pages/admin/user-groups.tsx`        | 45, 75-113, 131-286                          | Hardcoded `permissionCategories` array & massive `getPermissionDetails` function. | `rolesConfig.permissions` for dynamic categories & permission details. [CONFIG-REFAC] |
| `client/src/config/cosmetics.config.ts`         | Various (schema & data additions)             | Added `ColorSchemeSchema` & `colorSchemes` data for Tailwind colors. | N/A (schema/data update) [CONFIG-REFAC]                                              |
| `client/src/pages/admin/prefixes.tsx`           | 47, 66, 82-101                               | Hardcoded `availableColors` array & default form color value.       | `cosmeticsConfig.colorSchemes` for dynamic color options. [CONFIG-REFAC]            |
| `client/src/config/forumRules.config.ts`        | Various (schema & data additions)             | Added `ThreadStatusOptionSchema`, `ThreadSortOptionSchema` & data.   | N/A (schema/data update) [CONFIG-REFAC]                                              |
| `client/src/pages/admin/threads.tsx`            | 42, 44, 46, 120-122, 225-232, 250-257        | Hardcoded thread status & sort filter options.                       | `forumRulesConfig.threadStatusOptions` & `threadSortOptions` for dynamic options. [CONFIG-REFAC] |
| `client/src/config/forumRules.config.ts`        | Various (schema & data additions)             | Added `PrefixStyleSchema` & `prefixStyles` data, extended `threadSortOptions`. | N/A (schema/data update) [CONFIG-REFAC]                                              |
| `client/src/config/cosmetics.config.ts`         | Various (schema & data additions)             | Added `TagStyleSchema` & `tagStyles` data for forum tag styling.    | N/A (schema/data update) [CONFIG-REFAC]                                              |
| `client/src/components/forum/forum-filters.tsx` | 5, 7-8, 11-30, 37-39, 67-81, 91-105, 115-139 | Hardcoded `prefixStyles`, `tagStyles` objects & sort button definitions. | `forumRulesConfig.prefixStyles`, `cosmeticsConfig.tagStyles` & dynamic rendering. [CONFIG-REFAC] |

---

All changes use [CONFIG-REFAC] comments. Any ambiguous or TODO values are logged in the main config files as previously noted.
