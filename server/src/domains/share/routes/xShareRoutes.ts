import { userService } from '@server/src/core/services/user.service';
import { Router } from 'express';
import { shareToX } from '../services/xShareService';
import { isAuthenticated } from '../../auth/auth.routes';
import type { ContentId } from '@shared/types/ids';
import { sendSuccessResponse, sendErrorResponse } from "@server/src/core/utils/transformer.helpers";

const router = Router();

sendErrorResponse(res, 'Server error', 400);

sendErrorResponse(res, 'Server error', 400);

export default router;
