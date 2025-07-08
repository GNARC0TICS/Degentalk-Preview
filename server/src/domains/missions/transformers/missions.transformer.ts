import type { Mission } from '@db/schema';

export class MissionsTransformer {
  static toPublicMission(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  static toAuthenticatedMission(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  static toAdminMission(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  // Add array helpers
  static toPublicMissionList(entities: any[]): any[] {
    return entities.map(e => this.toPublicMission(e));
  }

  static toAuthenticatedMissionList(entities: any[]): any[] {
    return entities.map(e => this.toAuthenticatedMission(e));
  }

  static toAdminMissionList(entities: any[]): any[] {
    return entities.map(e => this.toAdminMission(e));
  }
}