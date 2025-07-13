import { Router } from 'express';
import { spawn } from 'child_process';

// Re-use existing admin auth middleware
// IMPORTANT: Adjust relative path based on file location (three levels up to auth middleware)
import { isAdmin } from '../../../auth/middleware/auth.middleware';
import { asyncHandler } from '../../admin.middleware';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

const router = Router();

// Map friendly seed names to npm scripts defined in package.json
// Only include scripts that are safe to run from the running Node process
const SEED_SCRIPT_MAP: Record<string, string> = {
	users: 'seed:users',
	forum: 'seed:forum:new',
	threads: 'seed:realistic-threads',
	xp: 'seed:xp',
	all: 'seed:all'
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
		const child = spawn('npm', ['run', npmScript, '--silent'], {
			cwd: process.cwd(),
			env: process.env,
			shell: true,
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

		sendSuccessResponse(res, '✅ Seed script ');
	})
);

export default router;
