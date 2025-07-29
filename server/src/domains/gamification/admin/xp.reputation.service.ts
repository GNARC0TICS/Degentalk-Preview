import { db } from '@degentalk/db';
import { eq } from 'drizzle-orm';
import { xpActionSettings } from '@schema';
import { AdminError } from '../../admin/admin.errors';

export class XpReputationService {
	async getSettings() {
		const [settings] = await db.select().from(xpActionSettings).limit(1);
		return settings;
	}

	async updateSettings(data: Partial<ReturnType<typeof this.getSettings>>) {
		const [existing] = await db.select().from(xpActionSettings).limit(1);
		if (!existing) throw new AdminError('XP Reputation settings row missing');

		const [updated] = await db
			.update(xpActionSettings)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(xpActionSettings.actionKey, existing.actionKey))
			.returning();
		return updated;
	}
}

export const xpReputationService = new XpReputationService();
