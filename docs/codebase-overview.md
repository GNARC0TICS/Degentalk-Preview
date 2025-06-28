---
title: codebase overview
status: STABLE
updated: 2025-06-28
---

# Degentalk Codebase Overview

This document provides a comprehensive overview of the Degentalk platform codebase, a crypto-native forum designed for dynamic user engagement and community management.

## Project Structure

```
.
├── client/                  # Frontend React application
│   └── src/
│       ├── components/      # Reusable UI components
│       │   ├── admin/       # Admin panel components
│       │   ├── economy/     # Wallet and economic functionality
│       │   ├── forum/       # Forum-related components
│       │   ├── layout/      # Layout components (header, footer, etc.)
│       │   ├── paths/       # User progression path components
│       │   ├── platform-energy/ # Engagement features
│       │   ├── shop/        # Shop interface components
│       │   └── ui/          # Core UI components
│       ├── hooks/           # Custom React hooks
│       ├── lib/             # Utility functions and API clients
│       ├── pages/           # Page components and routes
│       └── styles/          # Global styles and theme
├── server/                  # Express.js backend
│   ├── utils/               # Server utilities
│   ├── admin-routes.ts      # Admin API routes
│   ├── auth.ts              # Authentication logic
│   ├── db.ts                # Database connection
│   ├── index.ts             # Server entry point
│   ├── migrations.ts        # Database migration logic
│   ├── routes.ts            # Main API routes
│   ├── storage.ts           # Data access layer
│   └── vite.ts              # Vite server configuration
└── shared/                  # Shared code between frontend and backend
    └── schema.ts            # Database schema definitions
```

## Core Back-End Modules

### API Endpoints

#### Authentication APIs

- **/api/login** - User authentication
- **/api/logout** - User logout
- **/api/user** - Get current user information
- **/api/request-password-reset** - Password reset flow
- **/api/verify-reset-token/:token** - Verify reset token
- **/api/reset-password** - Complete password reset

#### Forum APIs

- **/api/categories** - Forum categories CRUD
- **/api/threads** - Thread management
- **/api/threads/:threadId/posts** - Post management
- **/api/posts/:postId/reactions** - Post reactions

#### Wallet APIs

- **/api/wallet/balance** - Get user wallet balance
- **/api/wallet/transactions** - Get transaction history
- **/api/wallet/treasury-address** - Get treasury wallet info
- **/api/wallet/buy-dgt** - Buy DGT with USDT
- **/api/wallet/tip** - Tip other users
- **/api/wallet/rain** - Distribute tokens to multiple users
- **/api/wallet/deposit-address** - Get deposit address
- **/api/wallet/withdraw** - Withdraw funds

#### Shop APIs

- **/api/shop/items** - Browse shop items
- **/api/shop/purchase** - Purchase items
- **/api/shop/check-balance** - Check if user can afford item
- **/api/shop/my-inventory** - View owned items
- **/api/shop/check-ownership/:itemId** - Check if user owns item
- **/api/shop/use-item** - Use owned item
- **/api/shop/sell-item** - Sell inventory item

#### Platform Energy APIs

- **/api/recent-posts** - Get recently active posts
- **/api/hot-threads** - Get trending threads
- **/api/featured-threads** - Get featured threads
- **/api/platform-stats** - Get platform statistics
- **/api/leaderboards/:type** - Get user leaderboards

#### Admin APIs

- **/api/admin/wallets** - Manage wallet information
- **/api/admin/treasury-settings** - Configure treasury
- **/api/admin/transactions** - View transaction history
- **/api/admin/stats** - View platform stats
- **/api/admin/users** - User management
- **/api/admin/categories** - Forum category management
- **/api/admin/settings** - Site settings
- **/api/admin/threads** - Thread moderation

### Utilities

- **path-utils.ts** - User progression path management
- **platform-energy.ts** - Community engagement features
- **shop-utils.ts** - Shop functionality helpers
- **task-scheduler.ts** - Background task scheduling

