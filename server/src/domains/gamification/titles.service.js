import { db } from '@db';
import { titles as titlesTable, roles as rolesTable, userTitles, users } from '@schema';
import { eq, asc, isNull, and } from 'drizzle-orm';
import { logger } from '@core/logger';
export class TitlesService {
    // Core title management
    async list() {
        // Get titles with their associated role information
        const titleList = await db
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
        return titleList;
    }
    async getByRole(roleId) {
        return db.select().from(titlesTable).where(eq(titlesTable.roleId, roleId)).orderBy(asc(titlesTable.name));
    }
    async getCustomTitles() {
        return db
            .select()
            .from(titlesTable)
            .where(isNull(titlesTable.roleId))
            .orderBy(asc(titlesTable.rarity), asc(titlesTable.name));
    }
    async getTitleById(id) {
        const [title] = await db
            .select()
            .from(titlesTable)
            .where(eq(titlesTable.id, id))
            .limit(1);
        return title || null;
    }
    async getUserTitles(userId) {
        const result = await db
            .select({
            userId: userTitles.userId,
            titleId: userTitles.titleId,
            awardedAt: userTitles.awardedAt,
            // Include title data
            title: {
                id: titlesTable.id,
                name: titlesTable.name,
                description: titlesTable.description,
                rarity: titlesTable.rarity,
                emoji: titlesTable.emoji,
                // Add other title fields as needed
            }
        })
            .from(userTitles)
            .innerJoin(titlesTable, eq(userTitles.titleId, titlesTable.id))
            .where(eq(userTitles.userId, userId));
        return result.map(row => ({
            userId: row.userId,
            titleId: row.titleId,
            awardedAt: row.awardedAt.toISOString(),
            title: row.title
        }));
    }
    // CRITICAL: Title assignment methods
    async grantTitle(userId, titleId, reason, grantedBy) {
        logger.info('TITLES', `Granting title ${titleId} to user ${userId}`, { reason, grantedBy });
        try {
            // Check if title exists
            const title = await this.getTitleById(titleId);
            if (!title) {
                throw new Error(`Title ${titleId} not found`);
            }
            // Check if user already has this title
            const existingGrant = await db
                .select()
                .from(userTitles)
                .where(and(eq(userTitles.userId, userId), eq(userTitles.titleId, titleId)))
                .limit(1);
            if (existingGrant.length > 0) {
                logger.warn('TITLES', `User ${userId} already has title ${titleId}`);
                return; // Silently ignore duplicate grants
            }
            // Grant the title
            await db.insert(userTitles).values({
                userId,
                titleId,
                awardedAt: new Date()
            });
            logger.info('TITLES', `Successfully granted title ${title.name} to user ${userId}`);
            // TODO: Emit event for other systems to react
            // this.eventBus.emit('title:granted', { userId, titleId, title, reason, grantedBy });
        }
        catch (error) {
            logger.error('TITLES', `Failed to grant title ${titleId} to user ${userId}:`, error);
            throw error;
        }
    }
    async revokeTitle(userId, titleId, reason, revokedBy) {
        logger.info('TITLES', `Revoking title ${titleId} from user ${userId}`, { reason, revokedBy });
        try {
            // Check if user has this title
            const existingGrant = await db
                .select()
                .from(userTitles)
                .where(and(eq(userTitles.userId, userId), eq(userTitles.titleId, titleId)))
                .limit(1);
            if (existingGrant.length === 0) {
                logger.warn('TITLES', `User ${userId} does not have title ${titleId} to revoke`);
                return; // Silently ignore if not owned
            }
            // Remove the title
            await db.delete(userTitles).where(and(eq(userTitles.userId, userId), eq(userTitles.titleId, titleId)));
            // If this was the equipped title, unequip it
            await db
                .update(users)
                .set({ activeTitleId: null })
                .where(and(eq(users.id, userId), eq(users.activeTitleId, titleId)));
            const title = await this.getTitleById(titleId);
            logger.info('TITLES', `Successfully revoked title ${title?.name || titleId} from user ${userId}`);
            // TODO: Emit event
            // this.eventBus.emit('title:revoked', { userId, titleId, title, reason, revokedBy });
        }
        catch (error) {
            logger.error('TITLES', `Failed to revoke title ${titleId} from user ${userId}:`, error);
            throw error;
        }
    }
    async equipTitle(userId, titleId) {
        logger.info('TITLES', `Equipping title ${titleId} for user ${userId}`);
        try {
            // Verify user owns this title
            const ownership = await db
                .select()
                .from(userTitles)
                .where(and(eq(userTitles.userId, userId), eq(userTitles.titleId, titleId)))
                .limit(1);
            if (ownership.length === 0) {
                throw new Error(`User ${userId} does not own title ${titleId}`);
            }
            // Update user's active title
            await db
                .update(users)
                .set({ activeTitleId: titleId })
                .where(eq(users.id, userId));
            const title = await this.getTitleById(titleId);
            logger.info('TITLES', `Successfully equipped title ${title?.name || titleId} for user ${userId}`);
            // TODO: Emit event
            // this.eventBus.emit('title:equipped', { userId, titleId, title });
        }
        catch (error) {
            logger.error('TITLES', `Failed to equip title ${titleId} for user ${userId}:`, error);
            throw error;
        }
    }
    async unequipTitle(userId) {
        logger.info('TITLES', `Unequipping title for user ${userId}`);
        try {
            await db
                .update(users)
                .set({ activeTitleId: null })
                .where(eq(users.id, userId));
            logger.info('TITLES', `Successfully unequipped title for user ${userId}`);
            // TODO: Emit event
            // this.eventBus.emit('title:unequipped', { userId });
        }
        catch (error) {
            logger.error('TITLES', `Failed to unequip title for user ${userId}:`, error);
            throw error;
        }
    }
    // Automatic title grants based on conditions
    async checkAndGrantLevelTitles(userId, newLevel) {
        logger.info('TITLES', `Checking level titles for user ${userId} at level ${newLevel}`);
        const grantedTitles = [];
        try {
            // Find all titles that should be unlocked at this level
            // TODO: When minLevel column is added to schema
            // const availableTitles = await db
            // 	.select()
            // 	.from(titlesTable)
            // 	.where(and(
            // 		eq(titlesTable.category, 'level'),
            // 		lte(titlesTable.minLevel, newLevel)
            // 	));
            // For now, just log that we would check
            logger.info('TITLES', `Would check level-based titles for level ${newLevel}`);
        }
        catch (error) {
            logger.error('TITLES', `Failed to check level titles for user ${userId}:`, error);
        }
        return grantedTitles;
    }
    async checkAndGrantRoleTitles(userId, roleId) {
        logger.info('TITLES', `Checking role titles for user ${userId} with role ${roleId}`);
        const grantedTitles = [];
        try {
            // Find all titles for this role
            const roleTitles = await db
                .select()
                .from(titlesTable)
                .where(eq(titlesTable.roleId, roleId));
            // Grant each title that user doesn't already have
            for (const title of roleTitles) {
                await this.grantTitle(userId, title.id, `Role assignment: ${roleId}`);
                grantedTitles.push(title.id);
            }
        }
        catch (error) {
            logger.error('TITLES', `Failed to check role titles for user ${userId}:`, error);
        }
        return grantedTitles;
    }
    // Legacy methods (updated with new naming)
    async create(data) {
        // Validate role exists if roleId is provided
        if (data.roleId) {
            const [role] = await db
                .select({ id: rolesTable.id })
                .from(rolesTable)
                .where(eq(rolesTable.id, data.roleId));
            if (!role)
                throw new Error('Role not found');
        }
        const [title] = await db.insert(titlesTable).values(data).returning();
        return title;
    }
    async update(id, data) {
        // Validate role exists if roleId is provided
        if (data.roleId) {
            const [role] = await db
                .select({ id: rolesTable.id })
                .from(rolesTable)
                .where(eq(rolesTable.id, data.roleId));
            if (!role)
                throw new Error('Role not found');
        }
        const [title] = await db.update(titlesTable).set(data).where(eq(titlesTable.id, id)).returning();
        if (!title)
            throw new Error('Title not found');
        return title;
    }
    async delete(id) {
        const [title] = await db.select().from(titlesTable).where(eq(titlesTable.id, id));
        if (!title)
            throw new Error('Title not found');
        // First remove all user assignments
        await db.delete(userTitles).where(eq(userTitles.titleId, id));
        // Then delete the title
        await db.delete(titlesTable).where(eq(titlesTable.id, id));
        return { success: true };
    }
}
