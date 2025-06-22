import { Router } from 'express';
import { avatarFrameController } from './avatar-frames.controller';
import { isAdmin } from '../../../auth/middleware/auth.middleware';

const router = Router();

// All routes require admin access
router.use(isAdmin);

// GET /api/admin/avatar-frames
router.get('/', avatarFrameController.getAllFrames);

// GET /api/admin/avatar-frames/:id
router.get('/:id', avatarFrameController.getFrame);

// POST /api/admin/avatar-frames
router.post('/', avatarFrameController.createFrame);

// PUT /api/admin/avatar-frames/:id
router.put('/:id', avatarFrameController.updateFrame);

// DELETE /api/admin/avatar-frames/:id
router.delete('/:id', avatarFrameController.deleteFrame);

export default router;