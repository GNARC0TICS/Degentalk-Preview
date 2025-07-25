export interface InsertXpReputationSettings {
	id?: string;
	xpAmount: number;
	reputationAmount: number;
	description?: string;
}

export interface InsertXpActionSetting {
	id?: string;
	key: string;
	xp: number;
	description?: string;
	enabled?: boolean;
}
