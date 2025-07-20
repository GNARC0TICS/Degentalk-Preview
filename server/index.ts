/**
 * @file server/index.ts
 * @description Main entry point for the Degentalk API server.
 *
 * @purpose Initializes and starts the Express API server, sets up middleware,
 *          registers API routes, handles database migrations/seeding (in dev),
 *          and starts scheduled tasks. This is a pure API server - client
 *          serving is handled separately by Vite dev server or static hosting.
 *
 * @dependencies
 *   - `express`: Web framework.
 *   - `./config/loadEnv`: For loading environment variables.
 *   - `./routes`: For API route registration.
 *   - `./utils/task-scheduler`: For running background tasks.
 *   - `../scripts/db/*`: Various database seeding and migration scripts.
 *
 * @environment
 *   - `NODE_ENV`: ('development' or 'production') Controls behavior like seeding.
 *   - `PORT`: Port number for the API server to listen on (default: 5001).
 *   - `DATABASE_PROVIDER`: ('sqlite' or 'postgresql') Determines migration logic.
 *   - `DATABASE_URL`: Connection string for the database.
 *   - `QUICK_MODE`: ('true' or 'false') If true, skips seeding in development.
 *
 * @important_notes
 *   - Environment variables MUST be loaded first via `import './config/loadEnv';`.
 *   - Seeding and some migrations are conditional based on `NODE_ENV` and `DATABASE_PROVIDER`.
 *   - Error handling middleware is the last `app.use()` call before server start.
 *   - This server only handles API routes. Client is served separately.
 *
 * @status Production-Ready API Server | 2025-07-10
 * @last_reviewed 2025-07-10 by Claude
 * @owner Backend Team
 */
import './config/loadEnv'; // Ensures environment variables are loaded first

// All other imports follow
import express, { type Request, type Response, type NextFunction } from 'express';
import { send } from './src/utils/response';
import { createServer } from 'http';
import { registerRoutes } from './routes';
import { runScheduledTasks } from './utils/task-scheduler';
import { seedDevUser } from './utils/seed-dev-user';
import { traceMiddleware } from './src/middleware/trace.middleware';
import { initEventNotificationListener } from './src/domains/notifications/event-notification-listener';
import './src/core/background-processor';
import { logger } from './src/core/logger';
import { sendErrorResponse } from './src/core/utils/transformer.helpers';
import { wsService } from './src/core/websocket/websocket.service';
import { sentinelBot } from './src/domains/shoutbox/services/sentinel-bot.service';

// Startup logging helper
const startupLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
	const prefix = {
		info: '🔧',
		success: '✅',
		error: '❌',
		warning: '⚠️'
	}[type];
	logger.info('BACKEND', message, { type, prefix });
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use the new traceMiddleware for request logging
app.use(traceMiddleware);

