declare module '@db' {
  export {};
}
declare module '@db/*' {
  export {};
}
declare module '@db/schema/core/enums' {
  export type UserRole = 'admin' | 'moderator' | 'user' | 'banned';
  export type ThreadStatus = 'active' | 'locked' | 'deleted' | 'archived';
  export type PostStatus = 'active' | 'deleted' | 'moderated' | 'edited';
  export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'reward' | 'fee';
  export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
}
