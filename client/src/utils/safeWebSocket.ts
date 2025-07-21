import { IS_PRODUCTION } from '@/constants/env';
import { WEBSOCKET_DISABLED } from '@/constants/websocket-disabled';
import { logger } from "@/lib/logger";

/**
 * A type for WebSocket messages
 */
export interface WebSocketMessage {
	type: string;
	[key: string]: any;
}

/**
 * Options for creating a safe WebSocket
 */
export interface SafeWebSocketOptions {
	path: string;
	authToken?: string;
	onOpen?: (event: Event) => void;
	onMessage?: (data: any) => void;
	onError?: (error: Event) => void;
	onClose?: (event: CloseEvent) => void;
	debug?: boolean;
}

/**
 * Creates a safe WebSocket connection that:
 * 1. Only connects in production mode
 * 2. Uses proper URL construction to avoid undefined port issues
 * 3. Properly handles errors
 * 4. Accepts auth tokens when needed
 *
 * @param options WebSocket options
 * @returns WebSocket instance or null in development mode
 */
export function createSafeWebSocket(options: SafeWebSocketOptions): WebSocket | null {
	// ALWAYS disable WebSockets to prevent white screen issues
	if (WEBSOCKET_DISABLED) {
		// WebSocket functionality disabled: (was console.log)
		return null;
	}

	// Disable WebSocket in development mode to avoid connection issues
	if (!IS_PRODUCTION) {
		// WebSocket disabled in development mode: (was console.log)
		return null;
	}

	// This code will never be reached due to the WEBSOCKET_DISABLED check above
	// It's kept for future reference if we need to re-enable WebSockets

	/*
  try {
    // Construct a proper WebSocket URL
    const wsUrl = IS_PRODUCTION
      ? `wss://${window.location.hostname}${options.path}${options.authToken ? `?token=${options.authToken}` : ''}`
      : `ws://${window.location.hostname}${options.path}${options.authToken ? `?token=${options.authToken}` : ''}`;
    
    if (options.debug) {
      // Attempting WebSocket connection to: (was console.log)
    }
    
    // Create the WebSocket
    const socket = new WebSocket(wsUrl);
    
    // Set up event listeners
    if (options.onOpen) {
      socket.addEventListener('open', options.onOpen);
    } else {
      socket.addEventListener('open', () => {
        if (options.debug) {
          // WebSocket connected: (was console.log)
        }
      });
    }
    
    if (options.onMessage) {
      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          options.onMessage!(data);
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });
    }
    
    if (options.onError) {
      socket.addEventListener('error', options.onError);
    } else {
      socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
      });
    }
    
    if (options.onClose) {
      socket.addEventListener('close', options.onClose);
    } else {
      socket.addEventListener('close', () => {
        if (options.debug) {
          // WebSocket connection closed: (was console.log)
        }
      });
    }
    
    return socket;
  } catch (error) {
    console.error('Error initializing WebSocket:', error);
    return null;
  }
  */

	return null; // Always return null as a fallback
}

/**
 * Safely sends a message through WebSocket if it's open
 *
 * @param socket WebSocket instance
 * @param message Message to send
 * @returns Whether the message was sent
 */
export function safeSendMessage(socket: WebSocket | null, message: WebSocketMessage): boolean {
	if (!socket || socket.readyState !== WebSocket.OPEN) {
		return false;
	}

	try {
		socket.send(JSON.stringify(message));
		return true;
	} catch (error) {
		logger.error('SafeWebSocket', 'Error sending WebSocket message:', error);
		return false;
	}
}

/**
 * Safely closes a WebSocket connection
 *
 * @param socket WebSocket instance
 * @param code Close code
 * @param reason Close reason
 */
export function safeCloseWebSocket(socket: WebSocket | null, code?: number, reason?: string): void {
	if (!socket) {
		return;
	}

	try {
		if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
			socket.close(code, reason);
		}
	} catch (error) {
		logger.error('SafeWebSocket', 'Error closing WebSocket:', error);
	}
}
