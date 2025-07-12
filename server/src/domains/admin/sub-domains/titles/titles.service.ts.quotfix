import { db } from '@db';
import { titles as titlesTable, roles as rolesTable } from '@schema';
import type { CreateTitleInput, UpdateTitleInput } from './titles.validators';
import { eq, desc, asc, isNull, isNotNull } from 'drizzle-orm';
import type { Id } from '@shared/types/ids';

// Alias for backward compatibility with existing variable names
const titles = titlesTable;

export class AdminTitlesService {
	async list() {
		// Get titles with their associated role information
		const titles = await db
			.select({
				id: titles.id,
				name: titles.name,
				description: titles.description,
				iconUrl: titles.iconUrl,
				rarity: titles.rarity,
				emoji: titles.emoji,
				fontFamily: titles.fontFamily,
				fontSize: titles.fontSize,
				fontWeight: titles.fontWeight,
				textColor: titles.textColor,
				backgroundColor: titles.backgroundColor,
				borderColor: titles.borderColor,
				borderWidth: titles.borderWidth,
				borderStyle: titles.borderStyle,
				borderRadius: titles.borderRadius,
				glowColor: titles.glowColor,
				glowIntensity: titles.glowIntensity,
				shadowColor: titles.shadowColor,
				shadowBlur: titles.shadowBlur,
				shadowOffsetX: titles.shadowOffsetX,
				shadowOffsetY: titles.shadowOffsetY,
				gradientStart: titles.gradientStart,
				gradientEnd: titles.gradientEnd,
				gradientDirection: titles.gradientDirection,
				animation: titles.animation,
				animationDuration: titles.animationDuration,
				roleId: titles.roleId,
				isShopItem: titles.isShopItem,
				isUnlockable: titles.isUnlockable,
				unlockConditions: titles.unlockConditions,
				shopPrice: titles.shopPrice,
				shopCurrency: titles.shopCurrency,
				createdAt: titles.createdAt,
				roleName: rolesTable.name
			})
			.from(titles)
			.leftJoin(rolesTable, eq(titles.roleId, rolesTable.id))
			.orderBy(asc(titles.rarity), asc(titles.name));

		return titles;
	}

	async getByRole(roleId: string) {
		return db.select().from(titles).where(eq(titles.roleId, roleId)).orderBy(asc(titles.name));
	}

	async getCustomTitles() {
		return db
			.select()
			.from(titles)
			.where(isNull(titles.roleId))
			.orderBy(asc(titles.rarity), asc(titles.name));
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

		const [title] = await db.insert(titles).values(data).returning();
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

		const [title] = await db.update(titles).set(data).where(eq(titles.id, id)).returning();

		if (!title) throw new Error('Title not found');
		return title;
	}

	async delete(id: Id<'id'>) {
		const [title] = await db.select().from(titles).where(eq(titles.id, id));
		if (!title) throw new Error('Title not found');

		await db.delete(titles).where(eq(titles.id, id));
		return { success: true };
	}
}