### Database Schema Structure

The database uses PostgreSQL with Drizzle ORM and follows this structure:

1. **Users & Authentication**
   - users
   - userSettings
   - userSessions
   - roles
   - userGroups

2. **Forum System**
   - forumCategories
   - threads
   - posts
   - postReactions
   - threadTags
   - threadPrefixes

3. **Wallet & Economy**
   - wallets
   - transactions
   - treasurySettings

4. **Shop & Inventory**
   - products
   - productCategories
   - orders
   - orderItems
   - userInventory
   - inventoryTransactions

5. **Social & Messaging**
   - conversations
   - conversationParticipants
   - messages
   - messageReads
   - userRelationships
   - notifications
   - notificationSettings

6. **Community Features**
   - customEmojis
   - achievements
   - userAchievements
   - leaderboardHistory
   - platformStatistics

7. **Admin & Settings**
   - siteSettings
   - adminThemes
   - betaFeatureFlags
   - adminAuditLogs
   - reportedContent
   - contentModerationActions

## Core Front-End Modules

### Pages

- **home-page.tsx** - Platform landing page with activity feeds
- **auth-page.tsx** - Login/Registration page
- **category-page.tsx** - View threads in a category
- **thread-page.tsx** - View and interact with threads
- **profile-page.tsx** - User profile page
- **shop.tsx** - Browse and purchase items

**Admin Pages:**
- **admin/index.tsx** - Admin dashboard
- **admin/users.tsx** - User management
- **admin/categories.tsx** - Forum category management
- **admin/threads.tsx** - Thread moderation
- **admin/treasury.tsx** - Treasury management
- **admin/platform-settings.tsx** - Site configuration

### Components

#### Economy Components
- **wallet-modal-v2.tsx** - Main consolidated wallet interface with tabbed sections
- **wallet/wallet-balance-display.tsx** - Displays wallet balance with animations
- **wallet/wallet-address-display.tsx** - Shows user's wallet address with copy function
- **wallet/tip-button.tsx** - Interface for tipping users
- **wallet/rain-button.tsx** - Interface for distributing rewards to active users
- **wallet/deposit-button.tsx** - Interface for depositing funds
- **wallet/withdraw-button.tsx** - Interface for withdrawing funds
- **wallet/buy-dgt-button.tsx** - Interface for purchasing DGT with USDT
- **wallet/transaction-history.tsx** - Displays transaction history

#### Shop Components
- **shop-item-card.tsx** - Displays shop items
- **purchase-modal.tsx** - Interface for purchasing items

#### Forum Components
- **thread-list.tsx** - Displays thread listings
- **post-card.tsx** - Displays forum posts
- **post-editor.tsx** - Interface for creating/editing posts
- **category-navigation.tsx** - Forum category navigation

#### Platform Energy Components
- **featured-threads/featured-thread-card.tsx** - Displays featured threads
- **hot-threads/hot-thread-list.tsx** - Displays trending threads
- **leaderboards/leaderboard-display.tsx** - Displays user rankings
- **recent-posts/recent-post-feed.tsx** - Displays recent activity

### Hooks

- **use-wallet-modal.tsx** - Manages wallet UI state
- **use-shop-items.ts** - Fetches and manages shop inventory
- **use-purchase-modal.ts** - Manages item purchase flow
- **use-toast.ts** - Manages toast notifications

## Integration Points

### Client-Server Communication
- React Query for data fetching
- API client in `client/src/lib/api.ts`
- WebSocket connections for real-time features

### Authentication Flow
- Passport.js local authentication strategy
- Session-based authentication
- Password reset flow via email tokens

### Wallet Integration
- Treasury wallet management
- Tipping and raining features
- Transaction history
- Balance management

## Database Migrations

Database migrations are managed through:
1. Schema definitions in `shared/schema.ts`
2. Migration logic in `server/migrations.ts`
3. Drizzle ORM for PostgreSQL

The system initializes various tables and seed data during startup.