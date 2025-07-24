import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { userService } from '@core/services/user.service';
import { AdminPermissionsController } from './permissions.controller';
import { canUser } from '@shared/lib/auth/canUser';
import { sendErrorResponse } from '@core/utils/transformer.helpers';

const controller = new AdminPermissionsController();
const router: RouterType = Router();

// Permission middleware
router.use(async (req: any, res, next) => {
	try {
		const user = userService.getUserFromRequest(req);
		if (!user || !(await canUser(user, 'roles.view'))) {
			return sendErrorResponse(res, 'Forbidden', 403);
		}
		next();
	} catch (err) {
		next(err);
	}
});

router.get('/', (req, res) => controller.list(req, res));
router.get('/by-category', (req, res) => controller.getByCategory(req, res));

export default router;
