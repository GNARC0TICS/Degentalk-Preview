# Changelog

All notable changes to the Degentalk platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - 2025-07-27

### Changed
- **BREAKING**: Standardized all import aliases across the codebase
  - Client: Migrated from `@app/*` to `@/*` (2,335+ imports updated)
  - Server: Migrated from `@api/*`, `@server/*` to `@/*` 
  - Server: Migrated from `@server-core/*` to `@core/*`
  - All legacy import patterns are now banned and enforced by git hooks
- Fixed database schema: `threads.categoryId` → `threads.structureId`
- Added comprehensive import validation to pre-commit hooks
- Updated documentation (CLAUDE.md, README.md, .cursorrules) with new standards

### Added
- `.cursorrules` file for Cursor AI integration with project standards
- Import pattern validation in lint-staged configuration
- Comprehensive import alias documentation in README.md

### Fixed
- JSX structure issues in ThreadCard component
- TypeScript module resolution for shared workspace (.js extensions)

### Security
- Enforced architectural boundaries through git hooks
- Prevented accidental use of deprecated import patterns

## Migration Notes

### Import Alias Migration (July 2025)

If you have branches created before this migration, you'll need to update imports:

```bash
# For client files
find client/src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do 
  sed -i "s/@app\//@\//g" "$file"
done

# For server files
find server/src -type f -name "*.ts" | while read file; do 
  sed -i "s/@api\//@\//g; s/@server\//@\//g; s/@server-core\//@core\//g" "$file"
done
```

Then run `pnpm typecheck` to verify everything compiles correctly.