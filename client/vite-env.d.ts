/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_CCPAYMENT_APP_ID: string
  readonly VITE_CCPAYMENT_PUBLIC_KEY: string
  readonly VITE_CCPAYMENT_BASE_URL: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENV: string
  readonly VITE_DEBUG: string
  readonly VITE_UPLOADER_URL: string
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface Window {
    Sentry?: {
      lastEventId(): string | null;
      captureException(error: Error): string;
    };
  }
}