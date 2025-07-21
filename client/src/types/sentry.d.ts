/**
 * Type declarations for Sentry packages
 * TODO: Remove this file once @sentry/react and @sentry/tracing are installed
 */

declare module '@sentry/react' {
  export interface User {
    id?: string;
    username?: string;
    email?: string;
    [key: string]: any;
  }

  export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

  export interface CaptureContext {
    level?: SeverityLevel;
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: User;
  }

  export interface Transaction {
    setStatus(status: string): void;
    finish(): void;
  }

  export interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
    showDialog?: boolean;
  }

  export function init(options: any): void;
  export function setUser(user: User | null): void;
  export function setContext(key: string, context: Record<string, any>): void;
  export function addBreadcrumb(breadcrumb: any): void;
  export function captureException(error: Error, captureContext?: CaptureContext): string;
  export function captureMessage(message: string, captureContext?: CaptureContext): string;
  export function startTransaction(context: any): Transaction;
  export function lastEventId(): string | undefined;
  export const ErrorBoundary: React.FC<ErrorBoundaryProps>;
  export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryOptions?: any
  ): React.ComponentType<P>;
  export function reactRouterV6Instrumentation(
    history: any,
    routes?: string[]
  ): () => void;
  
  export class Replay {
    constructor(options: any);
  }
}

declare module '@sentry/tracing' {
  export class BrowserTracing {
    constructor(options: any);
  }
}

declare global {
  interface Window {
    Sentry?: any;
  }
}