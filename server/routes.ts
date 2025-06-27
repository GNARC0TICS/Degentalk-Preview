/**
 * @file server/routes.ts
 * @description Centralized routing file for the Degentalk backend application.
 * @purpose Aggregates and registers all domain-specific API routes with the Express application.
 *          Also handles global middleware, authentication setup, and WebSocket server initialization.
 * @dependencies
 * - express: Web framework for Node.js.
 * - http: Node.js built-in module for creating HTTP servers.
 * - ws: WebSocket library for Node.js.
 * - storage: Local storage utility (e.g., for session store).
 * - Domain-specific routes and middleware (e.g., auth, wallet, forum, admin).
 * - Drizzle ORM for database interactions.
 * - Centralized error handlers.
 * @environment Server-side (Node.js).
 * @important_notes
 * - This file should primarily import route handlers from `src/domains/` subdirectories.
 * - Legacy routes are being deprecated and should be migrated to domain-driven structures.
 * - WebSocket server is enabled only in production to prevent development conflicts.
 * - Global error handler is registered as the final middleware.
 * @status Stable, but ongoing refactoring for route deprecation.
 * @last_reviewed 2025-06-01
 * @owner Backend Team / API Team
 */
import express, { type Express, type Request, type Response } from 'express';
import { createServer, type Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from './storage';
// Import auth from the new domain location
import { setupAuthPassport, authRoutes } from './src/domains/auth';
import { auditLogs } from '@schema';
import { z } from 'zod';
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
import dictionaryRoutes from './src/domains/dictionary/dictionary.routes';
// Import domain-based editor routes
import editorRoutes from './src/domains/editor/editor.routes';
// TODO: @routeDeprecation Investigate settings.routes.ts location or remove if deprecated.
// import settingsRoutes from './src/domains/settings/settings.routes';
// Import domain-based profile routes
import profileRoutes from './src/domains/profile/profile.routes';
// Import domain-based relationships routes
import relationshipsRoutes from './src/domains/social/relationships.routes';
// Import domain-based whale watch routes
import whaleWatchRoutes from './src/domains/social/whale-watch.routes';
// Import domain-based messaging routes
import messageRoutes from './src/domains/messaging/message.routes';
// Import domain-based vault routes
import vaultRoutes from './src/domains/engagement/vault/vault.routes';
// Import webhook routes
import ccpaymentWebhookRoutes from './src/domains/ccpayment-webhook/ccpayment-webhook.routes';
// Import domain-based announcement routes
import { registerAnnouncementRoutes } from './src/domains/admin/sub-domains/announcements';
import featureGatesRoutes from './src/domains/feature-gates/feature-gates.routes';
// Import domain-based notifications routes
import notificationRoutes from './src/domains/notifications/notification.routes';
// Import domain-based preferences routes
import preferencesRoutes from './src/domains/preferences/preferences.routes';
// Import domain-based advertising routes
import { adRoutes } from './src/domains/advertising/ad.routes';

// REFACTORED: Using the new centralized error handlers
import {
	walletErrorHandler,
	adminErrorHandler,
	forumErrorHandler,
	globalErrorHandler
} from './src/core/errors';
// Legacy route imports (@pending-migration)
import { registerPathRoutes } from './src/domains/paths/paths.routes'; // @pending-migration → domains/paths/paths.routes.ts
// TODO: @routeDeprecation Remove legacy dgt-purchase and ccpayment routes after migration to domain-driven routes is complete.
import { awardPathXp } from './utils/path-utils';
import { xpRewards } from '@shared/path-config';
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
import { randomBytes } from 'crypto';
import { db } from './src/core/db'; // Assuming db is now in src/core/db.ts
// TODO: @cleanup Remove 'pool' if not used after db migration.
// import { pool } from "./db";
import { and, eq, sql } from 'drizzle-orm';
// Import auth middleware from the new domain location
import {
	isAuthenticated,
	isAuthenticatedOptional,
	isAdminOrModerator,
	isAdmin
} from './src/domains/auth/middleware/auth.middleware';
import passport from 'passport';
import session from 'express-session';
// X integration routes
import xAuthRoutes from './src/domains/auth/routes/xAuthRoutes';
import xShareRoutes from './src/domains/share/routes/xShareRoutes';

export async function registerRoutes(app: Express): Promise<Server> {
	// Test
	app.get('/', async (req, res) => {
		res.json({ message: 'Backend working!!!' }).status(200);
	});

	// Add new unified content endpoint
	app.get('/api/content', async (req, res) => {
		try {
			const tab = (req.query.tab as string) || 'trending';
			const page = parseInt(req.query.page as string) || 1;
			const limit = Math.min(parseInt(req.query.limit as string) || 20, 50); // Max 50
			const forumId = req.query.forumId ? parseInt(req.query.forumId as string) : undefined;
			const userId = req.user?.id; // From auth middleware

			// Validate tab
			const validTabs = ['trending', 'recent', 'following'];
			if (!validTabs.includes(tab)) {
				return res
					.status(400)
					.json({ error: 'Invalid tab. Must be one of: trending, recent, following' });
			}

			// Require auth for following tab
			if (tab === 'following' && !userId) {
				return res.status(401).json({ error: 'Authentication required for following tab' });
			}

			// Import here to avoid circular dependencies
			const { threadService } = await import('./src/domains/forum/services/thread.service');

			// Fetch content using the new tab-based method
			const result = await threadService.fetchThreadsByTab({
				tab: tab as any,
				page,
				limit,
				forumId,
				userId
			});

			res.json(result);
		} catch (error) {
			console.error('Error fetching content:', error);
			res.status(500).json({ error: 'Failed to fetch content' });
		}
	});

	// Add hot threads endpoint BEFORE authentication middleware (legacy support)
	app.get('/api/hot-threads', async (req, res) => {
		try {
			const limit = parseInt(req.query.limit as string) || 5;

			// Import here to avoid circular dependencies
			const { threadService } = await import('./src/domains/forum/services/thread.service');

			// Use the new tab-based method for consistency
			const result = await threadService.fetchThreadsByTab({
				tab: 'trending',
				page: 1,
				limit,
				forumId: undefined,
				userId: undefined
			});

			// Transform to match legacy format for backward compatibility
			const hotThreads = result.items.map((thread: any) => ({
				thread_id: thread.id,
				title: thread.title,
				slug: thread.slug,
				post_count: thread.postCount || 0,
				view_count: thread.viewCount || 0,
				hot_score: Math.floor(Math.random() * 100) + 50, // Mock hot score for now
				created_at: thread.createdAt,
				last_post_at: thread.lastPostAt || thread.createdAt,
				user_id: thread.userId,
				username: thread.user?.username || 'Unknown',
				avatar_url: thread.user?.avatarUrl || null,
				category_name: thread.category?.name || 'Unknown',
				category_slug: thread.category?.slug || 'unknown',
				like_count: thread.firstPostLikeCount || 0
			}));

			res.json(hotThreads);
		} catch (error) {
			console.error('Error fetching hot threads:', error);
			res.status(500).json({ error: 'Failed to fetch hot threads' });
		}
	});

	// Set up session and authentication with new domain-based approach
	const sessionSettings = setupAuthPassport(storage.sessionStore);
	app.set('trust proxy', 1);
	app.use(session(sessionSettings));
	app.use(passport.initialize());
	app.use(passport.session());

	// Use the domain-based auth routes
	/*
	 * ---------------------------------------------------------------------------
	 * AUTHENTICATION ROUTES
	 * ---------------------------------------------------------------------------
	 *  Primary Mount:
	 *    • All authentication endpoints are now **namespaced** under `/api/auth/*`.
	 *      Example: `/api/auth/login`, `/api/auth/register`, `/api/auth/user`, etc.
	 *
	 *  Compatibility Mount (temporary):
	 *    • For legacy clients that still hit the root-level `/api/*` auth endpoints
	 *      (e.g. `/api/login`), we re-mount the same router at `/api`.  This alias
	 *      will be **removed after v2** once all callers have migrated.
	 */
	app.use('/api/auth', authRoutes); // ✅  NEW canonical path
	app.use('/api', authRoutes); // 🕰️  Back-compat alias  (DEPRECATE IN v2)
	// X account OAuth routes
	app.use('/api/auth/x', xAuthRoutes);
	// X share routes
	app.use('/api/share/x', xShareRoutes);

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
	// Use the domain-based notifications routes
	app.use('/api/notifications', notificationRoutes);
	// Use the centralized admin error handler
	app.use('/api/admin', adminErrorHandler);

	// Set up profile routes with domain-based approach
	app.use('/api/profile', profileRoutes);

	// Set up relationships routes with domain-based approach
	app.use('/api/relationships', relationshipsRoutes);

	// Set up whale watch routes with domain-based approach
	app.use('/api', whaleWatchRoutes);

	// Set up messaging routes with domain-based approach
	app.use('/api/messages', messageRoutes);

	// Set up vault routes with domain-based approach
	app.use('/api/vault', vaultRoutes);

	// Set up webhook routes (no auth required)
	app.use('/api/webhook', ccpaymentWebhookRoutes);

	// Set up announcement routes with domain-based approach
	registerAnnouncementRoutes(app); // Migrated to domains/admin/sub-domains/announcements

	// Set up feature gate routes
	app.use('/api/features', featureGatesRoutes);

	// Set up advertising routes with domain-based approach
	app.use('/api/ads', adRoutes);

	// Set up path specialization routes
	registerPathRoutes(app); // @pending-migration

	// Set up DGT purchase routes
	const dgtPurchaseRouter = express.Router();
	// TODO: @routeDeprecation Remove legacy dgt-purchase routes after migration to domain-driven routes is complete.
	// registerDgtPurchaseRoutes(dgtPurchaseRouter); // @pending-migration
	app.use('/api', dgtPurchaseRouter);

	// Set up dictionary routes
	app.use('/api/dictionary', dictionaryRoutes);

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
			ws.send(
				JSON.stringify({
					type: 'connected',
					message: 'Connected to Degentalk WebSocket'
				})
			);

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
