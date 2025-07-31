/**
 * Fraud Detection Routes
 *
 * Routes for fraud detection and suspicious activity monitoring
 */

import express from 'express'
import type { Router as RouterType } from 'express';
import { fraudDetectionController } from './fraud-detection.controller';
import { luciaAuth } from '@middleware/lucia-auth.middleware';
const isAuthenticated = luciaAuth.require;
const isAdmin = luciaAuth.requireAdmin;

const router: RouterType = express.Router();

// Apply authentication middleware
router.use(isAuthenticated);
router.use(isAdmin);

// Fraud alerts management
router.get('/alerts', (req, res) => fraudDetectionController.getFraudAlerts(req, res));
router.post('/alerts/resolve', (req, res) => fraudDetectionController.resolveAlert(req, res));

// Fraud metrics and reporting
router.get('/metrics', (req, res) => fraudDetectionController.getFraudMetrics(req, res));
router.get('/dashboard', (req, res) => fraudDetectionController.getDashboard(req, res));

// User analysis
router.post('/analyze-user', (req, res) => fraudDetectionController.analyzeUser(req, res));
router.get('/suspicious-users', (req, res) => fraudDetectionController.getSuspiciousUsers(req, res));

// Fraud detection operations
router.post('/scan', (req, res) => fraudDetectionController.runFraudScan(req, res));

// Settings management
router.get('/settings', (req, res) => fraudDetectionController.getSettings(req, res));
router.put('/settings', (req, res) => fraudDetectionController.updateSettings(req, res));

export default router;