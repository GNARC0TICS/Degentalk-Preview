# Degentalk Documentation

## Legend
| Symbol | Meaning | | Abbrev | Meaning |
|--------|---------|---|--------|---------|
| → | leads to | | API | application programming interface |
| 📚 | documentation | | Auth | authentication |
| ✅ | complete | | DGT | Degentalk Token |
| 🚧 | in progress | | XP | experience points |

## Quick Navigation

### 🚀 Getting Started
- **[Setup Guide](./setup.md)** - Development environment setup
- **[API Overview](./api/README.md)** - Complete API reference
- **[Architecture](./architecture.md)** - System design & patterns
- **[Database Schema](./database.md)** - Complete data model

### 🔧 API Documentation
- **[Authentication API](./api/auth/README.md)** - Login, registration, session management
- **[Forum System API](./api/forum/README.md)** - Threads, posts, zones, categories
- **[Wallet System API](./api/wallet/README.md)** - DGT tokens, crypto deposits, transfers
- **[XP & Gamification API](./api/xp/README.md)** - Experience points, levels, achievements
- **[Chat System API](./api/chat/README.md)** - Shoutbox, rooms, real-time messaging
- **[Admin Panel API](./api/admin/README.md)** - User management, analytics, settings
- **[Webhooks & Integration API](./api/webhooks/README.md)** - External integrations, callbacks

### 🏗️ Development Guides
- **[Contributing Guide](./contributing.md)** - How to contribute to the project
- **[Testing Guide](./testing.md)** - Unit, integration & E2E testing
- **[Deployment Guide](./deployment.md)** - Production deployment
- **[Troubleshooting](./troubleshooting.md)** - Common issues & solutions

### 🎮 Feature Documentation
- **[Forum Power Features](./features/forum-power-features.md)** - Advanced forum capabilities
- **[XP System](./features/xp-system.md)** - Gamification mechanics
- **[DGT Economy](./features/dgt-economy.md)** - Token economy & rewards
- **[Real-time Features](./features/realtime.md)** - WebSocket & live updates

### 🔐 Security & Administration
- **[Security Model](./security/README.md)** - Authentication, authorization, data protection
- **[Admin Features](./admin/README.md)** - Administrative tools & capabilities
- **[Monitoring](./monitoring.md)** - System monitoring & alerting
- **[Backup & Recovery](./backup.md)** - Data backup & disaster recovery

## Project Overview

**Degentalk** is a modern, highly satirical crypto forum platform designed for gamblers, investors, traders, and crypto fanatics across the globe. It aims to be the next viral forum of the century, featuring:

### Core Features ✅
- **Hierarchical Forum System** - Zones → Forums → Threads w/ advanced moderation
- **DGT Token Economy** - Native cryptocurrency w/ CCPayment integration
- **XP & Gamification** - Levels, achievements, missions & leaderboards
- **Real-time Chat** - Shoutbox w/ rooms, reactions & WebSocket integration
- **Advanced Analytics** - Comprehensive user & platform analytics
- **Admin Panel** - Full administrative interface w/ user management

### Technical Stack
```yaml
Frontend:
  - React 18 w/ TypeScript
  - Vite build system
  - TanStack Query for state management
  - Tailwind CSS for styling

Backend:
  - Node.js w/ Express
  - Domain-driven architecture
  - PostgreSQL w/ Drizzle ORM
  - Passport.js authentication

Infrastructure:
  - WebSocket for real-time features
  - CCPayment for crypto integration
  - Rate limiting & security middleware
  - Comprehensive logging & monitoring
```

### Architecture Highlights

#### Domain-Driven Design
```
server/src/domains/
├── auth/           # Authentication & session management
├── forum/          # Forum structure, threads, posts
├── wallet/         # DGT economy, crypto deposits
├── xp/             # Experience points, levels
├── admin/          # Administrative functions
├── engagement/     # Tips, airdrops, social features
└── messaging/      # Chat, notifications
```

