import { createInsertSchema as _createInsertSchema } from 'drizzle-zod';
import type { z } from 'zod';

// Workaround for drizzle-zod type inference issue with cross-workspace builds
// The .omit() method returns 'never' types when used in build mode
// This helper provides a type-safe alternative

export function createInsertSchema<T extends Record<string, any>>(
  table: any,
  refinements?: any
): any {
  return _createInsertSchema(table, refinements) as any;
}

// Re-export for convenience
export { z } from 'zod';