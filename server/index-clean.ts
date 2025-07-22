// Global error handlers - MUST be first
process.on('uncaughtException', (err) => {
	console.error('[FATAL] Uncaught Exception:', err);
	process.exit(1);
});

process.on('unhandledRejection', (reason) => {
	console.error('[FATAL] Unhandled Rejection:', reason);
	process.exit(1);
});

process.on('exit', (code) => {
	console.log(`[DEBUG] Process exiting with code ${code}`);
	console.trace('Exit stack trace');
});

process.on('SIGTERM', () => {
	console.log('[DEBUG] Received SIGTERM');
	process.exit(0);
});

process.on('SIGINT', () => {
	console.log('[DEBUG] Received SIGINT');
	process.exit(0);
});

// Load environment
import './config/loadEnv';

// Dependencies
import express from 'express';
import { createServer } from 'http';
import { send } from './src/utils/response';
import { registerRoutes } from './routes';
import { runScheduledTasks } from './utils/task-scheduler';
import { traceMiddleware } from './src/middleware/trace.middleware';
import { initEventNotificationListener } from './src/domains/notifications/event-notification-listener';
import './src/core/background-processor';
import { wsService } from './src/core/websocket/websocket.service';
import { sentinelBot } from './src/domains/shoutbox/services/sentinel-bot.service';
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from './src/lib/sentry-server';
import { centralizedErrorHandler, notFoundHandler } from './src/middleware/centralized-error-handler.middleware';

console.log('[STARTUP] Creating Express app...');
const app = express();

// Initialize Sentry
initSentry(app);
app.use(sentryRequestHandler);
app.use(sentryTracingHandler);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(traceMiddleware);

// Basic routes
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

console.log('[STARTUP] Registering API routes...');
// Register routes synchronously if possible, or handle async
registerRoutes(app).then(() => {
	console.log('[STARTUP] API routes registered');
}).catch(err => {
	console.error('[FATAL] Failed to register routes:', err);
	process.exit(1);
});

// Error handlers
app.use(notFoundHandler);
app.use(sentryErrorHandler);
app.use(centralizedErrorHandler);

// Create server
const port = Number(process.env.PORT) || 5001;
const server = createServer(app);

server.on('error', (err: any) => {
	if (err.code === 'EADDRINUSE') {
		console.error(`[FATAL] Port ${port} is already in use`);
	} else {
		console.error('[FATAL] Server error:', err);
	}
	process.exit(1);
});

server.on('listening', () => {
	const addr = server.address();
	console.log(`🚀 Server listening on http://0.0.0.0:${port}`, addr);
	
	// Initialize services AFTER server is listening
	console.log('[STARTUP] Initializing services...');
	
	// WebSocket
	wsService.initialize(server);
	console.log('[STARTUP] WebSocket initialized');
	
	// Sentinel bot
	sentinelBot.initialize();
	console.log('[STARTUP] Sentinel bot initialized');
	
	// Event notifications
	initEventNotificationListener();
	console.log('[STARTUP] Event notifications initialized');
	
	// Make WebSocket available to routes
	(app as any).wss = wsService;
	
	// Start scheduled tasks - fire and forget
	runScheduledTasks()
		.then(() => console.log('[STARTUP] Initial scheduled tasks completed'))
		.catch(err => console.error('[ERROR] Scheduled tasks error:', err));
	
	// Recurring tasks
	setInterval(() => {
		runScheduledTasks().catch(err => 
			console.error('[ERROR] Recurring scheduled tasks error:', err)
		);
	}, 5 * 60 * 1000);
	
	console.log('[STARTUP] Server initialization complete!');
});

// Start listening
console.log(`[STARTUP] Starting server on port ${port}...`);
server.listen(port, '0.0.0.0');

// Keep-alive heartbeat for debugging
const heartbeatInterval = setInterval(() => {
	console.log('[HEARTBEAT] Server alive:', {
		uptime: process.uptime(),
		memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
		pid: process.pid
	});
}, 5000); // Every 5 seconds for debugging

// Make sure the interval keeps the process alive
heartbeatInterval.unref = () => {}; // Prevent unref

console.log('[STARTUP] Process should now stay alive. PID:', process.pid);