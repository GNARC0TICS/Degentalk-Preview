---
title: techContext
status: STABLE
updated: 2025-06-28
---

# Degentalk Technical Context

## Technology Stack

Degentalk uses a modern full-stack JavaScript/TypeScript architecture:

### Frontend
*   **Framework**: React 18 with TypeScript
*   **Routing**: wouter (lightweight React routing)
*   **State Management**:
    *   React Query for server state
    *   React Context API for global app state
    *   Local state for component-specific concerns
*   **UI Component Library**: Custom components based on shadcn/ui
*   **Styling**: Tailwind CSS with custom utility extensions
*   **Build System**: Vite
*   **Form Handling**: React Hook Form with Zod validation
*   **Structure**: Migrating to a feature-based structure (`client/src/features/`) as per `client/README.md`.

### Backend
*   **Server Framework**: Express.js with TypeScript
*   **Database**: PostgreSQL (specifically **NeonDB**) for staging/production and local dev
*   **ORM**: Drizzle ORM
*   **Authentication**: Passport.js with session-based auth (currently bypassed in development)
*   **Real-time Communication**: WebSockets (ws)
*   **API Structure**: RESTful API endpoints, migrating to a **domain-driven structure** (`server/src/domains/`).

### Shared
*   **Type Validation**: Zod for runtime validation
*   **Schema**: Database schema is managed via Drizzle ORM and migration files. The `shared/schema.ts` file **IS** the current source of truth for Drizzle schema definitions. Migration files are stored in `migrations/postgres`.
*   **API Client**: Standardizing on `apiRequest` from `@/lib/queryClient.ts` for client-side API calls, as per `.cursor/rules/api-client-pattern.mdc`.

## Development Environment

*   **Package Manager**: npm
*   **TypeScript Configuration**: Strict mode
*   **Environment Variables**: Handled via .env files
*   **Testing**: Not yet comprehensively implemented
*   **Deployment**: Not specified in codebase

## Key Technical Patterns

### Database Schema

The database schema is comprehensive and covers all major application domains, defined in `shared/schema.ts` and managed through Drizzle ORM migration files.

**NOTE:** `server/src/core/db.ts` connects to PostgreSQL (Neon) using the `DATABASE_URL` environment variable and imports the schema from `shared/schema.ts`.

1.  **User System**
    ```typescript
    // Users table structure (simplified from schema defined in migrations)
    export const users = pgTable('users', {
      id: serial('user_id').primaryKey(),
      uuid: uuid('uuid').notNull().defaultRandom(),
      username: text('username').notNull(),
      email: text('email').notNull(),
      password: text('password_hash').notNull(),
      // Authentication fields
      verifyToken: varchar('verify_token', { length: 255 }),
      resetToken: varchar('reset_token', { length: 255 }),
      resetTokenExpiresAt: timestamp('reset_token_expires_at'),
      // User profile
      bio: text('bio'),
      avatarUrl: varchar('avatar_url', { length: 255 }),
      // Economy fields
      dgtPoints: integer('dgt_points').notNull().default(0), // Legacy field?
      walletAddress: varchar('wallet_address', { length: 255 }), // Legacy field?
      walletBalanceUSDT: doublePrecision('wallet_balance_usdt').notNull().default(0), // Legacy field?
      // ... additional fields for XP/DGT
      dgtWalletBalance: bigint('dgt_wallet_balance', { mode: 'number' }).notNull().default(0), // Internal DGT balance
      xp: integer('xp').notNull().default(0),
      level: integer('level').notNull().default(1),
      encryptedPrivateKey: text('encrypted_private_key'), // Added for TronWeb integration
    });
    ```

2.  **Forum Structure**
    ```typescript
    // Categories, threads, posts structure (simplified from schema defined in migrations)
    export const forumCategories = pgTable('forum_categories', {
      id: serial('category_id').primaryKey(),
      name: varchar('name', { length: 100 }).notNull(),
      description: text('description'),
      slug: varchar('slug', { length: 100 }).notNull(),
      color: varchar('color', { length: 7 }), // Added color
      icon: varchar('icon', { length: 50 }), // Added icon
      // ... additional fields
    });

    export const threads = pgTable('threads', {
      id: serial('thread_id').primaryKey(),
      title: varchar('title', { length: 255 }).notNull(),
      categoryId: integer('category_id').notNull().references(() => forumCategories.id),
      userId: integer('user_id').notNull().references(() => users.id),
      isSolved: boolean('is_solved').default(false), // Added isSolved
      // ... additional fields
    });

    export const posts = pgTable('posts', {
      id: serial('post_id').primaryKey(),
      threadId: integer('thread_id').notNull().references(() => threads.id),
      userId: integer('user_id').notNull().references(() => users.id),
      content: text('content').notNull(),
      // ... additional fields
    });

    // Also includes tables for thread_prefixes, thread_tags, post_likes, etc.
    ```

