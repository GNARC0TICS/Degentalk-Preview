import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { isAdmin } from '@domains/admin/admin.middleware';
import {
	getAnnouncementsController,
	getAllAnnouncementsController,
	getAnnouncementByIdController,
	createAnnouncementController,
	updateAnnouncementController,
	deactivateAnnouncementController
} from './announcements.controller';

// Export a function to register announcement routes
export function registerAnnouncementRoutes(app: Router) {
	// Public route for getting active announcements
	app.get('/api/announcements', getAnnouncementsController);

	// Admin routes for managing announcements
	const adminRouter: RouterType = Router();
	app.use('/api/admin/announcements', isAdmin, adminRouter);

	// Admin CRUD operations for announcements
	adminRouter.get('/', getAllAnnouncementsController);
	adminRouter.post('/', createAnnouncementController);
	adminRouter.get('/:id', getAnnouncementByIdController);
	adminRouter.put('/:id', updateAnnouncementController);
	adminRouter.delete('/:id', deactivateAnnouncementController);

	return app;
}

// Create a standalone router for direct use (useful for testing or when mounting at a different path)
const announcementsRouter: RouterType = Router();
const publicRouter: RouterType = Router();

// Public routes
publicRouter.get('/', getAnnouncementsController);

// Admin routes
const adminRouter: RouterType = Router();
adminRouter.get('/', getAllAnnouncementsController);
adminRouter.post('/', createAnnouncementController);
adminRouter.get('/:id', getAnnouncementByIdController);
adminRouter.put('/:id', updateAnnouncementController);
adminRouter.delete('/:id', deactivateAnnouncementController);

// Export both routers
export { publicRouter, adminRouter };

// Export a default router that includes both public and admin routes (protected by isAdmin middleware)
export default function createAnnouncementRouter() {
	const router: RouterType = Router();

	// Mount the public routes
	router.use('/api/announcements', publicRouter);

	// Mount the admin routes with protection
	router.use('/api/admin/announcements', isAdmin, adminRouter);

	return router;
}
