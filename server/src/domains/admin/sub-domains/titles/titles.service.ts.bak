import { db } from '@db';
import { titles as titlesTable, roles as rolesTable } from '@schema';
import type { CreateTitleInput, UpdateTitleInput } from './titles.validators';
import { eq, desc, asc, isNull, isNotNull } from 'drizzle-orm';

export class AdminTitlesService {
	async list() {
		// Get titles with their associated role information
		const titles = await db
			.select({
				id: titlesTable.id,
				name: titlesTable.name,
				description: titlesTable.description,
				iconUrl: titlesTable.iconUrl,
				rarity: titlesTable.rarity,
				emoji: titlesTable.emoji,
				fontFamily: titlesTable.fontFamily,
				fontSize: titlesTable.fontSize,
				fontWeight: titlesTable.fontWeight,
				textColor: titlesTable.textColor,
				backgroundColor: titlesTable.backgroundColor,
				borderColor: titlesTable.borderColor,
				borderWidth: titlesTable.borderWidth,
				borderStyle: titlesTable.borderStyle,
				borderRadius: titlesTable.borderRadius,
				glowColor: titlesTable.glowColor,
				glowIntensity: titlesTable.glowIntensity,
				shadowColor: titlesTable.shadowColor,
				shadowBlur: titlesTable.shadowBlur,
				shadowOffsetX: titlesTable.shadowOffsetX,
				shadowOffsetY: titlesTable.shadowOffsetY,
				gradientStart: titlesTable.gradientStart,
				gradientEnd: titlesTable.gradientEnd,
				gradientDirection: titlesTable.gradientDirection,
				animation: titlesTable.animation,
				animationDuration: titlesTable.animationDuration,
				roleId: titlesTable.roleId,
				isShopItem: titlesTable.isShopItem,
				isUnlockable: titlesTable.isUnlockable,
				unlockConditions: titlesTable.unlockConditions,
				shopPrice: titlesTable.shopPrice,
				shopCurrency: titlesTable.shopCurrency,
				createdAt: titlesTable.createdAt,
				roleName: rolesTable.name
			})
			.from(titlesTable)
			.leftJoin(rolesTable, eq(titlesTable.roleId, rolesTable.id))
			.orderBy(asc(titlesTable.rarity), asc(titlesTable.name));

		return titles;
	}

	async getByRole(roleId: string) {
		return db
			.select()
			.from(titlesTable)
			.where(eq(titlesTable.roleId, roleId))
			.orderBy(asc(titlesTable.name));
	}

	async getCustomTitles() {
		return db
			.select()
			.from(titlesTable)
			.where(isNull(titlesTable.roleId))
			.orderBy(asc(titlesTable.rarity), asc(titlesTable.name));
	}

	async create(data: CreateTitleInput) {
		// Validate role exists if roleId is provided
		if (data.roleId) {
			const [role] = await db
				.select({ id: rolesTable.id })
				.from(rolesTable)
				.where(eq(rolesTable.id, data.roleId));
			if (!role) throw new Error('Role not found');
		}

		const [title] = await db.insert(titlesTable).values(data).returning();
		return title;
	}

	async update(id: Id<'id'>, data: UpdateTitleInput) {
		// Validate role exists if roleId is provided
		if (data.roleId) {
			const [role] = await db
				.select({ id: rolesTable.id })
				.from(rolesTable)
				.where(eq(rolesTable.id, data.roleId));
			if (!role) throw new Error('Role not found');
		}

		const [title] = await db
			.update(titlesTable)
			.set(data)
			.where(eq(titlesTable.id, id))
			.returning();

		if (!title) throw new Error('Title not found');
		return title;
	}

	async delete(id: Id<'id'>) {
		const [title] = await db.select().from(titlesTable).where(eq(titlesTable.id, id));
		if (!title) throw new Error('Title not found');

		await db.delete(titlesTable).where(eq(titlesTable.id, id));
		return { success: true };
	}
}
