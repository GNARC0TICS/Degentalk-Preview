# Workspace Architecture - DDD Bounded Contexts

This document defines the Domain-Driven Design (DDD) bounded context architecture for the Degentalk monorepo workspace.

## 🏗️ Architectural Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DEGENTALK WORKSPACE                     │
├─────────────────────────────────────────────────────────────┤
│  @degentalk/scripts (DevOps & Tooling Context)            │
│  ├─ Database operations, seeding, validation              │
│  └─ Dependencies: ALL packages (operational layer)        │
├─────────────────────────────────────────────────────────────┤
│  @degentalk/client (Presentation Context)                 │
│  ├─ React UI, user interactions, presentation logic       │
│  └─ Dependencies: @degentalk/shared ONLY                  │
├─────────────────────────────────────────────────────────────┤
│  @degentalk/server (Business Domain Context)              │
│  ├─ 25+ business domains with strict boundaries           │
│  └─ Dependencies: @degentalk/shared, @degentalk/db        │
├─────────────────────────────────────────────────────────────┤
│  @degentalk/db (Data Persistence Context)                 │
│  ├─ Schema definitions, database operations               │
│  └─ Dependencies: @degentalk/shared ONLY                  │
├─────────────────────────────────────────────────────────────┤
│  @degentalk/shared (Cross-cutting Concerns Context)       │
│  ├─ Types, utilities, business rules, constants           │
│  └─ Dependencies: NONE (foundation layer)                 │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Bounded Context Definitions

### 1. Foundation Layer

**`@degentalk/shared`** - Cross-cutting Concerns Context
- **Purpose**: Shared types, utilities, business rules
- **Boundaries**: No external dependencies, pure functions only
- **Exports**: Types, validators, business logic, constants
- **Dependencies**: None

### 2. Data Layer

**`@degentalk/db`** - Data Persistence Context  
- **Purpose**: Schema definitions, database operations, migrations
- **Boundaries**: Database-only concerns, no business logic
- **Exports**: Schema, types, database utilities
- **Dependencies**: `@degentalk/shared`

### 3. Business Layer

**`@degentalk/server`** - Business Domain Context
- **Purpose**: Core business logic organized into 25+ domains
- **Boundaries**: Business rules, domain services, API controllers
- **Exports**: REST APIs, business services
- **Dependencies**: `@degentalk/shared`, `@degentalk/db`

#### Business Domains

| Domain | Responsibility | Sub-Domains |
|--------|---------------|-------------|
| `auth` | Authentication & authorization | X integration, RBAC |
| `forum` | Core forum functionality | Threads, posts, moderation |
| `wallet` | DGT economy & crypto | CCPayment, transfers, balances |
| `engagement` | Social features | Tips, rain events, interactions |
| `gamification` | XP & achievements | Levels, missions, leaderboards |
| `admin` | Administrative operations | User management, analytics |
| `messaging` | Communication | Shoutbox, DMs, notifications |
| `shop` | Digital marketplace | Cosmetics, inventory, purchases |
| `social` | Social graph | Friends, follows, mentions |
| `advertising` | Ad system | Campaigns, serving, tracking |
| And 15+ more specialized domains |

### 4. Presentation Layer

**`@degentalk/client`** - User Experience Context
- **Purpose**: React UI, user interactions, presentation logic
- **Boundaries**: UI-only, no direct database access
- **Exports**: Web application bundle
- **Dependencies**: `@degentalk/shared`

### 5. Operations Layer

**`@degentalk/scripts`** - DevOps & Tooling Context
- **Purpose**: Automation, seeding, validation, deployment
- **Boundaries**: Development and operational tooling only
- **Exports**: CLI tools, build scripts, validators
- **Dependencies**: All packages (operational privileges)

## 🔒 Dependency Flow Rules

### Strict Hierarchical Flow

```
scripts → db, shared, server, client  (DevOps layer)
   ↓
client → shared                        (Presentation layer)  
   ↓
server → db, shared                    (Business layer)
   ↓
db → shared                           (Data layer)
   ↓
shared → [no dependencies]            (Foundation layer)
```

### Enforcement Mechanisms

#### 1. Package Configuration
```json
// package.json
"pnpm": {
  "dependencyRules": {
    "@degentalk/shared": {
      "disallowedDependencies": ["@degentalk/*"]
    },
    "@degentalk/client": {
      "allowedDependencies": ["@degentalk/shared"],
      "disallowedDependencies": ["@degentalk/db", "@degentalk/server"]
    }
  }
}
```

