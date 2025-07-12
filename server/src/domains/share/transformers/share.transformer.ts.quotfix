import type { Share } from '@db/schema';

export class ShareTransformer {
  static toPublicShare(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  static toAuthenticatedShare(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  static toAdminShare(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  // Add array helpers
  static toPublicShareList(entities: any[]): any[] {
    return entities.map(e => this.toPublicShare(e));
  }

  static toAuthenticatedShareList(entities: any[]): any[] {
    return entities.map(e => this.toAuthenticatedShare(e));
  }

  static toAdminShareList(entities: any[]): any[] {
    return entities.map(e => this.toAdminShare(e));
  }
}