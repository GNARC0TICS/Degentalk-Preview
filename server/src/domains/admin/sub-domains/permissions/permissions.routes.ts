import { Router } from 'express';
import { AdminPermissionsController } from './permissions.controller';
import { canUser } from '@lib/auth/canUser.ts';

const controller = new AdminPermissionsController();
const router = Router();

// Permission middleware
router.use(async (req: any, res, next) => {
	try {
		const user = req.user;
		if (!user || !(await canUser(user, 'roles.view'))) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		next();
	} catch (err) {
		next(err);
	}
});

router.get('/', (req, res) => controller.list(req, res));
router.get('/by-category', (req, res) => controller.getByCategory(req, res));

export default router;
