import { Router } from 'express';
import { AdminRolesController } from './roles.controller';
import { canUser } from '@/lib/auth/canUser';

const controller = new AdminRolesController();
const router = Router();

// Permission middleware
router.use(async (req: any, res, next) => {
  try {
    const user = req.user;
    if (!user || !(await canUser(user, 'manageRoles'))) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  } catch (err) {
    next(err);
  }
});

router.get('/', (req, res) => controller.list(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router; 