3.  **Economic System**
    ```typescript
    // Wallet, Transaction, Treasury, XP, DGT Unlock, Vault, and Purchase tables (simplified from schema defined in migrations)
    export const wallets = pgTable('wallets', {
      id: serial('wallet_id').primaryKey(),
      userId: integer('user_id').notNull().references(() => users.id),
      balance: doublePrecision('balance').notNull().default(0), // Legacy field?
      // ... additional fields
    });

    export const transactions = pgTable('transactions', {
      id: serial('transaction_id').primaryKey(),
      userId: integer('user_id').references(() => users.id),
      type: transactionTypeEnum('type').notNull(),
      amount: bigint('amount', { mode: 'number' }).notNull(),
      status: transactionStatusEnum('status').notNull().default('pending'),
      // ... additional fields
    });

    export const treasurySettings = pgTable('treasury_settings', {
      id: serial('setting_id').primaryKey(),
      treasuryWalletAddress: varchar('treasury_wallet_address', { length: 255 }),
      minWithdrawalAmount: bigint('min_withdrawal_amount', { mode: 'number' }).notNull(),
      // ... additional fields
    });

    export const xp_actions = pgTable('xp_actions', {
      id: serial('id').primaryKey(),
      name: text('name').unique().notNull(),
      description: text('description'),
      default_value: integer('default_value').notNull().default(10),
      is_enabled: boolean('is_enabled').default(true),
      cooldown_seconds: integer('cooldown_seconds').default(0)
    });

    export const user_xp = pgTable('user_xp', {
      user_id: integer('user_id').primaryKey().references(() => users.id),
      xp: integer('xp').default(0),
      last_xp_event_at: timestamp('last_xp_event_at', { withTimezone: true }).defaultNow()
    });

    export const xp_levels = pgTable('xp_levels', {
      level: integer('level').primaryKey(),
      xp_required: integer('xp_required').notNull(),
      rank_name: text('rank_name').notNull(),
      description: text('description'),
      icon_url: text('icon_url'),
      color_code: text('color_code')
    });

    export const xp_log = pgTable('xp_log', {
      id: serial('id').primaryKey(),
      user_id: integer('user_id').references(() => users.id),
      action_id: integer('action_id').references(() => xp_actions.id),
      xp_awarded: integer('xp_awarded'),
      created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
      metadata: jsonb('metadata')
    });

    export const dgt_unlocks = pgTable('dgt_unlocks', {
      id: serial('id').primaryKey(),
      name: text('name').notNull(),
      type: text('type'),
      cost_dgt: integer('cost_dgt').notNull(),
      description: text('description'),
      unlock_data: jsonb('unlock_data')
    });

    export const user_wallet = pgTable('user_wallet', {
      user_id: integer('user_id').primaryKey().references(() => users.id),
      dgt_balance: integer('dgt_balance').default(0),
      lifetime_earned: integer('lifetime_earned').default(0),
      lifetime_spent: integer('lifetime_spent').default(0)
    });

    export const dgt_unlock_log = pgTable('dgt_unlock_log', {
      id: serial('id').primaryKey(),
      user_id: integer('user_id').references(() => users.id),
      unlock_id: integer('unlock_id').references(() => dgt_unlocks.id),
      dgt_spent: integer('dgt_spent'),
      acquired_at: timestamp('acquired_at', { withTimezone: true }).defaultNow()
    });

    export const vaults = pgTable('vaults', {
      id: serial('vault_id').primaryKey(),
      userId: integer('user_id').notNull().references(() => users.id),
      balance: bigint('balance', { mode: 'number' }).notNull().default(0), // Vaulted DGT balance
      lockedUntil: timestamp('locked_until'),
      createdAt: timestamp('created_at').notNull().defaultNow(),
      updatedAt: timestamp('updated_at').notNull().defaultNow(),
    });

    export const vaultTransactions = pgTable('vault_transactions', {
      id: serial('vault_tx_id').primaryKey(),
      vaultId: integer('vault_id').notNull().references(() => vaults.id),
      userId: integer('user_id').notNull().references(() => users.id),
      type: pgEnum('vault_tx_type', ['deposit', 'withdrawal'])('type').notNull(),
      amount: bigint('amount', { mode: 'number' }).notNull(),
      createdAt: timestamp('created_at').notNull().defaultNow(),
      metadata: jsonb('metadata').default('{}'),
    });

    export const dgtTransactions = pgTable('dgt_transactions', {
      id: serial('id').primaryKey(),
      userId: integer('user_id').references(() => users.id),
      amount: bigint('amount', { mode: 'number' }).notNull(),
      transactionType: varchar('transaction_type', { length: 50 }).notNull(),
      referenceId: integer('reference_id'),
      referenceType: varchar('reference_type', { length: 50 }),
      description: text('description'),
      createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
      metadata: jsonb('metadata').default('{}')
    });

    export const stripeDgtSessions = pgTable('stripe_dgt_sessions', {
      id: serial('id').primaryKey(),
      sessionId: varchar('session_id', { length: 255 }).notNull().unique(),
      userId: integer('user_id').notNull().references(() => users.id),
      packageId: varchar('package_id', { length: 50 }).notNull(),
      dgtAmount: bigint('dgt_amount', { mode: 'number' }).notNull(),
      usdAmount: decimal('usd_amount', { precision: 10, scale: 2 }).notNull(),
      status: varchar('status', { length: 20 }).notNull().default('pending')
    });

    export const usdtDgtTransactions = pgTable('usdt_dgt_transactions', {
      id: serial('id').primaryKey(),
      userId: integer('user_id').notNull().references(() => users.id),
      packageId: varchar('package_id', { length: 50 }).notNull(),
      dgtAmount: bigint('dgt_amount', { mode: 'number' }).notNull(),
      usdtAmount: decimal('usdt_amount', { precision: 10, scale: 6 }).notNull(),
      txHash: varchar('tx_hash', { length: 255 }).notNull().unique(),
      status: varchar('status', { length: 20 }).notNull().default('pending')
    });
    ```

