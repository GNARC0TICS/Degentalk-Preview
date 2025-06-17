import { Router } from 'express';
import { spawn } from 'child_process';

// Re-use existing admin auth middleware
// IMPORTANT: Adjust relative path based on file location (three levels up to auth middleware)
import { isAdmin } from '../../../auth/middleware/auth.middleware';
import { asyncHandler } from '../../admin.middleware';

const router = Router();

// Map friendly seed names to npm scripts defined in package.json
// Only include scripts that are safe to run from the running Node process
const SEED_SCRIPT_MAP: Record<string, string> = {
  users: 'seed:users',
  forum: 'seed:forum:new',
  threads: 'seed:realistic-threads',
  xp: 'seed:xp',
  all: 'seed:all',
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
      return res.status(403).json({ message: 'Seeding endpoints are disabled outside development mode.' });
    }

    const scriptName = req.params.name;
    const npmScript = SEED_SCRIPT_MAP[scriptName];

    if (!npmScript) {
      return res.status(400).json({ message: `Unknown seed script: ${scriptName}` });
    }

    // Spawn a child process to execute the npm script.
    // Using stdio: "pipe" so we can capture output and return once finished.
    const child = spawn('npm', ['run', npmScript, '--silent'], {
      cwd: process.cwd(),
      env: process.env,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        return res.json({ message: `✅ Seed script '${npmScript}' completed successfully.`, output: stdout });
      }
      return res.status(500).json({ message: `❌ Seed script '${npmScript}' exited with code ${code}.`, error: stderr });
    });
  })
);

export default router; 