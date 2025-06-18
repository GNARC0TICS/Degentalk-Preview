import { db } from '@db';
import { xpCloutSettings } from '@schema';
import { AdminError } from '../../admin.errors';

export class XpCloutService {
	async getSettings() {
		const [settings] = await db.select().from(xpCloutSettings).limit(1);
		return settings;
	}

	async updateSettings(data: Partial<ReturnType<typeof this.getSettings>>) {
		const [existing] = await db.select().from(xpCloutSettings).limit(1);
		if (!existing) throw new AdminError('XP Clout settings row missing');

		const [updated] = await db
			.update(xpCloutSettings)
			.set({ ...data, updatedAt: new Date() })
			.where(xpCloutSettings.id.eq(existing.id))
			.returning();
		return updated;
	}
}

export const xpCloutService = new XpCloutService(); 