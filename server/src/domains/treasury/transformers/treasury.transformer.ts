import type { Treasury } from '@db/schema';

export class TreasuryTransformer {
	static toPublicTreasury(entity: any): any {
		// TODO: Implement proper transformation
		return entity;
	}

	static toAuthenticatedTreasury(entity: any): any {
		// TODO: Implement proper transformation
		return entity;
	}

	static toAdminTreasury(entity: any): any {
		// TODO: Implement proper transformation
		return entity;
	}

	// Add array helpers
	static toPublicTreasuryList(entities: any[]): any[] {
		return entities.map((e) => this.toPublicTreasury(e));
	}

	static toAuthenticatedTreasuryList(entities: any[]): any[] {
		return entities.map((e) => this.toAuthenticatedTreasury(e));
	}

	static toAdminTreasuryList(entities: any[]): any[] {
		return entities.map((e) => this.toAdminTreasury(e));
	}
}
