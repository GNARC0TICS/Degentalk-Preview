import type { Dictionary } from '@db/schema';

export class DictionaryTransformer {
	static toPublicDictionary(entity: any): any {
		// TODO: Implement proper transformation
		return entity;
	}

	static toAuthenticatedDictionary(entity: any): any {
		// TODO: Implement proper transformation
		return entity;
	}

	static toAdminDictionary(entity: any): any {
		// TODO: Implement proper transformation
		return entity;
	}

	// Add array helpers
	static toPublicDictionaryList(entities: any[]): any[] {
		return entities.map((e) => this.toPublicDictionary(e));
	}

	static toAuthenticatedDictionaryList(entities: any[]): any[] {
		return entities.map((e) => this.toAuthenticatedDictionary(e));
	}

	static toAdminDictionaryList(entities: any[]): any[] {
		return entities.map((e) => this.toAdminDictionary(e));
	}
}
