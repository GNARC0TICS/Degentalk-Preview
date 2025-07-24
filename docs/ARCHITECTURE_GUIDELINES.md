# DegenTalk Backend Architecture Guidelines

## 1. Domain-Driven Design (DDD)

The backend follows a strict Domain-Driven Design structure. Each business domain resides in its own directory under `server/src/domains/`.

- **Location:** `server/src/domains/[domain-name]/`

## 2. Strict Domain Boundaries

Domains are isolated and must not have direct dependencies on each other's internal components.

- **Public API:** Each domain MUST expose its public API (services, types, events) through a single `index.ts` file.
- **Restricted Imports:** You are ONLY allowed to import from another domain's `index.ts` file. Direct imports from `domains/[domain]/services` or `domains/[domain]/repository` are strictly forbidden and enforced by ESLint.

## 3. Cross-Domain Communication: EventBus

All communication **between** domains MUST be asynchronous and handled via the global `EventBus`.

- **Emitting Events:** When a domain performs a significant action, it should emit a domain event (e.g., `DomainEvents.USER_REGISTERED`).
- **Listening to Events:** To react to an action in another domain, create a handler in your domain's `handlers/` directory and subscribe to the relevant event using `EventBus.on()`.
- **NO direct cross-domain service calls.**

## 4. Service and Repository Pattern

- **Services (`*.service.ts`):** Contain business logic. They orchestrate tasks but should not perform direct database queries.
- **Repositories (`*.repository.ts`):** Handle all data access. All `drizzle-orm` queries (`db.*`) MUST be located exclusively in repository files. Services call methods on their local repository to interact with the database.

## 5. Use of Core Services

- **Caching:** All caching operations must use the unified `CacheService` located at `server/src/core/cache/cache.service.ts`.
- **Configuration:** All access to environment variables or application settings should go through the `ConfigService`.
- **Error Handling:** Use the standardized custom error classes from `core/errors.ts`.

## 6. Shared Types

- **Core Entities:** Base type definitions for core entities (User, Thread, etc.) are located in `shared/types/entities/`.
- **Domain-Specific Extensions:** Domains can extend these shared types for their specific needs in their local `types.ts` file, but they must not redefine the core entities.

## 7. Import Path Standards

Following the import standardization plan, all domain imports should use the `@api/domains/` alias:

```typescript
// ✅ Correct - imports from domain's public API
import { userService } from '@api/domains/users';

// ❌ Forbidden - direct import from internal domain structure
import { userService } from '@api/domains/users/services/user.service';
```

This architecture ensures clean separation of concerns, maintainable code, and prevents circular dependencies while enabling proper domain isolation. 