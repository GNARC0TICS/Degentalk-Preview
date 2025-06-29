import { z } from 'zod';

// Basic brand configuration schema placeholder. Extend as needed for strict validation.
export const brandSchema = z.record(z.any());
export type BrandConfig = z.infer<typeof brandSchema>;
