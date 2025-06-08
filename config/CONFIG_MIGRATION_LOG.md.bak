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
| client/src/pages/admin/dgt-packages.tsx   | Various       | DGT package amounts, prices, discounts      | economyConfig.shop.dgtPackages (example comments added for dynamic pricing) [CONFIG-REFAC] |
| lib/config-utils.ts                       | ALL           | N/A (new file)                             | Helper accessors for config-driven lookups              |

---

All changes use [CONFIG-REFAC] comments. Any ambiguous or TODO values are logged in the main config files as previously noted.
