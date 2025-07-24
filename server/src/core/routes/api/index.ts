import { Router } from 'express';
import statusRoute from './status';
import dictionaryRoutes from '@api/domains/dictionary/dictionary.routes';

const router: Router = Router();

router.use('/status', statusRoute);
router.use('/dictionary', dictionaryRoutes);

export default router;