#### 2. ESLint Rules
- `degen/no-cross-context-imports` - Prevents architectural violations
- Real-time feedback during development
- CI/CD integration for automated checking

#### 3. Build-time Validation
```bash
npm run validate:boundaries    # Check architectural compliance
npm run validate:dependencies  # Verify dependency constraints
```

## 📋 Workspace Conventions

### Naming Conventions
- **Packages**: `@degentalk/{context-name}` (kebab-case)
- **Domains**: Singular nouns (`auth`, `forum`, `wallet`)
- **Files**: Purpose suffix (`auth.service.ts`, `forum.controller.ts`)

### Code Organization Patterns

#### Server Domains
```
domain/
├── {domain}.controller.ts     # HTTP request handling
├── {domain}.service.ts        # Business logic
├── {domain}.routes.ts         # Route definitions
├── {domain}.validators.ts     # Input validation
├── sub-domains/              # Nested contexts
└── services/                 # Domain services
```

#### Client Features
```
features/{feature}/
├── hooks/                    # React hooks
├── components/              # UI components
├── services/               # API integration
└── types/                  # Feature-specific types
```

#### Shared Modules
```
shared/
├── types/                  # TypeScript definitions
├── validators/            # Zod schemas
├── constants/            # Application constants
├── utils/               # Pure utility functions
└── config/             # Configuration objects
```

### Cross-Context Communication

#### API Contracts
```typescript
// Defined in @degentalk/shared
export interface CreateThreadRequest {
  title: string;
  content: string;
  categoryId: string;
}

export interface ThreadCreatedEvent {
  threadId: string;
  authorId: string;
  categoryId: string;
}
```

#### Event-Driven Architecture
```typescript
// Server domain communication
import { EventBus } from '@degentalk/shared/events';

// Publish domain events
EventBus.publish(new ThreadCreatedEvent(thread));

// Subscribe to domain events
EventBus.subscribe(ThreadCreatedEvent, async (event) => {
  await XpService.awardForumActivity(event.authorId);
});
```

## 🛠️ Development Workflow

### Adding New Features

1. **Identify bounded context** - Which domain owns this capability?
2. **Define API contract** - Add types to `@degentalk/shared`
3. **Implement business logic** - Add service to appropriate domain
4. **Create API endpoints** - Add controller and routes
5. **Build UI components** - Add to `@degentalk/client`
6. **Add validation** - Update scripts for consistency

### Modifying Existing Features

1. **Check domain boundaries** - Ensure changes stay within context
2. **Update shared contracts** - Modify types if needed
3. **Maintain backward compatibility** - Use versioning for breaking changes
4. **Run validation** - Check architectural compliance
5. **Update tests** - Maintain test coverage

## 🚨 Common Anti-Patterns

### ❌ Violations to Avoid

```typescript
// ❌ Cross-domain direct import
import { ForumService } from '../forum/forum.service';

// ❌ Business logic in client
const calculateXp = (posts: number) => posts * 10;

// ❌ Database access from client
import { db } from '@degentalk/db';

// ❌ Circular dependencies
// auth.service.ts imports user.service.ts
// user.service.ts imports auth.service.ts
```

### ✅ Correct Patterns

```typescript
// ✅ Event-driven communication
EventBus.publish(new UserRegisteredEvent(user));

// ✅ Shared business logic
import { calculateXp } from '@degentalk/shared/utils';

// ✅ API integration in client
import { apiRequest } from '@/lib/api';

// ✅ Dependency injection
constructor(
  private xpService: XpService,
  private notificationService: NotificationService
) {}
```

## 📊 Architecture Benefits

### Development Velocity
- **Clear ownership** - Teams know which domain to modify
- **Parallel development** - Minimal conflicts between features
- **Onboarding speed** - New developers understand structure quickly

### Maintainability
- **Isolated changes** - Modifications stay within domain boundaries
- **Testable components** - Clear interfaces enable unit testing
- **Refactoring safety** - Architectural constraints prevent breaking changes

### Scalability
- **Team scaling** - Different teams can own different domains
- **Feature isolation** - New features don't impact existing functionality
- **Performance optimization** - Clear boundaries enable targeted improvements

## 🔍 Validation & Monitoring

### Automated Checks
```bash
# Pre-commit hooks
npm run validate:boundaries
npm run validate:dependencies
npm run lint

# CI/CD pipeline
npm run test
npm run build
npm run validate:workspace
```

### Architecture Metrics
- Domain coupling measurements
- Dependency violation counts
- Cross-context import detection
- Test coverage per domain

This architecture ensures a maintainable, scalable codebase that can evolve with the platform's growth while maintaining clear boundaries between different areas of concern.