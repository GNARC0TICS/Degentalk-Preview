# DegenTalk - Crypto Community Platform

A crypto-native forum and social platform designed for cryptocurrency enthusiasts, traders, and developers. Features integrated wallet functionality, a digital goods marketplace, and gamified social features with XP/DGT economy.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL (for local development)

### Environment Setup

1. **Clone and install dependencies:**

   ```bash
   git clone https://github.com/GNARC0TICS/Degentalk-BETA
   cd Degentalk
   npm install
   ```

2. **Environment Configuration:**
   The project uses `env.local` for environment variables. Key settings:

   ```bash
   # Database (PostgreSQL for development - ensure this is set in your .env or env.local)
   # e.g., DATABASE_URL=postgresql://user:password@localhost:5432/your_dev_db
   # Or use NEON_DATABASE_URL if connecting to Neon
   DATABASE_URL=your_postgresql_connection_string

   # Server
   NODE_ENV=development
   PORT=5001

   # Client - Vite Port
   VITE_PORT=5173
   ```

3. **Database Setup:**
   ```bash
   # Generate and apply migrations
   npm run db:migrate
   npm run db:migrate:apply
   ```

## 🛠️ Development

### Start Development Server

```bash
# Start both frontend and backend (recommended)
npm run dev

# Start with database seeding (clears and seeds all data)
npm run dev:seed

# Quick start (skips seeding for faster startup)
npm run dev:quick
```

**Port Management:**

- Automatically kills existing processes on ports 5001 and 5173 before starting
- Frontend uses `--strictPort` to fail instead of trying alternative ports
- Ensures consistent port usage across development sessions

This starts:

- **Backend API** on `http://localhost:5001`
- **Frontend** on `http://localhost:5173`

#### Manual Port Cleanup

If you need to manually clear ports:

```bash
# Clear both development ports
npm run kill-ports

# Clear specific ports
npm run kill-port:5001  # Backend
npm run kill-port:5173  # Frontend
```

### Development Features

#### Role Switching (Dev Mode)

The application includes a development role switcher in the bottom-right corner:

- **User** - Regular user permissions
- **Moderator** - Moderation permissions
- **Admin** - Full administrative access

No authentication is required in development mode.

#### Startup Logging

Clear startup logs show which services are starting:

```
[BACKEND] ✅ Backend API running on http://localhost:5001
[FRONTEND] ✅ Frontend running on http://localhost:5173
```

### Available Scripts

#### Development

- `npm run dev` - Start both frontend and backend
- `npm run dev:seed` - Start with full database seeding
- `npm run dev:quick` - Start without seeding (faster)
- `npm run dev:frontend` - Frontend only (Vite dev server)
- `npm run dev:backend` - Backend only (tsx with hot reload)

#### Database Management

- `npm run db:migrate` - Generate new migrations
- `npm run db:migrate:apply` - Apply migrations to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:drop` - Drop all database tables

#### Seeding

- `npm run seed:all` - Run all seed scripts
- `npm run seed:forum` - Seed forum structure
- `npm run seed:threads` - Seed example threads
- `npm run seed:xp` - Seed XP system data
- `npm run seed:levels` - Seed user levels
- `npm run seed:economy` - Seed economy settings

#### Production

- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run preview` - Preview production build

#### Utilities

- `npm run check` - TypeScript type checking
- `npm run lint` - ESLint code checking
- `npm run generate:tree` - Generate directory tree documentation

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, React Query
- **Backend**: Express.js, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (development and production)
- **Real-time**: WebSockets for live features
- **Authentication**: Development bypass with role switching

### Project Structure

