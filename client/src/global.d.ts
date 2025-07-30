// Global type definitions for client

// Sentry global types
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: any) => void;
      withScope: (callback: (scope: any) => void) => void;
      [key: string]: any;
    };
  }
}

export {};