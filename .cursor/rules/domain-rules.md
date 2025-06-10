# Domain Structure (Enforced)

All new backend logic must be placed in `server/src/domains/<domain>/`.

Each domain must use:
- `routes/`
- `services/`
- `types.ts`
- `controllers/` (optional)

❌ DO NOT place new files in:
- `server/services/`
- `server/routes/api/`
- `db/schema/core/enums.ts`

Enums must be colocated with their domain's schema file and exported via `db/schema/index.ts`.
