# Server Domain Architecture

This directory contains the core business domains of the Degentalk platform, organized using Domain-Driven Design (DDD) principles.

## 🏗️ Domain Organization

Each domain follows a consistent structure:

```
domain/
├── {domain}.controller.ts     # HTTP request handling
├── {domain}.service.ts        # Business logic
├── {domain}.routes.ts         # Route definitions
├── {domain}.validators.ts     # Input validation
├── sub-domains/              # Nested domain contexts
└── services/                 # Domain-specific services
```

## 📋 Domain Catalog

### Core Platform Domains

**`auth`** - Authentication & Authorization

- Session management, JWT tokens
- Role-based access control (RBAC)
- X (Twitter) authentication integration

**`forum`** - Core Forum Functionality

- Threads, posts, categories
- Thread management and moderation
- Content filtering and search

**`wallet`** - DGT Economy & Crypto Integration

- DGT token management
- CCPayment crypto deposits
- Internal transfers and withdrawals

### Engagement Domains

**`engagement`** - Social Features

- Tipping system (DGT rewards)
- Rain events (mass tips)
- User-to-user interactions

**`gamification`** - XP & Achievement System

- Experience point calculations
- Achievement tracking and unlocks
- Leaderboards and missions

**`social`** - Social Graph

- Friend/follow relationships
- Mentions and notifications
- Whale watching (high-value users)

### Content & Commerce

**`shop`** - Digital Marketplace

- Cosmetic items and avatars
- Purchase processing
- Inventory management

**`admin`** - Administrative Operations

- User management and moderation
- System configuration
- Analytics and reporting

**`messaging`** - Communication

- Shoutbox (global chat)
- Direct messages
- Real-time notifications

### Support Domains

**`advertising`** - Ad System

- Campaign management
- Ad serving and tracking
- User promotions

**`collectibles`** - Digital Assets

- Sticker system
- Rare item management
- Trading functionality

**`cosmetics`** - Visual Customization

- Avatar frames and effects
- Profile customization
- Equipment system

## 🔒 Domain Boundaries

### Dependency Rules

1. **No Cross-Domain Imports**: Domains cannot directly import from other domains
2. **Shared Logic**: Common functionality goes in `@degentalk/shared`
3. **Event Communication**: Use events for cross-domain communication
4. **Service Injection**: Use dependency injection for shared services

### Communication Patterns

```typescript
// ✅ Correct: Use shared types and events
import { UserCreatedEvent } from '@degentalk/shared/events';
import { XPService } from '../xp/xp.service';

// ❌ Incorrect: Direct cross-domain import
import { ForumService } from '../forum/forum.service';
```

## 🎯 Adding New Domains

1. **Create domain directory** with standard structure
2. **Define domain boundaries** in business terms
3. **Implement controller → service → repository pattern**
4. **Add domain routes** to main routes file
5. **Document domain responsibilities** in README

## 📖 Domain Responsibilities

### Primary Business Capabilities

- **auth**: Who can access what and when
- **forum**: Core discussion platform features
- **wallet**: Economic transactions and balances
- **engagement**: User interaction and rewards
- **gamification**: Progress tracking and motivation

### Secondary Support Capabilities

- **admin**: Platform management and oversight
- **messaging**: Real-time communication channels
- **shop**: Monetization and virtual goods
- **social**: Community building and relationships
- **advertising**: Revenue generation and promotions

## 🔧 Development Guidelines

1. **Single Responsibility**: Each domain owns one business capability
2. **Loose Coupling**: Minimize dependencies between domains
3. **High Cohesion**: Keep related functionality together
4. **Event-Driven**: Use events for cross-domain communication
5. **Testable**: Write unit tests for each service

## 🚨 Architecture Violations

The following patterns are **strictly prohibited**:

- Direct database access from controllers
- Cross-domain service imports
- Business logic in route handlers
- Shared mutable state between domains
- Circular dependencies between domains

Use ESLint rule `degen/no-cross-context-imports` to enforce boundaries.
