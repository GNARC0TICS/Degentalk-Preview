import type { Collectible } from '@db/schema';

export class CollectiblesTransformer {
	static toPublicCollectible(entity: any): any {
		// TODO: Implement proper transformation
		return entity;
	}

	static toAuthenticatedCollectible(entity: any): any {
		// TODO: Implement proper transformation
		return entity;
	}

	static toAdminCollectible(entity: any): any {
		// TODO: Implement proper transformation
		return entity;
	}

	// Add array helpers
	static toPublicCollectibleList(entities: any[]): any[] {
		return entities.map((e) => this.toPublicCollectible(e));
	}

	static toAuthenticatedCollectibleList(entities: any[]): any[] {
		return entities.map((e) => this.toAuthenticatedCollectible(e));
	}

	static toAdminCollectibleList(entities: any[]): any[] {
		return entities.map((e) => this.toAdminCollectible(e));
	}
}
