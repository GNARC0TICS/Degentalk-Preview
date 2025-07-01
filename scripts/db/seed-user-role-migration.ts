import type { AdminId } from '@db/types';
import chalk from 'chalk';
import { db } from '@db';
import { roles as rolesTable, users as usersTable, userRoles as userRolesTable } from '@schema';
import { eq } from 'drizzle-orm';

async function ensureRole(slug: : AdminId, props: Partial<typeof rolesTable.$inferInsert>) {
  const [existing] = await db.select({ id: rolesTable.id }).from(rolesTable).where(eq(rolesTable.slug, slug));
  if (existing) return existing.id;
  const [row] = await db.insert(rolesTable).values({ slug, name: props.name ?? slug, rank: props.rank ?? 0, xpMultiplier: props.xpMultiplier ?? 1, permissions: props.permissions ?? {}, ...props }).returning({ id: rolesTable.id });
  console.log(chalk.gray(`Created role ${slug}`));
  return row.id;
}

async function main() {
  console.log(chalk.bold.magenta('🔄 Migrating legacy users to roles…'));

  const adminRoleId = await ensureRole('admin', { name: 'Admin', rank: 90, xpMultiplier: 2, permissions: ['*'], isSystemRole: true, isAdmin: true, isStaff: true });
  const modRoleId = await ensureRole('mod', { name: 'Moderator', rank: 80, xpMultiplier: 1.1, permissions: ['moderation:*'], isSystemRole: true, isModerator: true, isStaff: true });
  const defaultRoleId = await ensureRole('default', { name: 'Member', rank: 10, xpMultiplier: 1.0, permissions: [] });

  const users = await db.select({ id: usersTable.id, roleEnum: usersTable.role, primaryRoleId: usersTable.primaryRoleId }).from(usersTable);

  let adminCount = 0, modCount = 0, defaultCount = 0;

  for (const user of users) {
    let targetRoleId = defaultRoleId;
    if (user.roleEnum === 'admin') {
      targetRoleId = adminRoleId;
      adminCount++;
    } else if (user.roleEnum === 'mod') {
      targetRoleId = modRoleId;
      modCount++;
    } else {
      defaultCount++;
    }

    // Skip if already set
    if (user.primaryRoleId === targetRoleId) continue;

    await db.update(usersTable).set({ primaryRoleId: targetRoleId }).where(eq(usersTable.id, user.id));

    // Ensure userRoles row exists for stacking
    await db.insert(userRolesTable).values({ userId: user.id, roleId: targetRoleId }).onConflictDoNothing();
  }

  console.log(chalk.green('Migration complete.'));
  console.log(`Admins: ${adminCount}, Mods: ${modCount}, Defaults: ${defaultCount}`);
}

if (import.meta.url === (process.argv[1] ?? '')) {
  main()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(() => process.exit());
} 