```
├── client/src/           # Frontend React application
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-based modules (client-side logic)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities, API clients, and core client logic
│   ├── pages/            # Page components (route handlers)
│   ├── contexts/         # React Context API providers
│   ├── styles/           # Global and component-specific styles
│   └── types/            # Client-specific TypeScript types
├── server/src/           # Backend Express application
│   ├── domains/          # Domain-driven backend modules
│   ├── core/             # Core server functionalities (DB, error handling, etc.)
│   ├── middleware/       # Express middleware
│   ├── utils/            # Server-side utility functions
│   └── app.ts            # Main Express app configuration
├── shared/               # Code shared between client and server
│   ├── types.ts          # Shared TypeScript types and interfaces
│   └── validators/       # Shared Zod validators
├── scripts/              # Build, deployment, and utility scripts
├── db/                   # Database-related files
│   └── schema/           # Drizzle ORM schema definitions (organized by domain)
├── migrations/           # Database migration files (managed by Drizzle Kit)
└── public/               # Static assets served by the client
```

### API Client

The project uses a standardized API client (`apiRequest` from `client/src/lib/queryClient.ts` or `api` from `client/src/lib/api.ts` - _verify which is primary_) with:

- Automatic XP gain detection
- Consistent error handling
- Built-in loading states
- Authentication handling

## 🗃️ Database

### Schema Management

Database schema is managed through Drizzle ORM:

- Schema definitions in `db/schema/` (organized by domain, e.g., `db/schema/user/users.ts`, `db/schema/forum/threads.ts`)
- Migrations in `migrations/` (e.g., `migrations/postgres/`)
- Supports PostgreSQL

### Key Tables

(Refer to `db/schema/` for a comprehensive list. Key domains include:)

- **User**: `users`, `roles`, `permissions`, `profiles`, `preferences`
- **Forum**: `categories` (zones/forums), `threads`, `posts`, `tags`
- **Economy**: `wallets`, `transactions`, `dgtPackages`, `badges`, `levels`
- **Shop**: `products`, `orders`, `userInventory`
- **XP System**: `xpActionSettings`, `xpAdjustmentLogs`
- **Messaging**: `shoutboxMessages`, `directMessages`
- **Admin**: `announcements`, `reports`, `siteSettings`

## 🎮 Features

### Core Features

- **Forum System** - Hierarchical categories, threads, posts
- **User Progression** - XP levels, achievements, reputation
- **Digital Economy** - DGT token, wallet integration, shop
- **Real-time Chat** - Shoutbox with live updates
- **Administration** - Comprehensive admin panel

### Development Features

- **Hot Reload** - Both frontend and backend auto-reload
- **Role Switching** - Test different permission levels
- **Database Seeding** - Populate with realistic test data
- **Development Bypass** - No authentication required
- **Comprehensive Logging** - Clear startup and error messages

## 🔧 Configuration

### Environment Variables

Key environment variables in `env.local`:

```bash
# Database (PostgreSQL - ensure this is set in your .env or env.local)
# e.g., DATABASE_URL=postgresql://user:password@localhost:5432/your_dev_db
# Or use NEON_DATABASE_URL if connecting to Neon
DATABASE_URL=your_postgresql_connection_string

# Tron/Crypto Integration
NEXT_PUBLIC_TRON_NODE_URL=https://api.shasta.trongrid.io
NEXT_PUBLIC_TRONGRID_API_KEY=your_api_key

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_key
# CCPayment - if used for crypto payments
# CCPAYMENT_APP_ID=your_ccpayment_id
# CCPAYMENT_APP_SECRET=your_ccpayment_secret

# Giphy API for GIF picker in editor
# GIPHY_API_KEY=your_giphy_api_key
```

### Development vs Production

