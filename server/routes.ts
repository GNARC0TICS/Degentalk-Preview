/**
 * @file server/routes.ts
 * @description Centralized routing file for the Degentalk backend application.
 */
import express, { type Express, type Request, type Response } from 'express';
import { createServer, type Server } from 'http';
import { WebSocketServer } from 'ws';
import { db, pool } from './src/core/db';
import connectPGSink from 'connect-pg-simple';
const PGStore = connectPGSink(session);
import { setupAuthPassport, authRoutes } from './src/domains/auth';
import { registerAdminRoutes } from './src/domains/admin/admin.routes';
import walletRoutes from './src/domains/wallet/routes/wallet.routes';
import tipRoutes from './src/domains/engagement/tip/tip.routes';
import rainRoutes from './src/domains/engagement/rain/rain.routes';
import xpRoutes from './src/domains/xp/xp.routes';
import treasuryRoutes from './src/domains/treasury/treasury.routes';
import shoutboxRoutes from './src/domains/shoutbox/shoutbox.routes';
import forumRoutes from './src/domains/forum/forum.routes';
import dictionaryRoutes from './src/domains/dictionary/dictionary.routes';
import editorRoutes from './src/domains/editor/editor.routes';
import profileRoutes from './src/domains/profile/profile.routes';
import devRoutes from './src/routes/dev.routes';
import relationshipsRoutes from './src/domains/social/relationships.routes';
import whaleWatchRoutes from './src/domains/social/whale-watch.routes';
import messageRoutes from './src/domains/messaging/message.routes';
import vaultRoutes from './src/domains/engagement/vault/vault.routes';
import ccpaymentWebhookRoutes from './src/domains/wallet/webhooks/ccpayment-webhook.routes';
import { registerAnnouncementRoutes } from './src/domains/admin/sub-domains/announcements';
import featureGatesRoutes from './src/domains/feature-gates/feature-gates.routes';
import notificationRoutes from './src/domains/notifications/notification.routes';
import preferencesRoutes from './src/domains/preferences/preferences.routes';
import { adRoutes } from './src/domains/advertising/ad.routes';
import { globalErrorHandler } from './src/core/errors';
import { registerPathRoutes } from './src/domains/paths/paths.routes';
import { awardPathXp } from './utils/path-utils';
import { xpRewards } from '@shared/path-config';
import { PlatformAnalyticsService } from './src/domains/analytics/services/platform.service';
import { db } from './src/core/db';
import { and, eq, sql } from 'drizzle-orm';
import {
	isAuthenticated,
	isAuthenticatedOptional,
	isAdminOrModerator,
	isAdmin
} from './src/domains/auth/middleware/auth.middleware';
import passport from 'passport';
import session from 'express-session';
import {
	corsMiddleware,
	csrfProtection,
	securityHeaders,
	csrfTokenProvider,
	securityAuditLogger,
	originValidation,
	developmentSecurityWarning,
	apiResponseSecurity
} from './src/core/middleware/security.middleware';
import { validateRouteIds, logRouteIds } from './src/middleware/validate-route-ids.middleware';
import { rateLimiters } from './src/core/services/rate-limit.service';
import healthCheckRouter, { requestMetricsMiddleware } from './src/core/monitoring/health-check';
import { auditMiddleware } from './src/core/audit/audit-logger';
import { logger } from './src/core/logger';
import xAuthRoutes from './src/domains/auth/routes/xAuthRoutes';
import xShareRoutes from './src/domains/share/routes/xShareRoutes';
import { analyticsEvents } from '@schema/system/analyticsEvents';
import gamificationRoutes from './src/domains/gamification/gamification.routes';
import { achievementRoutes } from './src/domains/gamification/achievements';
import { getAuthenticatedUser } from '@core/utils/auth.helpers';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

