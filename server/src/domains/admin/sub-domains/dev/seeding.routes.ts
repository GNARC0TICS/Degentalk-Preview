import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { spawn } from 'child_process';

// Re-use existing admin auth middleware
// IMPORTANT: Adjust relative path based on file location (three levels up to auth middleware)
import { luciaAuth } from '@middleware/lucia-auth.middleware';
const isAdmin = luciaAuth.requireAdmin;
import { asyncHandler } from '../../admin.middleware';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';
import { logger } from '@core/logger';

const router: RouterType = Router();

// Map friendly seed names to npm scripts defined in package.json
// Only include scripts that are safe to run from the running Node process
const SEED_SCRIPT_MAP: Record<string, string> = {
	users: 'seed:users',
	forum: 'seed:forums:only',
	threads: 'seed:users:tokens',
	xp: 'seed:enhanced:quick',
	all: 'seed:all',
	enhanced: 'seed:enhanced:dev'
};

/**
 * POST /admin/dev/seed/:name
 * Trigger an npm seed script (development-only)
 */
router.post(
	'/seed/:name',
	isAdmin,
	asyncHandler(async (req, res) => {
		const env = process.env.NODE_ENV ?? 'development';

		if (env !== 'development') {
			// Extra safeguard – resist running destructive ops in prod
			return sendErrorResponse(
				res,
				'Seeding endpoints are disabled outside development mode.',
				403
			);
		}

		const scriptName = req.params.name;
		const npmScript = SEED_SCRIPT_MAP[scriptName];

		if (!npmScript) {
			return sendErrorResponse(res, `Unknown seed script: ${scriptName}`, 400);
		}

		// Spawn a child process to execute the npm script.
		// Using stdio: "pipe" so we can capture output and return once finished.
		// SECURITY: Removed shell: true to prevent command injection
		const child = spawn('npm', ['run', npmScript, '--silent'], {
			cwd: process.cwd(),
			env: process.env,
			shell: false, // Security: Prevent command injection
			stdio: ['ignore', 'pipe', 'pipe']
		});

		let stdout = '';
		let stderr = '';

		child.stdout?.on('data', (chunk) => {
			stdout += chunk.toString();
		});

		child.stderr?.on('data', (chunk) => {
			stderr += chunk.toString();
		});

		// Wait for the process to complete
		child.on('close', (code) => {
			if (code === 0) {
				sendSuccessResponse(res, {
					message: `✅ Seed script '${scriptName}' completed successfully`,
					output: stdout,
					script: npmScript
				});
			} else {
				sendErrorResponse(res, `Seed script failed with code ${code}: ${stderr}`, 500);
			}
		});

		child.on('error', (err) => {
			logger.error('SeedingRoutes', 'Failed to spawn process', { error: err.message });
			sendErrorResponse(res, `Failed to execute seed script: ${err.message}`, 500);
		});
	})
);

export default router;
