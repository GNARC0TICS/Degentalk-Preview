import type { Subscription } from '@db/schema';

export class SubscriptionTransformer {
  static toPublicSubscription(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  static toAuthenticatedSubscription(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  static toAdminSubscription(entity: any): any {
    // TODO: Implement proper transformation
    return entity;
  }

  // Add array helpers
  static toPublicSubscriptionList(entities: any[]): any[] {
    return entities.map(e => this.toPublicSubscription(e));
  }

  static toAuthenticatedSubscriptionList(entities: any[]): any[] {
    return entities.map(e => this.toAuthenticatedSubscription(e));
  }

  static toAdminSubscriptionList(entities: any[]): any[] {
    return entities.map(e => this.toAdminSubscription(e));
  }
}