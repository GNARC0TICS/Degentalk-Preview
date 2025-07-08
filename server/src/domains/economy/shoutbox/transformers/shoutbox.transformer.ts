import type { Shoutbox } from '@db/schema';

export class ShoutboxTransformer {
  static toPublicShoutbox(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  static toAuthenticatedShoutbox(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  static toAdminShoutbox(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  // Add array helpers
  static toPublicShoutboxList(entities: any[]): any[] {
    return entities.map(e => this.toPublicShoutbox(e));
  }

  static toAuthenticatedShoutboxList(entities: any[]): any[] {
    return entities.map(e => this.toAuthenticatedShoutbox(e));
  }

  static toAdminShoutboxList(entities: any[]): any[] {
    return entities.map(e => this.toAdminShoutbox(e));
  }
}