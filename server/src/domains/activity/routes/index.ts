import express, { Router } from 'express';
import eventLogRoutes from './event-log.routes';

const router: Router = express.Router();

router.use('/event-logs', eventLogRoutes);

export default router;
