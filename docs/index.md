---
title: index
status: STABLE
updated: 2025-06-28
---

# Degentalk Documentation

## Overview

Comprehensive documentation for the Degentalk platform - a modern, highly satirical crypto forum designed for gamblers, investors, traders, and crypto fanatics across the globe.

## Quick Navigation

### 📚 API Documentation
- **[Backend Improvements](api/backend-improvements.md)** - Recent performance optimizations and new development endpoints
- [Forum API Reference](api/forum-api.md) - Forum system endpoints and data structures
- [Authentication API](api/auth-api.md) - User authentication and session management
- [Wallet API](api/wallet-api.md) - DGT wallet and cryptocurrency integration

### 🛠️ Development Guides
- **[Performance Optimization](development/performance-optimization.md)** - Database optimization, caching, and monitoring
- **[Developer Tools](guides/developer-tools.md)** - Health monitoring, debugging, and development workflow
- [Setup Guide](development/setup.md) - Getting started with local development
- [Testing Guide](development/testing.md) - Unit tests, integration tests, and E2E testing

### 🏗️ Architecture Documentation
- [System Architecture](architecture/system-overview.md) - High-level system design and components
- [Database Schema](architecture/database-schema.md) - Complete database structure and relationships
- [Cache Architecture](architecture/cache-system.md) - Redis and in-memory caching strategy
- [Security Model](architecture/security.md) - Authentication, authorization, and data protection

### 👥 User Guides
- [Forum User Guide](guides/forum-usage.md) - How to use the forum features
- [Wallet User Guide](guides/wallet-usage.md) - DGT wallet and cryptocurrency features
- [Admin Guide](guides/admin-panel.md) - Administrative functions and moderation tools

## Recent Updates

### 🚀 Backend Performance Improvements (Latest)
- **5x faster thread loading** through N+1 query elimination
- **Redis cache integration** with automatic fallback
- **Development monitoring tools** for real-time performance tracking
- **Database indices** for critical query optimization
- **Security middleware** for development environment protection

**Quick Start**: Access development tools at `http://localhost:5001/api/dev/health`

### 🎨 Frontend Improvements
- **Zone carousel system** with auto-rotation and responsive design
- **Thread animation optimization** for better clickability
- **Zone theme consolidation** eliminating redundant configurations
- **Positioned shoutbox fixes** resolving dynamic import errors

### 🏛️ System Architecture
- **Domain-driven backend** with clean separation of concerns
- **Unified thread architecture** using canonical ThreadDisplay types
- **Config-driven forum system** with single source of truth
- **Advanced error handling** with contextual user feedback

## Development Quickstart

### Prerequisites
```bash
# Required
Node.js 18+
PostgreSQL (local or remote)

# Optional (for enhanced caching)
Redis
```

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp env.example env.local
# Edit env.local with your database credentials

# 3. Initialize database
npm run db:migrate:Apply
npm run seed:all

# 4. Start development
npm run dev
```

### Health Check
```bash
# Verify everything is working
curl http://localhost:5001/api/dev/health
```

## Key Features

### 🏆 Performance
- **Sub-50ms response times** for cached content
- **3-query limit** for complex thread listings (down from 40+)
- **Automatic cache warming** for common content
- **Real-time performance monitoring** during development

### 🔒 Security
- **Development-focused security** preventing accidental exposure
- **IP allowlisting** for sensitive endpoints
- **Production domain blocking** for shared development links
- **Comprehensive audit logging** for administrative actions

### 🔧 Developer Experience
- **Hot reload** for both frontend and backend
- **Comprehensive error messages** with actionable hints
- **Real-time cache management** via API endpoints
- **Dynamic log level adjustment** without restarts

## Architecture Highlights

### Database
- **PostgreSQL** with optimized indices for development workloads
- **Drizzle ORM** with type-safe query building
- **Automatic migrations** with schema validation

### Cache Layer
- **Redis-first** with automatic memory fallback
- **Structured cache keys** for predictable invalidation
- **TTL optimization** based on content freshness requirements

### API Design
- **Domain-driven routes** organized by business logic
- **Consistent error handling** across all endpoints
- **Development-specific endpoints** for debugging and monitoring

## Contributing

### Code Quality
- Follow existing patterns in domain-driven architecture
- Write tests for new features
- Use TypeScript for type safety
- Document API changes

### Performance
- Monitor query counts for N+1 patterns
- Use batch operations for multiple database calls
- Implement appropriate caching for repeated operations
- Test performance impact of changes

### Documentation
- Update relevant documentation for new features
- Include code examples in API documentation
- Add troubleshooting guides for common issues
- Keep README files current

## Support & Troubleshooting

### Common Issues
- **Slow page loading**: Check `/api/dev/health` for performance metrics
- **Memory usage growing**: Clear cache via `/api/dev/clear-cache`
- **Database connection issues**: Verify credentials in `env.local`
- **Cache not working**: Check Redis status or restart development server

### Getting Help
- Check the troubleshooting sections in relevant documentation
- Use development health endpoints to diagnose issues
- Enable debug logging for detailed information
- Review application logs for error messages

### Debug Resources
- **Health Dashboard**: `http://localhost:5001/api/dev/health`
- **Cache Management**: `POST /api/dev/clear-cache`
- **Log Level Control**: `POST /api/dev/logs/levels`
- **Database Testing**: `GET /api/dev/db/test`

---

📚 **Documentation Index**: This page serves as the central hub for all Degentalk documentation. Each section links to detailed guides and references for specific aspects of the platform.

**Last Updated**: 2025-06-28

# 📚 Documentation Index

| Domain | Primary Docs | Owner |
| ------ | ------------ | ----- |
| Architecture | [ARCHITECTURE.md](./ARCHITECTURE.md) | @core |
| API | [API Overview](./api/README.md) | @backend |
| Database | [db/schema/PERFORMANCE-INDICES.md](../db/schema/PERFORMANCE-INDICES.md) | @db |
| Frontend | [DynamicLayout](./DynamicLayout.md) | @frontend |
| Gamification | [gamification/level-flex-system.md](./gamification/level-flex-system.md) | @xp |
| Forum | [forum/SETUP_GUIDE.md](./forum/SETUP_GUIDE.md) | @forum |
| Admin | [admin/developer-guide.md](./admin/developer-guide.md) | @admin |
| Engagement | [engagement/tipping-analytics.md](./engagement/tipping-analytics.md) | @engagement |

> **Note**  All archived or superseded documents are now located under [`docs/archive/`](./archive/) with date-stamped folders (e.g. `2025-06`).