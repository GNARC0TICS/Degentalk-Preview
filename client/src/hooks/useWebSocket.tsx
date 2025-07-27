import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (event: string, handler: (data: any) => void) => () => void;
  unsubscribe: (event: string, data?: any) => void;
  send: (type: string, payload: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  subscribe: () => () => {},
  unsubscribe: () => {},
  send: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const eventHandlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const connect = useCallback(() => {
    if (!user || !token || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws?token=${token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        logger.info('UseWebSocket', 'WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // Emit connected event
        const handlers = eventHandlersRef.current.get('connected');
        if (handlers) {
          handlers.forEach(handler => handler({}));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const handlers = eventHandlersRef.current.get(data.type);
          
          if (handlers) {
            handlers.forEach(handler => handler(data));
          }
        } catch (error) {
          logger.error('UseWebSocket', 'WebSocket message parsing error:', error);
        }
      };

      ws.onerror = (error) => {
        logger.error('UseWebSocket', 'WebSocket error:', error);
      };

      ws.onclose = (event) => {
        logger.info('UseWebSocket', 'WebSocket disconnected', { data: [event.code, event.reason] });
        setIsConnected(false);
        wsRef.current = null;

        // Reconnect logic
        if (event.code !== 1000 && event.code !== 1001) {
          const attempts = reconnectAttemptsRef.current;
          if (attempts < 5) {
            const delay = Math.min(1000 * Math.pow(2, attempts), 10000);
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttemptsRef.current++;
              connect();
            }, delay);
          } else {
            toast.error('Lost connection to chat server');
          }
        }
      };

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping', payload: {} }));
        }
      }, 30000);

      ws.addEventListener('close', () => {
        clearInterval(pingInterval);
      });

    } catch (error) {
      logger.error('UseWebSocket', 'WebSocket connection error:', error);
    }
  }, [user, token]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const subscribe = useCallback((event: string, handler: (data: any) => void) => {
    if (!eventHandlersRef.current.has(event)) {
      eventHandlersRef.current.set(event, new Set());
    }
    
    eventHandlersRef.current.get(event)!.add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = eventHandlersRef.current.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlersRef.current.delete(event);
        }
      }
    };
  }, []);

  const unsubscribe = useCallback((event: string, data?: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: event,
        payload: data || {},
        timestamp: new Date().toISOString(),
      }));
    }
  }, []);

  const send = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type,
        payload,
        timestamp: new Date().toISOString(),
      }));
    } else {
      logger.warn('UseWebSocket', 'WebSocket not connected, cannot send message');
    }
  }, []);

  // Connect when user logs in
  useEffect(() => {
    if (user && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user, token, connect, disconnect]);

  // Reconnect on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (user && token && !isConnected) {
        connect();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, token, isConnected, connect]);

  const value: WebSocketContextType = {
    isConnected,
    subscribe,
    unsubscribe,
    send,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}