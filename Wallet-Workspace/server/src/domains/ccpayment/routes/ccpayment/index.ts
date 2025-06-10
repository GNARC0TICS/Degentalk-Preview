/**
 * CCPayment API Routes
 *
 * This module exports all CCPayment-related API routes
 */

import express from 'express';
import depositRoutes from './deposit';
import withdrawRoutes from './withdraw';
import webhookRoutes from './webhook';

const router = express.Router();

// Mount the sub-routes
router.use('/deposit', depositRoutes);
router.use('/withdraw', withdrawRoutes);
router.use('/webhook', webhookRoutes);

export default router;