export async function registerRoutes(app: Express): Promise<Server> {
	app.use(securityHeaders);
	app.use(corsMiddleware);
	app.use(originValidation);
	app.use('/api/', rateLimiters.general);
	app.use(securityAuditLogger);
	app.use(apiResponseSecurity);
	app.use(developmentSecurityWarning);
	app.use(requestMetricsMiddleware);
	app.use(auditMiddleware);
	
	// ID validation middleware - validates all route parameters that look like IDs
	if (process.env.NODE_ENV === 'development') {
		app.use(logRouteIds); // Log IDs in development for debugging
	}
	app.use(validateRouteIds); // Validate all ID parameters

	app.get('/', async (req: Request, res: Response) => {
		sendSuccessResponse(res, { message: 'Backend working!!!' });
	});

	app.get('/api/content', async (req: Request, res: Response) => {
		try {
			const tab = (req.query.tab as string) || 'trending';
			const page = parseInt(req.query.page as string) || 1;
			const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
			const forumId = req.query.forumId
				? (parseInt(req.query.forumId as string) as any)
				: undefined;
			const userId = getAuthenticatedUser(req)?.id;

			const validTabs = ['trending', 'recent', 'following'];
			if (!validTabs.includes(tab)) {
				return sendErrorResponse(res, 'Invalid tab.', 400);
			}

			if (tab === 'following' && !userId) {
				return sendErrorResponse(res, 'Authentication required for following tab', 401);
			}

			const { threadService } = await import('./src/domains/forum/services/thread.service');
			const params = {
				tab: tab as any,
				page,
				limit,
				forumId,
				...(userId !== undefined ? { userId } : {})
			};
			const result = await threadService.fetchThreadsByTab(params);

			return sendSuccessResponse(res, result);
		} catch (error) {
			logger.error('/api/content', 'Error fetching unified content feed', { err: error });
			sendErrorResponse(res, 'Failed to fetch content feed', 500);
		}
	});

	app.get('/api/hot-threads', async (req: Request, res: Response) => {
		try {
			const threads = await PlatformAnalyticsService.getHotThreads(10);
			sendSuccessResponse(res, threads);
		} catch (error) {
			logger.error('/api/hot-threads', 'Error fetching hot threads', { err: error });
			sendErrorResponse(res, 'Failed to fetch hot threads', 500);
		}
	});

	app.get('/api/recent-posts', async (req: Request, res: Response) => {
		try {
			const posts = await PlatformAnalyticsService.getRecentPosts(10);
			sendSuccessResponse(res, posts);
		} catch (error) {
			logger.error('/api/recent-posts', 'Error fetching recent posts', { err: error });
			sendErrorResponse(res, 'Failed to fetch recent posts', 500);
		}
	});

	app.get('/api/featured-threads', async (req: Request, res: Response) => {
		try {
			const threads = await PlatformAnalyticsService.getFeaturedThreads(5);
			sendSuccessResponse(res, threads);
		} catch (error) {
			logger.error('/api/featured-threads', 'Error fetching featured threads', { err: error });
			sendErrorResponse(res, 'Failed to fetch featured threads', 500);
		}
	});

	app.get('/api/leaderboards', async (req: Request, res: Response) => {
		try {
			const type = (req.query.type as string) || 'xp';
			const leaderboards = await PlatformAnalyticsService.getLeaderboards(type);
			sendSuccessResponse(res, leaderboards);
		} catch (error) {
			const typeForLog = (req.query.type as string) || 'xp';
			logger.error('/api/leaderboards', 'Error fetching leaderboards', {
				err: error,
				type: typeForLog
			});
			sendErrorResponse(res, 'Failed to fetch leaderboards', 500);
		}
	});

	app.get('/api/platform-stats', async (req: Request, res: Response) => {
		try {
			const stats = await PlatformAnalyticsService.getPlatformStats();
			sendSuccessResponse(res, stats);
		} catch (error) {
			logger.error('/api/platform-stats', 'Error fetching platform stats', { err: error });
			sendErrorResponse(res, 'Failed to fetch platform stats', 500);
		}
	});

	app.post(
		'/api/admin/feature-thread',
		isAuthenticated,
		isAdminOrModerator,
		async (req: Request, res: Response) => {
			try {
				const { threadId, expiresAt } = req.body;
				const userId = getAuthenticatedUser(req)?.id;
				if (!userId) {
					return sendErrorResponse(res, 'Authentication required', 401);
				}
				await PlatformAnalyticsService.featureThread(threadId, userId, expiresAt);
				sendSuccessResponse(res, { message: 'Thread featured successfully' });
			} catch (error) {
				const { threadId } = req.body;
				logger.error('/api/admin/feature-thread', 'Error featuring thread', {
					err: error,
					threadId
				});
				sendErrorResponse(res, 'Failed to feature thread', 500);
			}
		}
	);

	app.post(
		'/api/admin/unfeature-thread',
		isAuthenticated,
		isAdminOrModerator,
		async (req: Request, res: Response) => {
			try {
				const { threadId } = req.body;
				await PlatformAnalyticsService.unfeatureThread(threadId);
				sendSuccessResponse(res, { message: 'Thread unfeatured successfully' });
			} catch (error) {
				const { threadId } = req.body;
				logger.error('/api/admin/unfeature-thread', 'Error unfeaturing thread', {
					err: error,
					threadId
				});
				sendErrorResponse(res, 'Failed to unfeature thread', 500);
			}
		}
	);

	app.get('/api/health-check', (req: Request, res: Response) => {
		sendSuccessResponse(res, { status: 'ok' });
	});

	app.get('/api/csrf-token', csrfProtection, (req: Request, res: Response) => {
		// @ts-expect-error - csurf middleware adds csrfToken() to the request object
		sendSuccessResponse(res, { csrfToken: req.csrfToken() });
	});

	const server = createServer(app);

	if (process.env.NODE_ENV === 'production') {
		const wss = new WebSocketServer({ server });
		wss.on('connection', (ws) => {
			logger.info('WebSocket client connected');
			ws.on('message', (message) => {
				logger.info(`Received WebSocket message: ${message}`);
			});
			ws.on('close', () => {
				logger.info('WebSocket client disconnected');
			});
		});
	}

	const sessionMiddleware = session({
		store: new PGStore({
			pool: pool,
			tableName: 'user_sessions',
			createTableIfMissing: true
		}),
		secret: process.env.SESSION_SECRET || 'supersecret',
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === 'production',
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
		}
	});

	app.use(sessionMiddleware);
	setupAuthPassport(app);

	app.use(passport.initialize());
	app.use(passport.session());

	const apiRouter = express.Router();
	registerPathRoutes(apiRouter);
	registerAdminRoutes(apiRouter);
	registerAnnouncementRoutes(apiRouter);
	apiRouter.use('/auth', authRoutes);
	apiRouter.use('/ads', adRoutes);
	apiRouter.use('/wallet', walletRoutes);
	apiRouter.use('/tips', tipRoutes);
	apiRouter.use('/rain', rainRoutes);
	apiRouter.use('/xp', xpRoutes);
	apiRouter.use('/treasury', treasuryRoutes);
	apiRouter.use('/shoutbox', shoutboxRoutes);
	apiRouter.use('/forums', forumRoutes);
	apiRouter.use('/dictionary', dictionaryRoutes);
	apiRouter.use('/editor', editorRoutes);
	apiRouter.use('/profile', profileRoutes);
	apiRouter.use('/relationships', relationshipsRoutes);
	apiRouter.use('/whale-watching', whaleWatchRoutes);
	apiRouter.use('/messages', messageRoutes);
	apiRouter.use('/vault', vaultRoutes);
	apiRouter.use('/feature-gates', featureGatesRoutes);
	apiRouter.use('/notifications', notificationRoutes);
	apiRouter.use('/preferences', preferencesRoutes);
	apiRouter.use('/x-auth', xAuthRoutes);
	apiRouter.use('/share', xShareRoutes);
	apiRouter.use('/gamification', gamificationRoutes);
	apiRouter.use('/achievements', achievementRoutes);

	app.use('/api', apiRouter);
	app.use('/api/webhooks/ccpayment', ccpaymentWebhookRoutes);

	if (process.env.NODE_ENV === 'development') {
		app.use('/dev', devRoutes);
	}

	app.post('/api/path-xp', isAuthenticated, async (req, res) => {
		try {
			const { path, step } = req.body;
			const userId = getAuthenticatedUser(req)?.id;
			const xpToAward = xpRewards[path]?.[step] || 0;

			if (xpToAward > 0) {
				await awardPathXp(userId, path, step, xpToAward);
				sendSuccessResponse(res, {
					message: `Awarded ${xpToAward} XP for completing ${step} of ${path}`
				});
			} else {
				sendSuccessResponse(res, { message: 'No XP for this step' });
			}
		} catch (error) {
			logger.error('Error awarding path XP:', error);
			sendErrorResponse(res, 'Failed to award XP', 500);
		}
	});

	app.post('/api/log/analytic', isAuthenticated, async (req, res) => {
		try {
			const { event, data } = req.body;
			const userId = getAuthenticatedUser(req)?.id;
			await db.insert(analyticsEvents).values({
				userId,
				type: event,
				sessionId: req.sessionID,
				data
			});
			sendSuccessResponse(res, { message: 'Analytic event logged' });
		} catch (error) {
			logger.error('Error logging analytic event:', error);
			sendErrorResponse(res, 'Failed to log analytic event', 500);
		}
	});

	app.use(globalErrorHandler);

	return server;
}
