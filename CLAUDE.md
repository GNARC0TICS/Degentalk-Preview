# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL REMINDERS

1. **NEVER run `pnpm db:push`** - It will hang forever with Neon. Use `pnpm db:migrate` instead.
2. **Scripts workspace exists at root** - Don't assume it's deleted if imports fail.
3. **Use migration workflow** for all database schema changes.

## Workspace Details

- Uses **pnpm workspace architecture** with strict boundaries: `client/`, `server/`, `db/`, `shared/`, `scripts/`
- **PostgreSQL only** with Drizzle ORM (SQLite support completely removed)
- **TypeScript strict mode** enabled across all workspaces
- **Domain-driven backend** architecture with composable components
- **Configuration-first** approach - everything configurable via `*.config.ts` files

## Development Fixes

### PostCSS Configuration Fix
- ✅ Converted postcss.config.js to ES module format
- ✅ Removed duplicate @tailwind directives (kept only in index.css)
- ✅ Fixed theme() functions → actual color values
- ✅ Removed @layer wrapper from admin-theme.css

[Rest of the existing file content remains unchanged]