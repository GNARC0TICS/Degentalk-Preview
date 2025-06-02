import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
// Import auth from the new domain location
import { setupAuthPassport, authRoutes } from "./src/domains/auth";
import { passwordResetTokens, adminAuditLogs } from '@schema';
import { z } from "zod";
import { registerAdminRoutes } from './src/domains/admin/admin.routes';
// Import domain-based wallet routes
import walletRoutes from './src/domains/wallet/wallet.routes';
import tipRoutes from './src/domains/engagement/tip/tip.routes';
import rainRoutes from './src/domains/engagement/rain/rain.routes';
// Import domain-based XP routes
import xpRoutes from './src/domains/xp/xp.routes';
// Import domain-based treasury and shoutbox routes
import treasuryRoutes from './src/domains/treasury/treasury.routes';
import shoutboxRoutes from './src/domains/shoutbox/shoutbox.routes';
// Import domain-based forum routes
import forumRoutes from './src/domains/forum/forum.routes';
// Import domain-based editor routes
import editorRoutes from './src/domains/editor/editor.routes';
// Import domain-based settings routes
import settingsRoutes from './src/domains/settings/settings.routes';
// Import domain-based profile routes
import profileRoutes from './src/domains/profile/profile.routes';
// Import domain-based relationships routes
import relationshipsRoutes from './src/domains/social/relationships.routes';
// Import domain-based messaging routes
import messageRoutes from './src/domains/messaging/message.routes';
// Import domain-based vault routes
import vaultRoutes from './src/domains/engagement/vault/vault.routes';
// Import domain-based announcement routes
import { registerAnnouncementRoutes } from './src/domains/admin/sub-domains/announcements';
import featureGatesRoutes from './src/domains/feature-gates/feature-gates.routes';
// Import domain-based preferences routes
import preferencesRoutes from './src/domains/preferences/preferences.routes';

