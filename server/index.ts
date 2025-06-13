/**
 * @file server/index.ts
 * @description Main entry point for the Degentalk backend server.
 *
 * @purpose Initializes and starts the Express application, sets up middleware,
 *          registers API routes, handles database migrations/seeding (in dev),
 *          integrates Vite for development or serves static assets in production,
 *          and starts scheduled tasks.
 *
 * @dependencies
 *   - `express`: Web framework.
 *   - `./config/loadEnv`: For loading environment variables.
 *   - `./routes`: For API route registration.
 *   - `./vite`: For Vite HMR and middleware integration.
 *   - `./utils/task-scheduler`: For running background tasks.
 *   - `../scripts/db/*`: Various database seeding and migration scripts.
 *
 * @environment
 *   - `NODE_ENV`: ('development' or 'production') Controls behavior like seeding and Vite integration.
 *   - `PORT`: Port number for the server to listen on.
 *   - `DATABASE_PROVIDER`: ('sqlite' or 'postgresql') Determines migration logic.
 *   - `DATABASE_URL`: Connection string for the database.
 *   - `QUICK_MODE`: ('true' or 'false') If true, skips seeding in development.
 *
 * @important_notes
 *   - Environment variables MUST be loaded first via `import './config/loadEnv';`.
 *   - Seeding and some migrations are conditional based on `NODE_ENV` and `DATABASE_PROVIDER`.
 *   - Error handling middleware is the last `app.use()` call before server start.
 *
 * @status Reviewed – Awaiting Final Approval | 2025-06-02
 * @last_reviewed 2025-06-02 by Cline
 * @owner Backend Team (TODO: Confirm owner)
 */
import './config/loadEnv'; // Ensures environment variables are loaded first

// All other imports follow
import express, { type Request, type Response, type NextFunction } from 'express';
import { registerRoutes } from './routes';
import { setupVite, serveStatic, log } from './vite';
import { runScheduledTasks } from './utils/task-scheduler';
import { seedDevUser } from './utils/seed-dev-user';
// Import seed scripts
// import { seedForumStructure } from "../scripts/db/seed-forum-structure";
import { seedXpActions } from '../scripts/db/seed-xp-actions';
import { seedDefaultLevels } from '../scripts/db/seed-default-levels';
import { seedEconomySettings } from '../scripts/db/seed-economy-settings';
import { createMissingTables } from '../scripts/db/create-missing-tables';
import { seedCanonicalZones } from '../scripts/db/seed-canonical-zones';

// Startup logging helper
const startupLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
	const prefix = {
		info: '🔧',
		success: '✅',
		error: '❌',
		warning: '⚠️'
	}[type];
	console.log(`[BACKEND] ${prefix} ${message}`);
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
	const start = Date.now();
	const path = req.path;
	let capturedJsonResponse: Record<string, any> | undefined = undefined;

	const originalResJson = res.json;
	res.json = function (bodyJson, ...args) {
		capturedJsonResponse = bodyJson;
		return originalResJson.apply(res, [bodyJson, ...args]);
	};

	res.on('finish', () => {
		const duration = Date.now() - start;
		if (path.startsWith('/api')) {
			let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
			if (capturedJsonResponse) {
				logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
			}

			if (logLine.length > 80) {
				logLine = logLine.slice(0, 79) + '…';
			}

			log(logLine);
		}
	});

	next();
});

(async () => {
	try {
		startupLog(`Starting DegenTalk Backend Server...`);
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
			await createMissingTables();
			startupLog('Database migrations complete.', 'success');
		}

		if (process.env.NODE_ENV === 'development' && process.env.QUICK_MODE !== 'true') {
			// Seed DevUser for development
			startupLog('Seeding development user...');
			await seedDevUser();

			// Run all other seed scripts in development
			startupLog('Running seed scripts in development mode...');
			try {
				// await seedForumStructure();
				await seedXpActions();
				await seedDefaultLevels();
				await seedEconomySettings();
				// Temporarily disable seeding to fix startup issues
				await seedCanonicalZones();
				startupLog('All seed scripts completed successfully.', 'success');
			} catch (seedError) {
				startupLog(`Error during seeding: ${seedError}`, 'error');
				// Log the error but continue server startup
			}
		} else if (process.env.QUICK_MODE === 'true') {
			startupLog('Quick mode enabled - skipping seed scripts', 'warning');
		}

		const server = await registerRoutes(app);

		app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
			const status = err.status || err.statusCode || 500;
			const message = err.message || 'Internal Server Error';

			startupLog(`Express error handler caught: ${err.message}`, 'error');
			if (err.stack) {
				console.error(err.stack);
			}

			res.status(status).json({ message });
		});

		// Setup vite or serve static files
		if (process.env.NODE_ENV === 'production') {
			await serveStatic(app);
		} else {
			await setupVite(app, server);
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

			// Run scheduled tasks on server start and then every 5 minutes
			startupLog('Initializing scheduled tasks...');
			runScheduledTasks();

			// Set up scheduled tasks to run every 5 minutes
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
