# 🏦 Shared Economy Modules

This directory is **the** single source of truth for the Degentalk XP & DGT economy.
All backend services, frontend widgets, admin panels and scripts **import only** from
these modules—never re-declare numbers or formulas elsewhere.

## Files

| File                   | Purpose                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| `economy.config.ts`    | Smart-adjustable constants & level map validated by Zod. Imported everywhere. |
| `reward-calculator.ts` | Pure helpers: level math, cap checks, `calculateXp()` dispatcher.             |
| `shop-items.ts`        | Canonical catalogue for the Degen Shop. Used by client & API.                 |
| `rain-tip-config.ts`   | Limits, cooldowns and fee rules for `/tip` & `/rain`.                         |

## Editing Workflow

1. Make your changes in **this folder only**.
2. Run `npm run check` – Zod will validate the config at build time.
3. Update `XP-DGT-SOURCE-OF-TRUTH.md` in repo root so docs stay in sync.
4. Submit PR labelled `economy-change`; requires team lead approval.

## Versioning & Overrides

- At runtime the backend may layer DB overrides on top of `economyConfig`.
  Until that feature ships, the TypeScript literal is the live config.
- Future: `economyConfig.version` will auto-invalidate caches when bumped.

---

> ⚠️ **Never** scatter economy literals in random files. CI will flag & reject.
