# 🚀 Degentalk Platform

[![🛡️ Boundary Validation](https://github.com/your-username/degentalk/actions/workflows/validate-codebase.yml/badge.svg)](https://github.com/your-username/degentalk/actions/workflows/validate-codebase.yml)

## 🔒 **Bulletproof Architecture**

This repository is protected by an **advanced boundary enforcement system** that prevents architectural violations:

- ✅ **Import Boundaries**: Server cannot import from client/, client cannot import from server/
- ✅ **Vite Config Protection**: Zero-tolerance for Vite config leaks into backend
- ✅ **Schema Consistency**: All database fields must exist in the PostgreSQL schema across all environments (dev & prod)
- ✅ **Path Alias Validation**: Automated checking of `@/` imports and TypeScript resolution
- ✅ **CI/CD Integration**: Every PR is validated before merge

### 🚨 **Breaking the Rules?**

- **PRs will be automatically rejected** if they violate boundaries
- Run `pnpm format` and `pnpm lint --fix` to fix issues locally
- See `CONTRIBUTING.md` for the complete rule system

# Degentalk - Next-Generation Crypto Forum Platform

Degentalk is a modern, highly satirical crypto forum platform designed for gamblers, investors, traders, and crypto fanatics across the globe. Built with cutting-edge technology, it features integrated wallet functionality, a digital goods marketplace, and gamified social features with a comprehensive XP/DGT token economy.

## 🌟 Key Features

- **🏛️ Forum System**: Multi-zone discussion platform with advanced moderation
- **💰 DGT Economy**: Native token system with $0.10 fixed value and crypto integration
- **🎮 XP & Leveling**: Comprehensive experience point system with action-based rewards
- **💳 Crypto Wallet**: CCPayment integration for deposits, withdrawals, and trading
- **👑 Admin Dashboard**: Modular administrative system with feature flags and analytics
- **📱 Mobile-First**: Responsive design with touch-optimized interfaces
- **⚡ Real-time**: WebSocket integration for live updates and chat
- **🔒 Security**: Rate limiting, audit logging, and permission-based access control

## 🚀 Quick Start with Codespaces

### One-Click Development Environment

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/your-username/degentalk)

**The fastest way to get started** - click the badge above for a fully configured development environment that boots in under 90 seconds.

#### What's Included:

- ✅ **Pre-configured Node.js 20** with pnpm package manager
- ✅ **VS Code extensions** for TypeScript, ESLint, Prettier, Tailwind CSS
- ✅ **Database tools** including Drizzle Kit and Neon CLI
- ✅ **SuperClaude integration** with helpful aliases (`sc`, `scload`, `scplan`)
- ✅ **Auto-forwarded ports** for development (5173, 5001, 8080)
- ✅ **Environment template** ready for your configuration

#### First Steps in Codespaces:

```bash
# 1. Update environment file
cp env.local.example env.local  # Edit with your database credentials

# 2. Start development with enhanced dev environment
pnpm run dev:seed                # Full stack with dev user and wallet data

# 3. Optional: Load with SuperClaude
sc /user:load --depth deep --plan
```

### 🎯 **Enhanced Development Experience**

Degentalk includes a comprehensive development environment that simulates a production-ready platform:

#### **🧑‍💼 Pre-configured Admin User**

- **Username**: `cryptoadmin` (auto-login in dev mode)
- **Role**: Platform Administrator with full privileges
- **Profile**: Complete with bio, avatar, and social links
- **Stats**: Level 99, 99,999 XP, 10,000 reputation

#### **💰 Realistic Wallet Data**

- **500,000+ DGT tokens** from multiple simulated deposits
- **10 ETH** ($20,000 value)
- **5,000 USDT** ($5,000 value)
- **0.5 BTC** ($15,000 value)
- **VIP Pass subscription** with lifetime benefits

#### **🎮 Full Platform Features**

- **Forum posting** with admin moderation tools
- **Real wallet transactions** using seeded balances
- **Shoutbox chat** with user identity
- **Shop purchases** with DGT spending
- **XP system** with real-time updates
- **Admin panel** access to all features

#### Required Codespaces Secrets:

- `NEON_API_KEY` - Your Neon database API key
- `NEON_PROJECT_ID` - Your Neon project identifier

### Local Development Setup

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL (development & production)
  > **Note:** Degentalk now exclusively supports **PostgreSQL** across all environments. Legacy SQLite support has been fully removed.

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

### 🎯 **Development User Setup**

For the best development experience, set up the enhanced admin user:

> **Quick-login credentials (local dev)**
>
> • **Username:** `cryptoadmin`  
> • **Password:** `password123`
>
> These credentials are seeded by `pnpm run seed:all` and work in both the `/auth` page and API requests.

```bash
# Complete dev user setup (recommended for first-time setup)
pnpm run seed:all

# You can also run individual seed scripts, for example:
pnpm run seed:users              # Basic users including cryptoadmin
```

This creates a realistic development environment where you can:

- **Test wallet features** with actual DGT/crypto balances
- **Use admin privileges** for forum moderation and platform management
- **Experience VIP features** with an active subscription
- **See the profile card** with real user data in the sidebar

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
pnpm run kill-ports

# Clear specific ports
pnpm run kill-port:5001  # Backend
pnpm run kill-port:5173  # Frontend
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

- `pnpm run dev` - Start both frontend and backend
- `pnpm run dev:seed` - Start with full database seeding
- `pnpm run dev:quick` - Start without seeding (faster)
- `pnpm run dev:client` - Frontend only (Vite dev server)
- `pnpm run dev:server` - Backend only (tsx with hot reload)

#### Database Management

- `pnpm run db:migrate` - Generate new migrations
- `pnpm run db:migrate:apply` - Apply migrations to database
- `pnpm run db:studio` - Open Drizzle Studio (database GUI)
- `pnpm run db:drop` - Drop all database tables

#### Seeding

- `pnpm run seed:all` - Run all seed scripts
- `pnpm run seed:forums:only` - Seed forum structure
- `pnpm run seed:users` - Seed users including the admin
- `pnpm run sync:forums` - Sync forum configuration from `forumMap.config.ts` to the database

#### Production

- `pnpm run build` - **Builds the client only.** The server now runs directly via `tsx`, so no TypeScript compile step is necessary.
- `pnpm run start` - Starts the backend with `tsx` (hot-reload disabled) and serves the pre-built client assets.
- `pnpm run preview` - Preview the client build locally

> **Why no server build?** We temporarily disabled `tsc` during the build step to unblock deployments while large type-safety refactors are in progress. Server/package.json has:
>
> ```json
> "build": "echo \"skip build (tsx runtime)\"",
> "start": "tsx --tsconfig tsconfig.json --require tsconfig-paths/register index.ts"
> ```
>
> • `tsx` transpiles TypeScript on-the-fly at runtime.  
> • Use `pnpm run typecheck` in CI to surface type errors without blocking the build.

#### Utilities

- `pnpm run typecheck` - TypeScript type checking
- `pnpm run lint` - ESLint code checking
- `pnpm run generate:tree` - Generate directory tree documentation

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
│   ├── schema/           # Drizzle ORM schema definitions (organized by domain)
│   └── migrations/       # Database migration files (managed by Drizzle Kit)
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

- **Forum System** - Hierarchical categories, threads, posts with zone-based theming
- **User Progression** - XP levels, achievements, reputation system
- **Integrated Wallet System** - Complete DGT token economy with crypto deposits, transfers, and CCPayment integration
- **Real-time Features** - Live shoutbox, instant balance updates, transaction notifications
- **Digital Marketplace** - Shop system with DGT-based purchases
- **Administration** - Comprehensive admin panel with wallet configuration and feature gates

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
   pnpm run db:drop
   pnpm run db:migrate:apply
   pnpm run seed:all
   ```

3. **Module Not Found**

   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules
   pnpm install --force
   ```

4. **TSX Watch Issues**
   - TSX with `--watch` provides hot reload without needing nodemon
   - If issues persist, use `npm run dev:backend:quick` for faster startup

### 🔥 **Critical: NPM Script Infinite Loop Recovery**

If you encounter `pnpm run dev` spawning infinite processes or your system becomes unresponsive:

#### **Emergency Stop:**

```bash
# Kill all pnpm processes immediately
pkill -f "pnpm run dev"

# Kill all node processes (CAUTION: This will kill ALL Node.js processes)
killall node

# Clear development ports specifically
lsof -ti:5001 | xargs kill -9 2>/dev/null || echo "Port 5001 clear"
lsof -ti:5173 | xargs kill -9 2>/dev/null || echo "Port 5173 clear"
```

#### **Check for Runaway Processes:**

```bash
# See all npm/node processes
ps aux | grep npm
ps aux | grep node

# Kill specific process IDs if needed
kill -9 <PID>
```

#### **Common Causes:**

- Scripts that reference themselves: `"dev": "npm run dev"`
- Missing package.json files in subdirectories
- Circular script dependencies between parent/child packages

#### **Prevention:**

- Never create self-referencing pnpm scripts
- Always use direct commands instead of script delegation when possible
- Verify subdirectories have package.json files before delegating to them

### Development Environment

- **No nodemon needed** - Using tsx with `--watch` for hot reload
- **Environment variables** - Loaded from `env.local` automatically
- **Database** - PostgreSQL for development (requires a local or remote PostgreSQL instance)
- **Authentication** - Completely bypassed in development

## 📚 Documentation

- `docs/memory-bank/` - Project context and technical documentation
- `docs/ui/routing-logic.md` - Frontend routing patterns
- `NEON-SYNC.md` - Neon database synchronization and migration system
- `CONTRIBUTING.md` - Development guidelines and migration safety rules
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

- **Payload**: `{ userId: string, action: 'create_thread', entityId: string (threadId) }`
- **Backend Logic**: The XP service (`server/src/domains/xp/xp.service.ts` using `server/src/domains/xp/events/xp.events.ts`) looks up `xpActionSettings` for `'create_thread'`, awards the `baseValue` XP to the user, updates their total XP and level (if applicable), and logs the adjustment in `xpAdjustmentLogs`.
- **Response**: `{ xpAwarded: number, newTotalXp: number, leveledUp: boolean, currentLevel: number }`

3.  The client then (or in parallel) makes a `POST` request to `/api/wallet/transactions/create` (actual path for DGT rewards, routed via `server/src/domains/wallet/routes/wallet.routes.ts`).

- **Payload**: `{ userId: string, currency: 'DGT', amount: number (determined by backend config, e.g., DGT_REWARD_CREATE_THREAD), type: 'reward', reason: string, relatedEntityId: string (threadId), context: 'create_thread' }`
- **Backend Logic**: The DGT service (`server/src/domains/wallet/services/dgt.service.ts`) credits the user's DGT wallet balance (stored on the `users` table as `dgtWalletBalance`), and logs the transaction in the `transactions` table.
- **Response**: `{ dgtAwarded: number, newBalance: string }`

4.  The client displays toasts to inform the user of the XP and DGT awarded.

**Key Backend Components & Endpoints:**

- **XP Service & Rewards:**
  - Controller: `server/src/domains/xp/xp.controller.ts` (function: `awardActionXp`)
  - Route: `POST /api/xp/award-action` (defined in `server/src/domains/xp/xp.routes.ts`)
  - Core Logic: `server/src/domains/xp/xp.service.ts` (e.g., `handleXpTrigger`, `processXpAction`) and `server/src/domains/xp/events/xp.events.ts`
  - Relevant Schemas: `db/schema/economy/xpActionSettings.ts`, `db/schema/economy/xpAdjustmentLogs.ts`, `db/schema/economy/levels.ts`, `db/schema/user/users.ts`.

- **DGT Wallet System (Complete Integration):**
  - **Balances**: `GET /api/wallet/balances` - Real-time DGT and crypto balances
  - **Deposits**: `GET /api/wallet/deposit-addresses` - Live CCPayment crypto addresses with automatic DGT conversion
  - **Transfers**: `POST /api/wallet/transfer-dgt` - User-to-user DGT transfers with validation
  - **Transactions**: `GET /api/wallet/transactions` - Complete transaction history with DGT-specific types
  - **Configuration**: `GET /api/wallet/config` - Admin-configurable feature gates and limits
- **Withdrawals**: `POST /api/wallet/withdraw` - Crypto withdrawal requests (feature-gated)
- Core Logic: `server/src/domains/wallet/` with CCPayment v2 integration, automatic deposit processing, and comprehensive transaction management
- Frontend: `client/src/features/wallet/` with real-time updates, pending state management, and feature gate integration

**Configuration:**

- XP amounts for actions are configured in the `xpActionSettings` table (schema: `db/schema/economy/xpActionSettings.ts`).
- The DGT reward amount for actions like thread creation might be in environment variables or a configuration table (e.g., `economySettings` in `db/schema/economy/settings.ts`). Refer to `server/src/domains/wallet/wallet.constants.ts` or service logic for defaults.

## 🏗️ System Architecture

For detailed architectural information, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

### High-Level Overview

Degentalk follows a **Domain-Driven Architecture** with clear separation between frontend and backend:

```
Frontend (React + Vite)  ←→  Backend (Express + TypeScript)  ←→  PostgreSQL Database
     ↓                           ↓                                    ↓
- Pages & Components      - Domain Services                   - User Management
- State Management        - API Routes                        - Forum Content
- Mobile-Responsive UI    - Middleware                        - Economy & Wallets
- Real-time Updates       - WebSocket Server                  - XP & Transactions
```

### Key Architectural Principles

- **🔧 Modular Design**: Each domain (forum, wallet, XP, admin) is self-contained
- **📱 Mobile-First**: 44px minimum touch targets, progressive disclosure
- **🔒 Security-First**: Rate limiting, permission-based access, audit logging
- **⚡ Performance**: Caching layers, optimized queries, efficient state management
- **🧪 Feature Flags**: A/B testing and gradual rollout capabilities

## 📊 API Documentation

Complete API documentation is available in the `/docs/api/` directory:

- **[API Overview](./docs/api/README.md)** - Base URLs, authentication, rate limiting
- **[XP System API](./docs/api/xp-api.md)** - Experience points, levels, and action rewards
- **[Wallet & DGT API](./docs/api/wallet-api.md)** - Cryptocurrency and DGT token operations
- **[Forum API](./docs/api/forum-api.md)** - Threads, posts, categories, and user interactions
- **[Admin API](./docs/api/admin-api.md)** - Administrative functions and modular system

### API Quick Reference

| Endpoint                        | Description                 | Authentication |
| ------------------------------- | --------------------------- | -------------- |
| `GET /api/forum/threads`        | List forum threads          | Optional       |
| `POST /api/forum/threads`       | Create new thread           | Required       |
| `POST /api/xp/award-action`     | Award XP for user action    | Required       |
| `GET /api/wallet/balances`      | Get DGT and crypto balances | Required       |
| `POST /api/wallet/transfer-dgt` | Transfer DGT between users  | Required       |
| `GET /api/admin/modules`        | List admin modules          | Admin          |

## 🔧 Development Guide

### Environment Setup

1. **Prerequisites**

   ```bash
   # Required software
   Node.js 18+
   PostgreSQL 14+
   Git
   ```

2. **Database Configuration**

   ```bash
   # Local PostgreSQL
   createdb degentalk_dev

   # Or use Neon (cloud PostgreSQL)
   # Get connection string from dashboard
   ```

3. **Environment Variables**

   ```bash
   # Copy template and configure
   cp env.local.example env.local

   # Essential variables
   DATABASE_URL=postgresql://user:pass@localhost:5432/degentalk_dev
   NODE_ENV=development
   PORT=5001
   VITE_PORT=5173
   ```

4. **Initial Setup**

   ```bash
   # Install dependencies
   pnpm install

   # Set up database
   pnpm run db:migrate
   pnpm run db:migrate:apply
   pnpm run seed:all

   # Start development
   pnpm run dev
   ```

### Development Workflow

1. **Feature Development**

   ```bash
   # Create feature branch
   git checkout -b feature/new-feature

   # Start development servers
   pnpm run dev

   # Make changes with hot reload
   # Test with role switcher (bottom-right)
   ```

2. **Database Changes**

   ```bash
   # Modify schema files in db/schema/

   # Generate migration
   pnpm run db:migrate

   # Apply to development database
   pnpm run db:migrate:apply

   # Update seed data if needed
   pnpm run seed:all
   ```

3. **Testing & Validation**

   ```bash
   # Type checking
   pnpm run typecheck

   # Linting
   pnpm run lint
   ```

### Mobile Development

The platform prioritizes mobile experience with:

- **44px minimum touch targets** for all interactive elements
- **Progressive disclosure** - complex actions hidden on small screens
- **Adaptive spacing** using responsive utility classes
- **Touch-optimized navigation** with sticky headers and floating buttons

Test mobile responsiveness:

```bash
# View mobile layout
# Open http://localhost:5173 and toggle device emulation

# Test different breakpoints
# Mobile: max-767px
# Tablet: 768px-1023px
# Desktop: 1024px+
```

## 🚀 Deployment

### Production Deployment

1. **Build Process**

   ```bash
   # Build frontend (backend uses tsx runtime)
   pnpm run build

   # Verify build
   pnpm run preview
   ```

2. **Environment Variables**

   ```bash
   # Production variables
   NODE_ENV=production
   DATABASE_URL=postgresql://user:pass@host:5432/prod_db

   # Security settings
   SESSION_SECRET=long-random-string
   CORS_ORIGIN=https://yourdomain.com

   # Payment integration
   CCPAYMENT_APP_ID=prod_app_id
   CCPAYMENT_APP_SECRET=prod_secret
   ```

3. **Database Migration**

   ```bash
   # Apply migrations to production
   pnpm run db:migrate:apply
   ```

4. **Start Production Server**

   ```bash
   # Start with PM2 for process management
   pnpm run start

   # Or with PM2 cluster mode
   pm2 start ecosystem.config.js
   ```

### Scaling Considerations

- **Database**: Use read replicas for query distribution
- **Application**: Horizontal scaling with PM2 cluster mode
- **Caching**: Redis for session storage and query caching
- **CDN**: Static asset delivery for avatars and attachments
- **Load Balancing**: Nginx for SSL termination and request distribution

## 🔍 Monitoring & Analytics

### Health Monitoring

```bash
# Check system health
curl http://localhost:5001/api/health
```

### Key Metrics

- **User Engagement**: DAU, thread creation rate, post frequency
- **Economic Activity**: DGT transaction volume, XP awards per day
- **System Performance**: API response times, database query performance
- **Error Rates**: 4xx/5xx responses, failed transactions

### Admin Dashboard

Access the admin dashboard at `/admin` with appropriate permissions:

- **User Management**: View, suspend, promote users
- **Economy Controls**: Adjust XP rates, DGT settings, feature gates
- **Analytics**: Platform statistics and user behavior insights
- **Feature Flags**: A/B testing and gradual feature rollouts
- **System Settings**: Platform configuration and maintenance

## 🛡️ Security

### Security Measures

- **Authentication**: Session-based auth with CSRF protection
- **Authorization**: Role-based permissions with module-level access control
- **Rate Limiting**: Endpoint-specific limits to prevent abuse
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **Audit Logging**: Complete admin action tracking

### Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **Database Access**: Use least-privilege database users
3. **API Security**: Validate all inputs and sanitize outputs
4. **Error Handling**: Don't expose sensitive information in errors
5. **Session Management**: Secure session configuration and timeouts

## 🤝 Contributing

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the development workflow above
4. Ensure all tests pass: `pnpm run test`
5. Submit a pull request with detailed description

### Code Standards

- **TypeScript**: Strict mode enabled, all functions must be typed
- **ESLint**: Use provided configuration, fix all warnings
- **Prettier**: Auto-formatting on save
- **Conventional Commits**: Use semantic commit messages

### Pull Request Guidelines

- Include comprehensive description of changes
- Add tests for new functionality
- Update documentation as needed
- Ensure all CI checks pass
- Request review from maintainers

---

**Built with ❤️ for the crypto community**

For detailed technical documentation, see the `/docs/` directory.

## 🔐 Authentication & User Flow

### Dev Environment Quick Start

For development, use these credentials:

- **Username**: `cryptoadmin`
- **Password**: `password123`

### Complete Authentication Flow

#### 1. **Guest Experience**

- Header shows "Log In" and "Sign Up" buttons
- Hero section "Join Community" button redirects to `/auth?mode=signup`
- All user-specific icons (wallet, notifications, admin) are hidden

#### 2. **Login Process**

- Visit `/auth` or click "Log In"
- Successful login redirects to home page (`/`)
- Header automatically switches to authenticated state

#### 3. **Registration Process**

- Visit `/auth?mode=signup` or click "Sign Up"
- Auto-opens registration tab
- Successful registration redirects to home page (`/`)
- Wallet creation is automatically triggered during signup

#### 4. **Authenticated Experience**

- Header shows user menu, wallet, notifications, and admin buttons (if applicable)
- All authenticated-only features become available
- User context is maintained across page refreshes

#### 5. **Logout Process**

- Click user menu → "Log Out"
- **Immediate redirect** to `/auth` (no page flash)
- All user data cleared from memory
- Header switches back to guest state instantly

### Auth Route Patterns

```
/auth                    → Login tab (default)
/auth?mode=signup       → Registration tab
/auth?mode=register     → Registration tab (alias)
```

### Development Notes

When you click "Log Out" in development:

1. User session is cleared from context
2. All query cache is cleared
3. Automatic redirect to `/auth`
4. Header switches to "Log In / Sign Up" buttons
5. No user icons remain visible

The auth system works seamlessly in both development and production environments.
