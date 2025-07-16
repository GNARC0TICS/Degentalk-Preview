/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FORCE_AUTH?: string
  readonly VITE_CCPAYMENT_API_URL?: string
  readonly VITE_CCPAYMENT_APP_ID?: string
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}