### API Endpoint Structure

The API follows a modular structure with domain-specific route files, migrating towards `server/src/domains/`:

```typescript
// Example pattern from server/index.ts (simplified)
// Main routes
app.use('/', routes); // Note: This likely needs refactoring to use domain routes

// Admin-specific routes
app.use('/api/admin', adminRoutes); // Note: This likely needs refactoring to use domain routes

// Auth routes
app.use('/api/auth', authRoutes); // Note: This likely needs refactoring to use domain routes

// Wallet routes
app.use('/api/wallet', walletRoutes); // Note: This likely needs refactoring to use domain routes

// Shop routes
app.use('/api/shop', shopRoutes); // Note: This likely needs refactoring to use domain routes

// Shoutbox routes
registerShoutboxRoutes(app); // Note: This likely needs refactoring to use domain routes

// Planned XP/DGT routes (to be implemented under domains)
// app.use('/api/xp', xpRoutes);
// app.use('/api/paths', pathRoutes);
// app.use('/api/dgt', dgtRoutes);
```

### Frontend Application Structure

The frontend is organized primarily by feature with shared components, migrating towards `client/src/features/`:

```
client/src/
├── components/         # UI components (some legacy, some domain-specific)
│   ├── admin/          # Admin panel components
│   ├── economy/        # Wallet and economic components
│   ├── forum/          # Forum components (legacy, migrating to features)
│   ├── layout/         # Layout components
│   ├── shop/           # Shop components
│   ├── shoutbox/       # Chat components
│   └── ui/             # Basic UI components (shadcn/ui based)
├── contexts/           # React contexts
├── hooks/              # Custom React hooks (some legacy, some domain-specific)
├── lib/                # Utility functions and API clients (some legacy)
├── pages/              # Page components (some legacy, some domain-specific)
│   ├── admin/          # Admin pages
│   └── mod/            # Moderator pages
├── features/           # **New feature-based structure**
│   ├── admin/          # Admin features (e.g., XP)
│   ├── forum/          # Forum features (migration target)
│   └── wallet/         # Wallet features (migration target)
└── styles/             # Global styles
```

## Technical Constraints

### Authentication System

Currently using session-based authentication with Passport.js. **In development mode, authentication checks are bypassed using `DevAuthProvider` and modified route guards (`protected-route.tsx`, `admin-route.tsx`).** This needs to be replaced with a real authentication flow for production.

```typescript
// Authentication middleware pattern (simplified)
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (!req.user) {
    return res.status(401).json({ error: 'You must be logged in to access this resource' });
  }
  next();
}
```

```typescript
// DevAuthProvider for development environments (bypasses auth)
export function DevAuthProvider({ children }: { children: ReactNode }) {
  // Mock admin user
  const mockAdminUser = {
    id: 1,
    username: "admin",
    // ... other mock data
  } as User;

  // Set mock user in query cache
  useEffect(() => {
    queryClient.setQueryData(["/api/user"], mockAdminUser);
  }, []);

  // ... mock authentication functions
}
```

### API Integration & Wallet Services (Updated May 4, 2025)

API requests are handled through a custom client (`client/src/lib/api.ts`). **The project is standardizing on `apiRequest` from `@/lib/queryClient.ts` as the preferred API client.**

