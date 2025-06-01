/**
 * WebSocket Disabled Flag
 * 
 * This file serves as a central control for disabling WebSocket functionality
 * across the entire application. By importing this constant in any file
 * that uses WebSockets, we can easily disable WebSocket functionality
 * to prevent connection errors in development mode.
 */

// ALWAYS disable WebSockets to prevent white screen issues
export const WEBSOCKET_DISABLED = true;

// Additional utility to log WebSocket state on import
console.log('📡 WebSocket functionality is DISABLED across the application');