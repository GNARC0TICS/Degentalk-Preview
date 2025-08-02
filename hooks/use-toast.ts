// Mock toast hook for static landing page
import { logger } from '@/lib/logger';

export function useToast() {
  return {
    toast: (options: any) => logger.info('Toast', 'Show toast', options),
    dismiss: (id?: string) => logger.info('Toast', 'Dismiss toast', { id })
  };
}