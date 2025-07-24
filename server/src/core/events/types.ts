import type { UserId } from '@shared/types/ids';

/**
 * Base interface for all domain events
 */
export interface DomainEvent<T = any> {
  type: string;
  payload: T;
  metadata: {
    userId?: UserId;
    timestamp: Date;
    correlationId: string;
    version?: number;
  };
}

/**
 * Event handler function type
 */
export type EventHandler<T = any> = (event: DomainEvent<T>) => void | Promise<void>;

/**
 * Event middleware function type
 */
export type EventMiddleware = (event: DomainEvent) => void;

/**
 * Type-safe event emitter interface
 */
export interface TypedEventEmitter<TEvents extends Record<string, any>> {
  emit<K extends keyof TEvents>(
    type: K,
    payload: TEvents[K],
    metadata?: Partial<DomainEvent['metadata']>
  ): void;
  
  on<K extends keyof TEvents>(
    type: K,
    handler: (event: DomainEvent<TEvents[K]>) => void | Promise<void>
  ): () => void;
}