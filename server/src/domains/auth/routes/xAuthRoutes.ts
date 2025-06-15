import { Router } from 'express';
import { initiateXLogin, handleXCallback, unlinkXAccount } from '../services/xAuthService';
import { isAuthenticated } from '../auth.routes';

const router = Router();

// GET /api/auth/x/login – redirect to Twitter
router.get('/login', initiateXLogin);

// GET /api/auth/x/callback – OAuth2 callback
router.get('/callback', handleXCallback);

// POST /api/auth/x/unlink – unlink X account
router.post('/unlink', isAuthenticated, unlinkXAccount);

export default router; 