import { Request, Response } from 'express';
import { AdminRolesService } from './roles.service';
import { createRoleSchema, updateRoleSchema } from './roles.validators';

const service = new AdminRolesService();

export class AdminRolesController {
  async list(req: Request, res: Response) {
    const roles = await service.list();
    res.json(roles);
  }

  async create(req: Request, res: Response) {
    const parsed = createRoleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const role = await service.create(parsed.data);
    res.json(role);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const parsed = updateRoleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const role = await service.update(id, parsed.data);
    res.json(role);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    const result = await service.delete(id);
    res.json(result);
  }
} 