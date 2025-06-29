---
title: Validation Guidelines
status: STABLE
updated: 2025-06-28
---

# Backend Validation Guidelines

These guidelines describe how to validate incoming HTTP requests in Degentalk using **Zod** helpers.

## Helper Functions

All admin controllers MUST use the shared helpers exported from `server/src/domains/admin/admin.validation.ts`.

```ts
import { validateRequestBody, validateQueryParams } from '@/domains/admin/admin.validation';
```

### `validateRequestBody(req, res, schema)`

•  Parses `req.body` with the provided Zod `schema`.
•  On validation error → sends **400** with `errors` payload and **early-returns**.
•  On success → returns the parsed data (`const data = …`).

### `validateQueryParams(req, res, schema)`

Same contract as above but operates on `req.query`.

### Pattern

```ts
const data = validateRequestBody(req, res, XpActionCreateSchema);
if (!data) return; // Early exit on failure

// …business logic using `data`
```

## Why Helpers?

1. **Consistency** – Centralised error formatting.
2. **Brevity** – Removes repetitive `schema.safeParse` boilerplate.
3. **Maintainability** – Update validation behaviour in one place.

## When to Create a Schema

•  Every POST/PUT/PATCH endpoint with a non-trivial body.
•  Complex query param sets (pagination, filters, date ranges).
•  URL params that require type coercion (use `validateNumberParam`).

## Shared Validator Location

Place reusable schemas in `shared/validators/`.

Example:

```ts
// shared/validators/admin.ts
export const PermissionGroupCreateSchema = z.object({
  name: z.string().min(1),
  permissions: z.array(z.string())
});
```

## Type Inference

Always export a matching TypeScript type:

```ts
type PermissionGroupCreateInput = z.infer<typeof PermissionGroupCreateSchema>;
```

This guarantees controller & service layers stay in sync with validation rules.

## Legacy Code Removal

Run:

```bash
grep -R "safeParse(" server/src/domains/admin/sub-domains | wc -l
```

Expected output: **0**.  Any remaining usages should be refactored.

---

*Last updated: 2025-06-28* 