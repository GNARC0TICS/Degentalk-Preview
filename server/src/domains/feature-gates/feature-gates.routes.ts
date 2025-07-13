import { Router } from 'express';
import { isAuthenticated, isAdmin } from '@server/domains/auth/middleware/auth.middleware';
import * as featureGatesController from './feature-gates.controller';

const router = Router();

// Public routes
router.get('/gates', featureGatesController.getAllFeatureGates);
router.get('/gates/:featureId', featureGatesController.getFeatureGate);

// Authenticated user routes
router.get('/access', isAuthenticated, featureGatesController.checkAllFeatureAccess);
router.get('/access/:featureId', isAuthenticated, featureGatesController.checkFeatureAccess);

// Admin routes
router.get(
	'/admin/user/:userId/access',
	isAdmin,
	featureGatesController.getAllFeatureAccessForUser
);
router.get(
	'/admin/user/:userId/access/:featureId',
	isAdmin,
	featureGatesController.checkFeatureAccessForUser
);

export default router;