- **Development**: Uses PostgreSQL, bypassed auth, hot reload
- **Production**: Uses PostgreSQL, full authentication, optimized builds

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Kill process on port 5001
   lsof -ti:5001 | xargs kill -9
   ```

2. **Database Issues**

   ```bash
   # Reset database
   npm run db:drop
   npm run db:migrate:apply
   npm run seed:all
   ```

3. **Module Not Found**

   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TSX Watch Issues**
   - TSX with `--watch` provides hot reload without needing nodemon
   - If issues persist, use `npm run dev:backend:quick` for faster startup

### Development Environment

- **No nodemon needed** - Using tsx with `--watch` for hot reload
- **Environment variables** - Loaded from `env.local` automatically
- **Database** - PostgreSQL for development (requires a local or remote PostgreSQL instance)
- **Authentication** - Completely bypassed in development

## 📚 Documentation

- `docs/memory-bank/` - Project context and technical documentation
- `docs/ui/routing-logic.md` - Frontend routing patterns
- Database schema documentation (e.g., generated by tools or maintained manually)

## 🤝 Contributing

1. Start the development environment: `npm run dev`
2. Use the role switcher to test different permission levels
3. Seed the database with realistic data: `npm run dev:seed`
4. Make changes - both frontend and backend will hot reload
5. Check types and linting: `npm run check && npm run lint`

---

For more detailed technical information, see the documentation in `docs/memory-bank/`.

## Backend Features

### User Engagement Rewards (XP & DGT)

To incentivize user participation, the platform awards Experience Points (XP) and Degen Tokens (DGT) for various actions. Initially, this includes rewards for creating new forum threads.

**Flow for Thread Creation Rewards:**

1.  A user creates a new thread through the client application.
2.  Upon successful thread creation, the client makes a `POST` request to `/api/xp/award-action`.
    - **Payload**: `{ userId: number, action: 'create_thread', entityId: number (threadId) }`
    - **Backend Logic**: The XP service (`server/src/domains/xp/xp.service.ts` using `server/src/domains/xp/events/xp.events.ts`) looks up `xpActionSettings` for `'create_thread'`, awards the `baseValue` XP to the user, updates their total XP and level (if applicable), and logs the adjustment in `xpAdjustmentLogs`.
    - **Response**: `{ xpAwarded: number, newTotalXp: number, leveledUp: boolean, currentLevel: number }`
3.  The client then (or in parallel) makes a `POST` request to `/api/wallet/transactions/create` (actual path for DGT rewards, routed via `server/src/domains/wallet/wallet.routes.ts`).
    - **Payload**: `{ userId: number, currency: 'DGT', amount: number (determined by backend config, e.g., DGT_REWARD_CREATE_THREAD), type: 'reward', reason: string, relatedEntityId: number (threadId), context: 'create_thread' }`
    - **Backend Logic**: The DGT service (`server/src/domains/wallet/dgt.service.ts`) credits the user's DGT wallet balance (stored on the `users` table as `dgtWalletBalance`), and logs the transaction in the `transactions` table.
    - **Response**: `{ dgtAwarded: number, newBalance: string }`
4.  The client displays toasts to inform the user of the XP and DGT awarded.

**Key Backend Components & Endpoints:**

- **XP Service & Rewards:**
  - Controller: `server/src/domains/xp/xp.controller.ts` (function: `awardActionXp`)
  - Route: `POST /api/xp/award-action` (defined in `server/src/domains/xp/xp.routes.ts`)
  - Core Logic: `server/src/domains/xp/xp.service.ts` (e.g., `handleXpTrigger`, `processXpAction`) and `server/src/domains/xp/events/xp.events.ts`
  - Relevant Schemas: `db/schema/economy/xpActionSettings.ts`, `db/schema/economy/xpAdjustmentLogs.ts`, `db/schema/economy/levels.ts`, `db/schema/user/users.ts`.
- **DGT & Wallet Service Rewards:**
  - Controller: `server/src/domains/wallet/wallet.controller.ts` (e.g., `createDgtTransaction` or similar for rewards)
  - Route: e.g., `POST /api/wallet/dgt/reward` (defined in `server/src/domains/wallet/wallet.routes.ts`)
  - Core Logic: `server/src/domains/wallet/dgt.service.ts` (e.g., `addDgtToUserWallet`)
  - Relevant Schemas: `db/schema/user/users.ts` (for `dgtWalletBalance`), `db/schema/economy/transactions.ts`.

**Configuration:**

- XP amounts for actions are configured in the `xpActionSettings` table (schema: `db/schema/economy/xpActionSettings.ts`).
- The DGT reward amount for actions like thread creation might be in environment variables or a configuration table (e.g., `economySettings` in `db/schema/economy/settings.ts`). Refer to `server/src/domains/wallet/wallet.constants.ts` or service logic for defaults.
