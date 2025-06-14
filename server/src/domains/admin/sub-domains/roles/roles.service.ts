import { db } from '@db';
import { roles as rolesTable } from '@schema';
import type { CreateRoleInput, UpdateRoleInput } from './roles.validators';
import { eq, desc } from 'drizzle-orm';

export class AdminRolesService {
  async list() {
    return db.select().from(rolesTable).orderBy(desc(rolesTable.rank));
  }

  async create(data: CreateRoleInput) {
    const [existing] = await db
      .select({ id: rolesTable.id })
      .from(rolesTable)
      .where(eq(rolesTable.slug, data.slug));
    if (existing) throw new Error('Slug already exists');
    const [role] = await db.insert(rolesTable).values(data).returning();
    return role;
  }

  async update(id: string, data: UpdateRoleInput) {
    const [role] = await db
      .update(rolesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(rolesTable.id, id))
      .returning();
    return role;
  }

  async delete(id: string) {
    const [role] = await db.select().from(rolesTable).where(eq(rolesTable.id, id));
    if (!role) throw new Error('Role not found');
    if (role.isSystemRole) throw new Error('Cannot delete system role');
    await db.delete(rolesTable).where(eq(rolesTable.id, id));
    return { success: true };
  }
} 