The wallet system utilizes two key backend services:

1.  **`TronWebService` (`server/services/tronweb-service.ts`)**:
    *   Directly interacts with the Tron blockchain via TronGrid API.
    *   Handles wallet creation, balance checks (TRX/USDT), USDT transfers, and transaction verification.
    *   Manages encryption/decryption of private keys using AES-256-CBC.
    *   Requires `TRONGRID_API_KEY` and `ENCRYPTION_KEY` environment variables.

2.  **`WalletIntegration` (`server/services/wallet-integration.ts`)**:
    *   Acts as a bridge between API routes and `TronWebService`.
    *   Manages user-specific wallet operations (creating wallets, getting balances, recording transactions).
    *   Handles deposit verification and DGT crediting logic.
    *   Implements Vault deposit/withdrawal logic.

```typescript
// Example: TronWebService encryptPrivateKey method
encryptPrivateKey(privateKey: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    // ... error handling ...
  }
}

// Example: WalletIntegration verifyDeposit method
async verifyDeposit(userId: number, txHash: string) {
  // ... check if already processed ...
  const isConfirmed = await tronWebService.verifyTransaction(txHash);
  // ... get details, verify destination ...
  const dgtAmount = depositAmount * exchangeRate;
  // ... update user DGT balance ...
  // ... record transaction ...
}
```

The standard API client handles requests:

```typescript
// apiRequest pattern (simplified from client/src/lib/queryClient.ts)
export const apiRequest = async <T>(config: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  params?: any;
}): Promise<T> => {
  // ... implementation using fetch or axios ...
  // Includes logic for XP gain detection and toast notifications
};
```

### Real-time Communications

WebSockets are used for real-time features like the shoutbox:

```typescript
// WebSocket setup pattern (simplified from server code)
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      // Handle message based on type
      switch (data.type) {
        case 'chat_message':
          // Broadcast to all clients
          break;
        // ... other message types
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });
});

// Make WebSocket server available to routes
app.wss = wss;
```

## Development Constraints

### Known Technical Debt

1.  **Legacy Routes:** Route files directly under `server/` need migration to `server/src/domains/`.
2.  **Duplicate Utilities:** Multiple logging and API client implementations exist.
3.  **Mock Data Usage:** Several frontend components use mock or fallback data.
4.  **Incomplete Error Handling:** Some API calls and UI components lack comprehensive error handling.
5.  **Environment-Specific Code:** Development vs. production code paths need review.
6.  **Placeholder Components:** Many routes point to placeholder components.
7.  **Missing Tests:** Comprehensive testing infrastructure is not yet evident.

### Performance Considerations

1.  **API Request Caching:** React Query used, but cache invalidation needs refinement.
2.  **WebSocket Management:** Connection handling and message buffering need optimization.
3.  **Large Component Renders:** Virtualization or pagination may be needed for large data sets.

## Dependencies & External Services

### Core Dependencies (Selected)

*   **UI Framework**: React 18.3.1
*   **API Client**: TanStack Query (React Query) 5.60.5
*   **Form Validation**: Zod 3.24.2
*   **Database ORM**: Drizzle ORM 0.43.1
*   **Database Driver**: @neondatabase/serverless
*   **Styling**: TailwindCSS 3.4.17
*   **Icons**: Lucide React 0.453.0
*   **Charts**: Recharts 2.15.2
*   **Blockchain**: tronweb 6.0.3
*   **Real-time**: ws 8.18.0
*   **Environment**: dotenv

### External Service Integration Points (Updated May 4, 2025)

The codebase integrates with or is prepared for:

1.  **TronGrid API**
    *   Used by `TronWebService` for all Tron blockchain interactions (balance checks, transactions, verification).
    *   Requires `TRONGRID_API_KEY`.

2.  **Stripe Payment Integration**
    *   Dependencies: `@stripe/react-stripe-js`, `@stripe/stripe-js`, `stripe`.
    *   Planned for DGT purchases (`dgt-wallet-integration.ts`, `stripe_dgt_sessions` table).
    *   Basic structure exists, endpoints need full implementation.

3.  **Cryptocurrency Wallet Services (General)**
    *   The `TronWebService` provides the specific implementation for Tron.
    *   Architecture allows for potential future integration with other chains if needed.

## May 2, 2025 — Structure & Modularity Audit Reference

*   The May 2025 audit (see `activeContext.md`) establishes new best practices for modularity, directory structure, and future-proofing.
*   All technical patterns and architecture should align with these recommendations for maintainability and scalability.
*   See the summary table in `activeContext.md` for actionable refactoring areas.

This technical context provides the foundation for understanding the Degentalk codebase structure, patterns, and constraints that influence development decisions.
