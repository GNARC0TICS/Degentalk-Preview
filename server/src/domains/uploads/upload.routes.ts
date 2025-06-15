import { Router } from 'express';
import { getPresignedUrlController } from './upload.controller';

const router = Router();

// POST /api/uploads/presign
router.post('/presign', getPresignedUrlController);

export default router; 