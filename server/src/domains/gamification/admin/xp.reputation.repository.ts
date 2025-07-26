import { db } from '@db';
import { eq } from 'drizzle-orm';
import { xpActionSettings } from '@schema';
import { BaseRepository } from '@core/repositories/base.repository';
import type { DatabaseTransaction } from '@shared/types';

export class XpReputationRepository extends BaseRepository<typeof xpActionSettings> {
	constructor() {
		super(xpActionSettings, 'XpReputation');
	}

	async getSettings(options?: { tx?: DatabaseTransaction }) {
		const dbClient = options?.tx || db;
		const [settings] = await dbClient.select().from(xpActionSettings).limit(1);
		return settings;
	}

	async updateSettings(
		existingActionKey: string,
		data: Partial<{
			actionKey: string;
			action: string;
			baseValue: number;
			description: string;
			maxPerDay: number | null;
			cooldownSec: number | null;
			enabled: boolean;
		}>,
		options?: { tx?: DatabaseTransaction }
	) {
		const dbClient = options?.tx || db;
		const [updated] = await dbClient
			.update(xpActionSettings)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(xpActionSettings.actionKey, existingActionKey))
			.returning();
		return updated;
	}
}

export const xpReputationRepository = new XpReputationRepository();