import { db } from '@db';
import { eq } from 'drizzle-orm';
import { xpReputationSettings } from '@schema';
import { AdminError } from '../../admin.errors';

export class XpReputationService {
	async getSettings() {
		const [settings] = await db.select().from(xpReputationSettings).limit(1);
		return settings;
	}

	async updateSettings(data: Partial<ReturnType<typeof this.getSettings>>) {
		const [existing] = await db.select().from(xpReputationSettings).limit(1);
		if (!existing) throw new AdminError('XP Reputation settings row missing');

		const [updated] = await db
			.update(xpReputationSettings)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(xpReputationSettings.actionKey, existing.actionKey))
			.returning();
		return updated;
	}
}

export const xpReputationService = new XpReputationService();
