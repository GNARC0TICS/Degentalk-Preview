import type { Path } from '@db/schema';

export class PathsTransformer {
  static toPublicPath(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  static toAuthenticatedPath(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  static toAdminPath(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  // Add array helpers
  static toPublicPathList(entities: any[]): any[] {
    return entities.map(e => this.toPublicPath(e));
  }

  static toAuthenticatedPathList(entities: any[]): any[] {
    return entities.map(e => this.toAuthenticatedPath(e));
  }

  static toAdminPathList(entities: any[]): any[] {
    return entities.map(e => this.toAdminPath(e));
  }
}