import { userService } from '@core/services/user.service';
import { Router } from 'express';
import { shareToX } from '../services/xShareService';
import { isAuthenticated } from '../../auth/auth.routes';
import type { ContentId } from '@shared/types/ids';
import { sendSuccessResponse, sendErrorResponse } from '@core/utils/transformer.helpers';

const router: Router = Router();

// TODO: Implement sharing routes

export default router;