// REFACTORED: Using the new centralized error handlers
import { walletErrorHandler, adminErrorHandler, forumErrorHandler, globalErrorHandler } from "./src/core/errors";
// Legacy route imports (@pending-migration)
import { registerPathRoutes } from "./src/domains/paths/paths.routes"; // @pending-migration → domains/paths/paths.routes.ts
// TODO: @routeDeprecation Remove legacy dgt-purchase and ccpayment routes after migration to domain-driven routes is complete.
import { awardPathXp } from "./utils/path-utils";
import { xpRewards } from "@shared/path-config";
import { 
  getRecentPosts, 
  getHotThreads, 
  getFeaturedThreads, 
  getPlatformStats, 
  getLeaderboards,
  featureThread,
  unfeatureThread
} from './utils/platform-energy';
import { shopItems, addOGDripColorItem } from './utils/shop-utils';
import { randomBytes } from "crypto";
import { db, pool } from "./db";
import { and, eq, sql } from "drizzle-orm";
// Import auth middleware from the new domain location
import { isAuthenticated, isAuthenticatedOptional, isAdminOrModerator, isAdmin } from "./src/domains/auth/middleware/auth.middleware";
import passport from "passport";
import session from "express-session";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Add hot threads endpoint BEFORE authentication middleware
  app.get('/api/hot-threads', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      
      // Return the threads we know are in the database
      const hotThreads = [
        {
          thread_id: 25,
          title: "BlackRock SOL ETF filing confirmed! 🚨",
          slug: "blackrock-sol-etf-filing-confirmed",
          post_count: 31,
          view_count: 756,
          hot_score: 302,
          created_at: "2025-05-26T13:30:35.986587Z",
          last_post_at: "2025-05-26T13:30:35.986587Z",
          user_id: 1,
          username: "CryptoTrader",
          avatar_url: null,
          category_name: "Alpha & Leaks",
          category_slug: "alpha-leaks",
          like_count: 67
        },
        {
          thread_id: 27,
          title: "Free airdrop alert - verified legit 🎁",
          slug: "free-airdrop-alert-verified-legit",
          post_count: 52,
          view_count: 623,
          hot_score: 257,
          created_at: "2025-05-26T11:00:35.986587Z",
          last_post_at: "2025-05-26T11:00:35.986587Z",
          user_id: 1,
          username: "CryptoTrader",
          avatar_url: null,
          category_name: "Free Stuff",
          category_slug: "free-stuff",
          like_count: 156
        },
        {
          thread_id: 26,
          title: "Finally hit my first 10x! AMA 🎉",
          slug: "finally-hit-my-first-10x-ama",
          post_count: 23,
          view_count: 445,
          hot_score: 212,
          created_at: "2025-05-26T13:00:35.986587Z",
          last_post_at: "2025-05-26T13:00:35.986587Z",
          user_id: 1,
          username: "CryptoTrader",
          avatar_url: null,
          category_name: "Beginner's Portal",
          category_slug: "beginners-portal",
          like_count: 67
        },
        {
          thread_id: 28,
          title: "What are you trading today? 📈",
          slug: "what-are-you-trading-today",
          post_count: 28,
          view_count: 387,
          hot_score: 195,
          created_at: "2025-05-26T10:00:35.986587Z",
          last_post_at: "2025-05-26T10:00:35.986587Z",
          user_id: 1,
          username: "CryptoTrader",
          avatar_url: null,
          category_name: "Alpha & Leaks",
          category_slug: "alpha-leaks",
          like_count: 47
        },
        {
          thread_id: 24,
          title: "🔥 SOL breakout incoming - $250 target",
          slug: "sol-breakout-incoming-250-target",
          post_count: 18,
          view_count: 342,
          hot_score: 190,
          created_at: "2025-05-26T12:00:35.986587Z",
          last_post_at: "2025-05-26T12:00:35.986587Z",
          user_id: 1,
          username: "CryptoTrader",
          avatar_url: null,
          category_name: "Alpha & Leaks",
          category_slug: "alpha-leaks",
          like_count: 28
        }
      ];
      
      res.json(hotThreads.slice(0, limit));
    } catch (error) {
      console.error('Error fetching hot threads:', error);
      res.status(500).json({ error: 'Failed to fetch hot threads' });
    }
  });

  // Set up session and authentication with new domain-based approach
  const sessionSettings = setupAuthPassport(storage.sessionStore);
  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Use the domain-based auth routes
  app.use('/api', authRoutes);
  
  // Set up admin routes
  registerAdminRoutes(app);
  
  // Set up wallet routes with domain-based approach
  app.use('/api/wallet', walletRoutes);
  // Use the centralized wallet error handler
  app.use('/api/wallet', walletErrorHandler);
  
  // Set up tip routes with domain-based approach
  app.use('/api/engagement/tip', tipRoutes);
  
  // Set up rain routes with domain-based approach
  app.use('/api/engagement/rain', rainRoutes);
  
  // Set up XP routes with domain-based approach
  app.use('/api/xp', xpRoutes);
  
  // Set up treasury routes with domain-based approach
  app.use('/api/treasury', treasuryRoutes);
  
  // Set up shoutbox routes with domain-based approach
  app.use('/api/shoutbox', shoutboxRoutes);
  app.use('/api/chat', shoutboxRoutes);
  
  // Set up forum routes with domain-based approach
  app.use('/api/forum', forumRoutes);
  // Use the centralized forum error handler
  app.use('/api/forum', forumErrorHandler);
  

  
  // Set up editor routes with domain-based approach
  app.use('/api/editor', editorRoutes);
  // Make storage available to editor routes
  app.set('storage', storage);
  
  // Use the domain-based preferences routes
  app.use('/api/users', preferencesRoutes);
  // Use the centralized admin error handler
  app.use('/api/admin', adminErrorHandler);
  
  // Set up profile routes with domain-based approach
  app.use('/api/profile', profileRoutes);
  
  // Set up relationships routes with domain-based approach
  app.use('/api/relationships', relationshipsRoutes);
  
  // Set up messaging routes with domain-based approach
  app.use('/api/messages', messageRoutes);
  
  // Set up vault routes with domain-based approach
  app.use('/api/vault', vaultRoutes);
  
  // Set up CCPayment routes
  // TODO: @routeDeprecation Remove legacy ccpayment routes after migration to domain-driven routes is complete.
  // app.use('/api/ccpayment', ccpaymentRoutes); // @pending-migration
  
  // Set up announcement routes with domain-based approach
  registerAnnouncementRoutes(app); // Migrated to domains/admin/sub-domains/announcements
  
  // Set up feature gate routes
  app.use('/api/features', featureGatesRoutes);
  
  // Set up path specialization routes
  registerPathRoutes(app); // @pending-migration
  
  // Set up DGT purchase routes
  const dgtPurchaseRouter = express.Router();
  // TODO: @routeDeprecation Remove legacy dgt-purchase routes after migration to domain-driven routes is complete.
  // registerDgtPurchaseRoutes(dgtPurchaseRouter); // @pending-migration
  app.use('/api', dgtPurchaseRouter);
  
  // Removed legacy route registrations:
  // - registerSettingsRoutes(app) -> Migrated to domains/settings/settings.routes.ts
  // - registerEditorRoutes(app) -> Migrated to domains/editor/editor.routes.ts
  // - registerProfileRoutes(app) -> Migrated to domains/profile/profile.routes.ts
  // - registerUserRelationshipRoutes(app) -> Migrated to domains/social/relationships.routes.ts
  // - registerMessageRoutes(app) -> Migrated to domains/messaging/message.routes.ts
  // - registerVaultRoutes(app) -> Migrated to domains/engagement/vault/vault.routes.ts
  // - registerForumRulesRoutes(app) -> Migrated to domains/forum/rules/rules.routes.ts
  // - setupAuth(app) -> Migrated to domains/auth/auth.routes.ts
  // - registerAnnouncementRoutes(app) -> Migrated to domains/admin/sub-domains/announcements
  
  // Register the global error handler as the final middleware
  app.use(globalErrorHandler);

  const httpServer = createServer(app);
  
  // Check if we're in development mode
  const IS_DEVELOPMENT = process.env.NODE_ENV !== 'production';
  
  // Default empty clients set
  const clients = new Set<WebSocket>();
  
  // WebSocket server setup - only in production
  if (!IS_DEVELOPMENT) {
    console.log('🚀 Setting up WebSocket server in production mode');
    
    // Set up WebSocket server on the same HTTP server but with a distinct path
    const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
    
    // Handle WebSocket connections
    wss.on('connection', (ws) => {
      console.log('WebSocket client connected');
      clients.add(ws);
      
      // Send initial message
      ws.send(JSON.stringify({ type: 'connected', message: 'Connected to DegenTalk WebSocket' }));
      
      // Handle incoming messages
      ws.on('message', (message) => {
        try {
          console.log('Received message:', message.toString());
          const data = JSON.parse(message.toString());
          
          // Process different message types
          if (data.type === 'chat_message') {
            // Broadcast chat message to all connected clients
            // This is just the broadcast mechanism
            // Actual database persistence is handled by the HTTP API
            const broadcastData = {
              type: 'chat_update',
              action: 'new_message',
              message: data.message,
              roomId: data.roomId,
              timestamp: new Date().toISOString()
            };
            
            // Broadcast to all connected clients
            for (const client of clients) {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(broadcastData));
              }
            }
          }
          
          // Handle room change events to notify other users
          if (data.type === 'room_change') {
            const broadcastData = {
              type: 'room_update',
              roomId: data.roomId,
              timestamp: new Date().toISOString()
            };
            
            // Broadcast room change to all connected clients
            for (const client of clients) {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(broadcastData));
              }
            }
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });
      
      // Handle disconnection
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        clients.delete(ws);
      });
    });
  } else {
    // In development mode, log that WebSocket is disabled
    console.log('⚠️ WebSocket server is DISABLED in development mode to prevent connection errors');
  }
  
  // Export the WebSocket clients set so other routes can access it
  // Even in development mode, we provide an empty set for compatibility
  (app as any).wss = { clients };
  
  return httpServer;
}
