/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_URL: string;
  readonly VITE_CCPAYMENT_API_URL: string;
  readonly VITE_CCPAYMENT_APP_ID: string;
  readonly VITE_CCPAYMENT_APP_SECRET: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 