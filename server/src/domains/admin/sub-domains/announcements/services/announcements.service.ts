import { db } from '@db';
import { announcements, users } from '@schema';
import { desc, eq, sql, and } from 'drizzle-orm';
import type { UserId } from '@shared/types/ids';

/**
 * Get all active announcements with filtering
 */
export async function getActiveAnnouncements(options: {
	tickerOnly?: boolean;
	userRole?: string;
	userId?: UserId;
	limit?: number;
}) {
	const { tickerOnly, userRole = 'guest', userId, limit = 10 } = options;
	const now = new Date();

	// Get all active announcements
	const activeAnnouncements = await db
		.select({
			id: announcements.id,
			content: announcements.content,
			icon: announcements.icon,
			type: announcements.type,
			createdAt: announcements.createdAt,
			expiresAt: announcements.expiresAt,
			priority: announcements.priority,
			visibleTo: announcements.visibleTo,
			tickerMode: announcements.tickerMode,
			link: announcements.link,
			bgColor: announcements.bgColor,
			textColor: announcements.textColor
		})
		.from(announcements)
		.where(
			and(
				eq(announcements.isActive, true),
				// Either there's no expiration date or it's in the future
				sql`(${announcements.expiresAt} IS NULL OR ${announcements.expiresAt} > ${now})`
			)
		)
		.orderBy(desc(announcements.priority), desc(announcements.createdAt))
		.limit(50);

	// Filter announcements based on user role and visibility settings
	let filteredAnnouncements = activeAnnouncements.filter((announcement) => {
		const visibleTo = (announcement.visibleTo as string[]) || ['all'];

		// Show to everyone if 'all' is in the visibility list
		if (visibleTo.includes('all')) return true;

		// Check for user role (guest, user, mod, admin)
		if (visibleTo.includes(userRole)) return true;

		// If user is logged in, check for specific user group IDs
		if (userId && visibleTo.some((group) => !['guest', 'user', 'mod', 'admin'].includes(group))) {
			// For now, include any group-specific announcements if user is logged in
			// In a full implementation, you'd check against the user's actual groups
			return true;
		}

		return false;
	});

	// Further filter for ticker mode if specified
	if (tickerOnly === true) {
		filteredAnnouncements = filteredAnnouncements.filter((a) => a.tickerMode === true);
	}

	// Limit the results
	return filteredAnnouncements.slice(0, limit);
}

/**
 * Get all announcements with creator info (for admin use)
 */
export async function getAllAnnouncements() {
	return await db
		.select({
			id: announcements.id,
			content: announcements.content,
			icon: announcements.icon,
			type: announcements.type,
			isActive: announcements.isActive,
			createdBy: announcements.createdBy,
			createdAt: announcements.createdAt,
			updatedAt: announcements.updatedAt,
			expiresAt: announcements.expiresAt,
			priority: announcements.priority,
			visibleTo: announcements.visibleTo,
			tickerMode: announcements.tickerMode,
			link: announcements.link,
			bgColor: announcements.bgColor,
			textColor: announcements.textColor,
			creatorUsername: users.username
		})
		.from(announcements)
		.leftJoin(users, eq(announcements.createdBy, users.id))
		.orderBy(desc(announcements.createdAt));
}

/**
 * Get a single announcement by ID
 */
export async function getAnnouncementById(id: Id<'id'>) {
	const result = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);

	return result.length > 0 ? result[0] : null;
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(announcementData: any) {
	const result = await db.insert(announcements).values(announcementData).returning();

	return result[0];
}

/**
 * Update an existing announcement
 */
export async function updateAnnouncement(id: Id<'id'>, updateData: any) {
	// Add updated timestamp
	const dataWithTimestamp = {
		...updateData,
		updatedAt: new Date()
	};

	const result = await db
		.update(announcements)
		.set(dataWithTimestamp)
		.where(eq(announcements.id, id))
		.returning();

	return result.length > 0 ? result[0] : null;
}

/**
 * Soft delete an announcement by setting isActive to false
 */
export async function deactivateAnnouncement(id: Id<'id'>) {
	const result = await db
		.update(announcements)
		.set({
			isActive: false,
			updatedAt: new Date()
		})
		.where(eq(announcements.id, id))
		.returning();

	return result.length > 0 ? result[0] : null;
}
