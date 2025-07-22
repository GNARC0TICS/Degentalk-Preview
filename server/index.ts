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
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from './src/lib/sentry-server';
import { reportErrorServer } from './src/lib/report-error';
import { centralizedErrorHandler, notFoundHandler } from './src/middleware/centralized-error-handler.middleware';

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
let server: any; // Will be initialized later
const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;

// Initialize Sentry before any other middleware
initSentry(app);

// Sentry request handler must be the first middleware on the app
app.use(sentryRequestHandler);

// Sentry tracing handler creates a transaction for every incoming request
app.use(sentryTracingHandler);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use the new traceMiddleware for request logging
app.use(traceMiddleware);

// Add basic routes
app.get('/', (req, res) => {
	send(res, {
		message: 'Degentalk API Server Running!',
		status: 'ok'
	});
});

app.get('/api/health', (req, res) => {
	send(res, { status: 'healthy', uptime: process.uptime() });
});

app.get('/__healthz', (_req, res) => {
	res.status(200).send('OK');
});

// Initialize server startup
function initializeServer() {
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
		setupServer();
	} else {
		startupLog('Running database migrations...');
		import('../scripts/db/create-missing-tables').then(({ createMissingTables }) => {
			createMissingTables().then(() => {
				startupLog('Database migrations complete.', 'success');
				setupServer();
			});
		});
	}
}

// Main server setup
async function setupServer() {
	try {

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

		// Register API routes
		startupLog('Registering API routes...');
		const routeStartTime = Date.now();
		await registerRoutes(app);
		const routeEndTime = Date.now();
		startupLog(`API routes registered in ${routeEndTime - routeStartTime}ms.`, 'success');

		// Add 404 handler for undefined routes
		app.use(notFoundHandler);

		// Sentry error handler must come before custom error handlers
		app.use(sentryErrorHandler);

		// Centralized error handler
		app.use(centralizedErrorHandler);

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
			
			// Add timeout to prevent hanging
			const devAuthTimeout = new Promise((_, reject) => 
				setTimeout(() => reject(new Error('Dev auth initialization timed out')), 5000)
			);
			
			try {
				await Promise.race([initializeDevAuth(), devAuthTimeout]);
			} catch (error) {
				startupLog(`Dev auth initialization failed or timed out: ${error}`, 'warning');
				// Continue server startup even if dev auth fails
			}
		}

		// Server setup complete - now start listening
		startServer();
	} catch (error) {
		startupLog(`Failed to start server: ${error}`, 'error');
		process.exit(1);
	}
}

// Create the server
server = createServer(app);

// Server event handlers and startup
server.on('error', (err: any) => {
	console.error('[DEBUG] Server error event:', err);
	if (err.code === 'EADDRINUSE') {
		startupLog(
			`Port ${port} is already in use. Another process might be running on this port.`,
			'error'
		);
	} else {
		startupLog(`Server error: ${err}`, 'error');
	}
	process.exit(1);
});

server.on('listening', () => {
	console.log('[DEBUG] Server emitted "listening" event');
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
	
	// Run scheduled tasks asynchronously - don't block server startup
	runScheduledTasks()
		.then(() => logger.info('TASK_SCHEDULER', 'Initial scheduled tasks completed'))
		.catch(err => logger.error('TASK_SCHEDULER', 'Error in initial scheduled tasks', err));

	// Set up recurring tasks
	setInterval(
		() => {
			runScheduledTasks()
				.catch(err => logger.error('TASK_SCHEDULER', 'Error in recurring scheduled tasks', err));
		},
		5 * 60 * 1000
	);

	startupLog('Server initialization complete!', 'success');
});

// Handle process termination
process.on('SIGINT', () => {
	console.log('[DEBUG] Received SIGINT, shutting down gracefully...');
	server.close(() => {
		console.log('[DEBUG] Server closed');
		process.exit(0);
	});
});

// Function to start the server
function startServer() {
	startupLog(`Starting server on port ${port}...`);
	console.log('[DEBUG] ▶ About to call server.listen on port:', port, '(%s)', typeof port);
	
	console.log('[DEBUG] About to invoke server.listen()...');
	server.listen(port, '0.0.0.0', () => {
		console.log('[startup] 🚀 Server.listen callback fired on port', port);
		
		// Verify server is actually listening
		const address = server.address();
		console.log('[DEBUG] Server address info:', address);
	});
	console.log('[DEBUG] server.listen() method called, waiting for events...');
}

// Start the server initialization
initializeServer();

// Debug: Log that we're keeping the process alive
setInterval(() => {
	// This interval keeps the process alive and logs periodically
	logger.debug('SERVER', 'Process heartbeat - server still running', { 
		uptime: process.uptime(),
		memory: process.memoryUsage().heapUsed / 1024 / 1024 + ' MB'
	});
}, 30000); // Every 30 seconds
