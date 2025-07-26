import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { createPresignedUploadUrlController, confirmUploadController } from './upload.controller';
import { isAuthenticated } from '@domains/auth/middleware/auth.middleware';

const router: RouterType = Router();

// POST /api/uploads/presigned-url
// Generates a presigned URL for the client to upload a file directly to storage.
// Requires authentication.
router.post('/presigned-url', isAuthenticated, createPresignedUploadUrlController);

// POST /api/uploads/confirm
// Confirms that a file upload (via presigned URL) was successful and updates user profile.
// Requires authentication.
router.post('/confirm', isAuthenticated, confirmUploadController);

export default router;
