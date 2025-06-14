# ForumFusion Source of Truth

## Overview

ForumFusion powers DegenTalk's forum system using a config-driven, LLM-safe architecture. **Zones** are visual groupings; **forums** are the logic containers. All posting, XP, tipping, access, and prefix rules are defined in `forumMap.config.ts` and enforced at runtime via utility functions.

---

## Glossary
- **Zone**: Themed visual grouping of forums (e.g., "The Pit"). No logic.
- **Forum**: Logic container. All rules live here.
- **Thread**: A discussion within a forum.
- **Reply**: A comment within a thread.
- **Prefix**: Cosmetic badge/label on a thread, assigned by user, mod, or engine.

---

## Rule Logic & Enforcement

- All logic is defined in `client/src/config/forumMap.config.ts`.
- Use utility functions for all runtime checks:
  - `getForumRules(forumSlug)`
  - `canUserPost(forumSlug, user)`
  - `shouldAwardXP(forumSlug)`
  - `getAvailablePrefixes(forumSlug)`
  - `prefixEngine(forumSlug, threadStats)`
- **Never hardcode** forum logic in services or components.

---

## Prefix Logic Engine

Prefixes are assigned based on forum config:
- User-selectable (if in `availablePrefixes`)
- Mod-only (if `autoAssign: false`)
- Auto-assigned by engagement (see `prefixGrantRules`)

Example:
```ts
prefixEngine('general-brawls', { replies: 25, likes: 15 }) // => ['[HOT]']
```

---

## Usage Examples

**Check if user can post:**
```ts
canUserPost('alpha-leaks', user)
```

**Should award XP?**
```ts
shouldAwardXP('signals-ta')
```

**Get available prefixes:**
```ts
getAvailablePrefixes('pit-memes')
```

---

## Anti-Patterns
- ❌ Hardcoding XP logic in `forum.service.ts`
- ❌ Creating new seed files for zones/forums manually
- ❌ Relying on a `zones` DB table (doesn't exist)
- ❌ Ignoring config and writing logic per-forum in code

---

## Seeding & Syncing
- All zones and forums are seeded from `forumMap.config.ts` using `scripts/dev/syncForumsToDB.ts`.
- Do not manually define forums or zones.

---

## LLM & Developer Onboarding
- Always start from `forumMap.config.ts`.
- Use the provided utility functions for all forum logic.
- Zones are UI containers only — logic is defined per-forum.
- When in doubt, check this doc and the config.

---

## Common Questions

**Q: Can I add a new forum by editing the DB?**
A: No. Add it to `forumMap.config.ts` and run the sync script.

**Q: How do I change XP or tipping rules?**
A: Edit the `rules` object for the forum in the config.

**Q: How do I theme a zone or forum?**
A: Use the `theme` or `themeOverride` fields in the config.

---

> 🚨 **This file and `forumMap.config.ts` are the only valid sources of truth for forum logic.** 