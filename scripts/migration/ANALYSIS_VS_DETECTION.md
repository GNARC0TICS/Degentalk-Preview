# Analysis vs Detection File Counts

## Why Different Numbers?

You'll see different file counts between tools:

**Analysis Tool** (`migration:analyze`): **1,540 files**
- Filters out test files (`*.test.ts`, `*.spec.ts`)
- Excludes generated files (`dist/`, `build/`, `node_modules/`)
- Focuses on production code for migration planning

**Detection Tool** (`migration:detect-ids`): **1,931 files**
- Scans ALL TypeScript files including tests
- Comprehensive coverage for CI protection
- Prevents numeric IDs in any file type

## When to Use Which

### Analysis Tool → Migration Planning
- Domain assessment
- Effort estimation  
- Roadmap generation
- Progress tracking

### Detection Tool → CI Protection
- Regression prevention
- Complete coverage
- Daily development safety
- Baseline enforcement

Both tools are correct for their purpose. The ~400 file difference represents test files and build artifacts that don't need migration but do need protection.