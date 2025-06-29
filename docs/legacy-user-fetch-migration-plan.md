# Phase-3 – Legacy `req.user` Cleanup

> **Purpose**  Centralise _all_ user-fetch logic behind `userService.getUserFromRequest()` and delete every direct `req.user` access across the backend.

## ✅ MIGRATION COMPLETE

**Status: COMPLETED** ✅  
**Date Completed: 2025-06-29**

* ✅ All legacy `req.user` patterns migrated to `userService.getUserFromRequest()`
* ✅ Legacy helper functions removed (duplicate `getUserId`, `getUserFromRequest` wrappers)
* ✅ Scanner updated to properly identify true legacy patterns vs. centralized pattern
* ✅ ESLint rule `degen/no-direct-req-user` active to prevent future violations
* ✅ Zero actionable legacy patterns remain in codebase

## 📊 Final Status

* **Scanner Result**: `🎉 No legacy user-fetch patterns found.`
* **ESLint Protection**: Active rule prevents future direct `req.user` usage
* **Core Auth Infrastructure**: Only 2 valid `req.user` references remain:
  - `authenticate.ts:59` - ✅ Sets `req.user` (core auth)
  - `user.service.ts:46` - ✅ Reads `req.user` (centralized service)

## 🔀  Work-groups & scope

| Group | Scope (files) | Rough count* | Primary tasks |
|-------|---------------|-------------|---------------|
| **A** | `*/**/*.controller.ts` | ~118 lines | Replace `req.user` → `userService.getUserFromRequest(req)`.<br>  Ensure extracted `authUser` is reused within the handler. |
| **B** | `*/routes/*.ts` | ~161 lines | Same replacement inside route callbacks.<br>  Route already wrapped in `asyncHandler` – DO NOT touch that. |
| **C** | `*/middleware/*.ts` | ~42 lines | Middleware must call the user-service then attach `req.authUser` (or similar). Never pass raw `req` to services. |
| **D** | `*/services/*.ts` | ~25 lines | Refactor service functions that accept `req` – change to `(userId, ...)`. Update all callers. |
| **E** | "Other" (utils, tests, comments) | ~48 lines | Decide case-by-case:<br>  – keep (e.g. in central auth glue)<br>  – delete / refactor<br>  – ignore if only a comment. |

\*Exact line counts are from the 2025-06-29 audit; may fluctuate as PRs merge.

---

## 📂  Getting your TODO list

```bash
# example for Group A (controllers)
grep ' | controller |' legacy-user-fetch-audit.md > controllers.todo

# unique file paths only
cut -d'|' -f1 controllers.todo | cut -d':' -f1 | sort -u > controllers-files.txt
```

Do the same with `routes`, `middleware`, `service`, `other` to produce a clean per-group checklist.

Commit these `*.todo / *-files.txt` helper lists (or paste into Notion/Sheets) so progress can be tracked.

---

## 🔧  Coding guidelines (all groups)

1. **The one true way**
   ```ts
   const authUser = userService.getUserFromRequest(req)!;
   const userId   = authUser.id;
   ```
   Never access `req.user` directly.
2. Delete local helpers such as `getUserId(req)` – they're obsolete.
3. If a service/middleware needs the user, pass `authUser` or `userId`, **not the whole `req`**.
4. Don't re-introduce new direct user reads or new helper wrappers.
5. After finishing your edits:
   ```bash
   npx tsx scripts/codemods/identify-legacy-user-fetch.ts --markdown /tmp/recheck.md
   ```
   Your category should report **zero** matches before committing.
6. Small, focused commits – use pattern:
   `refactor(<category>): remove req.user in <domain>`

---

## 📤  Deliverables & PR requirements

* One PR per group, branched off **feat/visual-config-phase1**.
* Title: `Phase-3 | <Group> – remove legacy user-fetch`.
* PR description **must** include:
  * List of files touched.
  * "Closes audit rows …" reference (helpful for tracking).
  * Confirmation that the scanner reports zero actionable matches in the group scope.
* CI must pass; the `identify-legacy-user-fetch` script will be part of CI soon.

---

## ✅ Definition of Done - ACHIEVED

* ✅ `npx tsx scripts/codemods/identify-legacy-user-fetch.ts` prints:
  ```
  🎉  No legacy user-fetch patterns found.
  ```
* ✅ ESLint rule `degen/no-direct-req-user` is active and passes.
* ✅ Documentation (this file) updated to reflect completion.

## 🚀 Migration Results

**All work groups completed:**
- ✅ **Group A**: Controllers - All using centralized pattern
- ✅ **Group B**: Routes - All using centralized pattern  
- ✅ **Group C**: Middleware - All using centralized pattern
- ✅ **Group D**: Services - All using centralized pattern
- ✅ **Group E**: Other - Legacy helpers removed

**Remaining valid patterns:**
- Core auth infrastructure preserved (`authenticate.ts`, `user.service.ts`)
- All business logic uses `userService.getUserFromRequest(req)`
- ESLint rule prevents future violations

---

### Questions / clarifications
Use the PR discussion thread or `#phase-3-refactor` Slack channel.

Happy refactoring 🚀 