import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { logger } from '@core/logger';
import type { UserId, RoomId } from '@shared/types/ids';
import { verifyToken } from '@domains/auth/utils/jwt.utils';
import { IncomingMessage } from 'http';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: UserId;
  username?: string;
  isAlive?: boolean;
  rooms?: Set<RoomId>;
  lastActivity?: Date;
}

interface WSMessage {
  type: string;
  payload: any;
  timestamp: string;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private wss?: WebSocketServer;
  private clients: Map<UserId, Set<AuthenticatedWebSocket>> = new Map();
  private roomPresence: Map<RoomId, Set<UserId>> = new Map();
  private pingInterval?: NodeJS.Timeout;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
      }
    });

    this.wss.on('connection', async (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
      await this.handleConnection(ws, req);
    });

    // Start heartbeat
    this.startHeartbeat();

    logger.info('WEBSOCKET', 'WebSocket service initialized');
  }

  private async handleConnection(ws: AuthenticatedWebSocket, req: IncomingMessage) {
    try {
      // Extract token from query params or headers
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token') || 
                   req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        ws.close(1008, 'Missing authentication');
        return;
      }

      // Verify token and get user info
      const decoded = verifyToken(token);
      if (!decoded || !decoded.userId) {
        ws.close(1008, 'Invalid authentication');
        return;
      }

      // Setup authenticated socket
      ws.userId = decoded.userId as UserId;
      ws.username = decoded.username;
      ws.isAlive = true;
      ws.rooms = new Set();
      ws.lastActivity = new Date();

      // Add to clients map
      if (!this.clients.has(ws.userId)) {
        this.clients.set(ws.userId, new Set());
      }
      this.clients.get(ws.userId)!.add(ws);

      // Send welcome message
      this.sendToClient(ws, {
        type: 'connected',
        payload: {
          userId: ws.userId,
          username: ws.username,
          timestamp: new Date().toISOString()
        }
      });

      // Setup event handlers
      ws.on('message', (data) => this.handleMessage(ws, data));
      ws.on('close', () => this.handleDisconnect(ws));
      ws.on('error', (error) => this.handleError(ws, error));
      ws.on('pong', () => { ws.isAlive = true; });

      logger.info('WebSocket client connected', { userId: ws.userId });
    } catch (error) {
      logger.error('WebSocket connection error', { error });
      ws.close(1011, 'Server error');
    }
  }

  private handleMessage(ws: AuthenticatedWebSocket, data: any) {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      ws.lastActivity = new Date();

      switch (message.type) {
        case 'join_room':
          this.handleJoinRoom(ws, message.payload.roomId);
          break;
        case 'leave_room':
          this.handleLeaveRoom(ws, message.payload.roomId);
          break;
        case 'ping':
          this.sendToClient(ws, { type: 'pong', payload: {} });
          break;
        default:
          logger.warn('Unknown WebSocket message type', { type: message.type });
      }
    } catch (error) {
      logger.error('WebSocket message handling error', { error });
    }
  }

  private handleJoinRoom(ws: AuthenticatedWebSocket, roomId: RoomId) {
    if (!ws.userId) return;

    ws.rooms?.add(roomId);
    
    if (!this.roomPresence.has(roomId)) {
      this.roomPresence.set(roomId, new Set());
    }
    this.roomPresence.get(roomId)!.add(ws.userId);

    // Notify room about new user
    this.broadcastToRoom(roomId, {
      type: 'user_joined',
      payload: {
        userId: ws.userId,
        username: ws.username,
        roomId,
        activeUsers: this.getRoomActiveUsers(roomId)
      }
    }, ws.userId);

    // Send current room state to joining user
    this.sendToClient(ws, {
      type: 'room_joined',
      payload: {
        roomId,
        activeUsers: this.getRoomActiveUsers(roomId)
      }
    });
  }

  private handleLeaveRoom(ws: AuthenticatedWebSocket, roomId: RoomId) {
    if (!ws.userId) return;

    ws.rooms?.delete(roomId);
    this.roomPresence.get(roomId)?.delete(ws.userId);

    // Clean up empty room
    if (this.roomPresence.get(roomId)?.size === 0) {
      this.roomPresence.delete(roomId);
    }

    // Notify room about user leaving
    this.broadcastToRoom(roomId, {
      type: 'user_left',
      payload: {
        userId: ws.userId,
        username: ws.username,
        roomId,
        activeUsers: this.getRoomActiveUsers(roomId)
      }
    });
  }

  private handleDisconnect(ws: AuthenticatedWebSocket) {
    if (!ws.userId) return;

    // Remove from all rooms
    ws.rooms?.forEach(roomId => {
      this.handleLeaveRoom(ws, roomId);
    });

    // Remove from clients
    const userSockets = this.clients.get(ws.userId);
    if (userSockets) {
      userSockets.delete(ws);
      if (userSockets.size === 0) {
        this.clients.delete(ws.userId);
      }
    }

    logger.info('WebSocket client disconnected', { userId: ws.userId });
  }

  private handleError(ws: AuthenticatedWebSocket, error: Error) {
    logger.error('WebSocket error', { error, userId: ws.userId });
  }

  private startHeartbeat() {
    this.pingInterval = setInterval(() => {
      this.wss?.clients.forEach((ws: any) => {
        const authenticatedWs = ws as AuthenticatedWebSocket;
        if (authenticatedWs.isAlive === false) {
          authenticatedWs.terminate();
          return;
        }
        authenticatedWs.isAlive = false;
        authenticatedWs.ping();
      });
    }, 30000); // 30 seconds
  }

  // Public methods for broadcasting
  broadcastToRoom(roomId: RoomId, message: Omit<WSMessage, 'timestamp'>, excludeUserId?: UserId) {
    const users = this.roomPresence.get(roomId);
    if (!users) return;

    const fullMessage: WSMessage = {
      ...message,
      timestamp: new Date().toISOString()
    };

    users.forEach(userId => {
      if (userId === excludeUserId) return;
      const sockets = this.clients.get(userId);
      sockets?.forEach(socket => {
        if (socket.readyState === WebSocket.OPEN && socket.rooms?.has(roomId)) {
          socket.send(JSON.stringify(fullMessage));
        }
      });
    });
  }

  broadcastToUser(userId: UserId, message: Omit<WSMessage, 'timestamp'>) {
    const sockets = this.clients.get(userId);
    if (!sockets) return;

    const fullMessage: WSMessage = {
      ...message,
      timestamp: new Date().toISOString()
    };

    sockets.forEach(socket => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(fullMessage));
      }
    });
  }

  broadcastToAll(message: Omit<WSMessage, 'timestamp'>) {
    const fullMessage: WSMessage = {
      ...message,
      timestamp: new Date().toISOString()
    };

    this.wss?.clients.forEach((ws: any) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(fullMessage));
      }
    });
  }

  private sendToClient(ws: AuthenticatedWebSocket, message: Omit<WSMessage, 'timestamp'>) {
    if (ws.readyState === WebSocket.OPEN) {
      const fullMessage: WSMessage = {
        ...message,
        timestamp: new Date().toISOString()
      };
      ws.send(JSON.stringify(fullMessage));
    }
  }

  getRoomActiveUsers(roomId: RoomId): number {
    return this.roomPresence.get(roomId)?.size || 0;
  }

  getRoomUserList(roomId: RoomId): UserId[] {
    return Array.from(this.roomPresence.get(roomId) || []);
  }

  isUserOnline(userId: UserId): boolean {
    return this.clients.has(userId);
  }

  getUserActiveRooms(userId: UserId): RoomId[] {
    const sockets = this.clients.get(userId);
    if (!sockets) return [];
    
    const rooms = new Set<RoomId>();
    sockets.forEach(socket => {
      socket.rooms?.forEach(room => rooms.add(room));
    });
    
    return Array.from(rooms);
  }

  shutdown() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.wss?.clients.forEach((ws: any) => {
      ws.close(1001, 'Server shutting down');
    });
    
    this.wss?.close();
    logger.info('WEBSOCKET', 'WebSocket service shut down');
  }
}

export const wsService = WebSocketService.getInstance();