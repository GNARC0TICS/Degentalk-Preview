# 🛠️ Scripts Directory

This folder hosts one-off utilities, maintenance tools, and developer helpers.  Sub-folders are grouped by domain so you can find the right script quickly.

| Sub-folder | Purpose |
| ---------- | ------- |
| `admin/`   | Admin-panel maintenance (e.g. index optimizers, controller validators) |
| `codemods/`| Automated code transformations (jscodeshift / ts-morph) |
| `db/`      | Database helpers, seeders, and migration generators |
| `dev/`     | Local-dev tooling (e.g. environment sync, demo data) |
| `migration/`| Manual data migrations that don't fit Drizzle workflows |
| `ops/`     | Operational scripts (cron helpers, deployment verifiers) |
| `quality/` | Quality metrics and reports |
| `refactor/`| Large-scale refactor helpers |
| `seed/`    | Seed data for local or staging environments |
| `testing/` | Test harnesses and smoke tests |
| `tools/`   | Generic generators such as `generate-tree.js` |
| `validation/` | Schema & config validators |
| `wallet/`  | Wallet-specific migration aides |

## Running a Script

Almost every script is built with `tsx` and can be executed via npm-based helpers:

```bash
# Example: regenerate forum SDK
yarn tsx scripts/build-forum-sdk.ts    # or npm run build-forum-sdk
```

Many scripts have an accompanying `--help` flag.  Always dry-run first when available.

## Conventions

1. **TypeScript First** – use `.ts` or `.tsx`; Node ESM loader (`tsx`) handles them.
2. **No Side Effects on Import** – scripts should execute logic only inside `main()`.
3. **Verbose Logging** – prefer `console.log` wrappers in `scripts/logs/` for consistency.