#### Database Organization
```
db/schema/
├── user/           # Users, roles, permissions
├── forum/          # Categories, threads, posts
├── economy/        # Wallets, XP, transactions
├── shop/           # Products, inventory
├── messaging/      # Chat, notifications
└── admin/          # System administration
```

## Development Workflow

### Essential Commands
```bash
# Start full development environment
npm run dev                    # Frontend (5173) + Backend (5001)

# Database management
npm run db:migrate:Apply       # Apply migrations
npm run db:studio             # Open Drizzle Studio
npm run seed:all              # Seed with test data

# Forum system
npm run sync:forums           # Sync forumMap.config.ts → database

# Testing
npm run test:e2e              # Playwright E2E tests
npm run test:xp               # XP system validation
```

### Key Configuration Files
- **`forumMap.config.ts`** - Master forum structure configuration
- **`CLAUDE.md`** - Project instructions for AI assistants
- **`package.json`** - Essential npm scripts & dependencies
- **`env.local`** - Environment configuration

## API Quick Reference

### Base URL
```
Development: http://localhost:5001/api
Production: https://degentalk.com/api
```

### Authentication
```bash
# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password"}'

# Get current user
curl -X GET http://localhost:5001/api/auth/user \
  -H "Cookie: connect.sid=<session-cookie>"
```

### Common Operations
```bash
# Get forum structure
curl -X GET http://localhost:5001/api/forum/structure

# Check DGT balance
curl -X GET http://localhost:5001/api/wallet/balances \
  -H "Cookie: connect.sid=<session>"

# Create thread
curl -X POST http://localhost:5001/api/forum/threads \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=<session>" \
  -d '{"title":"Bitcoin Analysis","content":"Analysis here...","forumId":"bitcoin-discussion"}'
```

## Security Features

### Authentication & Authorization
- **Session-based authentication** w/ Passport.js
- **Role-based access control** (admin/moderator/user)
- **JWT tokens** for API access
- **Rate limiting** on all endpoints

### Data Protection
- **Input validation** w/ Zod schemas
- **SQL injection prevention** via parameterized queries
- **XSS protection** through content sanitization
- **CSRF protection** for state-changing operations

### Financial Security
- **Multi-signature withdrawals** for crypto
- **Real-time monitoring** for suspicious activity
- **Audit logging** for all financial transactions
- **Feature gates** for admin-controlled functionality

## Contributing

### Development Setup
1. **Clone repository** & install dependencies
2. **Configure environment** (`env.local`)
3. **Setup PostgreSQL** database
4. **Run migrations** & seed data
5. **Start development server**

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code quality
- **Domain-driven architecture** patterns
- **Comprehensive testing** (unit, integration, E2E)

### Submission Process
1. **Create feature branch** from main
2. **Implement changes** w/ tests
3. **Run validation** scripts
4. **Submit pull request** w/ description
5. **Code review** & merge

## Support & Resources

### Documentation Updates
This documentation is automatically updated as the codebase evolves. For the latest information:

1. **Check API endpoints** using the development server
2. **Review recent commits** for breaking changes
3. **Run test suites** to validate functionality
4. **Consult troubleshooting guide** for common issues

### Getting Help
- **GitHub Issues** - Report bugs & request features
- **Development Discord** - Real-time developer support
- **API Status Page** - Monitor system health
- **Admin Panel** - Built-in monitoring & logs

### External Links
- **Live Demo:** https://degentalk.com
- **API Status:** https://status.degentalk.com
- **Developer Discord:** https://discord.gg/degentalk-dev
- **GitHub Repository:** https://github.com/degentalk/platform

---

**📚 Documentation Version:** 2.0.0  
**Last Updated:** 2025-01-01  
**API Version:** v2

**Quick Access:**
- [🚀 Start Development](./setup.md)
- [📡 API Reference](./api/README.md)
- [🔧 Troubleshooting](./troubleshooting.md)
- [🏗️ Architecture](./architecture.md)