(async () => {
	try {
		startupLog(`Starting Degentalk Backend Server...`);
		startupLog(`Environment: ${process.env.NODE_ENV || 'development'}`);
		startupLog(
			`Database: ${process.env.DATABASE_PROVIDER || 'sqlite'} (${
				process.env.DATABASE_URL || 'db/dev.db'
			})`
		);

		// Run Drizzle migrations for PostgreSQL
		if (
			process.env.DATABASE_PROVIDER === 'postgresql' ||
			process.env.DATABASE_PROVIDER === 'postgres'
		) {
			startupLog('Using PostgreSQL - skipping SQLite table creation script');
		} else {
			startupLog('Running database migrations...');
			const { createMissingTables } = await import('../scripts/db/create-missing-tables');
			await createMissingTables();
			startupLog('Database migrations complete.', 'success');
		}

		// if (process.env.NODE_ENV === 'development' && process.env.QUICK_MODE !== 'true') {
		// 	// Seed DevUser for development
		// 	startupLog('Seeding development user...');
		// 	await seedDevUser();

		// 	// Run all other seed scripts in development
		// 	startupLog('Running seed scripts in development mode...');
		// 	try {
		// 		const { seedXpActions } = await import('../scripts/db/seed-xp-actions');
		// 		const { seedDefaultLevels } = await import('../scripts/db/seed-default-levels');
		// 		const { seedEconomySettings } = await import('../scripts/db/seed-economy-settings');
		// 		const { forumStructureService } = await import('./src/domains/forum/services/structure.service');

		// 		await seedXpActions();
		// 		await seedDefaultLevels();
		// 		await seedEconomySettings();
		// 		// Seed zones & forums using config-driven seeder
		// 		await forumStructureService.syncFromConfig();
		// 		startupLog('All seed scripts completed successfully.', 'success');
		// 	} catch (seedError) {
		// 		startupLog(`Error during seeding: ${seedError}`, 'error');
		// 		// Log the error but continue server startup
		// 	}
		// } else if (process.env.QUICK_MODE === 'true') {
		// 	startupLog('Quick mode enabled - skipping seed scripts', 'warning');
		// }

		// TEMP: Simple routes for debugging
		app.get('/', (req, res) => {
			send(res, {
				message: 'Degentalk API Server Running!',
				status: 'ok'
			});
		});

		app.get('/api/health', (req, res) => {
			send(res, { status: 'healthy', uptime: process.uptime() });
		});

		// Register API routes
		startupLog('Registering API routes...');
		const routeStartTime = Date.now();
		await registerRoutes(app);
		const routeEndTime = Date.now();
		startupLog(`API routes registered in ${routeEndTime - routeStartTime}ms.`, 'success');

		const server = createServer(app);

		app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
			const status = err.status || err.statusCode || 500;
			const message = err.message || 'Internal Server Error';

			startupLog(`Express error handler caught: ${err.message}`, 'error');
			if (err.stack) {
				logger.error('ExpressErrorHandler', err.stack);
			}

			sendErrorResponse(res, message, status);
		});

		// Pure API server - no client serving
		startupLog('API server configured (client served separately)', 'success');

		startupLog('Initializing event notification listener...');
		initEventNotificationListener();
		startupLog('Event notification listener initialized.', 'success');

		startupLog('Achievement background processor started.', 'success');

		// Initialize dev auth if enabled
		if (process.env.NODE_ENV !== 'production' && process.env.DEV_FORCE_AUTH === 'true') {
			startupLog('Initializing development authentication...');
			const { initializeDevAuth } = await import('./src/utils/dev-auth-startup');
			await initializeDevAuth();
		}

		// Start the server
		const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;
		startupLog(`Starting server on port ${port}...`);

		server.on('error', (error: any) => {
			if (error.code === 'EADDRINUSE') {
				startupLog(
					`Port ${port} is already in use. Another process might be running on this port.`,
					'error'
				);
			} else {
				startupLog(`Server error: ${error}`, 'error');
			}
			process.exit(1);
		});

		server.on('listening', () => {
			startupLog(`Backend API running on http://localhost:${port}`, 'success');

			// Initialize WebSocket service
			startupLog('Initializing WebSocket service...');
			wsService.initialize(server);
			startupLog('WebSocket service initialized.', 'success');

			// Initialize Sentinel bot
			startupLog('Initializing Sentinel bot...');
			sentinelBot.initialize();
			startupLog('Sentinel bot initialized.', 'success');

			// Make WebSocket service available to Express routes
			(app as any).wss = wsService;

			startupLog('Initializing scheduled tasks...');
			runScheduledTasks();

			setInterval(
				() => {
					runScheduledTasks();
				},
				5 * 60 * 1000
			);

			startupLog('Server initialization complete!', 'success');
		});

		server.listen({
			port,
			host: '0.0.0.0'
		});
	} catch (error) {
		startupLog(`Failed to start server: ${error}`, 'error');
		process.exit(1);
	}
})();
