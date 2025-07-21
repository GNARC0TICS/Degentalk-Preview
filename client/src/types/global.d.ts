/// <reference types="vite/client" />

declare global {
  interface Window {
    Sentry?: {
      lastEventId(): string | undefined;
      captureException(error: Error, options?: any): string;
      captureMessage(message: string, level?: string): string;
    };
  }
}

// Environment variables types
interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_BUILD_TIME: string;
  readonly VITE_GIT_COMMIT: string;
  readonly VITE_API_URL: string;
  readonly VITE_ENV: 'development' | 'staging' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};