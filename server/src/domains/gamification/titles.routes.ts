import { Router } from 'express'
import type { Router as RouterType } from 'express';
import { userService } from '@core/services/user.service';
import { AdminTitlesController } from './titles.controller';
import { canUser } from '@domains/auth/utils/canUser';
import { sendErrorResponse } from '@core/utils/transformer.helpers';

const controller = new AdminTitlesController();
const router: RouterType = Router();

// Permission middleware
router.use(async (req: any, res, next) => {
	try {
		const user = userService.getUserFromRequest(req);
		if (!user || !(await canUser(user, 'manageTitles'))) {
			return sendErrorResponse(res, 'Forbidden', 403);
		}
		next();
	} catch (err) {
		next(err);
	}
});

router.get('/', (req, res) => controller.list(req, res));
router.get('/role/:roleId', (req, res) => controller.getByRole(req, res));
router.get('/custom', (req, res) => controller.getCustomTitles(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
