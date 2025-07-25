/**
 * @file server/index.ts
 * @description Main entry point for the Degentalk API server.
 */

// Global error handlers - must be first
process.on('uncaughtException', err => {
	console.error('[FATAL] Uncaught Exception:', err);
	process.exit(1);
});

process.on('unhandledRejection', err => {
	console.error('[FATAL] Unhandled Rejection:', err);
	process.exit(1);
});

process.on('exit', code => {
	console.log(`[SHUTDOWN] Process exiting with code ${code}`);
});

// Load environment variables first
import './config/loadEnv';

// Import dependencies
import express from 'express';
import { createServer } from 'http';
import { registerRoutes } from './routes';
import { logger } from './src/core/logger';
import { centralizedErrorHandler, notFoundHandler } from './src/middleware/centralized-error-handler.middleware';
import { traceMiddleware } from './src/middleware/trace.middleware';
// import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from './src/lib/sentry-server'; // TODO: Add sentry-server file
import { wsService } from './src/core/websocket/websocket.service';
import { sentinelBot } from './src/domains/shoutbox/services/sentinel-bot.service';
import { initEventNotificationListener } from './src/domains/notifications/event-notification-listener';
import { runScheduledTasks } from './utils/task-scheduler';
import './src/core/background-processor';

const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;

// Async bootstrap function
async function bootstrap() {
	try {
		logger.info('SERVER', 'Starting Degentalk Backend Server...');
		logger.info('SERVER', `Environment: ${process.env.NODE_ENV || 'development'}`);
		logger.info('SERVER', `Database: ${process.env.DATABASE_PROVIDER || 'sqlite'}`);

		// 1. Create Express app
		const app = express();

		// 2. Initialize Sentry
		// TODO: Re-enable when sentry-server file is added
		// initSentry(app);
		// app.use(sentryRequestHandler);
		// app.use(sentryTracingHandler);

		// 3. Configure middleware
		app.use(express.json());
		app.use(express.urlencoded({ extended: false }));
		app.use(traceMiddleware);

		// 4. Add health check endpoint
		app.get('/__healthz', (_req, res) => {
			res.status(200).send('OK');
		});

		// 5. Register all routes - AWAIT this
		logger.info('SERVER', 'Registering API routes...');
		const routeStartTime = Date.now();
		await registerRoutes(app);
		const routeEndTime = Date.now();
		logger.info('SERVER', `API routes registered in ${routeEndTime - routeStartTime}ms`);

		// 6. Add error handlers
		app.use(notFoundHandler);
		// app.use(sentryErrorHandler); // TODO: Re-enable when sentry-server file is added
		app.use(centralizedErrorHandler);

		// 7. Create HTTP server
		const server = createServer(app);

		// 8. Server error handler
		server.on('error', (err: any) => {
			if (err.code === 'EADDRINUSE') {
				logger.error('SERVER', `Port ${port} is already in use`);
			} else {
				logger.error('SERVER', 'Server error:', err);
			}
			process.exit(1);
		});

		// 9. Server listening handler
		server.on('listening', () => {
			const address = server.address();
			logger.info('SERVER', `Backend API running on http://0.0.0.0:${port}`, address);

			// Initialize WebSocket service
			logger.info('SERVER', 'Initializing WebSocket service...');
			wsService.initialize(server);
			logger.info('SERVER', 'WebSocket service initialized');

			// Initialize Sentinel bot
			logger.info('SERVER', 'Initializing Sentinel bot...');
			sentinelBot.initialize();
			logger.info('SERVER', 'Sentinel bot initialized');

			// Make WebSocket service available to Express routes
			(app as any).wss = wsService;

			// Initialize event notifications
			logger.info('SERVER', 'Initializing event notification listener...');
			initEventNotificationListener();
			logger.info('SERVER', 'Event notification listener initialized');

			// Start scheduled tasks (fire and forget)
			logger.info('SERVER', 'Starting scheduled tasks...');
			runScheduledTasks()
				.then(() => logger.info('TASK_SCHEDULER', 'Initial scheduled tasks completed'))
				.catch(err => logger.error('TASK_SCHEDULER', 'Error in initial scheduled tasks', err));

			// Set up recurring tasks
			setInterval(() => {
				runScheduledTasks()
					.catch(err => logger.error('TASK_SCHEDULER', 'Error in recurring scheduled tasks', err));
			}, 5 * 60 * 1000); // Every 5 minutes

			logger.info('SERVER', '✅ Server initialization complete!');
		});

		// 10. Start listening
		logger.info('SERVER', `Starting server on port ${port}...`);
		server.listen(port, '0.0.0.0');

		// Handle graceful shutdown
		process.on('SIGINT', () => {
			logger.info('SERVER', 'Received SIGINT, shutting down gracefully...');
			server.close(() => {
				logger.info('SERVER', 'Server closed');
				process.exit(0);
			});
		});

		process.on('SIGTERM', () => {
			logger.info('SERVER', 'Received SIGTERM, shutting down gracefully...');
			server.close(() => {
				logger.info('SERVER', 'Server closed');
				process.exit(0);
			});
		});

		// Initialize dev auth if enabled (non-blocking)
		if (process.env.NODE_ENV !== 'production' && process.env.DEV_FORCE_AUTH === 'true') {
			logger.info('SERVER', 'Initializing development authentication...');
			import('./src/utils/dev-auth-startup')
				.then(({ initializeDevAuth }) => initializeDevAuth())
				.catch(error => logger.warn('SERVER', 'Dev auth initialization failed:', error));
		}

		// Fire and forget basic maintenance
		if (process.env.NODE_ENV !== 'production') {
			runScheduledTasks()
				.catch(err => logger.error('TASK_SCHEDULER', 'Error running basic maintenance', err));
		}

	} catch (error) {
		logger.error('SERVER', 'Failed to bootstrap server:', error);
		process.exit(1);
	}
}

// Start the server
bootstrap();